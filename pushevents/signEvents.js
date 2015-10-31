
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./../config/config'),
		User = require('./../models/UserModel'),
		randtoken = require('rand-token'),
		validator = require('validator'),
		eventUtils = require('./eventUtils'),
		moment = require('moment'),
		_ = require('lodash');

		var pusher  = require('../services/pusher'),
			mailer = require('../services/mailer');

		var sendHomepage = function( req, res ){
			res.sendfile( config.homepage[ process.env.NODE_ENV ] );
		};

		var sendEarlyAdoptersPage = function( req, res ){
			res.sendfile( process.cwd() + '/views/earlyadopters.html' );
		}

		var redirectToHome = function( req, res ){
			res.redirect('/home');
		};

	
	var handleFacebookAuth = function( req, res ){

		var fb = req.sent.facebookProfile;

		if( !fb )
			return eventUtils.raiseError({
				toClient: "Missing informations from Facebook", res: res
			});

		// L'utilisateur existe, on le connecte à l'application 
		if( req.sent.user)
		{	
			var user = req.sent.user;
			console.log('User has been found, login in...');

			/* Mise à jour de l'access token */
			facebook_access_token = user.facebook_access_token;
			facebook_access_token.short_lived = fb.access_token; 

			User.findByIdAndUpdate( user._id, { facebook_access_token: facebook_access_token }, { new: true }, function( err, user ){

				var accessToken = eventUtils.generateAppToken( "user", user ); 
				var expose  = { id: user._id, accessToken: accessToken };
				
				eventUtils.sendSuccess( res, expose );

			});

			return;
		}

		// L'utilisateur n'existe pas, on crée son compte 
		console.log('User not found, creating account...');

		var new_user = new User();

		new_user.facebook_id                       = fb.id;
		new_user.facebook_access_token.short_lived = fb.access_token;
		new_user.facebook_email                    = fb.email;
		new_user.contact_email 					   = fb.email;
		new_user.mailchimp_email                   = fb.email;
		new_user.mailchimp_id                      = req.sent.mailchimp_id;
		new_user.gender                            = fb.gender;
		new_user.name                              = fb.name;
		new_user.age                               = 24 // default value, fucking facebook  /me?fields=age_range is too broad!
		new_user.facebook_url                      = fb.link;
		new_user.country_code					   = fb.locale.split('-')[1].toLowerCase(); // country code extraction
		new_user.signup_date                       = new moment();
		new_user.access 						   = ['standard'];

		// Specific conditions //
		// None for now

		// Pusher informations for real time channels 
		new_user.channels = {
			public_chan : 'app',
			me 			: 'private-' + fb.id
		};

		new_user.save(function( err, user ){

			if( err ){
				return eventUtils.raiseError({
					toClient : "Error trying to create account",
					err      : err,
					res      : res
				});
			}

			console.log('Sending email notification to admins');
			mailer.sendSimpleAdminEmail( user.name + ' (' + user.contact_email + ') vient de s\'inscrire sur meefore',
				  JSON.stringify( user, null, 4 ))

			console.log('Account created successfully');
			var accessToken = eventUtils.generateAppToken( "user", user ); 
			var expose = { id: user._id, accessToken: accessToken };
			
			eventUtils.sendSuccess( res, expose );

		});
	};

	var sendContactEmail = function( req, res ){

		var name    = req.sent.name;
		var email   = req.sent.email;
		var message = req.sent.message;

		if( !name || !email || !message ){
			return eventUtils.raiseError({
				res: res,
				toServer: "Missing parameter from contact form submission"
			});
		}

		mailer.sendContactEmail( name, email, message, function( err ){
			if( err ){
				return eventUtils.raiseError({
					res: res,
					toServer: "Couldnt send email : " + err
				});
			} else {
				eventUtils.sendSuccess( res, {} );
			}
		});


	};

	module.exports = {
		sendContactEmail      : sendContactEmail,
		sendHomepage          : sendHomepage,
		sendEarlyAdoptersPage : sendEarlyAdoptersPage,
		redirectToHome        : redirectToHome,
		handleFacebookAuth    : handleFacebookAuth
	};
