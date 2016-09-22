
	var log = require('./logger');

	var default_backend_status_code = 500;
	var default_frontend_status_code = 400;

	/* Possible 'source' values 
		[ 'route', 'mongo', 'redis', 'facebook', 'mailchimp', 'empty', 'pusher', etc...]
	*/
	var handleBackErr = function( req, res, opts ){

		opts = opts || {};

		log.error({
			source: opts.source || "internal",
			ns: opts.err_ns,
			err: opts.err // explicit details about the error that occured, when available
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan


		// The majority of errors handlers are allowed to stop the request and respond to the client
		if( opts.end_request != false ){
			res.status( opts.status || default_backend_status_code ).json({
				call_id: req.sent.expose.call_id, // passback client call_id to allow async update of ui
				msg: "Unexpected error (backend temporarily unavailable)" // stay vague about 500 errors for consumers
			});
		}

	};

	var handleFrontErr = function( req, res, opts ){

		opts = opts || {};

		log.info({
			source: opts.source || "external",
			ns: opts.err_ns,
			err: opts.err, // explicit details about the error that occured, when available
			err_id: opts.err_id 
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan


		// The majority of errors handlers are allowed to stop the request and respond to the client
		if( opts.end_request != false ){
			res.status( opts.status || default_frontend_status_code ).json({
				msg: opts.msg, // explicit human-friendly messages for api consumers to know what went wrong
				err_ns: opts.err_ns, // namespace error to handle errors clientside
				err_id: opts.err_id, // id error to handle errors clientside more accurately
				call_id: req.sent.expose.call_id // passback client call_id to allow async update of ui
			});
		}

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