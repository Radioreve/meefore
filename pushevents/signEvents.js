
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

		var handleSignup = function( req, res, next ){
			passport.authenticate('local-signup', function( err, user, info ){
				if( err ){
					console.log('error with the database query');	
				}
				if( !user ){
					console.log('info : '+info.msg );	
	  				res.json( 401, { msg: info.msg });
					res.end();
				}
				else{
					console.log('info : '+info.msg);
	  				res.json( 200, {msg: info.msg });
					res.end();
				}
			})( req, res, next );
		};

		var handleLogin = function( req, res, next ){
			passport.authenticate('local-login', function( err, user, info ){

				/* Gestion des erreurs */
				if( err ) 
					return eventUtils.raiseError({
	  					toClient:"Une erreur s'est produite",
	  					toServer:"Error login in...",
	  					err:err,
	  					res:res
	  				});	

				if( !user )
	  				return eventUtils.raiseError({
	  					toClient:"Identifiants incorrects",
	  					toServer:"Error login in...",
	  					err:err,
	  					res:res
	  				});

	  			console.log(user.access);
	  			/* Création du token */				
				var accessToken = eventUtils.generateAppToken( user ); 

				/* Envoie de la réponse */
				var expose = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName');
				
				eventUtils.sendSuccess( res, expose );

				/* Mise à jour du Watcher */
				var d = moment();
				watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });


			})( req, res, next );
		};

		var handleReset = function( req, res ){
			var email = req.body.email;

			if( email.trim() === '' || !validator.isEmail( email.trim() )){

				res.json( 500, { msg: "Il faut un email..." });
				res.end();
				return;
			}

			User.findOne({'email': email}, function( err, user ){

				if( !user ){

					   res.json( 500, { msg: "Aucun email ne correspond" });
				       res.end();
				       return;
				}

				var resetToken = randtoken.generate(8);

				user.password = user.generateHash( resetToken );

				user.save( function( err, user ){

					if( err ){
						res.json( 500, { msg: "An error occured. Contact us directly" });
						res.end();
						return;
					}

					// Send ResetPasswordEmail
					mailer.sendResetPasswordEmail( email, resetToken );

					res.json( 200, { msg: "Ton nouveau mot de passe t'a été envoyé par email" });
					res.end();
					return;

				});

			});		
			
		};

	var handleFacebookAuth = function( req, res ){

		var fbId = req.body.facebookProfile.id,
			email = req.body.facebookProfile.email,
			gender = req.body.facebookProfile.gender,
			name = req.body.facebookProfile.first_name;

		console.log('Authenticating with Facebook with id : ' + fbId );

		User.findOne({ 'facebookId': fbId }, function( err, user ){

			if( err )
				return console.log('Error with Facebook : ' + err );

			if( user ){
				var accessToken = eventUtils.generateAppToken( user ); 

				/* Envoie de la réponse */
				var expose = { id: user._id, accessToken: accessToken },
					channel = _.result( _.find( user.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName');
				
				eventUtils.sendSuccess( res, expose );

				/* Mise à jour du Watcher */
				var d = moment();
				watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });
				return;
			}

			var newUser = new User();

			newUser.facebookId = fbId;
			newUser.email = email;
			newUser.password = newUser.generateHash('M3efore'); // les gens qui s'authentifient via fb n'ont pas besoin de password
			newUser.gender = gender;
			newUser.name = name;;
			newUser.signupDate = moment.utc();

			// public one based on global key
			// personnal one based on randtoken 
		    var token = randtoken.generate(30);
			var accessName = 'mychan',
				channelName = eventUtils.makeChannel({ accessName: accessName, token: token }) 

			newUser.myChannels.push( {accessName:accessName, channelName:channelName} );

			var accessName = 'defchan',
				channelName = eventUtils.makeChannel({ accessName: accessName }) 

			newUser.myChannels.push( {accessName:accessName, channelName:channelName} );
			
			
			newUser.save( function( err, user ){

				if( err ) return console.log('User was NOT saved : ' + err );

					var accessToken = eventUtils.generateAppToken( user ); 
					/* Envoie de la réponse */
					var expose = { id: user._id, accessToken: accessToken },
						channel = _.result( _.find( user.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName');
					
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
		handleFacebookAuth: handleFacebookAuth,
		handleSignup: handleSignup,
		handleLogin: handleLogin,
		handleReset: handleReset

	}
