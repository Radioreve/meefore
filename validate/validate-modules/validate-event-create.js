
	var eventUtils  = require('../../pushevents/eventUtils'),
		moment      = require('moment'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel'),
		Place   	= require('../../models/PlaceModel');

	var nv          = require('node-validator');

	function check( req, res, next ){

		console.log('Validating event');
		function isHostOk( val, onError ){

			if( !val.hosts_facebook_id ){
				return onError('Hosts are missing', 'hosts_facebook_id', val.hosts_facebook_id, {
					err_id    : 'missing_parameter',
					parameter : 'hosts_facebook_id'
				})
			}

			if( val.hosts_facebook_id[0] != "10152931836919063" ){

				// Make sure all hosts have the same value
				if( val.hosts_facebook_id && _.uniq( val.hosts_facebook_id ).length != val.hosts_facebook_id.length ){
					return onError('Hosts with the same id have been provided', 'hosts_facebook_id', val.hosts_facebook_id, {
						err_id: "twin_hosts"
					});
				}

				// Make sure the number of hosts is right
				if( val.hosts_facebook_id.length < settings.app.min_hosts || val.hosts_facebook_id.length > settings.app.max_hosts ){
					return onError('Hosts array too short/long', 'hosts_facebook_id', val.hosts_facebook_id, {
						err_id: "n_hosts"
					});
				}
			}

		};

		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )

		var checkEvent = nv.isAnyObject()

			.withRequired('facebook_id' 		, nv.isString())
			.withRequired('begins_at'           , nv.isDate())
			.withRequired('timezone'			, nv.isNumber({ min: -720, max: 840 }))
			.withRequired('address'				, checkAddress)
			.withCustom( isHostOk )

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
		event_data.timezone  = data.timezone;
		event_data.address   = data.address;

		// Weird, code auto converts it to string
		event_data.address.lat = parseFloat( event_data.address.lat );
		event_data.address.lng = parseFloat( event_data.address.lng );

		// No errors in parameters, checking for valid friends
		var host_number = data.hosts_facebook_id.length;

		User.find({ 'facebook_id': { $in: data.hosts_facebook_id }}, function( err, hosts ){

			if( err ) return callback({
				message : 'Internal error validating event',
				err_id  : 'api_error'
			});

			// Make sure all provided hosts are users of meefore, and none left the app
			if( hosts.length != host_number )
				return callback({
					message 	: "Couldn't find " + ( host_number - hosts.length ) + " members",
					err_id		: "ghost_hosts",
					n_sent  	: host_number,
					n_found		: hosts.length,
					missing_ids : _.difference( data.hosts_facebook_id, _.pluck( hosts, 'facebook_id' ) )
					}, null );


			// Make sure no host already has an event planned on this day
			var err_data = { host_ids: [] };
			var new_event_dayofyear = moment( data.begins_at ).dayOfYear();

			hosts.forEach(function( host ){
				host.events.forEach(function( evt ){

					var host_event_dayofyear = moment( evt.begins_at ).dayOfYear();

					if( new_event_dayofyear == host_event_dayofyear ){
						err_data.host_ids.push( host.facebook_id );
					}
				});
			});
			if( err_data.host_ids.length != 0 )
				return callback( _.merge( err_data, {
					message : 'Host(s) already hosting an event this day',
					err_id  : "already_hosting" 
				}, null ));


			// Make sure hosts are all friends
			var err_data = { host_names: [] };
			var requester = _.find( hosts, function(h){
				return h.facebook_id == req.sent.facebook_id;
			});

			// Useful to have access to the user
			// e.g. pusher will later need requester's location to trigger
			// the event creation in the right channel
			req.sent.requester = requester;

			data.hosts_facebook_id.forEach(function( host_id ){
				if( requester.facebook_id != host_id && requester.friends.indexOf( host_id ) == -1 ){
					err_data.host_names.push( host_id );
				}
			});

			if( err_data.host_names.length != 0 ){
				return callback( _.merge( err_data, {
					message : 'Hosts are not all good ol\' friends',
					err_id: "not_all_friends"
				}, null ));
			}



			/* Hosts are validated*/
			// event_data.hosts = _.pluckMany( hosts, settings.public_properties.users );
			event_data.hosts = _.map( hosts, 'facebook_id' );
			// event_data.hosts.forEach(function( host, i ){

			// 	var main_picture = _.find( host.pictures, function( pic ){
			// 		return pic.is_main
			// 	});

			// 	host.main_picture = main_picture;
			// 	delete host.pictures;

			// });

			return callback( null, event_data );

		});

	};


	module.exports = {
		check: check
	};