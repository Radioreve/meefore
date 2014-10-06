
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	var init = function(){

	};

	/*
	var disconnectClient = function(userId){
			global.sockets[userId].disconnect();
			console.log('Client has left the stream');
	};  */

	var sendMessage = function(data){
	  var room = eventUtils.buildRoomId( data.eventId, data.hostId, data.askerId);
 		  data.chatId = room;
	      global.io.to(room).emit('receive message', data);
	};
 
	var reloadRooms = function(userId){
 
			console.log('Loading rooms for user id : '+userId);
			User.findById(userId,{},function(err, user){
				if(err){
					console.log('Error fetching user for load rooms');
				}else{
					user.socketRooms.forEach(function(room){
						console.log('Joining room : '+room);
						global.sockets[userId].join(room);
					});
				}
			});
	};

	module.exports = {
		init: init,
		sendMessage: sendMessage,
		reloadRooms: reloadRooms
	};