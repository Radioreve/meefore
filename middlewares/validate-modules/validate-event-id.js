		
	var nv = require('node-validator');
	
	function check( req, res, next ){

		var checkId = nv.isString({ regex: /^[a-z0-9]{24}$/ });

		nv.run( checkId, req.params.event_id, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			req.event_id = req.params.event_id;
			next();

		});

	};

	module.exports = {
		check: check
	};