
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');


	function check( req, res, next ){

		var checkAuthRequest = nv.isAnyObject()

			.withRequired('facebook_id' 	, nv.isString())

		nv.run( checkAuthRequest, req.sent, function( n, errors ){
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