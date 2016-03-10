
	var nv     = require('node-validator');
	var _      = require('lodash');
	var moment = require('moment');

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

		var checkShareRequest = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('target_id'   , nv.isString() )
			.withRequired('target_type' , nv.isString() )
			.withRequired('share_type'  , nv.isString() )
			.withRequired('shared_with' , nv.isArray( nv.isString(), { min: 1 } ))
			.withRequired('socket_id'   , nv.isString() )
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

		var facebook_id = req.sent.facebook_id;
		var share_type  = req.sent.share_type;
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

		if( ['shared_by', 'shared_with'].indexOf( share_type ) == -1 ){
			return callback({
				'err_id' : 'unknown_share_type',
				'msg'    : 'The share_type parameter must be either shared_by or shared_with'
			});
		}
		
		User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

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

			var user_shared_object = _.find( user.shared, function( s ){ 
				return s.target_id == req.sent.target_id && s.shared_with 
			});

			var shared_with_new = shared_with.slice(0);

			if( !user_shared_object ){

				user.shared.push({
					"share_type"  : "shared_with",
					"shared_with" : shared_with,
					"target_type" : req.sent.target_type,
					"target_id"   : req.sent.target_id,
					"shared_at"   : moment().toISOString() 
				});
				
			} else {

				// Avoid duplication in each target object
				shared_with_new = _.difference( shared_with_new, user_shared_object.shared_with );

				// Avoid duplications in sender object
				user_shared_object.shared_with = _.union( shared_with, user_shared_object.shared_with );

			}

			req.sent.user = user;
			req.sent.shared_with_new = shared_with_new;

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
				Event.findById( target_id, function( err, evt ){

					if( err )
						return callback({ 'err_id': 'db_error', 'err': err });
					if( !evt )
						return callback( err_base );

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

					return callback( null );

				});
			}
			
		});

	}



	module.exports = {
		check: check
	};