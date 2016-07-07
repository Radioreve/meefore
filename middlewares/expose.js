
	var _ = require('lodash');


	var sendResponse = function( req, res ){

		console.log('Request reached the end successfully');

		// Convention : all middleware placed before is to setup an expose variable 
		// To notifiy that the route indeed existed
		var expose = req.sent.expose;

		if( !expose || _.keys( expose ).length == 0 ){
			res.status( 404 ).json({
				'namespace': 'route',
				'msg'      : 'The request url didnt match any route',
				'errors'   : { 'err_id': 'ghost_ressource' }
			});

		} else{
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
	}