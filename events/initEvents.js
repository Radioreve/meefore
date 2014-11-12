	
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

				expose.settings = settings;
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


			userSocket.emit('fetch user and configuration success', expose );

		});
	};

	module.exports = {

		fetchUserAndConfiguration: fetchUserAndConfiguration
		
	}