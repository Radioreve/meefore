	
	var eventUtils  = require('../pushevents/eventUtils');
	var settings    = require('../config/settings');
	var config 		= require('../config/config');
	var moment      = require('moment');
	var querystring = require('querystring');
	var request     = require('request');
	var _     	    = require('lodash');
	var log         = require('../services/logger');
	var print 	   = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/facebook.js' );
	var erh 		= require('../services/err');
	var User        = require('../models/UserModel');


	var updateFacebookToken = function( req, res, next ){
		
		// It is the client's responsibility to send as 'token' the right version (long/short)
		// meaning that if a client is used to auth with long version and detects that the long
		// version is soon out-dated, it has to force the client to give its credentials back

		var user        = req.sent.user;
		var token       = req.sent.fb_token;
		var expires_at  = req.sent.expires_at;

		// if( req.sent.bot ){
		// 	term.bold.green('Skipping the token update... (bearly)\n');
		// 	return next();
		// }

		// Check is long_lived needs to be refreshed with the short lived token from login
		// It is never the case when the user doesnt exist (signup), because the token is always a short one
		var remaining_days = moment( expires_at ).diff( moment(), 'd' );

		if( user && remaining_days > settings.facebook.token_lifespan_limit ){

			print.info( req, 'Facebook long lived token doesnt need to be refreshed, remaining_days : ' + remaining_days );
			return next();
		}

		// Token is 
		print.info( req, 'Updating Facebook token (long_lived)...');
		fetchLongLivedToken( token, function( err, body ){
		
			var err_ns = "updating_facebook_token";

			if( err ){
				return erh.handleBackErr( req, res, {
					source: "facebook",
					err_ns: err_ns,
					err: err
				});

			}	

			// Parse with querystring because response is a querystring, and not JSON
			var r = querystring.parse( body );

			// Make it accessible for the signup function 
			req.sent.facebook_access_token = {
				token      : r.access_token, // Brand new long_lived token
				expires_at : new Date( moment().add( r.expires, 's' ) ) // Keep the ISODate format for MongoDB
			}

			if( user ){

				user.facebook_access_token = req.sent.facebook_access_token;
				user.save(function( err, user ){

					if( err ) log.warn({ err: err }, "Unable to save the long lived token");

					next();

				});

			} else {
				next();

			}


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
							grant_type    : "client_credentials",
							client_id     : client_id,
							client_secret : client_secret
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
		return config.facebook[ process.env.APP_ENV ].client_id;
	}

	function getAppSecret(){
		return config.facebook[ process.env.APP_ENV ].client_secret;
	}

	function getRedirectUri(){
		return config.facebook[ process.env.APP_ENV ].redirect_uri;
	}

	function verifyFacebookCode( code, callback ){

		var err_ns = 'fetching_facebook_long_token';
		fetchTokenWithCode( code, function( err, body ){

			if( err ) return callback( err );

			// Parse with querystring because response is a querystring, and not JSON
			try {
				var r = JSON.parse( body );
			} catch( e ){
				try {
					r = querystring.parse( body );
				} catch( e ){
					return callback({
						message: "Unable to parse the response body from Facebook"
					}, null );
				}
			}
			
			callback( r.error, {
				fb_token   : r.access_token,
				expires_at : r.expires_at
			});

		});

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
    }

    function fetchTokenWithCode( code, callback ){

		var client_id     = getAppId();
		var client_secret = getAppSecret();
		var redirect_uri  = getRedirectUri();

		var url = 'https://graph.facebook.com/oauth/access_token?'
					+ querystring.stringify
					({
						client_id     : client_id,
						client_secret : client_secret,
						redirect_uri  : redirect_uri,
						code          : code
					});

		request.get( url, function( err, response, body ){

			if( err ){
				return callback( err, null );

			} else {
				return callback( null, body );
			}

		});

    }

	var fetchAndSyncFriends = function( req, res, next ){
 
		var err_ns = "fetching_facebook_friends";

		var user = req.sent.user;

		if( !user ){
			print.info( req, 'Unable to fetch facebook friends, no user object was found');
			return next();
		}

		var facebook_id  = user.facebook_id;
		var access_token = user.facebook_access_token.token;
		
		fetchFacebookFriends( facebook_id, access_token, function( err, res ){

			if( err ){
				return erh.handleBackErr( req, res, {
					source: "facebook",
					err_ns: err_ns,
					err: err
				});
			}

			print.info( req, 'Syncing new friends from Facebook');

			var friends = res.data;
			var new_friends = [];

			friends.forEach(function( f ){

				if( user.friends.indexOf( f.id ) == -1 ){
					new_friends.push({
						facebook_name : f.name,
						facebook_id   : f.id
					});
				} 

			});

			req.sent.new_friends = new_friends;

			user.friends = _.map( friends, 'id' );;
			user.save(function( err, user ){

				if( err ){
					return erh.handleMongoErr( req, res, err_ns, err );
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

		request.get( url, function( err, response, body ){

			body = JSON.parse( body );

			if( err ){
				return callback( err, null );

			} else {
				return callback( null, body );
			}

		});

	}

	function fetchFacebookProfile( facebook_id, access_token, callback ){

		var url = 'https://graph.facebook.com/v2.6/' + facebook_id + '?'
				  + querystring.stringify({
				  	access_token : access_token,
				  	fields       : 'name,gender,email,link,locale'
				  });

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
		getAppId 			 : getAppId,
		generateAppToken     : generateAppToken,
		updateFacebookToken  : updateFacebookToken,
		verifyFacebookToken  : verifyFacebookToken,
		verifyFacebookCode   : verifyFacebookCode,
		fetchAndSyncFriends  : fetchAndSyncFriends,
		fetchLongLivedToken  : fetchLongLivedToken,
		fetchFacebookProfile : fetchFacebookProfile,
		fetchTokenWithCode   : fetchTokenWithCode
	};