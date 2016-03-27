	
	var _ = require('lodash');

	var handle = function( req, res, next ){

		if( req.app_errors.length == 0 ){

			console.log('Validation passed');
			next();

		} else {

			res.status(403).json({ 

				call_id   : req.sent.expose && req.sent.expose.call_id,
				namespace : req.app_namespace,
				errors    : req.app_errors

			}).end();
		}
	};


	var stage = function( req, res, next ){

		// Errors array. If non empty at the end of the validation steps
		// http error is returned 
		req.app_errors = [];

		// Need merge params here cause cant access params before it's sent
		// So need to merge it dynamically in the req.sent global object
		req.sent = _.merge( req.params, req.sent );
		next();

	};

	module.exports = {
		handle: handle,
		stage: stage
	};