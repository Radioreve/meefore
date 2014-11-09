
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	    var fetchEvents = function(userId){

	    	var socket = global.sockets[userId];

			console.log('Fetching all events for user with socket : ' + socket);
			Event.find({ state: { $ne: 'canceled' }}, function( err, events ){

				if( err )
					return eventUtils.raiseError({
						socket: socket,
						err: err,
						toServer: "Error fetching event",
						toClient: "Error loading recent events..."
					});

				socket.emit('fetch events success', events);

			});
	    }; 
	  
	    var requestIn = function(data){

			var eventId = data.eventId,
			 	hostId  = data.hostId ,
			 	userId  = data.userInfos._id;

			if( hostId == userId ) return;

			var room   = eventUtils.buildRoomId( eventId, hostId, userId ),
				userSocket = global.sockets[userId],
				hostSocket = global.sockets[hostId];

				userSocket.join( room );
				console.log('User '+userId+' has joined the room : \n'+room +'\n');

		     if( hostSocket != undefined ){ 
		     	hostSocket.join( room ); 
				console.log('Host '+hostId+' has joined the room : \n'+room + '\n');
			}

		/* On commence par l'Event pour savoir s'il est full */
		Event.findById( eventId, {}, function( err, myEvent ){

			if( myEvent.askersList.length === myEvent.maxGuest ){

				return eventUtils.raiseError({
					socket: userSocket,
					toServer: "max user reached for that event",
					toClient: "This event is full, try another one"
				});

			}

			User.findById( userId, {}, function( err, user ){

				if( err ){
					return eventUtils.raiseError({
						err: err,
						socket: userSocket,
						toServer: "Request failed [1]",
						toClient: "Couldn't join event"
					});
				}

					user.socketRooms.push( room );
					user.eventsAskedList.push( eventId );

					user.save(function( err, user ){

						if( !err ){

							var asker = {

								id            : user._id.toString(),
								name          : user.name,
								description   : user.description,
								age           : user.age,
								imgId         : user.imgId,
								imgVersion    : user.imgVersion,
								msg           : data.msg

							}; 

								myEvent.askersList.push( asker );

								myEvent.save( function( err ){

									if( !err ){
										global.io.emit('request participation in success', 
										{ hostId: hostId,  userId: userId, asker: asker, eventId: eventId });
									}
								});
						}
					});
				}); 	
			});

			User.findById( hostId, {},function(err,host){

						if( err ){
							return eventUtils.raiseError({
								err: err,
								socket: hostSocket,
								toClient: "Error CE1",
								toServer: "Error CE1"
							});
						}

							host.socketRooms.push(room);
							host.save(function( err, host ){
								if( ! err ) { }
							});
						
			});
		
	    };

	    var requestOut = function(data){

				var eventId = data.eventId,
					hostId  = data.hostId,
					userId  = data.userInfos._id;

				var room  = eventUtils.buildRoomId(eventId,hostId,userId),
					userSocket = global.sockets[userId],
					hostSocket = global.sockets[hostId];

					userSocket.leave(room);
					
					if( hostSocket != undefined ){
						hostSocket.leave(room); 
					}
					
				    eventCondition = { _id: eventId },
					eventUpdate    = { $pull: {'askersList': { 'id': userId }}},

					userCondition  = { _id: userId },
					userUpdate     = { $pull: { 'socketRooms': room, 'eventsAskedList': eventId }},

					hostCondition  = { _id: hostId },
					hostUpdate	   = { $pull: { 'socketRooms': room }},

					option = {},

					callback = function(err, result){ 

						if( err ){
							return eventUtils.raiseError({
								toClient: "Something happened! :o",
								socket: [ userSocket, hostSocket ],
								err: err
							});
						 }
							var data = {
								userId: userId,
								eventId: eventId,
								hostId: hostId
							};

						if ( result._id == userId ) 
							return userSocket.emit('request participation out success', data );

						if ( result._id == hostId && hostSocket != undefined ) 
							return hostSocket.emit('request participation out success', data );

					};

				Event.findOneAndUpdate( eventCondition, eventUpdate, option, callback );
				User.findOneAndUpdate( userCondition, userUpdate, option, callback );
			  	User.findOneAndUpdate( hostCondition, hostUpdate, option, callback );
			  
	    };

	    module.exports = {
	    	fetchEvents: fetchEvents,
	    	requestIn: requestIn,
	    	requestOut: requestOut
	    };