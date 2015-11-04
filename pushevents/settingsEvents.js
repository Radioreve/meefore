
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

		var updateSettingsContact = function( req, res ){

			var contact_email = req.sent.contact_email;
			var facebook_id   = req.sent.facebook_id;

			var update = {
				contact_email: contact_email
			};

			if( req.sent.mailchimp_id ){
				update.mailchimp_id = req.sent.mailchimp_id
			}

			console.log('Updating contact email (' + contact_email + ') for facebook_id: ' + facebook_id );
			User.findOneAndUpdate({ facebook_id: facebook_id }, update, { new: true } , function( err, user ){

				if( err ) return eventUtils.raiseError({ err: err, res: res, toClient: "Une erreur est survenue!" });
	    		
	    		var expose = { user: user };
	    		eventUtils.sendSuccess( res, expose );

			});

		};


	    module.exports = {
			updateSettings        : updateSettings,
			updateSettingsContact : updateSettingsContact
	    };