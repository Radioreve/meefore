
	var jwt = require('jsonwebtoken'),
		eventUtils = require('../pushevents/eventUtils'),
		config = require('../config/config');


		var authenticate = function( audience ){

		return function( req, res, next ){

			var cookies = req.cookies;
			var token = req.cookies.token || ( req.body && req.body.token ) || ( req.query && req.query.token ) || req.headers['x-access-token'];
			
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
			
			req.userId = payload._id;
			return next();		
			
		};
	};	


	module.exports = {
		authenticate: authenticate
	}

