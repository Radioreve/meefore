
	var _      = require('lodash');
	var async  = require('async');
	var get_ip = require('ipware')().get_ip;

	var rd        = require('../services/rd');
	var pusher    = require('../services/pusher');
	
	var pushEventsDir = '../pushevents';
	var apiDir        = '../api';
	var mdwDir        = '../middlewares';

	var User = require('../models/UserModel');

	var profileEvents  = require( pushEventsDir + '/profileEvents'),
		settingsEvents = require( pushEventsDir + '/settingsEvents'),
		signEvents     = require( pushEventsDir + '/signEvents');

	var api = {}
	//	api.tests     = require( apiDir + '/tests');
		api.users     = require( apiDir + '/users');
		api.places    = require( apiDir + '/places');
		api.events    = require( apiDir + '/events');
		api.parties   = require( apiDir + '/parties');
		api.chats     = require( apiDir + '/chats');

	var mdw = {};
		mdw.expose 			  = require( mdwDir + '/expose');
		mdw.auth              = require( mdwDir + '/auth');
		mdw.mailchimp_watcher = require( mdwDir + '/mailchimp_watcher');
		mdw.pop               = require( mdwDir + '/pop');
		mdw.facebook          = require( mdwDir + '/facebook');
		mdw.alerts_watcher    = require( mdwDir + '/alerts_watcher');
		mdw.chat_watcher      = require( mdwDir + '/chat_watcher');
		mdw.profile_watcher   = require( mdwDir + '/profile_watcher');
		mdw.notifier          = require( mdwDir + '/notifier');
		mdw.meepass           = require( mdwDir + '/meepass');
		mdw.connecter 		  = require( mdwDir + '/connecter');

		mdw.validate          = require('../validate/validate');


	module.exports = function( app ) {


		// Charge the test_mode on true, for validation to stop and send "success" in case of success"
		// See errorHandlers.js

		app.all('/test/*', function( req, res, next ){
			console.warn('Testing route ' + req.url);
			next();
		});

		function handleTestEnd( req, res ){
			console.log('Handling end test');
			res.json({ "msg": "Test ended, validation passed. Make sure the datas look as expected" });
		}


		// Begin meepass
		app.post('/test/send_meepass',
			mdw.validate('send_meepass'),
			mdw.meepass.updateMeepass('meepass_sent'),
			profileEvents.updateMeepass
			// handleTestEnd
		);

		app.post('/test/admin/credit_meepass',
			mdw.auth.authenticate(['root','admin']),
			mdw.meepass.updateMeepass('admin_credit'),
			handleTestEnd
		);
		// End meepass


		// Start spotted & shared
		app.post('/test/spot',
			mdw.validate('spotted'),
			profileEvents.updateSpotted
		);

		app.post('/test/share',
			mdw.validate('shared'),
			profileEvents.updateShared
		);
		// End spotted & shared


		// Coupons, code & sponsorship
		app.post('/test/invite_code',
			mdw.validate('invite_code'),
			profileEvents.updateInviteCode
		);

		app.post('/test/activate-sponsor',
			mdw.validate('sponsor'),
			profileEvents.activateSponsor
		);
		// Coupons


		//Test request
		app.post('/test/request',
			mdw.validate('event_group_request'),
			api.events.request 
		);

		//End test request

		// Test party
		app.post('/test/party', 
			mdw.validate('create_party'),
			handleTestEnd
		);
		// end test party


		// Test users
		app.post('/test/users/me',
			api.users.fetchMe
		);

		app.post('/test/users/full',
			api.users.fetchUserById_Full
		);

		app.post('/test/users/core',
			api.users.fetchUserById_Core
		);

		app.post('/test/users?name',
			api.users.fetchUsers
		);

		app.post('/test/update-profile/base',
			mdw.validate('update_profile_base'),
			mdw.profile_watcher.updateCache('base'),
	    	profileEvents.updateProfile
	    );

	    app.post('/test/update-pictures',
			mdw.validate('update_pictures'),
			mdw.pop.populateUser(),
			mdw.profile_watcher.updateCache('picture_mainify'),
	    	profileEvents.updatePictures
	    );

	    app.post('/test/update-picture-client',
	    	mdw.validate('update_picture_client'),
	    	mdw.pop.populateUser(),
	    	profileEvents.updatePicture,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );

	    app.post('/test/update-picture-url',
	    	mdw.validate('upload_picture_url'),
	    	mdw.pop.populateUser(),
	    	profileEvents.uploadPictureWithUrl,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );


		// End test users

		app.all('/test/*', mdw.expose.sendResponse );



	};





