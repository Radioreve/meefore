
	var nv = require('node-validator');
	var rd = require('../../services/rd');
	var _  = require('lodash');


	function check( req, res, next ){
		
		var checkMessage = nv.isAnyObject()
			
			.withRequired('before_id'      , nv.isString() )
			.withRequired('chat_id'        , nv.isString() )
			.withRequired('message'        , nv.isString() )
			.withRequired('group_id'       , nv.isString() )
			.withRequired('facebook_id'    , nv.isString() )
			// .withOptional('offline_users'  , nv.isArray()  )
			// .withOptional('whisper_to'     , nv.isArray()  )

		nv.run( checkMessage, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors, author ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				// Everything went fine
				next();
			});
		});
	};


	function checkSenderStatus( req, callback ){

		var group_id = req.sent.group_id;
		var chat_id  = req.sent.chat_id;

		// The only thing that should not be possible is for users to send a chat message in the all channel
		// When the group status is still pending
		if( !/all/i.test( chat_id ) ){
			return callback( null );
		}
			
		rd.get('group/' + group_id + '/status', function( err, status ){

			// User that has been validated to send message ?
			if( status != "accepted" ){
				return callback({
					"err_id": "status_not_accepted",
					"status": status
				}, null );
			}

			callback( null );

		});


	};	

	module.exports = {
		check: check
	};

	