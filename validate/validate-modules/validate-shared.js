
	var nv     = require('node-validator');
	var _      = require('lodash');
	var moment = require('moment');

	var User  = require('../../models/UserModel');
	var Before = require('../../models/BeforeModel');
	var Party = require('../../models/PartyModel');


	var rg = require('../../config/regex');

	function isIdOk( val, onError ){

		if( val.target_type == "user" && !rg.fb_id.test( val.target_id ) ){
			return onError('The id provided doesnt match the required pattern.', 'wrong_pattern', val.target_id, {
					err_id			 : "wrong_pattern",
					expected_pattern : 'Facebook id'
				});
		}

		if( ( val.target_type == "before" || val.target_type == "party" ) && !rg.db_id.test( val.target_id ) ){
			return onError('The id provided doesnt match the required pattern.', 'wrong_pattern', val.target_id, {
					err_id			 : "wrong_pattern",
					expected_pattern : 'MongoDB BSON id'
				});
		}

	}

	function check( req, res, next ){

		var checkShareRequest = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('target_id'   , nv.isString() )
			.withRequired('target_type' , nv.isString() )
			.withRequired('shared_with' , nv.isArray( nv.isString(), { min: 1 } ))
			.withCustom( isIdOk )

		nv.run( checkShareRequest, req.sent, function( n, errors ){
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

		console.log('Checking sender status...');

		var facebook_id = req.sent.facebook_id;
		var target_id   = req.sent.target_id;
		var target_type = req.sent.target_type;
		var shared_with = req.sent.shared_with;

		if( facebook_id == target_id ){
			return callback({
				'err_id' : 'shared_himself',
				'msg'    : 'Cant share to himself'
			});
		}

		if( shared_with.indexOf( facebook_id ) != -1 ){
			return callback({
				'err_id' : 'shared_with_himself',
				'msg'    : 'Cant share his own profile'
			});
		}

		if( shared_with.indexOf( target_id ) != -1 ){
			return callback({
				'err_id' : 'shared_with_oneself',
				'msg'    : 'Cant share someones profile to that same person'
			});
		}

		
		User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

			console.log('Sender found. Verifying...');
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

			// Make sure user doesnt share something with random users
			if( _.difference( shared_with, user.friends ).length > 0 ){
				return callback({
					'err_id' 	  : 'shared_with_strangers',
					'msg'         : 'Can only share with friends',
					'facebook_id' : facebook_id
				})
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
				User.findOne({ 'facebook_id': target_id }, function( err, user ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !user )
						return callback( err_base );

					return callback( null );

				});
			}

			// Testing for presence of a before
			if( target_type == "before" ){
				Before.findById( target_id, function( err, bfr ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !bfr )
						return callback( err_base );

					return callback( null );

				});
			}
			
		});

	}



	module.exports = {
		check: check
	};