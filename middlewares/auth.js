
	var jwt 	    = require('jsonwebtoken'),
		eventUtils  = require('../pushevents/eventUtils'),
		config      = require('../config/config');


		var authenticate = function( audience ){

		return function( req, res, next ){

			if( audience.indexOf('test_mode') != -1 ){
				console.log('Test mode activated, passing in with facebook_id : ' + req.body.facebook_id );
				req.facebook_id = req.body.facebook_id;
				return next();
			}
			
			var token =    req.headers && req.headers['x-access-token'] 
						|| req.body    && req.body.token 
						|| req.params  && req.params.token 
						|| req.query   && req.query.token 

			if( !token )
				return eventUtils.raiseError({ res: res,
					toClient : "Un token est nécessaire pour appeler cette route"
				});

			console.log('Authenticating for this route...');
			var payload;
			try{
				payload = jwt.verify( token, config.jwtSecret, { audience: audience });
			} catch( err ){
				console.log( err.message );
				return eventUtils.raiseError({ res: res, err: err,
					toClient : "Cette action n'est pas autorisée"
				});
			}
			
			console.log('... success!');

			req.user_id 	= payload._id;
			req.facebook_id = payload.facebook_id;

			return next();		
			
		};
	};	


	module.exports = {
		authenticate: authenticate
	};