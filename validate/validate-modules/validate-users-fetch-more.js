
	var nv = require('node-validator');


	var checkRequest = nv.isAnyObject()

		.withRequired('facebook_id' , nv.isString())
		.withOptional('facebook_ids', nv.isArray());

	function check( req, res, next ){

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