	
	var _ = require('lodash');

	var pushEventsDir = '../pushevents/',
		apiDir        = '../api/',
		mdw 		  = require('../globals/middlewares');

	var initEvents     = require( pushEventsDir + 'initEvents'),
		profileEvents  = require( pushEventsDir + 'profileEvents'),
		manageEvents   = require( pushEventsDir + 'manageEvents'),
		chatEvents     = require( pushEventsDir + 'chatEvents'),
		settingsEvents = require( pushEventsDir + 'settingsEvents'),
		clientEvents   = require( pushEventsDir + 'clientEvents'),
		friendEvents   = require( pushEventsDir + 'friendEvents'),
		adminEvents    = require( pushEventsDir + 'adminEvents'),
		apiEventsUser  = require( apiDir + 'users' ),
		signEvents     = require( pushEventsDir + 'signEvents');


	module.exports = function( app ){

		app.all('/api/*', function( req, res, next ){
			console.log('Request made to the API');
			return next();
		});

		/* Debug les appels clients */
		app.post('*', function( req, res, next ){
			if( req.body )
				_.keys( req.body ).forEach( function( el ){ console.log( el + ' - ' + req.body[el] ); });
			next();
		});

		app.post('/api/v1/test/:user_id', apiEventsUser.test );

		app.get('/home', signEvents.sendHomepage );
		app.get('/', signEvents.redirectToHome );
		app.get('/earlyadopters', signEvents.sendEarlyAdoptersPage );

	//Events d'initialisation et de déconnexion
		app.post('/auth/facebook', mdw.populateUser({ force_presence: false }), mdw.subscribeMailchimpUser, signEvents.handleFacebookAuth );
		app.post('/auth/app', mdw.authenticate(['standard']), mdw.fetchFacebookLongLivedToken('app_id'), initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		app.post('/me/update-profile', profileEvents.updateProfile );
		app.post('/me/update-picture', profileEvents.updatePicture );
		app.post('/me/update-pictures', profileEvents.updatePictures );
		app.post('/me/update-picture-fb', profileEvents.updatePictureWithUrl );
		app.post('/me/fetch-and-sync-friends', profileEvents.fetchAndSyncFriends );
		app.post('/me/update-settings-ux', settingsEvents.updateSettingsUx );

	//Events relatif à la gestion d'un évènement
		app.post('/create-event', manageEvents.createEvent );
		app.post('/cancel-event', manageEvents.cancelEvent );
		app.post('/suspend-event', manageEvents.suspendEvent );
		app.post('/fetch-askers', manageEvents.fetchAskers );


	//REST API
		app.get('/api/v1/users/:user_id', apiEventsUser.getUserById );
		app.get('/api/v1/users', apiEventsUser.searchUsers );

	//Events relatifs au démarrage d'une session client
		app.post('/fetch-events', clientEvents.fetchEvents );
		app.post('/fetch-users', clientEvents.fetchUsers );
		app.post('/fetch-asked-in', clientEvents.fetchAskedIn );
		app.post('/request-participation-in', clientEvents.requestIn );		
		app.post('/request-participation-out', clientEvents.requestOut );

	//Events relatifs aux friends


	//Events relatifs aux admins
		app.post('/fetch-app-data', mdw.authenticate(['admin']), adminEvents.fetchAppData );
		app.post('/create-event-bot', mdw.authenticate(['admin-bot']), adminEvents.createBotEvent );
		app.post('/request-participation-in-bot', mdw.authenticate(['admin-bot']), adminEvents.requestParticipationInBot );
		app.post('/add-event-template', mdw.authenticate(['admin']), adminEvents.addEventTemplate );
		app.post('/delete-event-template', mdw.authenticate(['admin']), adminEvents.deleteEventTemplate );

		app.post('/hello', function( req, res ){
			console.log('Hello test command received!');
			console.log('Message : ' + req.body.msg );
		});
	


		//Events relatif aux tests
		app.post('/test/app', mdw.populateUser({ auth_type: 'app_id' }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test/facebook', mdw.populateUser({ auth_type: 'facebook_id' }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test', mdw.populateUser(), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});

		app.post('/test/force', mdw.populateUser({ force_presence: true }), function( req, res ){
			var user = req.body.user;
			if( !user )
				return res.json({"msg":"no user"});
			return res.json({ user: user });
		});



};