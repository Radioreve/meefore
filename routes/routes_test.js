
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
		mdw.meepass   	   = require( mdwDir + '/meepass');


	module.exports = function( app ) {


		// Charge the test_mode on true, for validation to stop and send "success" in case of success"
		// See errorHandlers.js

		app.all('/test/*', function( req, res, next ){
			req.test_mode = true;
			console.warn('Testing route ' + req.url);
			next();
		});

		function handleTestEnd( req, res ){
			console.log('Handling end test');
			res.json({ "msg": "Test ended, validation passed. Make sure the datas look as expected" });
		}


		app.post('/test/send_meepass',
			mdw.validate('meepass', ['send_meepass']),
			mdw.meepass.updateMeepass('meepass_sent'),
			handleTestEnd
		);

		app.post('/test/admin/credit_meepass',
			mdw.auth.authenticate(['root','admin']),
			mdw.meepass.updateMeepass('admin_credit'),
			handleTestEnd
		);

		app.all('/test/*', function( req, res ){
			res.json({ "msg": "Warning! This url matches no test route" });
		});



	};





