
	var jwt 	    = require('jsonwebtoken'),
		eventUtils  = require('../pushevents/eventUtils'),
		config      = require('../config/config');


		var authenticate = function( audience ){

		return function( req, res, next ){

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


	module.exports = {
		authenticate: authenticate
	};