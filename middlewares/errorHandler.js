
	var handle = function( req, res, next ){

		if( req.app_errors.length == 0 ){
			console.log('Validation passed');
			return next();
		}

		return res.status(400)
				  .json({ namespace: req.app_namespace, errors: req.app_errors })
				  .end();

	};

	var stage = function( req, res, next ){

		req.app_errors = [];
		
		req.body       = req.body   || {};
		req.params     = req.params || {};

		next();

	};

	module.exports = {
		handle: handle,
		stage: stage
	};