
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');

	var User  = require('../../models/UserModel');

	function isIdOk( val, onError ){

		if( !rg.fb_id.test( val.facebook_id ) ){
			return onError('The id provided doesnt match the required pattern.', 'wrong_pattern', val.target_id, {
					err_id			 : "wrong_pattern",
					expected_pattern : 'Facebook id'
				});
		}

	}

	function check( req, res, next ){

		var checkUpdateRequest = nv.isAnyObject()

			.withRequired('facebook_id' 	 , nv.isString())
			.withRequired('updated_pictures' , nv.isArray())
			.withCustom( isIdOk )

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

		// Nothing yet to validate 

		callback( null );
				

	}



	module.exports = {
		check: check
	};