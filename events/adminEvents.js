
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

			/* Fetching monitoring informations for real time */	


		});

	};

	 module.exports = {

	 	fetchAppData: fetchAppData

	 }