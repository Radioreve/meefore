	
	var _      = require('lodash');
	var async  = require('async');
	var get_ip = require('ipware')().get_ip;

	var rd        = require('../services/rd');
	var pusher    = require('../services/pusher');
	var connecter = require('../services/connecter');
	
	var pushEventsDir = '../pushevents';
	var apiDir        = '../api';
	var mdwDir        = '../middlewares';

	var User = require('../models/UserModel');

	var initEvents     = require( pushEventsDir + '/initEvents'),
		profileEvents  = require( pushEventsDir + '/profileEvents'),
		settingsEvents = require( pushEventsDir + '/settingsEvents'),
		adminEvents    = require( pushEventsDir + '/adminEvents'),
		signEvents     = require( pushEventsDir + '/signEvents');

	var api = {}
	//	api.tests     = require( apiDir + '/tests');
		api.users     = require( apiDir + '/users');
		api.places    = require( apiDir + '/places');
		api.ambiances = require( apiDir + '/ambiances');
		api.events    = require( apiDir + '/events');
		api.parties   = require( apiDir + '/parties');
		api.chats     = require( apiDir + '/chats');

	var mdw = {};
		mdw.auth           = require( mdwDir + '/auth');
		mdw.email          = require( mdwDir + '/email');
		mdw.pop            = require( mdwDir + '/pop');
		mdw.facebook       = require( mdwDir + '/facebook');
		mdw.validate       = require( mdwDir + '/validate');
		mdw.alerts_watcher = require( mdwDir + '/alerts_watcher');
		mdw.chat_watcher   = require( mdwDir + '/chat_watcher');
		mdw.notifier       = require( mdwDir + '/notifier');



	module.exports = function( app ) {


		//      All api calls are handled this way : 
		//		
		//	    % app.verb( url ) 
		//		% mdw.auth.authenticate 					% ---> Make sure user authenticated and populates req.facebook_id
		//		% mdw.validate( namespace, [ properties ] ) % ---> Make sure data is properly formatted and action is authorized 
		//		% controller.handler 						% ---> Make the call ( Redis & MongoDB )							
		//



		// Merge all body, query and params property 
		// Subsequent validation modules will look if each property they are looking for
		// is anywhere to be found and properly formatted, in the req.sent object
		app.all('*', function( req, res, next ){
			req.sent = _.merge( 

			    req.body   || {},  
				req.query  || {},
				req.sent   || {}

			);

			next();

		});

















		


	};