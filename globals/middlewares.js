
	var jwt 	    = require('jsonwebtoken'),
		eventUtils  = require('../pushevents/eventUtils'),
		config      = require('../config/config'),
		request     = require('request'),
		moment      = require('moment'),
		User        = require('../models/UserModel'),
		querystring = require('querystring'),
		lodash      = require('lodash'),
		mailer      = require('./mailer'),
		settings    = require('../config/settings');


	var authenticate = function( audience ){

		return function( req, res, next ){

			var cookies = req.cookies;
			var token = req.headers['x-access-token'];

			console.log('Authenticating for this route...');
			
			var payload;
			try{
				payload = jwt.verify( token, config.jwtSecret, { audience: audience });
			} catch (err) {
				console.log( err.message );
				return eventUtils.raiseError({
					res:res,
					err:err,
					toClient:"Cette action n'est pas autorisée"
				});
			}
			
			console.log('... success!');
			req.body.userId = payload._id;
			return next();		
			
		};
	};	

	var fetchFacebookLongLivedToken = function( auth_type ){

		return function( req, res, next ){

			if( auth_type == 'facebook_id' && req.body.facebook_id )
				var query = { 'facebook_id': req.body.facebook_id };

			if( auth_type == 'app_id' && req.body.userId )
				var query = { '_id' : req.body.userId };

			if( !query )
				return eventUtils.raiseError({ res: res, toClient: "Bad identifier" });

			User.findOne( query, function( err, user ){

				if( err || !user )
					return eventUtils.raiseError({ err: err, res: res, toClient: "Bad request (E82)" });

				/* 
					Testing if the current long lived token needs to be refreshed
					The user must provide a recent short_lived_token at is point
				*/

				/* User comes with auto_login:true, short_lived will be ask clientside */
				if( !user.facebook_access_token.short_lived )
					return next();

				/* Check is long_lived needs to be refreshed with the short lived token from login */
				if( user.facebook_access_token.long_lived )
				{
					var current_tk_valid_until = new moment( user.facebook_access_token.long_lived_valid_until );
					var now = new moment();
					var diff = current_tk_valid_until.diff( now, 'd' );

					if( diff > 30 )
					{
						console.log('Facebook long lived token doesnt need to be refreshed, diff is : ' + diff );
						return next();
					}
				}

				/* Fetch a long lived token for user to use app with valid api requests for 60 days! */
				console.log('Setting Facebook long lived token...');
				fetchLongLivedToken( user.facebook_access_token.short_lived, function( err, body ){

					var new_access_token     = querystring.parse( body ).access_token,
							expires          = querystring.parse( body ).expires,
							valid_until 	 = new Date( new moment().add( expires, 's' ) );

					var facebook_access_token = user.facebook_access_token;
						facebook_access_token.short_lived = null; //enforces that laters calls are done with refreshed short_lived token
						facebook_access_token.long_lived  = new_access_token;
						facebook_access_token.long_lived_valid_until = valid_until + '';

					User.findOneAndUpdate( query,
					{ facebook_access_token: facebook_access_token },
					{ new: true },
					function( err, user ){

						if( err )
							return eventUtils.raiseError({ err: err, res: res, toClient: "Bad Request (E83)" });

						next();
					});
				});
			});
		};
	};

	function fetchLongLivedToken( access_token, callback ){

				var client_id 	  	  = config.facebook.client_id,
					client_secret 	  = config.facebook.client_secret,
					grant_type    	  = "fb_exchange_token",
					fb_exchange_token = access_token;

				var url =  'https://graph.facebook.com/oauth/access_token?'
							+ querystring.stringify
							({ 
								grant_type: grant_type,
								client_id: client_id,
								client_secret: client_secret,
								fb_exchange_token: fb_exchange_token 
							});

				request.get( url, function( err, response, body ){

					if( err )
						return callback( err, null );

					return callback( null, body );
				});
	    };


	var subscribeMailchimpUser = function( email_address ){

		var email_address = email_address;

		return function( req, res, next ){

			mailer.addMailchimpUser( email_address, function( err, response ){

				if( err )
					return eventUtils.raiseError({
						res: res,
						err: err,
						toClient: "Error calling mailchimp api"
					});

				next();		
			});
		};
	};

	var fetchUser = function( auth_type ){
		return function( req, res, next ){

			/* Détection automatique du mode d'authentification */
			if( auth_type == 'facebook_id' && req.body.facebook_id )
				var query = { 'facebook_id': req.body.facebook_id };

			if( !auth_type && req.body.facebook_id )
				var query = { 'facebook_id': req.body.facebook_id };

			if( auth_type == 'app_id' && req.body.userId )
				var query = { '_id' : req.body.userId };

			if( !auth_type && req.body.userId )
				var query = { '_id' : req.body.userId };

			if( !query )
				return eventUtils.raiseError({
					toClient: "No id method provided",
					res: res,
				});

			User.findOne( query, function( err, user ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res, toClient: "Bad request (E83)" });

				if( user ){
					req.body.user = user;
				} else {
					req.body.user = null;
				}
			
				return next();

			});

		};
	};


	module.exports = {
		authenticate: authenticate,
		subscribeMailchimpUser: subscribeMailchimpUser,
		fetchFacebookLongLivedToken: fetchFacebookLongLivedToken
	}

