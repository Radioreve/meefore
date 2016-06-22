
	var nv = require('node-validator');

	function check( req, res, next ){

		var checkFetch = nv.isAnyObject()
			
			.withRequired('user' 		, nv.isAnyObject()) // Populated by middleware
			.withRequired('chat_id'	    , nv.isString() ) 
			.withRequired('facebook_id' , nv.isString() )

		nv.run( checkFetch, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}	

			var user    = req.sent.user;
			var chat_id = req.sent.chat_id;
			var channel = user.getChatChannel( chat_id );

			if( !channel ){
				req.app_errors = req.app_errors.concat([{
					"err_id"      : "ghost_channel",
					"message"     : "The channel wasnt found in users model",
					"facebook_id" : req.sent.facebook_id,
					"chat_id" 	  : chat_id
				}]);
				return next();
			}

			// User is calling a route for himself, proceed :) 
			next();

		});
	};

	module.exports = {
		check: check
	};