
	var nv = require('node-validator');
	
	function check( req, res, next ){

		var data = { socket_id: req.body.socket_id };

		var checkSocketId = nv.isObject()
			.withRequired('socket_id', nv.isString({ regex: /^\d{3,}.\d{3,}$/ }) );

		nv.run( checkSocketId, data, function( n, errors ){

			if( n != 0 )
				return res.json( errors ).end();

			req.socket_id = req.body.socket_id;
			delete req.body.socket_id;
			next();

		});

	};

	module.exports = {
		check: check
	};