
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    config = require('../config/config');
	    cloudinary = require('cloudinary'),
	    appSettings = require('../config/settings');


		cloudinary.config({ 
							cloud_name: config.cloudinary.cloud_name,
						    api_key: config.cloudinary.api_key,
						    api_secret: config.cloudinary.api_secret
						});

	var fetchUserAndConfiguration = function( userId ){

		var userSocket = global.sockets[userId];

		User.findById( userId, {}, function( err, user ){

			if( err ){

				return eventUtils.raiseError({
					toServer: "Problem finding user via socket.io during first connection attempt ",
					toClient: "Something went wrong initialising the app",
					socket: userSocket,
					err: err
				});

			}

			var cloudTag = cloudinary.uploader.image_upload_tag( 'hello_world' , { public_id: userId });

				/* Contient toutes les informations exposées publiquement lors de la première connection */
				var expose = {};

				expose.user = {

							_id:         	 user._id,
		  					email:       	 user.local.email,
		  					name:        	 user.name,
		  					age:         	 user.age,
		  					status:      	 user.status,
		  					description: 	 user.description,
		  					imgId:      	 user.imgId,
		  					imgVersion: 	 user.imgVersion,
		  					eventsAskedList: user.eventsAskedList,
		  					hostedEventId:   user.hostedEventId,
		  					newsletter:      user.newsletter,
		  					cloudTag:    	 cloudTag
				};

				var tagList = appSettings.tagList;

				expose.settings = {

					tagList : appSettings.tagList

				};

			userSocket.emit('fetch user and configuration success', expose );

		});
	};
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
		fetchUserAndConfiguration: fetchUserAndConfiguration,
		sendMessage: sendMessage,
		reloadRooms: reloadRooms
	};