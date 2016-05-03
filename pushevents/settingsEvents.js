
	var mongoose     = require('mongoose');
	var _            = require('lodash');
	var validator    = require('validator');
	var moment		 = require('moment');
	var querystring  = require('querystring');
	var request      = require('request');

	var User 	     = require('../models/UserModel');
	var config       = require('../config/config');
	var settings     = require('../config/settings');
	var Before 	     = require('../models/BeforeModel');
	var eventUtils   = require('./eventUtils');


	var settings_ns = 'update_settings';
	
	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

    var updateSettings = function( req, res, next ){

    	var app_preferences = req.sent.app_preferences,
    		facebook_id	    = req.sent.facebook_id;

    	if( _.keys( app_preferences ).length == 0 ){
    		return handleErr( req, res, 'update_settings (empty put)', {
    			err_id: 'empty_app_preferences'
    		});
    	}

    	User.findOneAndUpdate(
    		{ facebook_id: facebook_id },
    		{ app_preferences: app_preferences },
    		{ new: true },
    		function( err, user ){

    		if( err ){
    			return handleErr( req, res, settings_ns, {
    				err_id: 'saving_to_db'
    			});
    		}
    		
    		req.sent.expose.user = user;
    		next();

    	});
	};

	var updateSettingsContact = function( req, res, next ){

		var contact_email = req.sent.contact_email;
		var facebook_id   = req.sent.facebook_id;

		var update = {
			contact_email: contact_email
		};

		if( req.sent.mailchimp_id ){
			console.log('Updating also mailchimp_id, new is: ' + req.sent.mailchimp_id );
			update.mailchimp_id = req.sent.mailchimp_id
		}

		console.log('Updating contact email (' + contact_email + ') for facebook_id: ' + facebook_id );

		User.findOneAndUpdate(
			{ facebook_id: facebook_id },
			update,
			{ new: true },
			function( err, user ){

			if( err ){
    			return handleErr( req, res, settings_ns, {
    				err_id: 'saving_to_db'
    			});
    		}
    		
    		req.sent.expose.user = user;
    		next();

		});
	};

	var deleteProfile = function( req, res, next ){

		var facebook_id = req.sent.facebook_id;

		console.log('Deleting profile ' + facebook_id + ' and everything associated with it..');
		console.log('Good bye ' + req.sent.user.name + '..');

		User.update({ 'friends': facebook_id }, { $pull: { 'friends': facebook_id } }, { multi: true },
			function( err, users ){

			if( err ){
    			return handleErr( req, res, settings_ns, {
    				err_id: 'saving_to_db'
    			});
    		}

			User.findOneAndRemove({ facebook_id: facebook_id }, function( err, user ){
				
				if( err ){
	    			return handleErr( req, res, settings_ns, {
	    				err_id: 'saving_to_db'
	    			});
	    		}

				next();


			});

		});

	};

    module.exports = {
		updateSettings        : updateSettings,
		updateSettingsContact : updateSettingsContact,
		deleteProfile 		  : deleteProfile
    };