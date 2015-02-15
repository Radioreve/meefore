
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    settings = require('../config/settings');


	    var fetchEvents = function(userId){

	    	var socket = global.sockets[userId];

			console.log('Fetching all events for user with socket : ' + socket);
			Event.find({ state: { $in: settings.activeEventStates }}, function( err, events ){

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

	   var fetchUsers = function( userId ){

	   		var socket = global.sockets[userId];

	   		User.find({}, function( err, users ){

	   			if( err )
	   				return eventUtils.raiseError({
	   					socket: socket,
	   					err: err,
	   					toServer: "Error fetching all users",
	   					toClient: "Error loading users..."
	   				});

	   			console.log('Emitting...')
	   			socket.emit('fetch users success', users );

	   		});

	   }
	  
	    var requestIn = function(data){

			var eventId     = data.eventId,
			 	hostId      = data.hostId ,
			 	userId 		= data.userInfos._id,
			 	requesterId = data.requesterId;

			if( hostId == userId ) return;

			var room   = eventUtils.buildRoomId( eventId, hostId, userId ),
				userSocket = global.sockets[userId],
				hostSocket = global.sockets[hostId],
		   requesterSocket = global.sockets[requesterId];


			if( userSocket != undefined ){
				userSocket.join( room );
				console.log('User '+userId+' has joined the room : \n'+room +'\n');
			}

		    if( hostSocket != undefined ){ 
		     	hostSocket.join( room ); 
				console.log('Host '+hostId+' has joined the room : \n'+room + '\n');
			}


		Event.findById( eventId, {}, function( err, myEvent ){

			/* On commence par l'Event pour savoir s'il est full 

			if( myEvent.askersList.length === myEvent.maxGuest ){

				return eventUtils.raiseError({
					socket: userSocket,
					toServer: "max user reached for that event",
					toClient: "L'évènement est complet. Essayez en un autre."
				});

			

			}
			/* Ensuite on regarde si la personne n'est pas déjà dans la liste pour éviter toute incohérence Data */
			if(  _.pluck( myEvent.askersList, '_id' ).indexOf( userId ) != -1 )
			{
				return requesterSocket.emit('friend already in', { eventId: eventId, userId: userId });
			}

			User.findById( userId, {}, function( err, user ){

				if( err ){
					return eventUtils.raiseError({
						err: err,
						socket: userSocket,
						toServer: "Request failed [1]",
						toClient: "Error happened - We have been notified"
					});
				}

				if( user.status === 'hosting' ){
					if( requesterId == userId )
					{
						return eventUtils.raiseError({
							err: err,
							socket: userSocket,
							toServer: "Request failed [2a]",
							toClient: "Vous êtes déjà en train d'organiser une soirée!"
						});
					}
					if( requesterId != userId )
					{
						return eventUtils.raiseError({
							err: err,
							socket: requesterSocket,
							toServer: "Request failed [2b]",
							toClient: "Cet ami est en train d'organiser une soirée"
						});
					}

				}

					user.socketRooms.push( room );
					user.eventsAskedList.push( eventId );

					user.save(function( err, user ){

						if( !err ){

							var asker = {

								_id           : user._id.toString(),
								name          : user.name,
								description   : user.description,
								age           : user.age,
								favoriteDrink : user.favoriteDrink,
								mood          : user.mood,
								signupDate    : user.signupDate,
								imgId         : user.imgId,
								imgVersion    : user.imgVersion,
								friendList    : user.friendList

							}; 

								myEvent.askersList.push( asker );

								myEvent.save( function( err ){

									if( !err ){
										global.io.emit('request participation in success', 
										{ hostId: hostId,  userId: userId, asker: asker, eventId: eventId, requesterId: requesterId });
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

							host.socketRooms.push( room );
							host.save(function( err, host ){
								if( ! err ) { }
							});
						
			});
		
	    };

	    var requestOut = function(data){

				var eventId 	= data.eventId,
					hostId  	= data.hostId,
					userId  	= data.userInfos._id,
					requesterId = data.requesterId,
					asker   	= {};

				var room  = eventUtils.buildRoomId( eventId, hostId, userId ),

					userSocket = global.sockets[userId],
					hostSocket = global.sockets[hostId];

					userSocket.leave( room );
					
					if( hostSocket != undefined ){
						hostSocket.leave( room ); 
					}
					
				    eventCondition = { _id: eventId },
					eventUpdate    = { $pull: {'askersList': { '_id': userId }}},

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
					};

					userCallback = function(err, user){ 

						if( err ){
							return eventUtils.raiseError({
								toClient: "Something happened! :o",
								socket: [ userSocket, hostSocket ],
								err: err
							});
						 }

					 	asker = {

							_id           : user._id.toString(),
							name          : user.name,
							description   : user.description,
							age           : user.age,
							imgId         : user.imgId,
							imgVersion    : user.imgVersion

						}; 

						var data = {

							userId: userId,
							eventId: eventId,
							hostId: hostId,
							asker: asker,
							requesterId: requesterId

						};

			 			global.io.emit('request participation out success', data );

					};

				Event.findOneAndUpdate( eventCondition, eventUpdate, option, callback );
			  	User.findOneAndUpdate( hostCondition, hostUpdate, option, callback );
				User.findOneAndUpdate( userCondition, userUpdate, option, userCallback );

			  
	    };

	    module.exports = {
	    	fetchEvents: fetchEvents,
	    	fetchUsers: fetchUsers,
	    	requestIn: requestIn,
	    	requestOut: requestOut
	    };