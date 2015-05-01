
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    cloudinary = require('cloudinary'),
	    config = require('../config/config'),
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
				favoriteDrink : data.favoriteDrink,
				mood          : data.mood,
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
		
			User.findByIdAndUpdate( userId, update, {}, callback);

	};

	var updatePicture = function( req, res ){

			var data = req.body;

		   	var userId 		  = data._id,
		        newImgId   	  = data.imgId,
		    	newImgVersion = data.imgVersion;

		    var update = {
		        imgId      : newImgId,
		        imgVersion : newImgVersion
		    };

		    var callback1 = function( err, user ){

		    	if( err ){
		    		eventUtils.raiseError({
		    			res: res,
		    			err: err,
		    			toClient: 'Something went wrong, pleasy try again later',
		        		toServer: 'Error updating profile 2' 
		    		});
		    		return;
		    	}

		    	var expose = { user: user };

		    	console.log('User new imgId is : ' + user.imgId );
		    	eventUtils.sendSuccess( res, expose );

		    	//socket.emit('update image success', user);

		    	/* Host picture also needs to be changed in the event layer */
		    	if( user.status == 'hosting' ){

		    		var hostedEventId = user.hostedEventId,
		    			update = {
		    				hostImgId      : newImgId,
		    				hostImgVersion : newImgVersion
		    			};

		    		var callback2 = function(err, e){
		    			if( err ){ console.log( err ); }
		    		}

		    		Event.findByIdAndUpdate( hostedEventId, update, {}, callback2);
		    	}
		    };

		    User.findByIdAndUpdate( userId, update, {}, callback1 );

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

				user.imgId      = response.public_id;
				user.imgVersion = response.version;
				user.save( function( err ){

					if( err )
						return eventUtils.raiseError({
							res:res,
							err:err,
							toClient:"Impossible de sauvegarder votre photo Facebook"
						});

					res.json({ 
						msg:       "Votre photo de profile a été chargée à partir de Facebook",
						imgId:      user.imgId,
						imgVersion: user.imgVersionn
					});

				});
							
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
	    updatePictureWithFacebook: updatePictureWithFacebook,
	    updateSettings  : updateSettings
	    
	};