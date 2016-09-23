
	var nv    = require('node-validator');
	var st    = require('../../config/settings');
	var _     = require('lodash');
	var rg    = require('../../config/regex');
	var print = require('../../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/validate-update-profile-base.js' );
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

		var isLocation = nv.isAnyObject()
			.withRequired('place_name', nv.isString())
			.withRequired('place_id'  , nv.isString());

		var checkUpdateRequest = nv.isAnyObject()

			.withRequired('facebook_id' 	 		 , nv.isString() )
			.withOptional('name' 			 		 , nv.isString({ min: 2, max: 15 }))
			.withOptional('age' 					 , nv.isNumber({ min: st.app.min_age, max: st.app.max_age }))
			.withOptional('job' 			 		 , nv.isString({ min: 2, max: 25 }))
			.withOptional('ideal_night' 	 		 , nv.isString({ max: 500 }))
			.withOptional('location' 				 , nv.isLocation )
			.withCustom( isIdOk )

		req.sent.age = req.sent.age ? parseInt( req.sent.age ) : undefined;

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