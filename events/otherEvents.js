
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	var disconnectClient = function(){
			global.socket.disconnect();
			console.log('Client has left the stream');
	};

	var sendMessage = function(data){
	  var room = eventUtils.buildRoomId( data.eventId, data.hostId, data.askerId);
 		  data.chatId = room;
	      global.io.to(room).emit('receive message', data);
	};

	var loadRooms = function(data){
			console.log('Loading rooms for user id : '+data._id);
			User.findById(data._id,{},function(err, user){
				if(err){
					console.log('Error fetching user for load rooms');
				}else{
					user.socketRooms.forEach(function(room){
						console.log('Joining room : '+room);
						global.socket.join(room);
					});
				}
			});
	};

	module.exports = {
		sendMessage: sendMessage,
		loadRooms: loadRooms,
		disconnectClient: disconnectClient
	};