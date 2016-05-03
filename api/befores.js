	
	var _              = require('lodash');
	var eventUtils     = require('../pushevents/eventUtils');
	var User           = require('../models/UserModel');
	var Before         = require('../models/BeforeModel');
	var moment         = require('moment');
	var rd             = require('../services/rd');
	var alerts_watcher = require('../middlewares/alerts_watcher');
	var mailer         = require('../services/mailer');
	var realtime 	   = require('../middlewares/realtime');

	var mongoose = require('mongoose');
	var pusher   = require('../services/pusher');


	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

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
	    	var before_item = {
				status    : 'hosting',
				timezone  : parseFloat( data.timezone ),
				before_id : before_id,
				begins_at : new_before.begins_at
	    	};

	    	var channel_item = {
	    		type      : 'before',
	    		name      : realtime.makeHostsChannel( before_id ),
	    	};

	    	var hosts_ns = 'before/' + new_before._id + '/hosts';
	    	/* Cache hosts ids for chat performance */
	    	rd.sadd( hosts_ns, _.pluck( new_before.hosts, 'facebook_id' ), function( err ){

		    	User.update({'facebook_id': { $in: data.hosts } },
		    				{ $push: { 'befores': before_item, 'channels': channel_item }},
		    				{ multi: true },

					function( err, users ){

						if( err ){
							return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});
						}

				    	console.log('Before created!');
				    	req.sent.expose.before = new_before;

				    	return next();

					});

		    	});

	    	});



	};

	var fetchBefores = function( req, res, next ){

		var start_date = req.sent.start_date;

		Before
			.find(
				{ 
					//'begins_at': { $gte: moment( start_date, 'DD/MM/YY' ).toISOString() },
					'status' : { $in : ['open','suspended'] } 
				}
			)
			//.limit( 10 ) no limit needed
			.sort({ 'begins_at': -1 })
			.exec( function( err, befores ){

				if( err ){
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});
				}

				var filtered_befores = [];
				befores.forEach(function( bfr ){

					bfr.n_groups = bfr.groups.length;
					delete bfr.groups;
					filtered_befores.push( bfr );

				});

				 eventUtils.sendSuccess( res, filtered_befores );

			});

	};

	var request = function( req, res, next ){
		
		var err_ns = "requesting_before";

		var facebook_id = req.sent.facebook_id;
		var members     = req.sent.members;
		var before 	    = req.sent.before;
		var before_id   = req.sent.before_id;

		var group_item = {
			status 		: 'pending',
			members     : members,
			main_member : facebook_id
		};

		console.log('Requesting in with before_id = ' + before_id );

		Before.findByIdAndUpdate( before_id, {
			$push: {
				groups: group_item
			}
		},{ new: true }, function( err, bfr ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			var before_to_push = {
				before_id   : before_id,
				begins_at   : bfr.begins_at,
				timezone	: parseFloat( bfr.timezone ),
				status 		: 'pending'
			};

			User
				.update(
					{ 'facebook_id': { $in: members } },
					{ $push: { 'befores' : before_to_push } },
					{ multi: true, new: true },
					function( w ){

						if( err ){
							return handleErr( req, res, err_ns, err );
						}

						req.sent.expose.new_group = new_group;
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
					facebook_id: { $in: before.hosts }
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
		
		var bfr       = req.sent.bfr;
		var groups    = bfr.groups;
		var before_id = req.sent.before_id;
		var group_id  = req.sent.group_id;
		var chat_id   = req.sent.chat_id;
		var status    = req.sent.group_status;
		var socket_id = req.sent.socket_id;

		console.log('Changing group status, new status : ' + status );

		// Notification variable, to be displayed and saved;
		var notification = req.sent.notification;

		groups.forEach(function( group, i ){

			if( group.group_id == group_id ){

				groups[i].status = status;

				rd.set('before/' + before_id + '/' + 'group/' + group_id + '/status', status, function( err ){

					if( status == 'accepted' ){
						groups[i].accepted_at = new Date();
						groups[i].members_facebook_id.forEach(function( facebook_id ){

							alerts_watcher.allowSendAlert( facebook_id, "accepted_in", function( allowed, alerts ){

								if( allowed && alerts.email ){
									mailer.sendAlertEmail_RequestAccepted( alerts.email );
								}

							});

						});
					} else {
						groups[i].kicked_at = new Date();
					}
					
				});
			}
		});

		bfr.groups = groups;
		bfr.markModified('groups');

		bfr.save(function( err, bfr ){

			if( err || !bfr ) 
				return eventUtils.raiseError({
					err: err,
					res: res,
					toClient: "api error"
				});

			var group = bfr.getGroupById( group_id );


			console.log( eventUtils.oSize( group ) );

			var data = {
				before_id          : bfr._id,
				hosts             : bfr.hosts,
				group             : group,
				chat_id			  : chat_id,
				notification      : notification
			};

			eventUtils.sendSuccess( res, data );

			if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger( before_id, 'new oversize message' );
	    	} else {
				console.log('Pushing new group status to clients in beforeid: ' + before_id );
				pusher.trigger( 'presence-' + chat_id, 'new group status', data, socket_id );
			}


		});


	};

	var fetchBeforeById = function( req, res, next ){

		var err_ns   = "fetching_one_before";
		var before_id = req.sent.before_id;

		console.log('Requesting event by id : ' + before_id	);

		Before.findById( before_id, function( err, bfr ){

			if( err ) return handleErr( req, res, err_ns, err );

			if( !bfr ) return handleErr( req, res, err_ns, {
				'err_id'    : 'ghost_before',
				'before_id' : before_id
			});
			
			req.sent.expose.before = bfr;
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
		var maxDistance = req.sent.max_distance || 15000

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
					spherical          : true,
					near               : near,
					distanceField      : 'distance',
					maxDistance 	   : maxDistance
				}
			},
			{
				'$match': {
					status: { $in: ['open'] }
				}
			}
		])
		.exec(function( err, response ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.befores = response;
			next();

		});

	};

	module.exports = {
		createBefore        : createBefore,
		request             : request,
		changeBeforeStatus  : changeBeforeStatus,
		changeGroupStatus   : changeGroupStatus,
		fetchBefores        : fetchBefores,
		fetchBeforeById     : fetchBeforeById,
		updateBefore        : updateBefore,
		fetchGroups         : fetchGroups,
		fetchNearestBefores : fetchNearestBefores
	};