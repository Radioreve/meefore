	
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

	var pusher = require('../services/pusher');


		cloudinary.config({ 

			cloud_name: config.cloudinary.cloud_name,
		    api_key: config.cloudinary.api_key,
		    api_secret: config.cloudinary.api_secret

		});


	var fetchUserAndConfiguration = function( req, res ){

		var	userId = req.sent.user_id;
		
		User.findById( userId, {}, function( err, user ){

			if( err )
				return eventUtils.raiseError({
					toServer: "Problem finding user for fetch config during first connection attempt ",
					toClient: "Erreur d'initialisation",
					err: err,
					res: res			
				});

			if( !user )
				return eventUtils.raiseError({
					toServer: "User doesn't seem to exist?!",
					toClient: "Impossible de fetch les informations",
					err: err,
					res: res			
				});


				/* Contient toutes les informations exposées publiquement lors de la première connection */
				var expose = {};

				expose.settings = settings;
				expose.onlineUsers = [];

				expose.user = user;

			eventUtils.sendSuccess( res, expose );

		});
	};


	module.exports = {

		fetchUserAndConfiguration: fetchUserAndConfiguration
		
	}