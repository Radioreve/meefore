
	var passport  	  = require("passport"),
	LocalStrategy 	  = require("passport-local").Strategy,
	FacebookStrategy  = require('passport-facebook').Strategy,
	User        	  = require("../models/UserModel"),
	validator     	  = require('validator'),
	config        	  = require('./config');


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
				User.findOne({'local.email': email}, function(err,user){

					if( err )
						return next( err, false,{ msg: "Missing credentials" });

					
					if( user )
						return next( null, false,{ msg: "User already exists" });

					/*
					if( !validator.isEmail( email ) )
						return next( null, false, { msg: "Email is incorrect" });

					if ( password.trim().length < 6) 
				        return next( null, false, { msg: "Email is too short ( < 6 )" });

				    if ( password.trim().length > 30)
				        return next( null, false, { msg: "Email is too long ( > 30 )" });

				    if ( /[-!$%^&*()_#+|@~=`{}\[\]:";'<>?,.\/]/.test( password.trim() ) ){
				        return next( null, false, { msg: "Email contains invalid char!" });
				    }
				    */

					var newUser = new User();

					newUser.local.email = email;
					newUser.local.password = newUser.generateHash( password );
					newUser.signupDate = new Date();
					
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
         	   return done( err, false, { msg: "Missing credentials" });

            if( !user )
                return done( null, false, { msg: "No email matched" });

            if( !user.validPassword(password) )
                return done( null, false, { msg: "Invalid credentials" });

            return done( null, user, { msg: "Welcome " + user.local.email });

    	    });
	
	    }));

	};
	  