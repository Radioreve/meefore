
	var nv = require('node-validator');

	function check( req, res, next ){

		var checkFetch = nv.isAnyObject()
		
			.withRequired('user_id'	    , nv.isString() ) 
			.withRequired('facebook_id' , nv.isString() )

		nv.run( checkFetch, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			if( req.sent.user_id != req.sent.facebook_id ){
				req.app_errors = req.app_errors.concat([{
					"err_id"      : "not_myself",
					"message"     : "A user can only all this route for himself",
					"user_id"     : req.sent.user_id,
					"facebook_id" : req.sent.facebook_id
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