
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');

	var pusher = require('../globals/pusher');

	var fetchAppData = function( req, res ){	

		var userId = req.userId;

		User.findById( userId, {}, function( err, user ){

			if( err )
				return eventUtils.raiseError({
					err: err,
					toClient:'Error finding admin',
					toServer:'Error finding admin',
					res: res
				});

			var expose = {};
			User.find().limit(5).sort('-signupDate').exec(function(err,arr){
				expose.lastRegisteredUsers = arr;
				eventUtils.sendSuccess( res, expose );
			});

		});

	};

	 module.exports = {
	 	fetchAppData: fetchAppData
	 }