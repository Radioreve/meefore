
var nv = require('node-validator');
	
	function check( req, res, next ){

		var checkTest = nv.isAnyObject()
			.withCustom(function( value, onError ){
				setTimeout(function(){
					onError("Message d'erreur", "key", "val");
				}, 1000 );
			})
			.withCustom(function( value, onError ){
				onError("Message d'erreur 2", "key2", "val2")
			});

		nv.run( checkTest, req.body, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			req.before_id = req.params.before_id
			next();

		});

	};

	module.exports = {
		check: check
	};