
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
	  		toClient: "Il/elle n'est pas connecté(e)",
	  		flash: true
	  	});
	  }

	  if( !askerSocket ){
	  	return eventUtils.raiseError({
	  		socket: hostSocket,
	  		toClient: "Il/elle n'est pas connecté(e)",
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
						global.sockets[ userId ].join( room );
					});
				}
			});
	};

	var sayUserStartedTyping = function( data ){
		var userId = data.userId,
			chatId = data.chatId,
			socket = global.sockets[userId];

		socket.broadcast.to( chatId ).emit('user started typing success', chatId );
	}

	var sayUserStoppedTyping = function( data ){
		var userId = data.userId,
			chatId = data.chatId,
			socket = global.sockets[userId];
			
		socket.broadcast.to( chatId ).emit('user stopped typing success', chatId );
	}

	module.exports = {

		sendMessage: sendMessage,
		reloadRooms: reloadRooms,
		sayUserStartedTyping: sayUserStartedTyping,
		sayUserStoppedTyping: sayUserStoppedTyping

	};