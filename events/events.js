
//global.sockets[id] events handlers
		profileEvents = require('./profileEvents'),
		manageEvents = require('./manageEvents'),
		otherEvents = require('./otherEvents'),
		clientEvents = require('./clientEvents');


module.exports = function(id){


//Events d'initialisation
		otherEvents.init();
		//global.sockets[id].on('disconnect', otherEvents.disconnectClient);

//Events relatifs au profile utilisateur
		global.sockets[id].on('update profile', profileEvents.updateProfile);
		global.sockets[id].on('update picture', profileEvents.updatePicture);

//Events relatif à la gestion d'un évènement
		global.sockets[id].on('create event', manageEvents.createEvent);
		global.sockets[id].on('cancel event', manageEvents.cancelEvent);
		global.sockets[id].on('fetch askers', manageEvents.fetchAskers);

//Events inclassables
		global.sockets[id].on('send message', otherEvents.sendMessage);
		global.sockets[id].on('load rooms', otherEvents.reloadRooms);

//Events relatifs au démarrage d'une session client
		global.sockets[id].on('fetch events', clientEvents.fetchEvents);
		global.sockets[id].on('request participation in', clientEvents.requestIn)		
		global.sockets[id].on('request participation out', clientEvents.requestOut);

	};