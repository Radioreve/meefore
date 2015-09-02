
	var nv = require('node-validator');
	var rd = require('../../globals/rd');

	var Event = require('../../models/EventModel');

	var name, facebook_id, img_id, img_vs, id, msg, group_id;

	function check( req, res, next ){
		
		id          = req.body.id;
		msg         = req.body.msg;
		name        = req.body.name;
		img_vs      = req.body.img_vs;
		img_id      = req.body.img_id;
		group_id    = req.body.group_id;
		facebook_id = req.body.facebook_id;

		var checkMessage = nv.isAnyObject()

			.withRequired('id'         , nv.isString())
			.withRequired('msg'        , nv.isString())
			.withRequired('name'       , nv.isString())
			.withRequired('img_vs'     , nv.isString())
			.withRequired('img_id'     , nv.isString())
			.withRequired('facebook_id', nv.isString())

		nv.run( checkMessage, req.body, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSenderStatus( req, function( errors, author ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}

				// Everything went fine
				_.merge( req, req.body );
				next();


			});

		});

	};

	function checkSenderStatus( req, callback ){

			rd.smembers('chat:'+id+'/hosts', function( err, hosts_id ){
				rd.get('event:'+id+'/'+'group:'+group_id+'/status', function( err, status ){

					// User that has been validated to send message?
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

	