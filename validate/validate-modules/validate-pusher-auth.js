
	var nv   = require('node-validator');
	var rd   = require('../../services/rd');
	var _    = require('lodash');
	var User = require('../../models/UserModel');

	var check = function( req, res, next ){

		var checkJoinRequest = nv.isAnyObject()
			.withRequired('socket_id'	, nv.isString({ match: /^\d+.\d+$/ }) )
			.withRequired('facebook_id' , nv.isString() );

		nv.run( checkJoinRequest, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, user ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				req.sent.user = user;
				next();

			});

		});
	};

	// Make sure the channel the user is trying to access is part of its channel
	// property array. All the channel logic is controlled and persisted server-side
	function checkWithDatabase( req, callback ){

		console.log('Checking user has permission to subscribe to this channel');

		// Passed in token, surcharged Pusher init clientside method [@48723]
		var facebook_id  = req.sent.facebook_id;
		var channel_name = req.sent.channel_name;

		User.findOne({ facebook_id: facebook_id }, function( err, user ){

			if( err ){
				return callback({
					message : 'Internal error validating pusher subscription',
					err_id  : 'api_error'
				});
			}

			if( !user ){
				return callback({
					err_id    : 'ghost_user',
					message   : 'Unable to find user',
					http_code : 403
				});
			}

			var channel = user.getChannel( channel_name );
			if( !channel ){
				return callback({
					err_id    : 'ghost_channel',
					message   : 'This channel is not a part of users channels',
					allowed   : user.channels,
					http_code : 403
				});
			}

			// if( channel.type == "chat" && channel.status )

			return callback( null, user );


		});
	}


	module.exports = {
		check: check
	};
