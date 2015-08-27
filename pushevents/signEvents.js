
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./../config/config'),
		User = require('./../models/UserModel'),
		randtoken = require('rand-token'),
		validator = require('validator'),
		eventUtils = require('./eventUtils'),
		moment = require('moment'),
		_ = require('lodash');

		var pusher  = require('../globals/pusher'),
			mailer = require('../globals/mailer'),
			watcher = require('../globals/watcher');

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

		var fb = req.body.facebookProfile;

		if( !fb )
			return eventUtils.raiseError({
				toClient: "Missing informations from Facebook", res: res
			});

		/* L'utilisateur existe, on le connecte à l'application */
		if( req.body.user)
		{	
			var user = req.body.user;
			console.log('User has been found, login in...');

			/* Mise à jour de l'access token */
			facebook_access_token = user.facebook_access_token;
			facebook_access_token.short_lived = fb.access_token; 

			User.findByIdAndUpdate( user._id, { facebook_access_token: facebook_access_token }, { new: true }, function( err, user ){

				var accessToken = eventUtils.generateAppToken( user ); 
				var expose  = { id: user._id, accessToken: accessToken };
				
				eventUtils.sendSuccess( res, expose );

			});

			return;
		}

		/* L'utilisateur n'existe pas, on crée son compte */
		console.log('User not found, creating account...');

			var new_user = new User();

			new_user.facebook_id = fb.id;
			new_user.facebook_access_token.short_lived = fb.access_token;
			new_user.facebook_email = fb.email;
			new_user.mailchimp_email = fb.email;
			new_user.mailchimp_id = req.body.mailchimp_id;
			new_user.gender = fb.gender;
			new_user.name = fb.name;
			new_user.age = 18 // default value
			new_user.facebook_url = fb.link;
			new_user.signup_date = new moment();

			/* Pusher informations for real time channels */
			new_user.channels = {
				public_chan : 'app',
				me 			: fb.id
			};

			new_user.save( function( err, user ){

				if( err )
					return eventUtils.raiseError({
						err: err,
						toClient: "Error trying to create account",
						res: res
					});

				var accessToken = eventUtils.generateAppToken( user ); 
				var expose = { id: user._id, accessToken: accessToken };
				
				eventUtils.sendSuccess( res, expose );

			});
	};


	module.exports = {

		sendHomepage: sendHomepage,
		sendEarlyAdoptersPage: sendEarlyAdoptersPage,
		redirectToHome: redirectToHome,
		handleFacebookAuth: handleFacebookAuth

	}
