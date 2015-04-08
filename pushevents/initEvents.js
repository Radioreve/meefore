	
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
	    settings    = require('../config/settings');

	var pusher = require('../globals/pusher');


		cloudinary.config({ 

			cloud_name: config.cloudinary.cloud_name,
		    api_key: config.cloudinary.api_key,
		    api_secret: config.cloudinary.api_secret

		});


	var fetchUserAndConfiguration = function( req, res ){

		var	userId = req.body.id;
		
		console.log( userId );

		User.findById( userId, {}, function( err, user ){

			if( err ){

				return eventUtils.raiseError({
					toServer: "Problem finding user via socket.io during first connection attempt ",
					toClient: "Erreur d'initialisation",
					err: err,
					res: res			
				});

			}

			if( !user ){

				return eventUtils.raiseError({
					toServer: "User doesn't seem to exist?!",
					toClient: "Impossible de fetch les informations",
					err: err,
					res: res			
				});

			}

			var cloudTag = cloudinary.uploader.image_upload_tag( 'hello_world' , { public_id: userId });

				/* Contient toutes les informations exposées publiquement lors de la première connection */
				var expose = {};

				expose.settings = settings;
				expose.onlineUsers = [];

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
  					myChannels:      user.myChannels,
  					cloudTag:    	 cloudTag
  					
				};

			eventUtils.sendSuccess( res, expose );

			if( user.status == 'new' ) 
				pusher.trgger( 'default', 'new-user-signed-up', { user: expose.user } );

		});
	};


	module.exports = {

		fetchUserAndConfiguration: fetchUserAndConfiguration,
		disconnectUser: disconnectUser
		
	}