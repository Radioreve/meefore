
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    validator = require("validator");


	var updateProfile = function(data){

			var userId = data._id,
				socket = global.sockets[userId];

			if( ! validator.isInt( data.age ) ){
				return eventUtils.raiseError({
						toServer: "Wrong input format for age (must be age)",
						toClient: "Something is wrong with your age",
						socket: socket
					});	
			}

			var update = {
				name     	: data.name,
				description : data.description,
				age			: data.age,
				status		: data.status
			};

			var callback = function(err, user) {
		        if (err) { 
		        	eventUtils.raiseError({
		        		toClient: 'Something went wrong, pleasy try again later',
		        		toServer: 'Error updating profile'
		        	});
		        	return;
		         }
		            console.log('Emtting event update profile success')
		            socket.emit('update profile success', user);
		    }
		
			User.findByIdAndUpdate( userId, update, {}, callback);

	};

	var updatePicture = function(data){

		   	var userId 		  = data._id,
		        newImgId   	  = data.imgId,
		    	newImgVersion = data.imgVersion;

		    var socket = global.sockets[userId];

		    var update = {
		        imgId      : newImgId,
		        imgVersion : newImgVersion
		    };

		    var callback1 = function(err, user){

		    	if( err ){
		    		eventUtils.raiseError({
		    			err: err,
		    			toClient: 'Something went wrong, pleasy try again later',
		        		toServer: 'Error updating profile' 
		    		});
		    		return;
		    	}

		    	socket.emit('update image success', user);

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


	var updateSettings = function(data){

		var newEmail 	 = data.currentEmail.trim(),
			newPw  	     = data.newPw.trim(),
			newPwConf    = data.newPwConf.trim(),
			newsletter   = data.newsletter,
			userId       = data.userId;

		var socket = global.sockets[userId];

		User.findById( userId, function(err, user){

			if( err ){ 
			return	eventUtils.raiseError({
						err: err,
						socket: socket,
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
			*/

			if( newPw.length < 6 && newPw.length != 0){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Password must be at least 6 characters long",
					toServer: "Error updating profile, invalid email (too short)" 
				}); 
				
			}

			if( newPw != newPwConf ){
				return eventUtils.raiseError({
					socket: socket,
					toClient: "Passwords didn't match",
					toServer: "Passwords didn't match" 
				}); 
			}

			/* No error was raised */
			if ( user.local.email != newEmail){
				user.local.email = newEmail;
			}

			var hashed = user.generateHash( newPw );

			if ( ! user.validPassword( hashed ) && newPw.length != 0 ){
				user.local.password = hashed;
			}

			user.newsletter = newsletter;

			user.save( function(err, user){

				if (err){
					return eventUtils.raiseError({
							socket: socket,
							toClient: "Something happened, please try again later",
							toServer: "Error saving settings",
							err: err
						});
				}

				socket.emit('update settings success', { user: user, msg: "Updating settings success" });

			});
		});
	};

	var fetchUser = function( userId ){

		userSocket = global.sockets[userId];
		var informations = User.fetchUser( userId, userSocket );
	
	};

	module.exports = {
		fetchUser      : fetchUser,
	    updateProfile  : updateProfile,
	    updatePicture  : updatePicture,
	    updateSettings : updateSettings
	};