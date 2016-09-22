	
	var _   = require('lodash');
	var log = require( process.cwd() + '/services/logger' );
	var erh = require( process.cwd() + '/services/err' );

	var handle = function( req, res, next ){

		if( req.app_errors.length == 0 ){

			next();

		} else {

			erh.handleFrontErr( req, res, {
				status: 403,
				source: "client",
				err_ns: req.err_ns,
				err: req.app_errors[ 0 ],
				err_id: req.app_errors[ 0 ].err_id,
				call_id: req.sent.expose.call_id,
				msg: req.app_errors[ 0 ].msg || req.app_errors[ 0 ].message
			});

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