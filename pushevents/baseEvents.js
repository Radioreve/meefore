
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./../config/config'),
		User = require('./../models/UserModel'),
		randtoken = require('rand-token'),
		validator = require('validator'),
		eventUtils = require('./eventUtils'),
		_ = require('lodash');

	var passport = global.passport,
		pusher  = require('../globals/pusher'),
		mailer = require('../globals/mailer'),
		watcher = require('../globals/watcher');

		var sendHomepage = function( req, res ){
			res.sendfile( process.cwd() +'/views/index.html');
		};

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

				if( err ) return console.log('error with the database query');	

				if( !user )
				{
	  				return eventUtils.raiseError({
	  					toClient:"Identifiants incorrects",
	  					toServer:"Error login in...",
	  					err:err,
	  					res:res
	  				});
				}

				// Useless, legacy code?
				var token = jwt.sign( user, config.jwtSecret, { expiresInMinutes: 600 });

				var expose = { id: user._id, msg: info.msg, token: token },
					channel = _.result( _.find( user.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName');

				var d = new Date();
				watcher.addUser( user._id, { channel: channel, userId: user._id, onlineAt: d });

				//pusher.trigger( 'default', 'user-connected', { userId: user._id } );
				eventUtils.sendSuccess( res, expose );

	  				
			})( req, res, next );
		};

		var handleReset = function( req, res ){
			var email = req.body.email;

			if( email.trim() === '' || !validator.isEmail( email.trim() )){

				res.json( 500, { msg: "Il faut un email..." });
				res.end();
				return;
			}

			User.findOne({'local.email': email}, function( err, user ){

				if( !user ){

					   res.json( 500, { msg: "Aucun email ne correspond" });
				       res.end();
				       return;
				}

				var resetToken = randtoken.generate(8);

				user.local.password = user.generateHash( resetToken );

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

			if( user )
			{
				console.log('Used found based on Facebook id ');
				var token = jwt.sign( user, config.jwtSecret, { expiresInMinutes: 600 });

					res.json(200,
					{
						_id: user._id,
						token: token
					});
					res.end();
					return;
			}

			var newUser = new User();

			newUser.facebookId = fbId;
			newUser.local.email = email;
			newUser.local.password = newUser.generateHash('M3efore');
			newUser.gender = gender;
			newUser.name = name;;
			newUser.signupDate = new Date();
			
			newUser.save( function( err, user ){

				if( err ) return console.log('User was NOT saved : ' + err );

					var token = jwt.sign( user, config.jwtSecret, { expiresInMinutes: 600 });

					res.json( 200, 
	  				{
	  					_id:     user._id,
	  					token:   token
	  				});

					mailer.sendWelcomeEmail( email );

	  				res.end();

			});
		});
	};

	module.exports = {

		sendHomepage: sendHomepage,
		redirectToHome: redirectToHome,
		handleFacebookAuth: handleFacebookAuth,
		handleSignup: handleSignup,
		handleLogin: handleLogin,
		handleReset: handleReset

	}
