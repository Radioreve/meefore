
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
			res.sendfile( process.cwd() +'/views/index.html');
		};

		var sendEarlyAdoptersPage = function( req, res ){
			res.sendfile( process.cwd() + '/views/earlyadopters.html' );
		}

		var redirectToHome = function( req, res ){
			res.redirect('/home');
		};

	
	var handleFacebookAuth = function( req, res ){

		var facebook_id  	 = req.body.facebookProfile.id,
				access_token = req.body.facebookProfile.access_token,
				    email  	 = req.body.facebookProfile.email,
				     gender  = req.body.facebookProfile.gender,
				   	  fbURL  = req.body.facebookProfile.link,
				     	name = req.body.facebookProfile.first_name;

		console.log('Authenticating with Facebook with id : ' + facebook_id );

		User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

			if( err )
				return eventUtils.raiseError({
					res:res,
					err:err,
					toClient:"Une erreur est survenue"
				});

			/* L'utilisateur existe, on le connecte à l'application */
			if( user ){
				console.log('User found, login in...');
				var accessToken = eventUtils.generateAppToken( user ); 

				facebook_access_token = user.facebook_access_token;
				facebook_access_token.short_lived = access_token; 

				User.findByIdAndUpdate( user._id, { facebook_access_token: facebook_access_token }, { new: true }, function( err, user ){

					var expose  = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label');
					
					eventUtils.sendSuccess( res, expose );

					var d = moment();
					watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });

				});

				return;
			}

			console.log('User not found, creating account...');
			/* L'utilisateur n'existe pas, on crée son compte et on le connecte à l'application */
			var newUser = new User();

			newUser.facebook_id = facebook_id;
			newUser.facebook_access_token.short_lived = access_token;
			newUser.facebook_email = email;
			newUser.mailchimp_email = email;
			newUser.gender = gender;
			newUser.name = name;
			newUser.age = 18 // default value
			newUser.facebook_url = fbURL;
			newUser.signup_date = moment.utc();

			/* Pusher informations for real time channels */
		    var token = randtoken.generate(30);
			newUser.channels.push({ access_name: 'mychan', channel_label: token });
			newUser.channels.push({ access_name: 'defchan', channel_label: 'default' });

			newUser.save( function( err, user ){

				if( err ) return console.log('User was NOT saved : ' + err );

				var accessToken = eventUtils.generateAppToken( user ); 
				/* Envoie de la réponse */
				var expose = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label');
				
				eventUtils.sendSuccess( res, expose );


			});
		});
	};


	module.exports = {

		sendHomepage: sendHomepage,
		sendEarlyAdoptersPage: sendEarlyAdoptersPage,
		redirectToHome: redirectToHome,
		handleFacebookAuth: handleFacebookAuth

	}
