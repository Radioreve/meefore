
	var nv = require('node-validator');
	var rd = require('../../services/rd');

	function check( req, res, next ){

		var checkFetch = nv.isAnyObject()
		
			.withRequired('group_id'    , nv.isString() )
			.withRequired('chat_id'		, nv.isString() )
			.withRequired('event_id'	, nv.isString() )
			.withRequired('facebook_id' , nv.isString() )
			.withRequired('socket_id'   , nv.isString() )

		nv.run( checkFetch, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkSenderStatus( req, function( errors, author ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
	};

	function checkSenderStatus( req, callback ){

			var event_id    = req.sent.event_id;
			var group_id    = req.sent.group_id;
			var facebook_id = req.sent.facebook_id;

			rd.smembers('event/' + event_id + '/hosts', function( err, hosts_id ){
				
				rd.get('event/' + event_id + '/group/' + group_id + '/status', function( err, status ){

					// User that has been validated to fetch message?
					if( group_id != "hosts" && status == "suspended" )   // On autorise les "kick" 
						return callback({
							err_id: "unauthorized_fetch",
							data: {
								group_id : group_id,
								status   : status,
								sent     : req.sent,
								location : "validate chat fetch [hosts]"
							}
						});

					// One of the hosts?
					if( group_id == "hosts" && hosts_id.indexOf( facebook_id ) == -1 )
						return callback({
							message: "You are not an admin",
							err_id: "unauthorized_fetch",
							data: {
								hosts_id : hosts_id,
								sent     : req.sent,
								location : "validate chat fetch"
							}
						});

					callback( null );

				});
			});


	};	


module.exports = {
	check: check
};