
	var nv = require('node-validator');
	var rd = require('../../globals/rd');
	var _  = require('lodash');

	var id, name, facebook_id, group_id;

	function check( req, res, next ){

		id          = req.params.chat_id;
		facebook_id = req.facebook_id || req.body.facebook_id;
		group_id    = req.body.group_id;

		var checkReadbyRequest = nv.isAnyObject()
			.withRequired('id',		nv.isString())
			.withRequired('name',	nv.isString());

		console.log('id here is : ' + id );

		var data = {
			id          : id,
			name        : req.body.name,
			facebook_id : facebook_id
		};

		nv.run( checkReadbyRequest, data, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors, author ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}

				_.merge( req, req.body )
				req.id = id;
				next();

			});
		});
		
	};

	function checkSenderStatus( req, callback ){

			rd.smembers('chat/'+id+'/hosts', function( err, hosts_id ){

				rd.get('event/'+id+'/'+'group/'+group_id+'/status', function( err, status ){

					// User that has been validated to fetch messages ?
					if( group_id && status != 'accepted' )
						return callback({
							err_id : "unauthorized_group",
							data   : {
								group_id : group_id,
								location : "validate chat readby",
								status   : status
							}
						});

					// One of the hosts?
					if( !group_id && hosts_id.indexOf( facebook_id ) == -1 )
						return callback({
							message : "No group_id passed and you are not an admin",
							err_id  : "unauthorized_admin",
							data: {
								hosts_id : hosts_id,
								location : "validate chat readby"
							}
						});

					callback( null );

				});
			});


	};	

	module.exports = {
		check: check
	};