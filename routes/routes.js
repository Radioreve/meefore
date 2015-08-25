	
	var _ = require('lodash');

	var pushEventsDir = '../pushevents/',
		apiDir        = '../api/';

	var initEvents     = require( pushEventsDir + 'initEvents'),
		profileEvents  = require( pushEventsDir + 'profileEvents'),
		manageEvents   = require( pushEventsDir + 'manageEvents'),
		chatEvents     = require( pushEventsDir + 'chatEvents'),
		settingsEvents = require( pushEventsDir + 'settingsEvents'),
		clientEvents   = require( pushEventsDir + 'clientEvents'),
		friendEvents   = require( pushEventsDir + 'friendEvents'),
		adminEvents    = require( pushEventsDir + 'adminEvents'),
		mapEvents	   = require( pushEventsDir + 'mapEvents'),
		signEvents     = require( pushEventsDir + 'signEvents');

	var api = {}
		api.tests     = require( apiDir + 'tests');
		api.users     = require( apiDir + 'users' );
		api.events    = require( apiDir + 'events' );
		api.places    = require( apiDir + 'places' );
		api.ambiances = require( apiDir + 'ambiances' );

	var mdw = {};
		mdw.auth 	  	  = require('../middlewares/auth');
		mdw.email 	  	  = require('../middlewares/email');
		mdw.pop 	 	  = require('../middlewares/pop');
		mdw.facebook 	  = require('../middlewares/facebook');
		mdw.validate 	  = require('../middlewares/validate');
	

	module.exports = function( app ){

		app.all('/api/*', function( req, res, next ){
			console.log('Request made to the api');
			return next();
		});

		/* Debug les appels clients */
		app.post('*', function( req, res, next ){
			if( req.body )
				_.keys( req.body ).forEach( function( el ){ console.log( el + ' - ' + req.body[el] ); });
			next();
		});

		app.get('/home', signEvents.sendHomepage );
		app.get('/', signEvents.redirectToHome );
		app.get('/earlyadopters', signEvents.sendEarlyAdoptersPage );

	//Events d'initialisation et de déconnexion
		app.post('/auth/facebook', mdw.pop.populateUser({ force_presence: false }), mdw.email.subscribeMailchimpUser, signEvents.handleFacebookAuth );
		app.post('/auth/app', mdw.auth.authenticate(['standard']), mdw.facebook.fetchFacebookLongLivedToken('app_id'), initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		app.post('/me/update-profile', profileEvents.updateProfile );
		app.post('/me/update-picture', profileEvents.updatePicture );
		app.post('/me/update-pictures', profileEvents.updatePictures );
		app.post('/me/update-picture-fb', profileEvents.updatePictureWithUrl );
		app.post('/me/fetch-and-sync-friends', profileEvents.fetchAndSyncFriends );
		app.post('/me/update-settings-ux', settingsEvents.updateSettingsUx );
		app.post('/me/update-settings-mailinglists', mdw.pop.populateUser({ force_presence: true }), mdw.email.updateMailchimpUser, settingsEvents.updateSettingsMailinglists );

	//Rest api events
		app.get('/api/v1/events', api.events.fetchEvents );
		app.get('/api/v1/events/:event_id', api.events.fetchEventById );
		app.post('/api/v1/events', mdw.validate.validate('event'), api.events.createEvent );
		app.patch('/api/v1/events/:event_id', api.events.updateEvent );
		app.patch('/api/v1/events/:event_id/requestin', mdw.validate.validate('requestin'), api.events.requestIn );
		app.get('/api/v1/events/groups', api.events.fetchGroups );

	//Rest api tests
		//app.post('/api/v1/test/:user_id', api.tests.test );
		app.post('/api/v1/test/validate', mdw.validate.extendedValidation(), api.tests.testValidate );

	//Rest api users
		app.all('/api/v1/users/:facebook_id/*', mdw.validate.validate('facebook_id') );
		app.get('/api/v1/users/:user_id', api.users.fetchUserById );
		app.get('/api/v1/users', api.users.fetchUsers );
		app.get('/api/v1/users/:facebook_id/events', api.users.fetchUserEvents );

	//Rest api ambiances
		app.get('/api/v1/ambiances', api.ambiances.fetchAmbiances );
		app.post('/api/v1/ambiances', api.ambiances.createAmbiance );

	//Rest api places
		app.get('/api/v1/places', api.places.fetchPlaces );
		app.post('/api/v1/places', api.places.createPlace );

	//Events relatifs aux friends


	//Events relatifs aux admins
		app.post('/fetch-app-data', mdw.auth.authenticate(['admin']), adminEvents.fetchAppData );
		app.post('/create-event-bot', mdw.auth.authenticate(['admin-bot']), adminEvents.createBotEvent );
		app.post('/request-participation-in-bot', mdw.auth.authenticate(['admin-bot']), adminEvents.requestParticipationInBot );
		app.post('/add-event-template', mdw.auth.authenticate(['admin']), adminEvents.addEventTemplate );
		app.post('/delete-event-template', mdw.auth.authenticate(['admin']), adminEvents.deleteEventTemplate );

		app.post('/hello', function( req, res ){
			console.log('Hello test command received!');
			console.log('Message : ' + req.body.msg );
		});
	


		//Events relatif aux tests
		app.post('/test/app', mdw.pop.populateUser({ auth_type: 'app_id' }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test/facebook', mdw.pop.populateUser({ auth_type: 'facebook_id' }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test', mdw.pop.populateUser(), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test/force', mdw.pop.populateUser({ force_presence: true }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});



};