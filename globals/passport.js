
	var passport  	   	= require("passport"),
		LocalStrategy 	= require("passport-local").Strategy,
		User        	= require("../models/UserModel"),
		validator     	= require('validator'),
		config        	= require('../config/config'),
		randtoken 		= require('rand-token'),
		mailer 			= require('./mailer');

	var eventUtils = require('../pushevents/eventUtils');


	module.exports = function(passport){

		passport.use('local-signup', new LocalStrategy({

			//Overriding internal parameters with our fields
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true

			},
			function( req, email, password, next ){

				// Passport.js, the next signature :
				//  next(null || err , true || false [populates with users if true],  {key:msg})
				User.findOne({ 'local.email': email }, function( err, user ){

					if( err )
						return next( err, false,{ msg: "Missing credentials" });
					
					if( user )
						return next( null, false,{ msg: "Cet email est déjà utilisé" });

					/*
					if( !validator.isEmail( email ) )
						return next( null, false, { msg: "L'email est incorrect" });

					if ( password.trim().length < 6) 
				        return next( null, false, { msg: "Le mot de passe est trop court ( < 6 )" });

				    if ( password.trim().length > 30)
				        return next( null, false, { msg: "Le mot de passe est trop long ( > 30 )" });
				    */

				    if ( /[-!$%^&*()_#+|@~=`{}\[\]:";'<>?,.\/]/.test( password.trim() ) ){
				        return next( null, false, { msg: "Le mot de passe contient des caractères invalides!" });
				    }

					var newUser = new User();

					newUser.local.email = email;
					newUser.local.password = newUser.generateHash( password );

					mailer.sendWelcomeEmail( email );

					newUser.gender = req.body.gender;
					newUser.age = 25;
					newUser.signupDate = new Date();
					
					// public one based on global key
					// personnal one based on randtoken 
				    var token = randtoken.generate(30);
					
					var accessName = 'mychan',
						channelName = eventUtils.makeChannel({ accessName: accessName, token: token }) 

					newUser.myChannels.push( {accessName:accessName, channelName:channelName} );

					var accessName = 'defchan',
						channelName = eventUtils.makeChannel({ accessName: accessName }) 

					newUser.myChannels.push( {accessName:accessName, channelName:channelName} );


					newUser.save( function( err ){
						if( err ){ throw err; }
						return next( null, newUser, { msg: "User created" });
					});
				}); 

			}));

		passport.use('local-login', new LocalStrategy({

	        // by default, local strategy uses username and password, we will override with email
	        usernameField : 'email',
	        passwordField : 'password',
	        passReqToCallback : true 

	    },
	    function( req, email, password, done ) {

		    User.findOne({ 'local.email' :  email }, function( err, user ) {

          	if( err )
         	   return done( err, false, { msg: "Identifiants incorrects" });

            if( !user )
                return done( null, false, { msg: "Identifiants incorrects" });

            if( !user.validPassword( password ) )
                return done( null, false, { msg: "Identifiants incorrects" });

            return done( null, user, { msg: "Bienvenue " + user.local.email });

    	    });
	
	    }));

	};
	  