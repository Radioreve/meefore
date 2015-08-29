	
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	function check( req, res, next ){

		console.log('Validating change group status');

		req.group_id     = req.params.group_id;
		req.group_status = req.body.group_status;

		var checkReq = nv.isObject()
			.withRequired('group_status', nv.isString({ expected: ['accepted','kicked'] }) )
			.withRequired('group_id',	  nv.isString() )

		nv.run( checkReq, { group_id: req.group_id, group_status: req.group_status }, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, evt ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

			req.evt = evt;
			next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var event_id = req.event_id,
				group_id = req.group_id;

			Event.findById( event_id, function( err, evt ){

				if( err ) return callback({ message: "api error" }, null );

				if( !evt )
					return callback({
						message		: "Couldnt find the event",
						data: {
							err_id		: "ghost_event",
							event_id	: event_id
						}
					}, null );

				/*
				if( _.pluck( evt.hosts, 'facebook_id' ).indexOf( req.facebook_id ) == -1 ){
					return callback({
						message		: "Unauthorized action!",
						parameter	: "facebook_id",
						data: {
							err_id 		: "unauthorized",
							authorized  : _.pluck( evt.hosts, "facebook_id"),
							event_id 	: req.event_id
						}
					}, null );
				}f
				*/

				if( evt.getGroupIds().indexOf( group_id ) == -1 ){
					return callback({
						message		: "No matching group id was found",
						parameter	: "group_id",
						data: {
							err_id 		: "invalid_group_id",
							group_id    : req.group_id,
							group_ids   : evt.getGroupIds()
						}
					}, null );
				};

				callback( null, evt );
					
				});
			
		};



	module.exports = {
		check: check
	};

