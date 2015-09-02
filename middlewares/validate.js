
	var errHandler = require('./errorHandler');

	var validate = function( namespace, types ){

		var types = Array.isArray( types ) ? types : [types];

		var middlewares = [ setNamespace(namespace), errHandler.stage ];

		var matches_files = {

			eid_params   : 'validate-event-id-params',
			fid_params   : 'validate-facebook-id-params',
			fid_body     : 'validate-facebook-id-body',
			socket_id    : 'validate-socket-id',

			create_event : 'validate-events',
			request      : 'validate-request',
			event_status : 'validate-event-status',
			group_status : 'validate-group-status',
			chat_message : 'validate-chat-message',
			chat_fetch   : 'validate-chat-fetch',

			test         : 'validate-test'
			
		};

		var path = './validate-modules/';
		types.forEach(function( type ){
			if( matches_files[ type ] ){
				middlewares.push( require( path + matches_files[ type ] ).check )
			} else { console.log('Couldnt find path for validation module'); }
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