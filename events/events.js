
//global.sockets[id] events handlers
		profileEvents = require('./profileEvents'),
		manageEvents = require('./manageEvents'),
		otherEvents = require('./otherEvents'),
		clientEvents = require('./clientEvents');


module.exports = function(id){

		var socket = global.sockets[id];

//Events d'initialisation
		otherEvents.init();
		//global.sockets[id].on('disconnect', otherEvents.disconnectClient);

//Events relatifs au profile utilisateur
		socket.on( 'fetch user', profileEvents.fetchUser				);
		socket.on( 'update profile', profileEvents.updateProfile   		);
		socket.on( 'update picture', profileEvents.updatePicture   		);
		socket.on( 'update settings', profileEvents.updateSettings 		);

//Events relatif à la gestion d'un évènement
		socket.on( 'create event', manageEvents.createEvent		   		);
		socket.on( 'cancel event', manageEvents.cancelEvent		   		);
		socket.on( 'suspend event', manageEvents.suspendEvent	   		);
		socket.on( 'fetch askers', manageEvents.fetchAskers		   		);

//Events inclassables
		socket.on( 'send message', otherEvents.sendMessage		   		);
		socket.on( 'load rooms', otherEvents.reloadRooms		   		);

//Events relatifs au démarrage d'une session client
		socket.on( 'fetch events', clientEvents.fetchEvents		   		);
		socket.on( 'request participation in', clientEvents.requestIn	);		
		socket.on( 'request participation out', clientEvents.requestOut );

		socket.on('test', function(data){
			
			console.log(global.sockets);

		});
	};