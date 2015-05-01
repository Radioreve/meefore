	
	var pushEventsDir = '../pushevents/',
		auth = require('../globals/authorize.js');

	var initEvents    = require( pushEventsDir + 'initEvents'),
		profileEvents = require( pushEventsDir + 'profileEvents'),
		manageEvents  = require( pushEventsDir + 'manageEvents'),
		chatEvents    = require( pushEventsDir + 'chatEvents'),
		clientEvents  = require( pushEventsDir + 'clientEvents'),
		friendEvents  = require( pushEventsDir + 'friendEvents'),
		adminEvents   = require( pushEventsDir + 'adminEvents'),
		signEvents    = require( pushEventsDir + 'signEvents');

	module.exports = function( app ){

		app.get('/home', signEvents.sendHomepage );
		app.get('/earlyadopters', signEvents.sendEarlyAdoptersPage );
		app.get('*', signEvents.redirectToHome );
		app.post('/auth/facebook', signEvents.handleFacebookAuth );
		app.post('/signup', signEvents.handleSignup );
		app.post('/login', signEvents.handleLogin );
		app.post('/reset', signEvents.handleReset );

	//Events d'initialisation et de déconnexion
		app.post('/fetch-user-and-configuration', auth.authenticate(['standard']), initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		app.post('/update-profile', auth.authenticate(['standard']), profileEvents.updateProfile );
		app.post('/update-picture', profileEvents.updatePicture );
		app.post('/update-settings', profileEvents.updateSettings );
		app.post('/update-picture-fb', profileEvents.updatePictureWithFacebook );

	//Events relatif à la gestion d'un évènement
		app.post('/create-event', manageEvents.createEvent );
		app.post('/cancel-event', manageEvents.cancelEvent );
		app.post('/suspend-event', manageEvents.suspendEvent );
		app.post('/fetch-askers', manageEvents.fetchAskers );

	//Events relatif au chat
		app.post('/send-message', chatEvents.sendMessage );
		app.post('/test-all-channels', chatEvents.testAllChannels );
		app.post('/user-started-typing', chatEvents.sayUserStartedTyping );
		app.post('/user-stopped-typing', chatEvents.sayUserStoppedTyping );

	//Events relatifs au démarrage d'une session client
		app.post('/fetch-events', clientEvents.fetchEvents );
		app.post('/fetch-users', clientEvents.fetchUsers );
		app.post('/fetch-asked-in', clientEvents.fetchAskedIn );
		app.post('/request-participation-in', clientEvents.requestIn );		
		app.post('/request-participation-out', clientEvents.requestOut );

	//Events relatifs aux friends
		app.post('/fetch-friends', friendEvents.fetchFriends );
		app.post('/friend-request-in', friendEvents.friendRequestIn );
		app.post('/refetch-askers', friendEvents.refetchAskers );

	//Events relatifs aux admins
		app.post('/fetch-app-data', auth.authenticate(['admin']), adminEvents.fetchAppData );
		app.post('/create-event-bot', auth.authenticate(['admin']), adminEvents.createBotEvent );
		app.post('/request-participation-in-bot', auth.authenticate(['admin']), adminEvents.requestParticipationInBot );
		app.post('/add-event-template', auth.authenticate(['admin']), adminEvents.addEventTemplate );
		app.post('/delete-event-template', auth.authenticate(['admin']), adminEvents.deleteEventTemplate );

		app.post('/hello', function( req, res ){
			console.log('Hello test command received!');
			console.log('Message : ' + req.body.msg );
		});
	};


	

