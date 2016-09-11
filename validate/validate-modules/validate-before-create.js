
	var eventUtils = require('../../pushevents/eventUtils');
	var moment     = require('moment');
	var _          = require('lodash');
	var settings   = require('../../config/settings');
	var Before     = require('../../models/BeforeModel');
	var User       = require('../../models/UserModel');
	var Place      = require('../../models/PlaceModel');
	var nv         = require('node-validator');

	function check( req, res, next ){

		console.log('Validating before');
		function isHostOk( val, onError ){

			if( !val.hosts_facebook_id ){
				return onError('Hosts are missing', 'hosts_facebook_id', val.hosts_facebook_id, {
					err_id    : 'missing_parameter',
					parameter : 'hosts_facebook_id'
				});
			}

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

		function isHashtagsOk( val, onError ){

			for( var i=0; i< val.length; i++ ){
				if( val[i].length > 30 ){
					return onError('Hashtag value is too long (>30)', 'hashtags', val.hashtags, {
						err_id: 'hashtags_length_limit'
					});
				}
			}

			if( val.length < settings.app.min_hashtags ){
				return onError('Hashtag array is too short ('+ settings.app.min_hashtags  +' minimum)', 'hashtags', val.hashtags, {
					err_id: 'hashtags_length_too_short'
				});
			}

			if( val.length > settings.app.max_hashtags  ){
				return onError('Hashtag array is too short ('+ settings.app.max_hashtags  +' maximum)', 'hashtags', val.hashtags, {
					err_id: 'hashtags_length_too_long'
				});
			}

		}

		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )

		var checkBefore = nv.isAnyObject()

			.withRequired('facebook_id' 		, nv.isString())
			.withRequired('begins_at'           , nv.isDate())
			.withRequired('hashtags' 			, nv.isArray())
			.withRequired('timezone'			, nv.isNumber({ min: -720, max: 840 }))
			.withRequired('address'				, checkAddress)
			.withCustom( isHostOk )
			.withCustom( isHashtagsOk )


		req.sent.timezone    = parseFloat( req.sent.timezone );
		req.sent.hashtags    = req.sent.hashtags.filter( Boolean );
		req.sent.address.lat = parseFloat( req.sent.address.lat );
		req.sent.address.lng = parseFloat( req.sent.address.lng );
		req.sent.begins_at 	 = new Date();
		
		nv.run( checkBefore, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}
			checkWithDatabase( req, function( errors, before_data ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}
				req.sent.before_data = before_data;
				next();
			});
		});
	};


	function checkWithDatabase( req, callback ){

		var data = req.sent;
		var before_data = {};

		before_data.main_host = data.facebook_id;
		before_data.begins_at = data.begins_at;
		before_data.timezone  = data.timezone;
		before_data.address   = data.address;
		before_data.hashtags  = data.hashtags;

		// Weird, code auto converts it to string
		before_data.address.lat = parseFloat( before_data.address.lat );
		before_data.address.lng = parseFloat( before_data.address.lng );

		// No errors in parameters, checking for valid friends
		var host_number = data.hosts_facebook_id.length;

		User.find({ 'facebook_id': { $in: data.hosts_facebook_id }}, function( err, hosts ){

			if( err ) return callback({
				message : 'Internal error validating before',
				err_id  : 'api_error'
			});

			// Make sure all provided hosts are users of meefore, and none left the app
			if( hosts.length != host_number ){
				return callback({
					message 	: "Couldn't find " + ( host_number - hosts.length ) + " members",
					err_id		: "ghost_hosts",
					n_sent  	: host_number,
					n_found		: hosts.length,
					missing_ids : _.difference( data.hosts_facebook_id, _.map( hosts, 'facebook_id' ) )
				}, null );
			}

			// Make sure no host already has an before planned on this day
			var err_data = { host_ids: [] };
			var new_before_dayofyear = moment( data.begins_at ).dayOfYear();

			hosts.forEach(function( host ){
				host.befores.forEach(function( bfr ){

					var host_before_dayofyear = moment( bfr.begins_at ).dayOfYear();

					if( bfr.status == "hosting" && new_before_dayofyear == host_before_dayofyear ){
						err_data.host_ids.push( host.facebook_id );
					}
				});
			});
			
			if( err_data.host_ids.length != 0 ){
				return callback( _.merge( err_data, {
					message : 'Host(s) already hosting a before this day',
					err_id  : "already_hosting" 
				}, null ));
			}

			// Make sure hosts are all friends
			var err_data = { hosts: [] };
			var requester = _.find( hosts, function(h){
				return h.facebook_id == req.sent.facebook_id;
			});

			// Useful to have access to the user
			// e.g. pusher will later need requester's location to trigger
			// the before creation in the right channel
			req.sent.requester = requester;


			// Only bots are allowed to create a before with virtually anyfriends
			if( requester.access.indexOf("bot") == -1 ){
				data.hosts_facebook_id.forEach(function( host_id ){
					if( requester.facebook_id != host_id && requester.friends.indexOf( host_id ) == -1 ){
						err_data.hosts.push( host_id );
					}
				});
			}

			if( err_data.hosts.length != 0 ){
				return callback( _.merge( err_data, {
					message : 'Hosts are not all good ol\' friends',
					err_id: "not_all_friends"
				}, null ));
			}



			/* Hosts are validated*/
			// before_data.hosts = _.pluckMany( hosts, settings.public_properties.users );
			req.sent.hosts_profiles = hosts;
			before_data.hosts       = _.map( hosts, 'facebook_id' );
			// before_data.hosts.forEach(function( host, i ){

			// 	var main_picture = _.find( host.pictures, function( pic ){
			// 		return pic.is_main
			// 	});

			// 	host.main_picture = main_picture;
			// 	delete host.pictures;

			// });

			return callback( null, before_data );

		});

	};


	module.exports = {
		check: check
	};