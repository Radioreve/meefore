
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    async = require('async');

	var pusher = require('../globals/pusher');

	var fetchAppData = function( req, res ){	

		console.log('Fetching app data...');

		async.parallel([ fetchLastRegisteredUsers, fetchBots ], function( err, result ){
			eventUtils.sendSuccess( res, { lastRegisteredUsers: result[0], bots: result[1] });
		});

	};

	function fetchLastRegisteredUsers(callback){
		User.find().limit(10).sort('-signupDate').exec(function(err,lastRegisteredUsers){
			 if(err)
			 	return callback(err);
			 callback(null,lastRegisteredUsers);
			
		});
	}

	function fetchBots(callback){
		User.find({access:'bot'},function(err,bots){
			if(err)
			 	return callback(err);
			 callback(null,bots);
		});
	}

	 module.exports = {
	 	fetchAppData: fetchAppData
	 }