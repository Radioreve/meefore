
	var errHandler = require('./errorHandler');

	var validate = function( namespace ){

		// Builds in array of middlewares that will be sequentially called 
		// First of all, set up the namespace of the route that will be 
		// Used clientside to match the proper error message

		var matches_files = {
			
			myself					: 'validate-myself',
			auth_facebook			: 'validate-auth-facebook',
			create_before        	: 'validate-before-create',
			create_party        	: 'validate-party-create',
			create_place 			: 'validate-place-create',
			before_fetch         	: 'validate-before-fetch',
			before_group_request 	: 'validate-before-group-request',
			before_status        	: 'validate-before-status',
			before_group_status  	: 'validate-before-group-status',
			before_nearest 		    : 'validate-before-nearest',
			chat_message        	: 'validate-chat-message',
			chat_fetch          	: 'validate-chat-fetch',
			chat_readby         	: 'validate-chat-readby',
			pusher_auth				: 'validate-pusher-auth',
			user_fetch 				: 'validate-user-fetch',
			send_meepass			: 'validate-send-meepass',
			spotted					: 'validate-spotted',
			shared              	: 'validate-shared',
			invite_code				: 'validate-invite-code',
			sponsor					: 'validate-sponsor',
			update_profile_base 	: 'validate-update-profile-base',
			update_pictures		    : 'validate-update-pictures',
			update_picture_client	: 'validate-update-picture-client',
			upload_picture_url		: 'validate-upload-picture-url',
			users_fetch_more		: 'validate-users-fetch-more',
			chat_seen_by			: 'validate-chat-seen-by'
			
			//test                : 'validate-test'
			
		};

		var middlewares = [
			setNamespace( namespace ),
			errHandler.stage
		];

		var path = './validate-modules/';
		var full_path = path + matches_files[ namespace ];

		middlewares.push( require( full_path ).check )

	
		/* Will inspect the req.app_errors object and raise error if necessary */
		middlewares.push( errHandler.handle );

		return middlewares;

	};

	function setNamespace( namespace ){

		return function( req, res, next ){

			req.app_namespace = namespace || 'void_namespace';
			next();

		}
	};


module.exports = validate;