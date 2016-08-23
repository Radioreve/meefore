
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');

	var User  = require('../../models/UserModel');

	function check( req, res, next ){

		var checkUpdateRequest = nv.isAnyObject();

		nv.run( checkUpdateRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkWithDatabase( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
		
	};

	function checkWithDatabase( req, callback ){

		var patch = req.sent;
		var user  = req.sent.user;

		if( !patch.contact_email || patch.contact_email == user.contact_email ){
			console.log("Not trying to patch with new email, skipping the check of uniqueness");
			return callback( null );
		}

		if( !rg.email.test( patch.contact_email ) ){
			return callback({
				message      : "The email provided didnt look like one",
				err_id       : "wrong_pattern",
				contact_email: patch.contact_email
			});
		}

		User.findOne({ contact_email: patch.contact_email }, function( err, user ){

			if( err ){
				return callback({
					message: 'Internal error validating the patch',
					err_id : 'api_error'
				});
			}

			if( user ){
				return callback({
					message: 'This email already exists in the database',
					err_id : 'email_already_taken'
				});
			}

			callback( null );

		});
				

	}


	module.exports = {
		check: check
	};