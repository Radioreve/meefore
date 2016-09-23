
	var nv    = require('node-validator');
	var _     = require('lodash');
	var print = require('../../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/validate-user-fetch.js' );

	function check( req, res, next ){

		// Only validation to fetch user info is to have valid token which is ok at this point
		// because of auth middleware. Just merge params with sent for further access
		next();

	};

	module.exports = {
		check: check
	};