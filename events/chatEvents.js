
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');
	
	var sendMessage = function(data){

	  var askerId = data.askerId,
	  	  hostId  = data.hostId,
	  	  eventId = data.eventId;

	  var askerSocket = global.sockets[ askerId ],
	  	  hostSocket  = global.sockets[ hostId ];

	  if( !hostSocket ){
	  	return eventUtils.raiseError({
	  		socket: askerSocket,
	  		toClient: "Host is not online",
	  		flash: true
	  	});
	  }

	  if( !askerSocket ){
	  	return eventUtils.raiseError({
	  		socket: hostSocket,
	  		toClient: "Asker is not online",
	  		flash: true
	  	});
	  }

	  var room = eventUtils.buildRoomId( data.eventId, data.hostId, data.askerId );

 		  data.chatId = room;
	      global.io.to( room ).emit('receive message', data);
	};
 
	var reloadRooms = function(userId){
 
			User.findById( userId, {}, function(err, user){

				if( err ){
					console.log('Error fetching user for load rooms');
				}else{
					user.socketRooms.forEach( function( room ){
						console.log('Joining room : ' + room );
						global.sockets[userId].join( room );
					});
				}
			});
	};

	module.exports = {

		sendMessage: sendMessage,
		reloadRooms: reloadRooms

	};