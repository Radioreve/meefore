	
	var mdwDir = process.cwd() + '/middlewares';
	var mdw = {

		mergify : require( mdwDir + '/mergify'),
		boolify : require( mdwDir + '/boolify'),
		expose  : require( mdwDir + '/expose' )

	};

	module.exports = function( app ){

		// Merge all body, query and params property 
		// Subsequent validation modules will look if each property they are looking for
		// is anywhere to be found and properly formatted, in the req.sent object
		app.all('*',
			mdw.mergify.merge
		);

		// Cast all boolean strings like "true" and "false" to their boolean values
		app.all('*',
			mdw.boolify.castToBool
		);

		// Set the global req.sent.expose parameter to allow each module down the flow
		// to expose the variable he wants to on it 
		app.all('*',
			mdw.expose.setExpose
		);

		// Setup the values in the req.sent object, to allow a more RESTish way of calling the services for the client
		// Each middleware can consume the params, and client can just add it to the url and not to the raw body!
		app.all('/api/v1/users/:user_id*', mdw.mergify.setParam('user_id') );
	    app.all('/api/v1/chats/:chat_id*', mdw.mergify.setParam('chat_id') );
		app.all('/test/api/v1/chats/:chat_id*', mdw.mergify.setParam('chat_id') );
		app.all('/api/v1/befores/:before_id*', mdw.mergify.setParam('before_id') );


	}	
