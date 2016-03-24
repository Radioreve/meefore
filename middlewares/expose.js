
	var _ = require('lodash');


	var sendResponse = function( req, res ){

		console.log('Request reached the end successfully');

		// Convention : all middleware placed before is to setup an expose variable 
		// To notifiy that the route indeed existed
		var expose = req.sent.expose;

		if( !expose ){
			res.status( 404 ).json({
				'err_id': 'ghost_ressource',
				'msg'   : 'The request url didnt match any route'
			});
		} else{
			res.status( 200 ).json( expose );
		} 

	};


	module.exports = {
		'sendResponse': sendResponse
	}