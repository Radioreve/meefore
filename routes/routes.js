	
	var pushEventsDir = '../pushevents/';

	var initEvents    = require( pushEventsDir + 'initEvents'),
		profileEvents = require( pushEventsDir + 'profileEvents'),
		manageEvents  = require( pushEventsDir + 'manageEvents'),
		chatEvents    = require( pushEventsDir + 'chatEvents'),
		clientEvents  = require( pushEventsDir + 'clientEvents'),
		friendEvents  = require( pushEventsDir + 'friendEvents'),
		adminEvents   = require( pushEventsDir + 'adminEvents');

	var baseEvents    = require( pushEventsDir + 'baseEvents');

	module.exports = function( app ){

		app.get('/home', baseEvents.sendHomepage );
		app.get('*', baseEvents.redirectToHome );
		app.post('/auth/facebook', baseEvents.handleFacebookAuth );
		app.post('/signup', baseEvents.handleSignup );
		app.post('/login', baseEvents.handleLogin );
		app.post('/reset', baseEvents.handleReset );

	//Events d'initialisation et de déconnexion
		app.post('/fetch-user-and-configuration', initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		app.post('/fetch-user', profileEvents.fetchUser );  // useless 
		app.post('/update-profile', profileEvents.updateProfile );
		app.post('/update-picture', profileEvents.updatePicture );
		app.post('/update-settings', profileEvents.updateSettings );

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
		app.post('/request-participation-in', clientEvents.requestIn );		
		app.post('/request-participation-out', clientEvents.requestOut );

	//Events relatifs aux friends
		app.post('/fetch-friends', friendEvents.fetchFriends );
		app.post('/friend-request-in', friendEvents.friendRequestIn );
		app.post('/refetch-askers', friendEvents.refetchAskers );

	//Events relatifs aux admins
		app.post('/fetch-app-data', adminEvents.fetchAppData );

		app.post('/hello', function( req, res ){
			console.log('Hello test command received!');
			console.log('Message : ' + req.body.msg );
		});
	};


	

