
	var   User = require('../models/UserModel')
	    , Event = require('../models/EventModel')
	    , eventUtils = require('./eventUtils')
	    , _ = require('lodash')
	    , pusher = require( process.cwd() + '/globals/pusher')
	    , watcher = require('../globals/watcher');
	
	var sendMessage = function( req, res ){

		var data = req.body;

	    var senderId = data.senderId,
	  	    receiverId  = data.receiverId,
	  	    msg = data.msg;

		  var expose = {
		  	senderId: senderId,
		  	receiverId: receiverId,
		  	msg: msg
		  }

		eventUtils.sendSuccess( res, expose );

		var user = watcher.accessUser( receiverId );
		if( user )
			pusher.trigger( watcher.accessUser( receiverId ).channel , 'send-message-success', expose );

	};
 
	var testAllChannels = function( req, res ){
 			
		var userId = req.body.userId;
		User.findById( userId, {}, function(err, user){

			if( err ){
				console.log('Error fetching user for load rooms');
			}else{
				for( var i=0; i<user.myChannels.length; i++){
					console.log('Emitting in channel : ' + user.myChannels[i].channelName );
					pusher.trigger( user.myChannels[i].channelName, 'test', { msg:"You are on channel : " + user.myChannels[i].channelName });
				}
			}
		});
	};

	var sayUserStartedTyping = function( req, res ){
		
		var senderId = req.body.senderId,
			receiverId = req.body.receiverId;

			eventUtils.sendSuccess( res, {} );

		var expose = { chatId: senderId };
		var user = watcher.accessUser( receiverId );

		if( user )
			pusher.trigger( user.channel, 'user-started-typing-success', expose );
	}

	var sayUserStoppedTyping = function( req, res ){

		var senderId = req.body.senderId,
			receiverId = req.body.receiverId;

			eventUtils.sendSuccess( res, {} );

		var expose = { chatId: senderId };
		var user = watcher.accessUser( receiverId );
		
		if( user )
			pusher.trigger( user.channel, 'user-stopped-typing-success', expose );

	}

	module.exports = {

		sendMessage: sendMessage,
		testAllChannels: testAllChannels,
		sayUserStartedTyping: sayUserStartedTyping,
		sayUserStoppedTyping: sayUserStoppedTyping

	};