
	var express    = require('express');
	var jwt        = require('jsonwebtoken');
	var config     = require('./../config/config');
	var settings   = require('./../config/settings');
	var User       = require('./../models/UserModel');
	var randtoken  = require('rand-token');
	var validator  = require('validator');
	var eventUtils = require('./eventUtils');
	var moment     = require('moment');
	var _          = require('lodash');
	var facebook   = require('./../middlewares/facebook');
	var term 	   = require('terminal-kit').terminal;

	var pusher  = require('../services/pusher');
	var mailer  = require('../services/mailer');


	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var sendHomepage = function( req, res ){
		res.sendFile( config.homepage[ process.env.NODE_ENV ] );
	};

	var sendEarlyAdoptersPage = function( req, res ){
		res.sendFile( process.cwd() + '/views/earlyadopters.html' );
	}

	var redirectToHome = function( req, res ){
		res.redirect('/home');
	};

	
	var handleFacebookAuth = function( req, res, next ){

		// The only thing useful for users tryna login in
		var user = req.sent.user;

		// The only thing useful for users tryna signing up
		var facebook_id           = req.sent.facebook_id;
		var facebook_access_token = req.sent.facebook_access_token;


		// User exists, generate an app token and thats it ! His profile has already
		// been fetched, and token already being updated
		if( user ){

			req.sent.expose.user = user;
			req.sent.expose.facebook_id = facebook_id;
			req.sent.expose.app_token = eventUtils.generateAppToken( "user", user );

			next();

		} else {

			var err_ns = "signing_up";

			term.bold.green('User not found, creating account...');
			facebook.fetchFacebookProfile( facebook_id, facebook_access_token.token, function( err, fb ){

				if( err ) return handleErr( req, res, err_ns, err );

				var new_user = new User();

				// User-id on which most api calls are based
				new_user.facebook_id = facebook_id;

				// Facebook access token that has just been processed by previous middlewares
				new_user.facebook_access_token = facebook_access_token;

				// Store the contact email used by mailchimp and clientside.
				new_user.contact_email = fb.email || 'n/a';

				// Store the url of his facebook profile (for a quick access by admins)
				new_user.facebook_url = fb.link;

				// Default status is "new", to be overrided by "idle" as soon as one api calls is made
				new_user.status = 'new';

				// Default access is standard for everyone, plus specific rules
				new_user.access = ['standard'];	

				// Could be access via the _id from mongodb but who cares, let's explicit it
				new_user.signup_date = new Date();
				
				// User name @facebookProfile
				new_user.name = fb.name;

				// Default user age, fucking fb doesnt let us access it except <18, between 18-21 or >21 ... "lol"
				new_user.age = 18;

				// "If gender unset, equals null" during graph api call, so make it "male" by default and wait for client to contact :)
				new_user.gender = fb.gender || "male";

				// Job is not asked clientside, so put some placeholder until he changes it
				new_user.job = '';

				// Country code extracted from the facebook_profile, and defaulted to "fr" if fail
				new_user.country_code = 'fr'; 
				if( fb.locale && fb.locale.split('_')[1] ){
					new_user.country_code = fb.locale.split('_')[1].toLowerCase();
				}

				// Let client set his ideal_night on update
				new_user.ideal_night = null;

				// Put the placeholders. His facebook profile picture is automatically fetched clientside on first conn anyway
				new_user.pictures = _.cloneDeep( settings.default_pictures );

				// This will be set clientside as a standalone signup step
				new_user.location = { place_name: null, place_id: null };

				// Default invite code, can be changed by client. Use facebook_id to ensure uniqueness
				new_user.invite_code = fb.id; 

				// Default preferences using whats in settings
				new_user.app_preferences = settings.default_app_preferences;


				// Special conditions for admins
				if( config.admins_facebook_id.indexOf( fb.id ) != -1 ){
					new_user.access.push('admin');
				}

				// Special conditions for bots
				if( req.sent.bot ){
					new_user.access.push('bot');
					new_user = _.merge( new_user, req.sent.bot );
					console.log('New #bot about to join the force...')
				}

				new_user.save(function( err, user ){

					if( err ){
						return handleErr( req, res, 'server_error', err );
					}

					if( !req.sent.bot ){
						console.log('Sending email notification to admins');
						mailer.sendSimpleAdminEmail( user.name + ' (' + user.contact_email + ')(' + user.gender[0] + ') vient de s\'inscrire sur meefore',
							  user.facebook_url )
					}

					console.log('Account created successfully');

					req.sent.user = user;

					req.sent.expose.user        = user;
					req.sent.expose.facebook_id = facebook_id;				
					req.sent.expose.app_token   = eventUtils.generateAppToken( "user", user ); ;

					next();

				});
			});
		}

	};



	module.exports = {
		sendHomepage          	  : sendHomepage,
		sendEarlyAdoptersPage 	  : sendEarlyAdoptersPage,
		redirectToHome        	  : redirectToHome,
		handleFacebookAuth    	  : handleFacebookAuth
	};
