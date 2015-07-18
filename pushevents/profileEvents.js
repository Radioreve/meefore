
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    cloudinary = require('cloudinary'),
	    config = require('../config/config'),
	    settings = require('../config/settings'),
	    validator = require("validator");

	    cloudinary.config({ 

			cloud_name: config.cloudinary.cloud_name,
		    api_key: config.cloudinary.api_key,
		    api_secret: config.cloudinary.api_secret

		});

	var pusher = require('../globals/pusher');

	var updateProfile = function( req, res ){

			var data = req.body;

			var userId = req.userId,
				age    = data.age;

			if( ! validator.isInt( data.age ) ){
				return eventUtils.raiseError({
						toServer: "Wrong input format for age (must be age)",
						toClient: "Il y a un problème avec votre âge",
						res: res
					});	
			}

			var update = {
				name     	  : data.name,
				age			  : data.age,
				description   : data.description,
				drink         : data.drink,
				mood          : data.mood,
				job			  : data.job,
				status	 	  : data.status
			};

			var callback = function( err, user ) {
		        if( err ){ 
		        	eventUtils.raiseError({
		        		toClient: 'Something went wrong, pleasy try again later',
		        		toServer: 'Error updating profile 1',
		        		res: res,
		        		err: err
		        	});
		        	return;
		         }
		            console.log('Emtting event update profile success')

		            var expose = { user: user };

		            eventUtils.sendSuccess( res, expose, true );
		    }
		
			User.findByIdAndUpdate( userId, update, {}, callback );

	};

	var updatePicture = function( req, res ){

		var data = req.body;

	   	var userId 		  = data._id,
	        newimg_id   	  = data.img_id,
	    	newimg_version = data.img_version,
	    	img_place      = data.img_place;

	    User.findById( userId, function( err, myUser ){

	    	if( err )
	    		return eventUtils.raiseError({
	    			err: err,
	    			res: res,
	    			toClient: "Une erreur s'est produite.",
	    			toServer: "Error uploading picture|| couldn't find user"
	    		});

	    	var i = _.findIndex( myUser.pictures, function( el ){
	    		return el.img_place == img_place;
	    	});

	    	var newPicture = myUser.pictures[i];

	    	if( newPicture == undefined )
	    		return eventUtils.raiseError({
	    			err: err,
	    			res: res,
	    			toClient: "Une erreur s'est produite",
	    			toServer: "Error uploading picture || pictures[i] undefined"
	    		});

    		newPicture.img_id = newimg_id;
    		newPicture.img_version = newimg_version;

	    	myUser.pictures.set( i, newPicture );
	    	myUser.save(function( err, savedUser ){

	    		if( err )
	    			return eventUtils.raiseError({
			    			err: err,
			    			res: res,
			    			toClient: "Une erreur s'est produite.",
			    			toServer: "Error uploading picture|| couldn't save user"
			    		});

	    		eventUtils.sendSuccess( res, { user: savedUser, msg: "Votre photo a été uploadée" });

	    	});
	    });
	};

	var updatePictureWithFacebook = function( req, res ){

		var userId = req.body.userId,
			fbId   = req.body.fbId;
			url    = 'https://graph.facebook.com/' + fbId + '/picture?width=180&height=180';

		console.log(url);

		cloudinary.uploader.upload( url, function( response ){

			User.findById( userId, function( err, user ){

				if( err )
					return eventUtils.raiseError({
						res:res,
						err:err,
						toClient:"Impossible de charger votre photo Facebook"
					});

				var main_picture = user.pictures[0];
					main_picture.img_id = response.public_id;
					main_picture.img_version = response.version + '';

				user.pictures.set( 0, main_picture );
				user.status = "idle";

				user.save( function( err ){

					if( err )
						return eventUtils.raiseError({
							res:      res,
							err:      err,
							toClient: "Impossible de sauvegarder votre photo Facebook"
						});

					res.json({ 
						msg:         "Votre photo de profile a été chargée à partir de Facebook",
						img_id:      response.public_id,
						img_version: response.version
					});

				});
							
			});
		});

	};

	var updatePictures = function( req, res ){

		console.log('updating all pictures');
		var data = req.body;

		var updatedPictures = data.updatedPictures,
			userId			= data.userId;

		User.findById( userId, function( err, myUser ){

			if( err )
				return eventUtils.raiseError({
					res: res,
					err: err,
					toClient: "Une erreur serveur s'est produite",
					toServer: "Impossible de trouver l'user"
				});

			var mainified_picture = _.find( updatedPictures, function(el){ return el.action == "mainify"});
			if( mainified_picture && myUser.pictures[ mainified_picture.img_place ].img_id == settings.placeholder.img_id )
				return eventUtils.raiseError({
					res: res,
					err: err,
					toClient: "Ta photo de profile doit te représenter",
					toServer: "Tentative de mettre une photo qui n'est pas lui même"
				});

			for( var i = 0; i < updatedPictures.length; i++ ){

				var current_picture = _.find( myUser.pictures, function(el){ return el.img_place == updatedPictures[i].img_place });
				
				if( updatedPictures[i].action == "mainify" )
				{
					var currentMain = _.find( myUser.pictures, function(el){ return el.is_main == true });
						currentMain.is_main = false;

					myUser.pictures.set( parseInt( currentMain.img_place ), currentMain );
					current_picture.is_main = true;
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );

				}
				if( updatedPictures[i].action == "delete" )
				{
					current_picture.img_id = "placeholder_spjmx7";
					current_picture.img_version = "1407342805";
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );
				}
				if( updatedPictures[i].action == "hashtag" )
				{
					current_picture.hashtag = updatedPictures[i].new_hashtag;
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );
				}

			}

			myUser.save( function( err, savedUser ){

				if( err )
				return eventUtils.raiseError({
					res: res,
					err: err,
					toClient: "Une erreur serveur s'est produite",
					toServer: "Impossible de sauvegarder l'user"
				});

				console.log('sending success');
				eventUtils.sendSuccess( res, { msg: "Mise à jour effectuée!", pictures: savedUser.pictures });

			});
		});
	};


	var updateSettings = function( req, res ){

		var newEmail 	 = req.body.currentEmail.trim(),
			newPw  	     = req.body.newPw.trim(),
			newPwConf    = req.body.newPwConf.trim(),
			newsletter   = req.body.newsletter,
			userId       = req.body.userId;

		//var socket = global.sockets[userId];

		User.findById( userId, function(err, user){

			if( err ){ 
			return	eventUtils.raiseError({
						err: err,
						res: res,
						toClient: "Erreur de chargement",
						toServer: "Erreur lors de UpdateSettings" 
					}); 
			}

			/* Production only 

			if( ! validator.isEmail(newEmail) ){
				return eventUtils.raiseError({
						socket: socket,
						toClient: "Invalid email. Double check and try again",
						toServer: "Error updating profile, invalid email (regex)" 
					}); 
			}
			

			if( newPw.length < 6 && newPw.length != 0){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Email is too short ( < 6 )",
					toServer: "Error updating profile, invalid email (too short)" 
				}); 
				
			}

			if( newPw.length > 30 && newPw.length != 0){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Email is too long ( > 30 )",
					toServer: "Error updating profile, invalid email (too short)" 
				}); 
				
			}

			if( /[-!$%^&*()@_#+|~=`{}\[\]:";'<>?,.\/]/.test( newPw.trim() ) ){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Password contains invalid char!",
					toServer: "Error updating profile, invalid char" 
				});
			}

			if( newPw != newPwConf ){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Passwords didn't match",
					toServer: "Passwords didn't match" 
				}); 
			}
			*/

			/* No error was raised */
			if ( user.email != newEmail){
				user.email = newEmail;
			}

			var hashed = user.generateHash( newPw );

			if ( ! user.validPassword( hashed ) && newPw.length != 0 ){
				user.password = hashed;
			}

			user.newsletter = newsletter;

			user.save( function( err, user ){

				if( err ){
					return eventUtils.raiseError({
							res: res,
							toClient: "Something happened, please try again later",
							toServer: "Error saving settings",
							err: err
						});
				}

				var expose = { user: user, msg: "Vos préférénces ont été modifées" };

				eventUtils.sendSuccess( res, expose );

			});
		});
	};


	module.exports = {

	    updateProfile   : updateProfile,
	    updatePicture   : updatePicture,
	    updatePictures  : updatePictures,
	    updatePictureWithFacebook: updatePictureWithFacebook,
	    updateSettings  : updateSettings
	    
	};