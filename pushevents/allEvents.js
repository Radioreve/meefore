	
	var _ = require('lodash');

	var initEvents    = require('./initEvents'),
		profileEvents = require('./profileEvents'),
		manageEvents  = require('./manageEvents'),
		chatEvents    = require('./chatEvents'),
		clientEvents  = require('./clientEvents'),
		friendEvents  = require('./friendEvents'),
		adminEvents  = require('./adminEvents'),
		mailEvents    = require('./mailEvents');

	module.exports = function( app ){

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
		app.post('/load-rooms', chatEvents.reloadRooms );
		app.post('/user-started-typing', chatEvents.sayUserStartedTyping );
		app.post('/user-stopped-typing', chatEvents.sayUserStoppedTyping );

	//Events relatifs au démarrage d'une session client
		app.post('/fetch-events', clientEvents.fetchEvents );
		app.post('/fetch-users', clientEvents.fetchUsers );
		app.post('/request-participation-in', clientEvents.requestIn );		
		app.post('/request-participation-out', clientEvents.requestOut );

	//Events relatifs aux friends
		app.post( '/fetch-friends', friendEvents.fetchFriends );
		app.post( '/friend-request-in', friendEvents.friendRequestIn );
		app.post( '/refetch-askers', friendEvents.refetchAskers );

	//Events relatifs aux admins
		app.post( '/fetch-app-data', adminEvents.fetchAppData );

	//Events de mails
		//app.post( '/request welcome email', mailEvents.requestWelcomeEmail	);
		app.post( '/send-contact-email', mailEvents.sendContactEmail );

		app.post('/test', function(req,res,data){

			console.log('Test received!');

		});
	};