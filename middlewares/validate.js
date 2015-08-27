
	var errHandler = require('./errorHandler');

	var validate = function( namespace, types ){

		var types = Array.isArray( types ) ? types : [types];

		var middlewares = [ setNamespace(namespace), errHandler.stage ];

		var matches_files = {
			create_event : 'validate-events',
			event_id     : 'validate-event-id',
			request      : 'validate-request',
			facebook_id  : 'validate-facebook-id',
			socket_id    : 'validate-socket-id',
			test         : 'validate-test'
		};

		var path = './validate-modules/';
		types.forEach(function( type ){
			if( matches_files[ type ] ){
				middlewares.push( require( path + matches_files[ type ] ).check )
			} 
		});

		/* Will inspect the req.app_errors object and raise error if necessary */
		middlewares.push( errHandler.handle );

		return middlewares;

	};

	function setNamespace(namespace){
		return function(req, res, next){
			req.app_namespace = namespace || 'void_namespace';
			return next();
		}
	};


module.exports = validate;