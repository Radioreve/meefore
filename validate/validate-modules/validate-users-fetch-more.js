
	var nv = require('node-validator');
	var st = require( process.cwd() + '/config/settings');

	var checkFilters = nv.isAnyObject()

		.withOptional('age' 	  , nv.isArray() )
		.withOptional('countries' , nv.isArray() )
		.withOptional('gender'	  , nv.isArray() )

	var checkRequest = nv.isAnyObject()

		.withRequired('facebook_id' , nv.isString())
		.withOptional('facebook_ids', nv.isArray())
		.withOptional('filters',      checkFilters )


	function check( req, res, next ){
		
		req.sent.min 	 = parseInt( req.sent.min );
		req.sent.max 	 = parseInt( req.sent.max );
		
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