
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

	var pusher  = require('../services/pusher');
	var mailer  = require('../services/mailer');
	var realtime = require('../middlewares/realtime');


	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var sendHomepage = function( req, res ){
		res.sendfile( config.homepage[ process.env.NODE_ENV ] );
	};

	var sendEarlyAdoptersPage = function( req, res ){
		res.sendfile( process.cwd() + '/views/earlyadopters.html' );
	}

	var redirectToHome = function( req, res ){
		res.redirect('/home');
	};

	
	var handleFacebookAuth = function( req, res, next ){

		var fb = req.sent.facebook_profile;

		// L'utilisateur existe, on le connecte à l'application 
		if( req.sent.user ){

			console.log('User has been found, login in...');
			// console.log('Token pre-update : ' + JSON.stringify(req.sent.facebook_profile,null,2) );

			User.findOneAndUpdate(

				{ facebook_id: fb.id },
				{ 'facebook_access_token.short_lived': fb.access_token },
				{ new: true },
				function( err, user ){

				if( err ){
					return handleErr( req, res, 'server_error' );
				}
			
				var app_token = eventUtils.generateAppToken( "user", user );

				// console.log('Token post-update : ' + JSON.stringify(user.facebook_access_token,null,2) );

				req.sent.expose.user_id   = user._id;
				req.sent.expose.app_token = app_token;

				next();

			});

			return;
		}

		// L'utilisateur n'existe pas, on crée son compte 
		console.log('User not found, creating account...');

		var new_user = new User();

		// Pre conditions (test weird values)
		var country_code = 'fr'; // default value
		if( fb.locale && fb.locale.split('_')[1] ){
			country_code = fb.locale.split('_')[1].toLowerCase();
		}

		var email = fb.email;
		if( req.sent.no_email ){
			email = 'n/a';
		}

		// User-id on which most api calls are based
		new_user.facebook_id = fb.id;

		new_user.facebook_access_token.short_lived = fb.access_token;
		new_user.facebook_email                    = email;
		new_user.facebook_url                      = fb.link;
		new_user.contact_email 					   = email;
		new_user.mailchimp_id                      = req.sent.mailchimp_id;

		// Control attributes
		new_user.status 	 = 'new';
		new_user.access 	 = ['standard'];
		new_user.signup_date = new moment();
		
		// Public profile attributes
		new_user.name         = fb.name || settings.default_profile_values.name;
		new_user.age          = settings.default_profile_values.age; // default value, fucking facebook  /me?fields=age_range is too broad!
		new_user.gender       = fb.gender;
		new_user.job          = settings.default_profile_values.job;
		new_user.country_code = country_code; // country code extraction
		new_user.ideal_night  = null;
		new_user.pictures     = _.cloneDeep ( settings.default_pictures );
		new_user.location 	  = { place_name: null, place_id: null };


		// Private profile attributes
		new_user.invite_code 	 = fb.id;
		new_user.app_preferences = settings.default_app_preferences;

		// Post conditions //
		if( config.admins_facebook_id.indexOf( fb.id ) != -1 ){
			new_user.access.push('admin');
		}

		if( req.sent.bot ){
			new_user.access.push('bot');
			new_user = _.merge( new_user, req.sent.bot );
			console.log('New #bot about to join the force...')
		}

		// Setup personnal channel (Pusher)
		new_user.channels.push({
			type: 'personnal',
			name: realime.makePersonnalChannel( fb.id )
		});

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
			var app_token = eventUtils.generateAppToken( "user", user ); 

			req.sent.expose.id = user._id;
			req.sent.expose.app_token = app_token;

			next();

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
		sendContactEmail      	  : sendContactEmail,
		sendHomepage          	  : sendHomepage,
		sendEarlyAdoptersPage 	  : sendEarlyAdoptersPage,
		redirectToHome        	  : redirectToHome,
		handleFacebookAuth    	  : handleFacebookAuth
	};
