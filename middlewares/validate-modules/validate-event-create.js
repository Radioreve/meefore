
	var eventUtils  = require('../../pushevents/eventUtils'),
		moment      = require('moment'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel'),
		Place   	= require('../../models/PlaceModel');

	var nv          = require('node-validator');

	/* La base! */
	_.mixin({
	    pluckMany: function() {
	        var array = arguments[0],
	            propertiesToPluck = _.rest(arguments, 1);
	        return _.map(array, function(item) {
	            return _.partial(_.pick, item).apply(null, propertiesToPluck);
	        });
		}
	});


	function check( req, res, next ){

		console.log('Validating event');

		function isHostDuplicated( val, onError ){
			if( val.hosts_facebook_id && _.uniq( val.hosts_facebook_id ).length != val.hosts_facebook_id.length )
				onError('Hosts with the same id have been provided', 'hosts_facebook_id', val.hosts_facebook_id, { err_id: "twin_hosts"} );
		};

		function isDateAtLeastToday( val, onError ){
			if(  moment( val.begins_at ) < moment({'H':0,'m':0}) )
				onError('Date must be tomorrow or later', 'begins_at', val.begins_at, { err_id: "time_travel"} );
		};

		function isGoodAgerange( val, onError ){

			console.log(val.agerange);
			if( !/^\d{2}-\d{2}$/.test( val.agerange ) ){
				return onError('Agerange must match the required pattern', val.agerange );
			}

			var min_age = parseInt( val.agerange.split('-')[0] );
			var max_age = parseInt( val.agerange.split('-')[1] );

			if( min_age > max_age ){
				return onError('Agerange must be properly ordered', val.agerange );
			}

			if( min_age < settings.app.agerange_min || max_age > settings.app.agerange_max ){
				return onError('Agerange must be between ' + settings.app.agerange_min + ' and ' + settings.app.agerange_max, val.agerange );
			}
		};


		var checkHostId   = nv.isString({ regex: /^\d{10,}$/ });
		var checkAmbiance = nv.isString();

	/*	var checkParty  = nv.isAnyObject()

			.withRequired('_id', nv.isString({ regex: /^[a-z0-9]{24}$/ }));*/

		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )
			.withRequired('city_name'	, nv.isString() )

		var checkParty = nv.isAnyObject()

			.withRequired('type'		, nv.isString() )
			.withRequired('address'		, checkAddress  )

		var checkEvent = nv.isAnyObject()

			.withRequired('begins_at'           , nv.isDate() )
			.withRequired('socket_id'   		, nv.isString())
			.withRequired('address'				, checkAddress )
			.withRequired('party'		    	, checkParty )
			.withRequired('hosts_facebook_id'	, nv.isArray(  checkHostId, { min: settings.app.min_hosts , max: settings.app.max_hosts }))
			.withRequired('ambiance'			, nv.isArray(  checkAmbiance, { min: settings.app.min_ambiance, max: settings.app.max_ambiance }))
			.withRequired('agerange'			, nv.isString() )
			.withRequired('mixity'				, nv.isString({ expected: _.pluck( settings.app.mixity, 'id' )   }))
			.withCustom( isGoodAgerange )
			.withCustom( isHostDuplicated )
			.withCustom( isDateAtLeastToday )

		nv.run( checkEvent, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}
			checkWithDatabase( req, function( errors, event_data ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}
				req.sent.event_data = event_data;
				next();
			});
		});
	};


	function checkWithDatabase( req, callback ){

		var data = req.sent;
		var event_data = {};

		event_data.begins_at = data.begins_at;
		event_data.address   = data.address;
		event_data.ambiance  = data.ambiance;
		event_data.agerange  = data.agerange;
		event_data.party     = data.party;
		event_data.mixity    = data.mixity;

		// Weird, code auto converts it to string
		event_data.address.lat       = parseFloat( event_data.address.lat );
		event_data.address.lng       = parseFloat( event_data.address.lng );
		event_data.party.address.lat = parseFloat( event_data.party.address.lat );
		event_data.party.address.lng = parseFloat( event_data.party.address.lng );

		// No errors in parameters, checking for valid friend and places ids 
		var host_number = data.hosts_facebook_id.length;

		User.find({ 'facebook_id': { $in: data.hosts_facebook_id }}, function( err, hosts ){

			if( err ) return callback({ toClient: "api error", }, null );

			if( hosts.length != host_number )
				return callback({
					message : "Couldn't find " + ( host_number - hosts.length ) + " members",
					data    : {
						err_id		: "ghost_hosts",
						n_sent  	: host_number,
						n_found		: hosts.length,
						missing_ids : _.difference( data.hosts_facebook_id, _.pluck( hosts, 'facebook_id' ) )
					}}, null );

			var to_client = '';
			var err_data = { host_names: [] };

			hosts.forEach(function( host ){
				host.events.forEach(function( evt ){
					// known bug : wont catch the equivalent day sometimes...
					if( moment( new Date(evt.begins_at) ).dayOfYear() === moment( data.begins_at, 'DD/MM/YY').dayOfYear() ){
						err_data.host_names.push( host.name );
					}
				});
			});

			if( err_data.host_names.length != 0 )
				return callback({
					message : 'Host(s) already hosting an event this day',
					data    : _.merge( err_data, { err_id: "already_hosting"} )
				}, null );

			/* Hosts are validated*/
			event_data.hosts = _.pluckMany( hosts, settings.public_properties.users );

			return callback( null, event_data );


		/*	// Validating the place provided 
			Place.findById( data.scheduled_party._id, function( err, place ){

				if( err ) return callback({ message: "api error" }, null );

				if( !place ) 
					return callback({ 
						message : "Error fetching place, make sure you provided a good place_id",
						data    : { place_id: data.scheduled_party._id }
					}, null );

				event_data.scheduled_party = place;

				// Dunno why need to coerce to float
				event_data.address.lat = parseFloat( event_data.address.lat );
				event_data.address.lng = parseFloat( event_data.address.lng );

				//Everything went fine!
				console.log('Validation success!');
				return callback( null, event_data );

			});*/

		});

	};


	module.exports = {
		check: check
	};