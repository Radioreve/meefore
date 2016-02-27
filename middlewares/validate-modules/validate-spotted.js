
	var nv = require('node-validator');
	var _  = require('lodash');

	var User  = require('../../models/UserModel');
	var Event = require('../../models/EventModel');
	var Party = require('../../models/PartyModel');


	var fb_id_regex = /^\d{10,15}$/;
	var db_id_regex = /^[a-f\d]{24}$/i;

	function isIdOk( val, onError ){

		if( val.target_type == "user" && !fb_id_regex.test( val.target_id ) ){
			return onError('The id provided doesnt match the required pattern.', 'wrong_pattern', val.target_id, {
					err_id			 : "wrong_pattern",
					expected_pattern : 'Facebook id'
				});
		}

		if( ( val.target_type == "before" || val.target_type == "party" ) && !db_id_regex.test( val.target_id ) ){
			return onError('The id provided doesnt match the required pattern.', 'wrong_pattern', val.target_id, {
					err_id			 : "wrong_pattern",
					expected_pattern : 'MongoDB BSON id'
				});
		}

	}

	function check( req, res, next ){

		var checkSpotRequest = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('target_id'   , nv.isString() )
			.withRequired('target_type' , nv.isString() )
			.withRequired('socket_id'   , nv.isString() )
			.withCustom( isIdOk )

		nv.run( checkSpotRequest, req.sent, function( n, errors ){
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

		var facebook_id = req.sent.facebook_id;
		var target_id   = req.sent.target_id;
		var target_type = req.sent.target_type;

		if( facebook_id == target_id ){
			return callback({
				'err_id' : 'twin_target',
				'msg'    : 'Cant sent spot himself'
			});
		}
		
		User.findOne({ 'facebook_id': facebook_id}, function( err, user ){

			// Database internal error
			if( err ){
				return callback({ 'err_id': 'db_error', 'err': err });
			}

			// Couldn't find the user
			if( !user ){
				return callback({
					'err_id' 	  : 'ghost_user',
					'msg' 		  : 'Didnt find user with this id',
					'facebook_id' : facebook_id
				});
			}


			req.sent.user = user;

			var err_base = {
				'err_id'	  : 'ghost_target',
				'msg'	 	  : 'Didnt find the target in database',
				'target_id'	  : target_id,
				'target_type' : target_type
			};


			// Testing for presence of user
			if( target_type == "user" ){
				User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !user )
						return callback( err_base );

					req.sent.user = user;
					return callback( null );

				});
			}

			// Testing for presence of a before
			if( target_type == "before" ){
				Event.findById( target_id, function( err, evt ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !evt )
						return callback( err_base );

					req.sent.evt = evt;
					return callback( null );

				});
			}

			// Testing for presence of a party
			if( target_type == "party" ){
				Party.findById( target_id, function( err, party ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !party )
						return callback( err_base );

					req.sent.party = party;
					return callback( null );

				});
			}
			
		});

	}



	module.exports = {
		check: check
	};