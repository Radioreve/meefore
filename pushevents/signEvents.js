
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./../config/config'),
		User = require('./../models/UserModel'),
		randtoken = require('rand-token'),
		validator = require('validator'),
		eventUtils = require('./eventUtils'),
		moment = require('moment'),
		_ = require('lodash');

	var passport = global.passport,
		pusher  = require('../globals/pusher'),
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

		var fbId   = req.body.facebookProfile.id,
			email  = req.body.facebookProfile.email,
			gender = req.body.facebookProfile.gender,
			fbURL  = req.body.facebookProfile.link,
			name   = req.body.facebookProfile.first_name;

		console.log('Authenticating with Facebook with id : ' + fbId );

		User.findOne({ 'facebook_id': fbId }, function( err, user ){

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

				var expose = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label');
				
				eventUtils.sendSuccess( res, expose );

				var d = moment();
				watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });
				return;
			}

			console.log('User not found, creating account...');
			/* L'utilisateur n'existe pas, on crée son compte et on le connecte à l'application */
			var newUser = new User();

			newUser.facebook_id = fbId;
			newUser.email = email;
			newUser.gender = gender;
			newUser.name = name;
			newUser.age = 18 // default value
			newUser.facebook_url = fbURL;
			newUser.signup_date = moment.utc();

		    var token = randtoken.generate(30);
			var access_name = 'mychan',
				channel_label = eventUtils.makeChannel({ access_name: access_name, token: token }) 

			newUser.channels.push( {access_name:access_name, channel_label:channel_label} );

			var access_name = 'defchan',
				channel_label = eventUtils.makeChannel({ access_name: access_name }) 

			newUser.channels.push( {access_name:access_name, channel_label:channel_label} );
			
			newUser.save( function( err, user ){

				if( err ) return console.log('User was NOT saved : ' + err );

				var accessToken = eventUtils.generateAppToken( user ); 
				/* Envoie de la réponse */
				var expose = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label');
				
				eventUtils.sendSuccess( res, expose );

				/* Mise à jour du Watcher */
				var d = moment();
				watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });

				mailer.sendWelcomeEmail( email, name );
			});
		});
	};


	module.exports = {

		sendHomepage: sendHomepage,
		sendEarlyAdoptersPage: sendEarlyAdoptersPage,
		redirectToHome: redirectToHome,
		handleFacebookAuth: handleFacebookAuth

	}
