		
	var nv = require('node-validator');
	
	function check( req, res, next ){

		var checkId = nv.isString({ regex: /^[a-z0-9]{24}$/ });

		nv.run( checkId, req.params.event_id, function( n, errors ){

			if( n != 0 )
				return res.json( errors ).end();

			req.event_id = req.params.event_id
			next();

		});

	};

	module.exports = {
		check: check
	};