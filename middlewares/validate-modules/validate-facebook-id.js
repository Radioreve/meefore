		
	var nv = require('node-validator');
	
	function check( req, res, next ){

		var checkId = nv.isString({ regex: /^\d{10,}$/ });

		nv.run( checkId, req.params.facebook_id, function( n, errors ){

			if( n != 0 )
				return res.json( errors ).end();

			req.facebook_id = req.params.facebook_id
			next();

		});

	};

	module.exports = {
		check: check
	};