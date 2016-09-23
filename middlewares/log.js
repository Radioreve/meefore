
	var log = require( process.cwd() + '/services/logger' );

	randomInt = function(low, high) {
	    return Math.floor(Math.random() * (parseInt(high) - parseInt(low) + 1) + parseInt(low));
	}

	function addContext( context ){
		return function( req, res, next ){

			req.log = req.log || log;

			if( context == "request" ){
				if( process.env.APP_ENV == "prod" ){
					req.log = req.log.child({ request_id: randomInt( 0, 100 )});
				}
				req.log.debug("HTTP %s %s", req.method, req.url.split('?')[0] );
			}

			if( context == "auth" ){
				req.log = req.log.child({ facebook_id: req.sent.facebook_id });
			}

			if( context == "user" ){
				var user = req.sent.user ? req.sent.user : null;
				req.log = req.log.child({ username: user.name });

				if( user ){
					req.log.info("User has been successfully populated");
				} else {
					req.log.info("User hasnt been populated");
				}
			}

			next();

		}
	}



	module.exports = {
		addContext: addContext
	};