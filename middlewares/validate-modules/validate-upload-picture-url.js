
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');

	var User  = require('../../models/UserModel');

	function isImgPlaceRangeOk( val, onError ){

		var img_place = parseInt( val.img_place );
		var max_place = st.default_pictures.length;

		if( img_place >= 0 && img_place < max_place ){
			// Do nothing 
		} else {
			return onError('The img_place isnt in the right range', 'wrong_range', val.img_place, {
				'err_id': 'wrong_img_place_range',
				'expected_range': '[0-' + (max_place - 1) + ']'
			});	
		}
	}

	function check( req, res, next ){

		var checkUpdateRequest = nv.isAnyObject()

			.withRequired('facebook_id' 	, nv.isString({ regex: rg.fb_id }))
			.withRequired('img_id' 			, nv.isString())
			.withRequired('url' 			, nv.isString({ regex: rg.url }))
			.withCustom( isImgPlaceRangeOk )

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