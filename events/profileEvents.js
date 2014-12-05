
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
				name     	  : data.name,
				age			  : data.age,
				description   : data.description,
				favoriteDrink : data.favoriteDrink,
				mood          : data.mood,
				status	 	  : data.status
			};

			var callback = function(err, user) {
		        if (err) { 
		        	eventUtils.raiseError({
		        		toClient: 'Something went wrong, pleasy try again later',
		        		toServer: 'Error updating profile 1',
		        		err: err
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
		        		toServer: 'Error updating profile 2' 
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

	var fetchFriends = function( userId ){

		console.log('Fetching friends...');
		var userSocket = global.sockets[userId];

		User.find({ 'friendList.friendId' : userId,
				    'friendList.status' : { $in: ['askedMe', 'mutual'] } }
				    , function( err, friendList ){

			if( err ){
				return eventUtils.raiseError({
					err: err,
					toServer: 'LJ-53',
					toClient: 'Error raising friends',
					socket: userSocket
				});
			}

		userSocket.emit('fetch friends success', friendList );

		});

	};

	var friendRequestIn = function( data ){

		console.log('Friend request ... ');

		var userId   = data.userId,
			friendId = data.friendId;

		var userSocket   = global.sockets[ userId ],
			friendSocket = global.sockets[ friendId ];

		if( userId === friendId )
		{
			return eventUtils.raiseError({
				toServer:"Cant add himself as friend",
				toClient:"Can't be friend with yourself",
				socket: userSocket
			});
		}

		User.findById( userId, function( err, myUser ){

			if( err )
			{
				return eventUtils.raiseError({
					err: err,
					toServer: 'Problem requestin friend in',
					toClient: 'Please try later',
					socket: userSocket
				});
			}

			myUser.friendList.push({
				friendId: friendId,
				status  : 'askedHim'
			});

			myUser.save( function( err ){

					if( err ) return console.log('Error LJ-50' );

					userSocket.emit('friend request in success', { friendId: friendId, userId: userId });
					
				});
		});

		User.findById( friendId, function( err, myFriend ){

			myFriend.friendList.push({
				friendId : userId,
				status   : 'askedMe'
			});

			myFriend.save( function( err ){

				if( err ) return console.log('Error LJ-51' );

				if(  friendSocket != undefined )
					friendSocket.emit('friend request in success', { friendId: friendId, userId: userId });
			});

		});

	};

	module.exports = {
		fetchUser       : fetchUser,
		fetchFriends    : fetchFriends,
	    updateProfile   : updateProfile,
	    updatePicture   : updatePicture,
	    updateSettings  : updateSettings,
	    friendRequestIn : friendRequestIn
	};