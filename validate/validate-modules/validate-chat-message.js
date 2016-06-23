
	var nv = require('node-validator');
	var rd = require('../../services/rd');
	var _  = require('lodash');


	function check( req, res, next ){
		
		var checkMessage = nv.isAnyObject()
			
			.withRequired('chat_id'        , nv.isString() )
			.withRequired('message'        , nv.isString() )
			.withRequired('facebook_id'    , nv.isString() )
			// .withOptional('offline_users'  , nv.isArray()  )
			// .withOptional('whisper_to'     , nv.isArray()  )

		nv.run( checkMessage, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				// Everything went fine
				next();
			});
		});
	};


	function checkSenderStatus( req, callback ){

		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;
		var user 		= req.sent.user;

		// User should only be allowed to send messages in chat channels that are part of their chat channels
		if( !user.getChatChannel( chat_id ) ){
			return callback({
				err_id  : 'ghost_channel',
				message : 'This chat is not part of users chat channels',
				chat_id : chat_id,
				allowed : user.getChatChannels()
			});
		}

		if( user.getChatChannel( chat_id ).status && !user.getChatChannel( chat_id ).status == "accepted" ){
			return callback({
				err_id  : 'unauthorized_action',
				message : 'This channel is closed until the hosts have validated the group',
				chat_id : chat_id
			});
		}

		// used to determine which channel to send the message to
		req.sent.type = user.getChatChannel( chat_id ).type;

		callback( null );
			
	
	};	

	module.exports = {
		check: check
	};

