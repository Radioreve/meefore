	
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	function check( req, res, next ){

		console.log('Validating change event status');

		var checkReq = nv.isAnyObject()
			.withRequired('status'   , nv.isString({ expected: ['open','suspended','canceled'] }) )
			.withRequired('socket_id', nv.isString() );
 
		nv.run( checkReq, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, evt ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}
			req.sent.evt          = evt;
			next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var facebook_id = req.sent.facebook_id;
			var event_id	= req.sent.event_id;

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

				if( _.pluck( evt.hosts, 'facebook_id' ).indexOf( facebook_id ) == -1 ){
					return callback({
						message		: "Unauthorized action!",
						parameter	: "facebook_id",
						data: {
							err_id 		: "unauthorized",
							facebook_id : facebook_id,
							authorized  : _.pluck( evt.hosts, "facebook_id"),
							event_id 	: req.event_id
						}
					}, null );
				}

				callback( null, evt );
					
				});
			
		};



	module.exports = {
		check: check
	};



		