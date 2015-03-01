	
/* 
	Contient tous les évènements relatifs à l'initialisation de l'application
	Cet event est automatiquement envoyé par le client dès qu'il a été authentifié
*/

	var User 		= require('../models/UserModel'),
	    Event 		= require('../models/EventModel'),
	    _ 			= require('lodash'),
	    cloudinary  = require('cloudinary'),
		eventUtils  = require('./eventUtils'),
		config      = require('../config/config'),
	    settings = require('../config/settings');

		cloudinary.config({ 
							cloud_name: config.cloudinary.cloud_name,
						    api_key: config.cloudinary.api_key,
						    api_secret: config.cloudinary.api_secret
						});

	var fetchUserAndConfiguration = function( req, res ){

		var chan = req.body.chan,
			userId = req.body.userId;
		
		User.findById( userId, {}, function( err, user ){

			if( err ){

				return eventUtils.raiseError({
					toServer: "Problem finding user via socket.io during first connection attempt ",
					toClient: "Erreur d'initialisation",
					socket: userSocket,
					err: err			
				});

			}

			var cloudTag = cloudinary.uploader.image_upload_tag( 'hello_world' , { public_id: userId });

				/* Contient toutes les informations exposées publiquement lors de la première connection */
				var expose = {};

				expose.settings = settings;
				expose.onlineUsers = global.appData.onlineUsers;
				expose.user = {

							_id:         	 user._id,
		  					email:       	 user.local.email,
		  					name:        	 user.name,
		  					age:         	 user.age,
		  					access:          user.access, 
		  					gender:          user.gender,
		  					favoriteDrink:   user.favoriteDrink,
		  					mood:            user.mood,
		  					status:      	 user.status,
		  					description: 	 user.description,
		  					imgId:      	 user.imgId,
		  					imgVersion: 	 user.imgVersion,
		  					friendList:      user.friendList,
		  					eventsAskedList: user.eventsAskedList,
		  					hostedEventId:   user.hostedEventId,
		  					newsletter:      user.newsletter,
		  					cloudTag:    	 cloudTag
		  					
				};


			pusher.trigger('public_chan','fetch-user-and-configuration-success', expose );

			//if( user.status == 'new' ) userSocket.broadcast.emit('new user signed up', expose.user );

		});
	};

	var disconnectUser = function(){

		console.log( socket );
		global.io.emit('user disconnected', userId );

	}



	module.exports = {

		fetchUserAndConfiguration: fetchUserAndConfiguration,
		disconnectUser: disconnectUser
		
	}