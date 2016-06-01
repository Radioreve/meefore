	
	var eventUtils  = require('../pushevents/eventUtils');
	var settings    = require('../config/settings');
	var moment      = require('moment');
	var querystring = require('querystring');
	var request     = require('request');
	var _     	    = require('lodash');
	var term 		= require('terminal-kit').terminal;

	var User        = require('../models/UserModel');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var updateFacebookToken = function( req, res, next ){
		
		// It is the client's responsibility to send as 'token' the right version (long/short)
		// meaning that if a client is used to auth with long version and detects that the long
		// version is soon out-dated, it has to force the client to give its credentials back

		var user        = req.sent.user;
		var token       = req.sent.token;
		var expires_at  = req.sent.expires_at;

		if( req.sent.bot ){
			term.bold.green('Skipping the token update... (no user or bot)');
			return next();
		}

		// Check is long_lived needs to be refreshed with the short lived token from login
		// It is never the case when the user doesnt exist (signup), because the token is always a short one
		var remaining_days = moment( expires_at ).diff( moment(), 'd' );
		term.bold.green("Token still valid for : " + remaining_days + " days\n");
		if( user && remaining_days > settings.facebook.token_lifespan_limit ){
			term.bold.green('Facebook long lived token doesnt need to be refreshed, remaining_days : ' + remaining_days  + '\n');
			return next();
		}

		// Token is 
		console.log('Updating Facebook token (long_lived)...');
		fetchLongLivedToken( token, function( err, body ){
			
			if( err ){
				return handleErr( req, res, 'fetching_facebook_long_token', err );
			}	

			// Parse with querystring because response is a querystring, and not JSON
			var r = querystring.parse( body );
			user.facebook_access_token = {
				token      : r.access_token, // Brand new long_lived token
				expires_at : new Date( moment().add( r.expires, 's' ) ) // Keep the ISODate format for MongoDB
			}

			user.save(function( err, user ){

				if( err ){
					return handleErr( req, res, 'fetching_facebook_long_token', err );
				}

				next();

			});
		});
	};


	function generateAppToken( callback, mode ){

		var client_id     = getAppId();
		var client_secret = getAppSecret();

		// Return the shortcut that is allowed by Facebook
		if( mode != "fetch" ){
			
			var app_token = client_id + '|' + client_secret;
			return callback( null, app_token );

		} else {

			var url =  'https://graph.facebook.com/oauth/access_token?'
						+ querystring.stringify
						({ 
							grant_type        : "client_credentials",
							client_id         : client_id,
							client_secret     : client_secret
						});

			request.get( url, function( err, response, body ){

				//body is string expected 

				if( err ){
					return callback( err, null );

				} else {
					return callback( null, body );
				}

			})
			
		}
	}

	function getAppId(){
		return config.facebook[ process.env.NODE_ENV ].client_id;
	}

	function getAppSecret(){
		return config.facebook[ process.env.NODE_ENV ].client_secret;
	}

	function verifyFacebookToken( access_token, callback ){

		generateAppToken(function( err, app_token ){

			var url =  'https://graph.facebook.com/debug_token?'
						+ querystring.stringify
						({ 
							input_token  : access_token,
							access_token : app_token // Shortcut to bypass the request of app_token
						});

			request.get( url, function( err, response, body ){

				body = typeof body == "string" ? JSON.parse( body ) : body;

				if( err ){
					return callback( err, null );

				} else {
					return callback( null, body );
				}

			});

		}, "local" );
	}

	function fetchLongLivedToken( access_token, callback ){
		
		var client_id     = getAppId();
		var client_secret = getAppSecret();
		var grant_type    = "fb_exchange_token";

		var url =  'https://graph.facebook.com/oauth/access_token?'
					+ querystring.stringify
					({ 
						grant_type        : grant_type,
						client_id         : client_id,
						client_secret     : client_secret,
						fb_exchange_token : access_token 
					});

		request.get( url, function( err, response, body ){

			// body expected format : "access_token=EAAXR2Qo4lLoZD....&expires=2610505"

			if( err ){
				return callback( err, null );

			} else {
				return callback( null, body );
			}

		});
    };

	var fetchAndSyncFriends = function( req, res, next ){

		var user = req.sent.user;

		if( !user ){
			console.log('Cant fetch facebook friends, no user object was found');
			return next();
		}

		var facebook_id  = user.facebook_id;
		var access_token = user.facebook_access_token.long_lived || user.facebook_access_token.short_lived;

		fetchFacebookFriends( facebook_id, access_token, function( err, body ){

			if( err ){
				return handleErr( req, res, 'fetching_facebook_friends', err );
			}

			var facebook_res = body;

			var friends       = facebook_res.data;
			var friends_ids   = _.map( friends, 'id' );

			var n_friends_new = facebook_res.summary.total_count;
			var n_friends_old = user.friends.length;

			if( n_friends_new - n_friends_old <= 0 ){
				return next();
			}


			console.log('Adding and syncing new friends...');

			user.friends = friends_ids;
			user.markModified('friends');
			
			// This notification makes only sense for users that arent new
			if( user.status != "new" ){

				var new_friends = [];
				friends.forEach(function( f ){

					if( user.friends.indexOf( f.id ) == -1 ){
						new_friends.push({
							facebook_name : f.name,
							facebook_id   : f.id
						});
					}

				});

				var n = {
					notification_id : "new_friends",
					new_friends     : new_friends,
					happened_at     : new Date()
				};

				user.notifications.push( n );
				user.markModified('notifications');
			}

			user.save(function( err, user ){

				if( err ){
					return handleErr( req, res, 'fetching_facebook_friends', err );
				}

				next();

			});

		});

	};

	function fetchFacebookFriends( facebook_id, access_token, callback ){

		var url = 'https://graph.facebook.com/v2.6/' + facebook_id + '/friends?'
				  + querystring.stringify({
				  	access_token: access_token
				  });

		console.log('Requesting friends at url : ' + url );

		request.get( url, function( err, response, body ){

			body = JSON.parse( body );

			if( err ){
				return callback( err, null );

			} else {
				return callback( null, body );
			}

		});

	}


	module.exports = {
		getAppId 			: getAppId,
		generateAppToken    : generateAppToken,
		updateFacebookToken : updateFacebookToken,
		verifyFacebookToken : verifyFacebookToken,
		fetchAndSyncFriends : fetchAndSyncFriends,
		fetchLongLivedToken : fetchLongLivedToken
	};