	
	var pushEventsDir = '../pushevents/',
		apiDir        = '../api/',
		auth = require('../globals/authorize.js');

	var initEvents    = require( pushEventsDir + 'initEvents'),
		profileEvents = require( pushEventsDir + 'profileEvents'),
		manageEvents  = require( pushEventsDir + 'manageEvents'),
		chatEvents    = require( pushEventsDir + 'chatEvents'),
		clientEvents  = require( pushEventsDir + 'clientEvents'),
		friendEvents  = require( pushEventsDir + 'friendEvents'),
		adminEvents   = require( pushEventsDir + 'adminEvents'),
		apiEventsUser = require( apiDir + 'users' ),
		signEvents    = require( pushEventsDir + 'signEvents');

	module.exports = function( app ){

		app.all('/api/*', function( req, res, next ){
			console.log('Request made to the API');
			return next();
		});

		app.get('/home', signEvents.sendHomepage );
		app.get('/', signEvents.redirectToHome );
		app.get('/earlyadopters', signEvents.sendEarlyAdoptersPage );
		app.post('/auth/facebook', signEvents.handleFacebookAuth );

	//Events d'initialisation et de déconnexion
		app.post('/fetch-user-and-configuration', auth.authenticate(['standard']), initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		app.post('/me/update-profile', auth.authenticate(['standard']), profileEvents.updateProfile );
		app.post('/me/update-picture', profileEvents.updatePicture );
		app.post('/me/update-pictures', profileEvents.updatePictures );
		app.post('/me/update-settings', profileEvents.updateSettings );
		app.post('/me/update-picture-fb', profileEvents.updatePictureWithFacebook );

	//Events relatif à la gestion d'un évènement
		app.post('/create-event', manageEvents.createEvent );
		app.post('/cancel-event', manageEvents.cancelEvent );
		app.post('/suspend-event', manageEvents.suspendEvent );
		app.post('/fetch-askers', manageEvents.fetchAskers );


	//REST API
		app.get('/api/v1/users/:user_id', apiEventsUser.getUserById );

	//Events relatif au chat


	//Events relatifs au démarrage d'une session client
		app.post('/fetch-events', clientEvents.fetchEvents );
		app.post('/fetch-users', clientEvents.fetchUsers );
		app.post('/fetch-asked-in', clientEvents.fetchAskedIn );
		app.post('/request-participation-in', clientEvents.requestIn );		
		app.post('/request-participation-out', clientEvents.requestOut );

	//Events relatifs aux friends


	//Events relatifs aux admins
		app.post('/fetch-app-data', auth.authenticate(['admin']), adminEvents.fetchAppData );
		app.post('/create-event-bot', auth.authenticate(['admin-bot']), adminEvents.createBotEvent );
		app.post('/request-participation-in-bot', auth.authenticate(['admin-bot']), adminEvents.requestParticipationInBot );
		app.post('/add-event-template', auth.authenticate(['admin']), adminEvents.addEventTemplate );
		app.post('/delete-event-template', auth.authenticate(['admin']), adminEvents.deleteEventTemplate );

		app.post('/hello', function( req, res ){
			console.log('Hello test command received!');
			console.log('Message : ' + req.body.msg );
		});
	};


