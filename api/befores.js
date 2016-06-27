	
	var _              = require('lodash');
	var eventUtils     = require('../pushevents/eventUtils');
	var User           = require('../models/UserModel');
	var Before         = require('../models/BeforeModel');
	var moment         = require('moment');

	var mongoose = require('mongoose');
	var pusher   = require('../services/pusher');


	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var handleErrAsync = function( namespace, err ){

		console.log( err );

	};


	var createBefore = function( req, res, next ) {
	    
	    var err_ns    = "creating_before";

		var data         = req.sent.before_data;	    
	    var new_before = {};

    	// Sent by the client
		new_before.hosts     = data.hosts;
		new_before.main_host = data.main_host;
		new_before.begins_at = moment( data.begins_at );
		new_before.timezone  = data.timezone;
		new_before.address   = data.address;

    	new_before.created_at = moment();
    	new_before.groups 	 = [];
    	new_before.status 	 = 'open';

    	// GeoJSON to create an MongoDB 2dpshere Index, for $geoNear queries
    	new_before.geojson = {
    		"type"        : "Point",
    		"coordinates" : [ data.address.lng, data.address.lat ] 
    	};

	    var new_before = new Before( new_before );

	    new_before.save(function( err, new_before ){

	    	if( err ) return handleErr( req, res, err_ns, err );

	    	var before_id = new_before._id;

	    	var before_item_host = {
				status    : 'hosting',
				timezone  : parseFloat( data.timezone ),
				before_id : before_id,
				begins_at : new Date( new_before.begins_at )
	    	};

	    	User.update({'facebook_id': { $in: data.hosts } },
	    				{ $push: { 'befores': before_item_host }},
	    				{ multi: true },

				function( err, users ){

					if( err ){
						return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});
					}

			    	console.log('Before created!');
			    	
			    	req.sent.before 		    = new_before;
			    	req.sent.expose.before      = new_before;
			    	req.sent.expose.before_item = before_item_host;

			    	return next();

				});


	    	});



	};

	var request = function( req, res, next ){
		
		var err_ns = "requesting_before";

		var facebook_id = req.sent.facebook_id;
		var members     = req.sent.members;
		var before 	    = req.sent.before;
		var before_id   = req.sent.before_id;

		var requested_at = new Date();

		var group_item = {
			status 		 : 'pending',
			members      : members,
			main_member  : facebook_id,
			requested_at : requested_at,
			accepted_at  : null
		};

		// Used right after to make channel_item
		req.sent.group = group_item;

		console.log('Requesting in with before_id = ' + before_id );

		Before.findByIdAndUpdate( before_id, {
			$push: {
				groups: group_item
			}
		},{ new: true }, function( err, bfr ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			var before_item = {
				before_id   : bfr._id, // Important, to keep the ObjectId type 
				begins_at   : bfr.begins_at,
				timezone	: parseFloat( bfr.timezone ),
				status 		: 'pending'
			};

			User
				.update(
					{ 'facebook_id': { $in: members } },
					{ $push: { 'befores' : before_item } },
					{ multi: true, new: true },
					function( w ){

						if( err ){
							return handleErr( req, res, err_ns, err );
						}
						
						req.sent.before      = bfr;
						req.sent.before_item = before_item;
						next();

					});
				});
	};

	var changeBeforeStatus = function( req, res, next ){

		var err_ns    = "updating_before_status";
	
		var before    = req.sent.before;
		var status    = req.sent.status;
		var before_id = req.sent.before_id;

		console.log('Changing event status, new status : ' + status + ' for event: ' + before_id );

		before.status = status;
		before.save(function( err, before ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.before = before;
			next();

			// If the status is canceled, all befores need to be removed from users array
			// To allow them to recreate event the same day
			if( status == "canceled" ){
				
				var query = {
					facebook_id: { $in: before.hosts.concat( _.flatten( _.map( before.groups, 'members' ) )  ) }
				};

				var update = {
					$pull: {
						befores: { 'before_id': mongoose.Types.ObjectId( before_id ) }
					}
				};

				var options = {
					multi: true
				};

				User.update( query, update, options, function( err, res ){
					if( err ){
						console.log('Cant remove canceled befores from users collection : ' + err );
					}
				});

			}

		});


	};

	var changeGroupStatus = function( req, res, next ){
		
		next();

		var err_ns    = "updating_group_status";

		var before = req.sent.before;
		var status = req.sent.status;
		var group  = req.sent.group;

		console.log('Changing group status, new status : ' + status );
		req.sent.accepted_at = new Date();

		group.status      = status;
		group.accepted_at = req.sent.accepted_at;

		before.markModified('groups');
		before.save(function( err, bfr ){

			if( err ) return handleErrAsync( err_ns, err );

		});

		User.update(
		{
			'befores.before_id' : mongoose.Types.ObjectId( before._id )
		},
		{
			'$set': { 'before.$.status' : 'status', 'before.$.accepted_at' : req.sent.accepted_at }
		},
		{
			'multi': true
		},
		function( err, raw ){

			if( err ) return handleErrAsync( err_ns, err );

		});


	};

	var fetchBeforeById = function( req, res, next ){

		var err_ns   = "fetching_one_before";
		var before_id = req.sent.before_id;

		console.log('Requesting event by id : ' + before_id	);

		Before.findById( before_id, function( err, bfr ){

			if( err ) return handleErr( req, res, err_ns, err );

			if( !bfr ){
				req.sent.expose.message = "The ressource (before) couldnt be found (no entry)";
			}

			// Do not expose the group lists to other people than hosts
			if( bfr && bfr.hosts.indexOf( req.sent.facebook_id ) == -1 ){
				bfr.members = null;
			}
			
			req.sent.expose.before = bfr;
			delete req.sent.expose.before.groups;
			next();
			
		});

	};

	var updateBefore = function( req, res, next ){

	};

	var fetchGroups = function( req, res, next ){

	};
	
	var fetchNearestBefores = function( req, res, next ){

		console.log('Fetching nearest befores...');

		var err_ns = "fetching_nearest_befores";
		// var earth_radius_in_meters = 6371000;

		// Default, only fetch the befores in a 5km radius 
		// more here : https://docs.mongodb.org/manual/reference/operator/aggregation/geoNear/
		var maxDistance = req.sent.max_distance || 15000;

		// GeoJSON specification
		// coordinates array must start with longitude
		var near = {
			"type"        : "Point",
			"coordinates" : [ req.sent.latlng.lng, req.sent.latlng.lat ]
		};

		console.log('Maximum distance is : ' + maxDistance );

		// When near is GeoJSON type, the maxDistance is express in 'meters' !
		// No need to convert with the earth radius
		Before.aggregate([
			{ 
				$geoNear: {
					spherical     : true,
					near          : near,
					distanceField : 'distance',
					maxDistance   : maxDistance
				}
			},
			{
				'$match': {
					status: { $in: ['open'] }
				}
			}
		],
		function( err, response ){

			if( err ) return handleErr( req, res, err_ns, err );

			response.forEach(function( bfr ){
				delete bfr.groups;
			});
			
			req.sent.expose.befores = response;
			next();

		});

	};


	module.exports = {
		createBefore        : createBefore,
		request             : request,
		changeBeforeStatus  : changeBeforeStatus,
		changeGroupStatus   : changeGroupStatus,
		fetchBeforeById     : fetchBeforeById,
		updateBefore        : updateBefore,
		fetchGroups         : fetchGroups,
		fetchNearestBefores : fetchNearestBefores
	};