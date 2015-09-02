
	var nv = require('node-validator');
	var rd = require('../../globals/rd');

	var Event = require('../../models/EventModel');

	var id, group_id, facebook_id;

	function check( req, res, next ){
		
		id          = req.params.chat_id;
		group_id    = req.query.group_id;
		facebook_id = req.facebook_id;

		var checkFetch = nv.isAnyObject()
			.withRequired('id'         , nv.isString())
			.withRequired('facebook_id', nv.isString())

		var data = {
			id          : id,
			group_id    : group_id,
			facebook_id : facebook_id
		};
		console.log(JSON.stringify(data,null,4));
		nv.run( checkFetch, data, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors, author ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}

				// Everything went fine
				_.merge( req, { id: id, group_id: group_id, facebook_id: facebook_id } );
				next();


			});

		});

	};

	function checkSenderStatus( req, callback ){

			rd.smembers('chat:'+id+'/hosts', function( err, hosts_id ){
				rd.get('event:'+id+'/'+'group:'+group_id+'/status', function( err, status ){

					// User that has been validated to fetch messages ?
					if( group_id && status != 'accepted' )
						return callback({
							err_id: "unauthorized_group",
							data: {
								group_id: group_id
							}
						});

					// One of the hosts?
					if( !group_id && hosts_id.indexOf( facebook_id ) == -1 )
						return callback({
							message: "No group_id passed and you are not an admin",
							err_id: "unauthorized_admin",
							data: {
								hosts_id: hosts_id
							}
						});

					callback( null );

				});
			});


	};	


module.exports = {
	check: check
};