
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
			.withOptional('offline_users'  , nv.isArray()  )
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

		var before_id   = req.sent.before_id;
		var group_id    = req.sent.group_id;
		var facebook_id = req.sent.facebook_id;

		rd.smembers('before/' + before_id + '/hosts', function( err, hosts_id ){
			
			rd.get('group/' + group_id + '/status', function( err, status ){

				// User that has been validated to send message?
				if( group_id != "hosts" && status != 'accepted' )
					return callback({
						err_id   : "unauthorized_group",
						group_id : group_id,
						status   : status
					});

				// One of the hosts?
				if( group_id == "hosts" && hosts_id.indexOf( facebook_id ) == -1 )
					return callback({
						message  : "You are not an host",
						err_id   : "unauthorized_admin",
						hosts_id : hosts_id,
						sent 	 : req.sent,
					});

				callback( null );

			});
		});


	};	

	module.exports = {
		check: check
	};

	