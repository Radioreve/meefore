
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


	    var updateSettingsUx = function( req, res ){

	    	var app_preferences = req.body.app_preferences,
	    		userId	     	= req.body.userId;

	    	User.findByIdAndUpdate( userId, { app_preferences: app_preferences }, { new: true }, function( err, user ){
	    		if( err )
	    			return eventUtils.raiseError({ err: err, res: res, toClient: "Une erreur est survenue!" });
	    		var expose = { user: user };
	    		eventUtils.sendSuccess( res, expose );
	    	});

		};

		var updateSettingsMailinglists = function( req, res ){

			var app_preferences = req.body.app_preferences,
	    		userId	     	= req.body.userId;

	    	User.findOneAndUpdate( req.body.query, { app_preferences: app_preferences }, { new: true }, function( err, user ){
	    		if( err )
	    			return eventUtils.raiseError({ err: err, res: res, toClient: "Une erreur est survenue!" });
	    		var expose = { user: user };
	    		eventUtils.sendSuccess( res, expose );
	    	});

		};

	    module.exports = {
	    	updateSettingsUx: updateSettingsUx,
	    	updateSettingsMailinglists: updateSettingsMailinglists
	    };