	
	initEvents    = require('./initEvents'),
	profileEvents = require('./profileEvents'),
	manageEvents  = require('./manageEvents'),
	otherEvents   = require('./otherEvents'),
	clientEvents  = require('./clientEvents'),
	friendEvents  = require('./friendEvents'),
	mailEvents    = require('./mailEvents');

	module.exports = function( id ){

		var socket = global.sockets[id];

	//Events d'initialisation
		socket.on( 'fetch user and configuration', initEvents.fetchUserAndConfiguration );

	//Events relatifs au profile utilisateur
		socket.on( 'fetch user', profileEvents.fetchUser );  // useless 
		socket.on( 'update profile', profileEvents.updateProfile );
		socket.on( 'update picture', profileEvents.updatePicture );
		socket.on( 'update settings', profileEvents.updateSettings );

	//Events relatif à la gestion d'un évènement
		socket.on( 'create event', manageEvents.createEvent );
		socket.on( 'cancel event', manageEvents.cancelEvent );
		socket.on( 'suspend event', manageEvents.suspendEvent );
		socket.on( 'fetch askers', manageEvents.fetchAskers );

	//Events inclassables
		socket.on( 'send message', otherEvents.sendMessage );
		socket.on( 'load rooms', otherEvents.reloadRooms );

	//Events relatifs au démarrage d'une session client
		socket.on( 'fetch events', clientEvents.fetchEvents );
		socket.on('fetch users', clientEvents.fetchUsers );
		socket.on( 'request participation in', clientEvents.requestIn );		
		socket.on( 'request participation out', clientEvents.requestOut );

	//Events relatifs aux friends
		socket.on( 'fetch friends', friendEvents.fetchFriends );
		socket.on( 'friend request in', friendEvents.friendRequestIn );
		socket.on( 'refetch askers', friendEvents.refetchAskers );

	//Events de mails
		//socket.on( 'request welcome email', mailEvents.requestWelcomeEmail	);
		//socket.on( 'send contact email', mailEvents.sendContactEmail	    );

		socket.on('test', function(data){
			
			console.log(global.sockets);

		});
	};