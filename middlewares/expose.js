
	var log   = require('../services/logger');
	var print = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/expose.js' )
	var erh   = require('../services/err'); 
	var _     = require('lodash');


	var sendResponse = function( req, res ){

		// Time profiling end
		req.request_ended_at = new Date();

		// Convention : all middleware placed before is to setup an expose variable 
		// To notifiy that the route indeed existed
		var expose = req.sent.expose;

		if( !expose || _.keys( expose ).length == 0 ){

			erh.handleFrontErr( req, res, {
				msg: "The requested url did not match any route (ressource not found)",
				err_ns: "sending_response",
				source: "route",
				code: 404
			});


		} else{

			var request_time = req.request_ended_at - req.request_started_at;
			print.info(req, { request_time: request_time }, 'Request reached the end successfully in ' + request_time + 'ms' );
			res.status( 200 ).json( expose );

		} 

	};

	var setExpose = function( req, res, next ){

		// Timeprofiling start
		req.request_started_at = new Date();

		req.sent.expose = {};
		next();

	}

	module.exports = {
		sendResponse  : sendResponse,
		setExpose 	  : setExpose
	};