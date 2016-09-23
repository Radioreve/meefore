	
	var log = require('./logger');

	// A little utility helper to log contextualized messages on each middleware
	var base_print = function( prefix, level ){
		return function( req, object, message ){

			if( !(typeof req == "object" && typeof req.log == "object" && typeof req.log.info == "function") ){
				message = object;
				object  = req;
				req     = log;
			} else {
				log = req.log;
			}

			if( typeof object == "string" ){
				return log[ level ]({ path: prefix }, object );
			} else {
				object.path = prefix;
				return log[ level ]( object, message );
			}
		}
	};

	module.exports = function( prefix ){

		var expose = {};
		[ "info", "warn", "debug", "error", "fatal", "trace" ]
		.forEach(function( level ){
			expose[ level ] = base_print( prefix, level );
		});

		return expose; 
	};