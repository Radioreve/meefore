
	var User 	     = require('../models/UserModel'),
		mongoose     = require('mongoose'),
	    Event 	     = require('../models/EventModel'),
	    eventUtils   = require('./eventUtils'),
	    _            = require('lodash'),
	    config       = require('../config/config'),
	    settings     = require('../config/settings'),
	    validator    = require('validator'),
	    moment		 = require('moment'),
	    querystring  = require('querystring'),
	    request      = require('request');


	    var updateSettings = function( req, res ){

	    	var app_preferences = req.sent.app_preferences,
	    		userId	     	= req.sent.userId;

	    	User.findByIdAndUpdate( userId, { app_preferences: app_preferences }, { new: true }, function( err, user ){

	    		if( err ) return eventUtils.raiseError({ err: err, res: res, toClient: "Une erreur est survenue!" });
	    		
	    		var expose = { user: user };
	    		eventUtils.sendSuccess( res, expose );
	    	});

		};


	    module.exports = {
			updateSettings: updateSettings
	    };