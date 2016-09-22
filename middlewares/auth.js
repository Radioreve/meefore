
	var jwt 	    = require('jsonwebtoken');
	var log 		= require('../services/logger');
	var erh 		= require('../services/err');
	var eventUtils  = require('../pushevents/eventUtils');
	var config      = require('../config/config');
	var tk 	        = require('../services/tk');

	var pusher = require('../services/pusher');


	var authenticate = function( audience ){

		var err_ns = "authenticating_user";

		return function( req, res, next ){
						
			if( req.sent.api_key == config.admin_api_key ){
				log.info("Bypassing the auth middleware (admin api_key provided)");
				return next();
			}

			var token = req.headers && req.headers['x-access-token']
			            || req.sent.token
			            || req.sent.app_token;
			
			if( !token ){
				return erh.handleFrontErr( req, res, {
					message: "You need a valid app token to access this ressource",
					err_ns: err_ns
				});
			}

			try{
				var payload = jwt.verify( token, config.jwtSecret, {
					audience: audience
				});

			} catch( err ){
				return erh.handleFrontErr( req, res, {
					msg: "Action unauthorized (unable to decode the token)",
					err_ns: err_ns,
					err: err
				});

			}
			
			// Important : make sure that the facebook_id used in all api calls via the req.sent object is always
			// the one of the user, to prevent anybody from hijacking api calls with any id;
			req.sent.facebook_id = payload.facebook_id || payload.id;

			// Get the expose object, which is what is always returned to the client, already setup with update_id. 
			// That will ping/pong and stay unchanged for the client to be able to uniquely identify each of its calls
			req.sent.expose.call_id = req.sent.call_id;

			return next();		
			
		};
	};	


	var authPusherChannel = function( req, res ){

		var facebook_id = req.sent.facebook_id;
		var socket_id   = req.sent.socket_id;
		var channel     = req.sent.channel_name;

		var auth;	
		try {
			// Create an authentication string, like a token, that will be send back 
			// To the pusher servers, and used later to query informations about user
			// More infos @https://pusher.com/docs/authenticating_users#/lang=node
			auth = pusher.authenticate( socket_id, channel );

		} catch( e ){
			res.status( 403 ).json({
				msg: "The pusher.auhtenticate method failed",
				err: e
			});
		}

		res.status( 200 ).send( auth );

	};


	module.exports = {
		authenticate      : authenticate,
		authPusherChannel : authPusherChannel
	};