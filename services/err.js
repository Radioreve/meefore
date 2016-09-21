
	var log = require('./logger');

	var default_backend_status_code = 500;
	var default_frontend_status_code = 400;

	/* Possible sources values 
		- 'mongo' for error reported by the mongodb driver
		= 'facebook' for errors reported by calling the Facebook Graph api
		- 'client' for errors during validation of a client requst
		- 'empty' for errors concerning a request that 
		- 'route' for errors that resulted in a ressource not found (404)
		- 'frontend' as a generic error from clients call that couldnt be completed
	*/
	var handleBackErr = function( req, res, opts ){

		log.error({
			source: opts.source,
			ns: opts.err_ns,
			err: opts.err // explicit details about the error that occured, when available
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan

		res.status( opts.status || default_backend_status_code ).json({
			call_id: req.sent.expose.call_id, // passback client call_id to allow async update of ui
			msg: "Unexpected error (backend temporarily unavailable)" // stay vague about 500 errors for consumers
		});

	};

	var handleFrontErr = function( req, res, opts ){

		log.info({
			source: opts.source || "frontend",
			ns: opts.err_ns,
			err: opts.err, // explicit details about the error that occured, when available
			err_id: opts.err_id 
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan

		res.status( opts.status || default_frontend_status_code ).json({
			msg: opts.msg, // explicit human-friendly messages for api consumers to know what went wrong
			err_ns: opts.err_ns, // namespace error to handle errors clientside
			err_id: opts.err_id, // id error to handle errors clientside more accurately
			call_id: req.sent.expose.call_id // passback client call_id to allow async update of ui
		});

	};

	// Shortcut method to allow all these annoying error handling cases to be one-liners
	var handleMongoErr = function( req, res, err_ns, err ){

		handleBackErr( req, res, {
			source : "mongo",
			err_ns : err_ns,
			err    : err
		});

	};

	// Shortcut method to allow all these annoying error handling cases to be one-liners
	var handleRedisErr = function( req, res, err_ns, err ){

		handleBackErr( req, res, {
			source : "redis",
			err_ns : err_ns,
			err    : err
		});

	};

	module.exports = {
		handleBackErr  : handleBackErr,
		handleFrontErr : handleFrontErr,
		handleMongoErr : handleMongoErr,
		handleRedisErr : handleRedisErr
	};