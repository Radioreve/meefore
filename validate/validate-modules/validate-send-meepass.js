
	var nv = require('node-validator');
	var _  = require('lodash');

	var User = require('../../models/UserModel');


	function check( req, res, next ){

		var checkSendMeepassRequest = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('receiver_id' , nv.isString() )
			.withRequired('socket_id'   , nv.isString() )
			.withRequired('event_id'    , nv.isString() )

		nv.run( checkSendMeepassRequest, req.sent, function( n, errors ){
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

		var sender_id   = req.sent.facebook_id;
		var receiver_id = req.sent.receiver_id;

		var users_facebook_id = [ sender_id, receiver_id ];

		if( sender_id == receiver_id ){
			return callback({
				'err_id': 'twin_user',
				'msg': 'Cant sent a meepass for himself'
			});
		}
		
		User.find({ 'facebook_id': { '$in': users_facebook_id } }, function( err, users ){

			var users_facebook_id = _.pluck( users, 'facebook_id' );

			var sender = _.find( users, function( usr ){ 
				return usr.facebook_id == sender_id;
			});

			var receiver = _.find( users, function( usr ){
				return usr.facebook_id == receiver_id;
			});

			// Database internal error
			if( err ){
				return callback('db_error');
			}

			// Couldn't find the sender of the meepass (user)
			if( users_facebook_id.indexOf( sender_id ) == -1 ){
				return callback({ 
					'err_id'	 : 'no_sender_found',
					// 'users_facebook_id': users_facebook_id,
					// 'users'  : users, 
					'sender_id'  : sender_id, 
					'receiver_id': receiver_id 
				});
			}

			// Couldn't find the receiver (target)
			if( users_facebook_id.indexOf( receiver_id ) == -1 ){
				return callback({ 
					'err_id'	 : 'no_receiver_found',
					// 'users'      : users,
					// 'users_facebook_id': users_facebook_id,
					'sender_id'  : sender_id, 
					'receiver_id': receiver_id 
				});
			}
			console.log( sender );
			// Sender doesn't have enough meepass to do the action
			if( sender.n_meepass < 1 ){
				return callback({ 
					'err_id'		  : 'not_enough_meepass',
					'current_meepass' : sender.n_meepass
				});
			}

			req.sent.receiver = receiver;
			req.sent.sender   = sender;
			
			callback( null );			


		});

	}



	module.exports = {
		check: check
	};