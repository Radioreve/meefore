	
	var eventUtils  = require('../pushevents/eventUtils'),
		moment      = require('moment'),
		querystring = require('querystring'),
		request     = require('request'),
		_     	    = require('lodash');

	var User        = require('../models/UserModel');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var fetchFacebookLongLivedToken = function( req, res, next ){
			
		if( req.sent.bot ){
			console.log('Creating a bot, skipping the long-lived-token fetching procedure...');
			return next();
		}

		console.log('Fetching long_lived token for id : ' + req.sent.facebook_id );
		User.findOne({ facebook_id: req.sent.facebook_id }, function( err, user ){

			if( err ){
				return handleErr( req, res, 'fetching_facebook_long_token', {
					'err_id': 'server_error',
					'err': err
				});
			}

			if( !user ){
				return handleErr( req, res, 'fetching_facebook_long_token', {
					'err_id': 'ghost_user',
					'err': err
				});
			}

			/* Check is long_lived needs to be refreshed with the short lived token from login */
			if( user.facebook_access_token.long_lived ){
				var current_tk_valid_until = new moment( user.facebook_access_token.long_lived_valid_until );
				var now = new moment();
				var diff = current_tk_valid_until.diff( now, 'd' );

				if( diff > 30 ) {
					console.log('Facebook long lived token doesnt need to be refreshed, diff is : ' + diff );
					return next();
				}
			}

			/* User comes with auto_login:true, short_lived will be ask clientside */
			if( !user.facebook_access_token.short_lived ){
				console.log('Unable to find a short lived access token, skipping the refresh process...');
				return next();
			}

			/* Fetch a long lived token for user to use app with valid api requests for 60 days! */
			console.log('Setting facebook long lived token...');
			fetchLongLivedToken( user.facebook_access_token.short_lived, function( err, body ){
				
				var new_access_token = querystring.parse( body ).access_token;
				var expires          = querystring.parse( body ).expires;
				var valid_until      = new Date( new moment().add( expires, 's' ) );

				var facebook_access_token = user.facebook_access_token;

				facebook_access_token.short_lived            = null; //enforces that laters calls are done with refreshed short_lived token
				facebook_access_token.long_lived             = new_access_token;
				facebook_access_token.long_lived_valid_until = valid_until + '';

				User.findOneAndUpdate(
				{ facebook_id: req.sent.facebook_id },
				{ facebook_access_token: facebook_access_token },
				{ new: true },
				function( err, user ){

					if( err ){
						return handleErr( req, res, 'fetching_facebook_long_token', {
							'err_id': 'server_error',
							'err': err
						});
					}

					next();

				});
			});
		});
	};

	function fetchLongLivedToken( access_token, callback ){

				var client_id 	  	  = config.facebook[ process.env.NODE_ENV ].client_id,
					client_secret 	  = config.facebook[ process.env.NODE_ENV ].client_secret,
					grant_type    	  = "fb_exchange_token",
					fb_exchange_token = access_token;

				var url =  'https://graph.facebook.com/oauth/access_token?'
							+ querystring.stringify
							({ 
								grant_type        : grant_type,
								client_id         : client_id,
								client_secret     : client_secret,
								fb_exchange_token : fb_exchange_token 
							});

				request.get( url, function( err, response, body ){

					if( err )
						return callback( err, null );

					return callback( null, body );
				});
	    };

	module.exports = {
		fetchFacebookLongLivedToken: fetchFacebookLongLivedToken
	};