	
	var nv = require('node-validator');
	
	function check( req, res, next ){

		next();

	};

	module.exports = {
		check: check
	};