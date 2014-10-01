
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');

	    var fetchEvents = function(data){

			console.log('Fetching all events');
			Event.find({state: {$ne: 'canceled'}}, function(err,events){
				if(err){console.log(err); return;}
					global.socket.emit('fetch events success', events);
			});
	    };

	    var requestIn = function(data){
			var eventId = data.eventId,
			 	hostId  = data.hostId,
			 	userId = data.userInfos._id;

			var room = eventUtils.buildRoomId(eventId, hostId, userId);
				socket.join(room);

			Event.findById(eventId,{},function(err,myEvent){

					User.findById(userId,{},function(err,user){
						if(err){
							console.log('Error finding user : '+err);
						}
						else{
							user.socketRooms.push(room);
							user.eventsAskedList.push(myEvent._id.toString());
							user.save(function(err,user){
								if(err){
									console.log("Error updating User Model : "+err);
								}else{
									var asker = {
										id:user._id.toString(),
										name:user.name,
										description:user.description,
										age:user.age,
										imgId:user.img.id,
										imgVersion:user.img.version,
										msg:data.msg
									};
									myEvent.askersList.push(asker);
									myEvent.save(function(err){
										if(!err){
											console.log('Array augmented');
											socket.broadcast.emit('request participation in success', {hostId:hostId,
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

			User.findById(hostId,{},function(err,host){
						if(err){
							console.log('Error finding host');
						}else{
							host.socketRooms.push(room);
							host.save(function(err,host){
								if(err){
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
					chatId  = eventUtils.buildRoomId(eventId,hostId,userId),

				    eventCondition = { _id: eventId },
					eventUpdate    = { $pull: {'askersList': { 'id': userId }}},

					userCondition  = { _id: userId },
					userUpdate     = { $pull: { 'socketRooms': chatId, 'eventsAskedList': eventId }},

					hostCondition  = { _id: hostId },
					hostUpdate	   = { $pull: { 'socketRooms': chatId }},

					option = {},
					callback = function(err){ 
						if(err){console.log(err); }
						else{ global.io.to(hostId).emit('request participation out success', {userId: userId});}
					};

				global.socket.leave(chatId);

				Event.update(eventCondition, eventUpdate, option, callback);
				User.update(userCondition, userUpdate, option, callback);
			  	User.update(hostCondition, hostUpdate, option, callback);
			  
	    };

	    module.exports = {
	    	fetchEvents: fetchEvents,
	    	requestIn: requestIn,
	    	requestOut: requestOut
	    };