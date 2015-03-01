
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	function authAdmin( user, socket ){

		if( ['root','admin'].indexOf( user.access ) == -1 )
				return eventUtils.raiseError({
					err: err,
					toClient:'This is an admin command',
					toServer:'Someone tried an admin command',
					socket: socketAdmin
				});

	}


	var fetchAppData = function( userId ){	

		var socketAdmin = global.sockets[ userId ];

		User.findById( userId, {}, function( err, user ){

			if( err )
				return eventUtils.raiseError({
					err: err,
					toClient:'Error finding admin',
					toServer:'Error finding admin',
					socket: socketAdmin
				});

			authAdmin( user, socketAdmin );

			/* Fetch last N subscribers */
			User.find().limit(5).sort('-signupDate').exec(function(err,arr){
				socketAdmin.emit('fetch last signup success', arr );
			});

			/* Fetching monitoring informations for real time */	
			socketAdmin.emit('fetch app data success', global.appData );


		});

	};

	 module.exports = {

	 	fetchAppData: fetchAppData

	 }