
		/* Models */
   	var	User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		Chat = require('../models/ChatModel'),

		/* Socket events handlers */
		profileEvents = require('./profileEvents'),
		manageEvents = require('./manageEvents'),
		otherEvents = require('./otherEvents'),
		clientEvents = require('./clientEvents');


	module.exports = function(socket, io){

		socket.emit('client connected');
		socket.on('disconnect', otherEvents.disconnectClient);

		/* Events relatifs au profile utilisateur */
		socket.on('update profile', profileEvents.updateProfile);
		socket.on('update picture', profileEvents.updatePicture);

		/* Events relatif à la gestion d'un évènement */
		socket.on('create event', manageEvents.createEvent);
		socket.on('cancel event', manageEvents.cancelEvent);
		socket.on('fetch askers', manageEvents.fetchAskers);

		/* Events inclassables */
		socket.on('send message', otherEvents.sendMessage);
		socket.on('load rooms', otherEvents.loadRooms);

		/* Events relatifs au démarrage d'une session client */
		socket.on('fetch events', clientEvents.fetchEvents);
		socket.on('request participation in', clientEvents.requestIn)		
		socket.on('request participation out', clientEvents.requestOut);

		
		

	};