
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');

	    var fetchEvents = function(userId){

	    	var socket = global.sockets[userId];

			console.log('Fetching all events');
			Event.find({state: {$ne: 'canceled'}}, function(err,events){
				if(err){console.log(err); return;}
					socket.emit('fetch events success', events);
			});
	    }; 
	  
	    var requestIn = function(data){

			var eventId = data.eventId,
			 	hostId  = data.hostId ,
			 	userId  = data.userInfos._id;

			if( hostId == userId ) return;  /* Send back un msg au client éventuellement */

			var room   = eventUtils.buildRoomId(eventId, hostId, userId),
				userSocket = global.sockets[userId],
				hostSocket = global.sockets[hostId];

				userSocket.join(room);
				console.log('User '+userId+' has joined the room : \n'+room +'\n');

		     if( hostSocket != undefined ){ 
		     	hostSocket.join(room); 
				console.log('Host '+hostId+' has joined the room : \n'+room + '\n');
			}
		
			Event.findById( eventId, {}, function(err,myEvent){

					User.findById( userId, {}, function(err,user){
						if( err ){
							console.log('Error finding user : '+err);
						}
						else{
							user.socketRooms.push(room);
							user.eventsAskedList.push(myEvent._id.toString());
							user.save(function(err,user){
								if( err ){
									console.log("Error updating User Model : "+err);
								}else{
									var asker = {
										id:user._id.toString(),
										name:user.name,
										description:user.description,
										age:user.age,
										imgId:user.imgId,
										imgVersion:user.imgVersion,
										msg:data.msg
									}; 
									myEvent.askersList.push(asker);
									myEvent.save(function(err){
										if( !err ){
											global.io.emit('request participation in success', {hostId:hostId,
																							 userId:userId,
																							 asker:asker});
										}else{
											console.log("Error updating Event Model: "+err);
										}
									});
								}
							});
						}
					});	
			});

			User.findById( hostId, {},function(err,host){
						if( err ){
							console.log('Error finding host');
						}else{
							host.socketRooms.push(room);
							host.save(function(err,host){
								if( err ){
									console.log('Error saving host new room');
								}
							});
						}
					});
		
	    };

	    var requestOut = function(data){

				var eventId = data.eventId,
					hostId  = data.hostId,
					userId  = data.userInfos._id,
					room  = eventUtils.buildRoomId(eventId,hostId,userId),
					userSocket = global.sockets[userId],
					hostSocket = global.sockets[hostId];

					userSocket.leave(room);
					console.log('User '+userId+' has left the room : \n'+room + '\n');
					
					if( hostSocket != undefined ){
						hostSocket.leave(room); 
						console.log('Host '+hostId+' has left the room : \n'+room + '\n');
					}
					
				    eventCondition = { _id: eventId },
					eventUpdate    = { $pull: {'askersList': { 'id': userId }}},

					userCondition  = { _id: userId },
					userUpdate     = { $pull: { 'socketRooms': room, 'eventsAskedList': eventId }},

					hostCondition  = { _id: hostId },
					hostUpdate	   = { $pull: { 'socketRooms': room }},

					option = {},

					callback = function(err){ 
						if(err){console.log(err); }
						else{ 

							var data = {
								userId: userId,
								eventId: eventId,
								hostId: hostId
							};

							if( hostSocket != undefined ){
							hostSocket.emit('request participation out success', data );
							console.log('emitting out for host');
							}
							
							hostSocket.emit('request participation out success', data );								
						}
					};

				Event.update( eventCondition, eventUpdate, option, callback );
				User.update( userCondition, userUpdate, option, callback );
			  	User.update( hostCondition, hostUpdate, option, callback );
			  
	    };

	    module.exports = {
	    	fetchEvents: fetchEvents,
	    	requestIn: requestIn,
	    	requestOut: requestOut
	    };