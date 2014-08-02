	
			var passport  = require("passport"),
			LocalStrategy = require("passport-local").Strategy,
			User          = require("../models/user");


	module.exports = function(passport){

			passport.use('local-signup', new LocalStrategy({

				//Overriding internal parameters with our fields
				usernameField : 'email',
				passwordField : 'password',
				passReqToCallback : true
			},
			function(req,email,password,next){
					// Passport.js, the next signature :
					//  next(null || err , true || false [populates with users if true],  {key:msg})
					User.findOne({'local.email' : email}, function(err,user){
						if(err){
							console.log(1);
							return next(err,false,{msg:"Missing credentials"});
						}
						if(user){
							console.log(2);
							return next(null,false,{msg:"User already exists"});
						}else{
							console.log(3);
							var newUser = new User();
							newUser.local.email = email;
							newUser.local.password = newUser.generateHash(password);
							newUser.save(function(err){
								if(err){throw err;}
									return next(null,newUser,{msg:"User created"});
							});
						} 
					});
			})

			); 

			passport.use('local-login', new LocalStrategy({
		        // by default, local strategy uses username and password, we will override with email
		        usernameField : 'email',
		        passwordField : 'password',
		        passReqToCallback : true // allows us to pass back the entire request to the callback
		    },
		    function(req, email, password, done) {

	    		    User.findOne({ 'local.email' :  email }, function(err, user) {
 
 	          		  if (err)
	             	   return done(err,false,{msg:"Missing credentials"});

		            if (!user)
		                return done(null, false,{msg:"No email matched"});

		            if (!user.validPassword(password))
		                return done(null, false, {msg:"Invalid credentials"});

	            return done(null, user, {msg:"Welcome "+user.local.email});

	        });

	    })

	    );

	};

	
