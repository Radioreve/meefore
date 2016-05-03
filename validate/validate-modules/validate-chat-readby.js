
	var nv = require('node-validator');
	var rd = require('../../services/rd');
	var _  = require('lodash');

	function check( req, res, next ){

		var checkReadbyRequest = nv.isAnyObject()

			.withRequired('chat_id'  , nv.isString() )
			.withRequired('before_id' , nv.isString() )
			.withRequired('group_id' , nv.isString() )
			.withRequired('socket_id', nv.isString() )
			.withRequired('name'     , nv.isString() );

		nv.run( checkReadbyRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
		
	};

	function checkSenderStatus( req, callback ){

		var before_id    = req.sent.before_id;
		var group_id    = req.sent.group_id;
		var facebook_id = req.sent.facebook_id;
		
		rd.smembers('before/' + before_id + '/hosts', function( err, hosts_id ){
			
			rd.get('before/' + before_id + '/group/' + group_id + '/status', function( err, status ){

				// User that has been validated to send message?
				if( group_id != "hosts" && status != 'accepted' )
					return callback({
						err_id: "unauthorized_group",
						data: {
							group_id : group_id,
							status   : status,
							location : "validate chat message"
						}
					});

				// One of the hosts?
				if( group_id == "hosts" && hosts_id.indexOf( facebook_id ) == -1 )
					return callback({
						message: "You are not an admin",
						err_id: "unauthorized_admin",
						data: {
							hosts_id: hosts_id,
							location: "validate chat message"
						}
					});

				callback( null );

			});
		});


	};	

	module.exports = {
		check: check
	};