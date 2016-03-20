
	var jwt 	    = require('jsonwebtoken'),
		eventUtils  = require('../pushevents/eventUtils'),
		config      = require('../config/config');

	var pusher = require('../services/pusher');


	var authenticate = function( audience ){

		return function( req, res, next ){

			var token = req.headers && req.headers['x-access-token'] || req.sent.token;
			
			// Allow root users to bypass the app token required for  calls from terminals
			if( audience.indexOf('root') != -1 && req.sent.rootkey == "M33forever" ){
				return next();
			}

			if( !token ){
				return eventUtils.raiseError({ res: res,
					toClient : "Un token est nécessaire pour appeler cette route"
				});
			}

			console.log('Authenticating [api]');

			var payload;
			try{
				payload = jwt.verify( token, config.jwtSecret, { audience: audience });
			} catch( err ){
				console.log( err.message );
				return eventUtils.raiseError({ res: res, err: err,
					toClient : "Cette action n'est pas autorisée"
				});
			}
			
			// Important : make sure that the facebook_id used in all api calls via the req.sent object is always
			// the one of the user, to prevent anybody from hijacking api calls with any id (masquerade attempt)
			req.sent.user_id 	 = payload._id;
			req.sent.facebook_id = payload.facebook_id || payload.id;

			// Get the expose object already setup with update_id. That will ping/pong and stay unchanged 
			// For the client to be able to uniquely identify each of its calls
			req.sent.expose = {};
			req.sent.expose.call_id = req.sent.call_id;

			return next();		
			
		};
	};	

	var makeToken = function( req, res ){

		var api_key = req.body.api_key;
		var data    = req.body.data;

		if( api_key != 'meeforever' ){
			return res.json({ err: "Unauthorized - wrong api_key" });
		}

		if( !data ){
			return res.json({ err: "Unauthorized - didnt provide data upon which to sign to token" });
		}

		var access_token = eventUtils.generateAppToken( "app", data );

		res.json({ token: access_token }).end();
	};

	var authPusherChannel = function( req, res ){

		var facebook_id = req.sent.facebook_id;
		var socket_id   = req.sent.socket_id;
		var channel     = req.sent.channel_name;

		var data = {
			user_id: facebook_id,
			user_info: {
				group_id: channel.split('-')[2]
			}
		};

		var auth;	
		try {
			auth = pusher.authenticate( socket_id, channel, data );
		} catch( e ){
			res.status( 403 ).json({ msg: "Cant sign pusher auth token ", err: e });
		}

		res.status( 200 ).send( auth );
	};


	module.exports = {
		authenticate      : authenticate,
		makeToken         : makeToken,
		authPusherChannel : authPusherChannel
	};