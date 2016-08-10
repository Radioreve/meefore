
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');


	function check( req, res, next ){

		var checkRequest = nv.isAnyObject()
			.withRequired('onboarding_id', nv.isString({ regex: rg.makeRegExpFromArray( st.onboarding_ids ) }));

		nv.run( checkRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}
			
			next();
		});

	}

	module.exports = {
		check: check
	};