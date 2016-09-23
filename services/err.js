
	var print = require('./print')( __dirname.replace( process.cwd()+'/', '' ) + '/err.js' );

	var default_backend_status_code = 500;
	var default_frontend_status_code = 400;

	/* Possible 'source' values 
		[ 'route', 'mongo', 'redis', 'facebook', 'mailchimp', 'empty', 'pusher', etc...]
	*/
	var handleBackErr = function( req, res, opts ){

		opts = opts || {};

		print.error( req, {
			source: opts.source || "internal",
			err_ns: opts.err_ns,
			err: opts.err // explicit details about the error that occured, when available
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan


		// The majority of errors handlers are allowed to stop the request and respond to the client
		if( opts.end_request != false ){
			res.status( opts.status || default_backend_status_code ).json({
				call_id: req.sent.expose.call_id || "internal", // passback client call_id to allow async update of ui
				msg: "Unexpected error (backend temporarily unavailable)" // stay vague about 500 errors for consumers
			});
		}

	};

	var handleFrontErr = function( req, res, opts ){

		opts = opts || {};

		print.info( req, {
			source: opts.source || "external",
			err_ns: opts.err_ns,
			err: opts.err, // explicit details about the error that occured, when available
			err_id: opts.err_id 
		}, "Handling error, " + opts.msg ); // Pretty printing of the erreor message by bunyan


		// The majority of errors handlers are allowed to stop the request and respond to the client
		if( opts.end_request != false ){
			res.status( opts.status || default_frontend_status_code ).json({
				msg: opts.msg, // explicit human-friendly messages for api consumers to know what went wrong
				err_ns: opts.err_ns, // namespace error to handle errors clientside
				err_id: opts.err_id, // id error to handle errors clientside more accurately
				call_id: opts.call_id || req.sent.expose.call_id, // passback client call_id to allow async update of ui
				meta: opts.meta
			});
		}

	};

	// The usage of a 5 params signature is to allow these errors to be handled in the code as 'one-liners';
	// Usage 1 : handleDbErr( err_ns, err, source ) -> Doesnt end the request
	// Usage 2 : handleDbErr( req, res, err_ns, err, source ) -> Does end the request
	var handleDbErr = function( req, res, err_ns, err, source ){


		var end_request = true;
		// Duck-type the first params to see if the error is meant to terminate the request
		if( typeof req == "string" ){
			end_request = false;
			source = err_ns;
			err_ns = req;
			err = res;
		}

		print.info( req, "Handling database error ("+source+")");

		handleBackErr( req, res, {
			msg: "Something went wrong with the database ("+ source +")",
			end_request: end_request,
			source: source,
			err_ns: err_ns,
			err: err
		});

	};


	module.exports = {
		handleBackErr  : handleBackErr,
		handleFrontErr : handleFrontErr,
		handleDbErr    : handleDbErr
	};