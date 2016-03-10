
	
	var nv     = require('node-validator');
	var _      = require('lodash');
	var moment = require('moment');

	var User  = require('../../models/UserModel');
	var Event = require('../../models/EventModel');
	var Party = require('../../models/PartyModel');


	var invite_code_regex = /^[a-z0-9]{5,20}$/i;

	function check( req, res, next ){

		var checkSponsorRequest = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('invite_code',  nv.isString({ 'regex': invite_code_regex }));

		nv.run( checkSponsorRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkSponsorRequestDb( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
		
	};

	function checkSponsorRequestDb( req, callback ){

		var facebook_id = req.sent.facebook_id;
		var invite_code = req.sent.invite_code;
		
		User.findOne({ 'invite_code': invite_code }, function( err, user ){

			if( err ){
				return callback({ 'err_id': 'db_error', 'err': err });
			}

			if( !user ){
				return callback({
					'err_id' : 'ghost_sponsor',
					'msg'    : 'This invite code doesnt match any users code'
				});
			}

			if( user.facebook_id == facebook_id ){
				return callback({
					'err_id' : 'auto_sponsor',
					'msg'    : 'One cannot sponsor himself'
				});
			}

			req.sent.sponsor = user;

			User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

				if( err ){
					return callback({ 'err_id': 'db_error', 'err': err });
				}

				if( !user ){
					return callback({
						'err_id': 'ghost_sponsee',
						'msg'   : 'The sponsee facebook_id didnt match any user facebook_id'
					});
				}

				req.sent.sponsee = user;

				callback( null );

			});

		});

	}



	module.exports = {
		check: check
	};