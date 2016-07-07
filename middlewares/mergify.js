	
	var _ = require('lodash');
	
	// Merge requests 
	var merge = function( req, res, next ){

			req.sent = _.merge( 

			    req.body   || {},  
				req.query  || {},
				req.sent   || {}
			);

			req.sent.expose = {};

			next();

	}

	// Used to make sure every value passed in param url is also accessible via the 
	// convenient global req.sent object
	var setParam = function( params ){

		var params = Array.isArray(params) ? params : [params];
		return function( req, res, next ){
			params.forEach(function( para ){
				req.sent[ para ] = req.params[ para ];
			});
			next();
		}

	}

	module.exports = {
		merge: merge,
		setParam: setParam
	};