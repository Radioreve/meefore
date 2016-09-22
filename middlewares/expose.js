
	var log   = require('../services/logger');
	var print = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/expose.js' )
	var erh   = require('../services/err'); 
	var _     = require('lodash');


	var sendResponse = function( req, res ){

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

			print.info( req, 'Request reached the end successfully');
			res.status( 200 ).json( expose );

		} 

	};

	var setExpose = function( req, res, next ){

		req.sent.expose = {};
		next();

	}

	module.exports = {
		sendResponse  : sendResponse,
		setExpose 	  : setExpose
	};