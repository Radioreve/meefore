
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

		var evt = req.body;

		function isHostDuplicated( val, onError ){

			if( _.uniq( val.hosts_facebook_id ).length != val.hosts_facebook_id.length )
				onError('Hosts with the same id have been provided', 'hosts_facebook_id', val.hosts_facebook_id );
		};

		function isDateAtLeastToday( val, onError ){
			if(  moment( val.begins_at, 'DD/MM/YY') < moment({'H':0,'m':0}) )
				onError('Date must be tomorrow or later', 'begins_at', val.begins_at );
		};

		var checkHostId   = nv.isString({ regex: /^\d{10,}$/ });
		var checkAmbiance = nv.isString();

		var checkParty  = nv.isObject()
			.withRequired('_id', nv.isString({ regex: /^[a-z0-9]{24}$/ }));

		var checkAddress = nv.isObject()
			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )
			.withRequired('city_name'	, nv.isString() )

		var checkEvent = nv.isObject()
			.withRequired('address'				, checkAddress )
			.withRequired('scheduled_party'		, checkParty )
			.withRequired('hosts_facebook_id'	, nv.isArray(  checkHostId, { min: 2, max: 4 }))
			.withRequired('ambiance'			, nv.isArray(  checkAmbiance, { min: 1, max: 5 }))
			.withRequired('agerange'			, nv.isString({ expected: _.pluck( settings.app.agerange, 'id' ) }))
			.withRequired('mixity'				, nv.isString({ expected: _.pluck( settings.app.mixity, 'id' )   }))
			.withRequired('begins_at'           , nv.isDate({ format: 'DD/MM/YY'}))
			.withCustom( isHostDuplicated )
			.withCustom( isDateAtLeastToday )

		nv.run( checkEvent, evt, function( n, errors ){

			if( n != 0 )
				return res.json( errors ).end();

			checkWithDatabase( req, function( errors, event_data ){

				if( errors )
					return eventUtils.raiseError( _.merge({ res: res }, errors ));

				req.event_data = event_data;
				next();

			});

		});
	};


	function checkWithDatabase( req, callback ){

		var data = req.body;
		var event_data = {};

		event_data.begins_at = data.begins_at;
		event_data.address   = data.address;
		event_data.ambiance  = data.ambiance;
		event_data.agerange  = data.agerange;
		event_data.mixity    = data.mixity;

		// No errors in parameters, checking for valid friend and places ids 
		var host_number = data.hosts_facebook_id.length;

		User.find({ 'facebook_id': { $in: data.hosts_facebook_id }}, function( err, hosts ){

			if( err ) return callback({ toClient: "api error", }, null );

			if( hosts.length != host_number )
				return callback({
							toClient: 'Error, couldnt find ' + ( host_number - hosts.length ) + ' members',
						}, null );

			var host_already_hosting = false;
			var to_client = '';

			hosts.forEach(function( host ){
				host.events.forEach(function( evt ){
					if( moment( new Date(evt.begins_at) ).dayOfYear() - 1 === moment( data.begins_at, 'DD/MM/YY').dayOfYear() ){
						host_already_hosting = true;
						to_client = host.name + ' already hosting an event this day';
					}
				});
			});

			if( host_already_hosting )
				return callback({ toClient: to_client }, null );

			/* Hosts are validated*/
			event_data.hosts = _.pluckMany( hosts, settings.public_properties.users );


			/* Validating the place provided */
			Place.findById( data.scheduled_party._id, function( err, place ){

				if( err ) return callback({ toClient: "api error", }, null );

				if( !place ) return callback({ toClient: "Error fetching place, make sure you provided a good place_id", }, null );

				event_data.scheduled_party = place;

				// Dunno why need to coerce to float
				event_data.address.lat = parseFloat( event_data.address.lat );
				event_data.address.lng = parseFloat( event_data.address.lng );

				//Everything went fine!
				console.log('Validation success!');
				return callback( null, event_data );

			});

		});

	};


	module.exports = {
		check: check
	};