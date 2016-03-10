
	
	var nv     = require('node-validator');
	var _      = require('lodash');
	var moment = require('moment');

	var User  = require('../../models/UserModel');
	var Event = require('../../models/EventModel');
	var Party = require('../../models/PartyModel');


	var invite_code_regex = /^[a-z0-9]{5,20}$/i;

	function check( req, res, next ){

		var checkInviteCode = nv.isAnyObject()

			.withRequired('facebook_id' , nv.isString() )
			.withRequired('invite_code',  nv.isString({ 'regex': invite_code_regex }));

		nv.run( checkInviteCode, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkInviteCodeDb( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
		
	};

	function checkInviteCodeDb( req, callback ){

		var facebook_id = req.sent.facebook_id;
		var invite_code = req.sent.invite_code;
		
		User.find({ 'invite_code': invite_code }, function( err, users ){

			if( err ){
				return callback({ 'err_id': 'db_error', 'err': err });
			}

			if( users.length > 0 ){
				return callback({
					'err_id' : 'already_taken',
					'msg'    : 'This invite_code is already in use by another user'
				});
			}

			callback( null );

		});

	}



	module.exports = {
		check: check
	};