
	var errHandler = require('./errorHandler');

	var validate = function( namespace, types ){

		var types = Array.isArray( types ) ? types : [ types ];

		var middlewares = [ setNamespace( namespace ), errHandler.stage ];

		var matches_files = {
			
			create_event        : 'validate-event-create',
			create_party        : 'validate-party-create',
			event_fetch         : 'validate-event-fetch',
			event_group_request : 'validate-event-group-request',
			event_status        : 'validate-event-status',
			event_group_status  : 'validate-event-group-status',
			chat_message        : 'validate-chat-message',
			chat_fetch          : 'validate-chat-fetch',
			chat_readby         : 'validate-chat-readby',
			pusher_auth			: 'validate-pusher-auth',
			user_fetch 			: 'validate-user-fetch'
			
			//test                : 'validate-test'
			
		};

		var path = './validate-modules/';
		types.forEach(function( type ){
			if( matches_files[ type ] ){
				middlewares.push( require( path + matches_files[ type ] ).check )
			} else { console.log('Couldnt find path for validation module : ' + type ); }
		});

		/* Will inspect the req.app_errors object and raise error if necessary */
		middlewares.push( errHandler.handle );

		return middlewares;

	};

	function setNamespace( namespace ){

		return function(req, res, next){

			req.app_namespace = namespace || 'void_namespace';
			next();

		}
	};


module.exports = validate;