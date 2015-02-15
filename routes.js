
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./config/config'),
		User = require('./models/UserModel'),
		nodemailer = require('nodemailer'),
		randtoken = require('rand-token'),
		validator = require('validator');


	module.exports = function(app,passport){

		app.get('/home', function( req, res ){
			res.sendfile( __dirname + '/index.html');
		});

		app.get('/test', function( req, res ){
			res.sendfile(__dirname + '/test.html');
		});

		app.get('*', function( req, res ){
			res.redirect('/home');
		});
		
		app.post('/auth/facebook', handleFacebookAuth );

		app.post('/signup', function( req, res, next ){
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
			})(req,res,next);

		});

		app.post('/login', function( req, res, next ){
			passport.authenticate('local-login', function( err, user, info ){

				if( err )
				{
					console.log('error with the database query');	
				}
				if( !user )
				{
	  				res.json( 401, { msg: "Identifiants incorrects" });
					res.end();
				}
				else
				{
					var token = jwt.sign( user, config.jwtSecret, { expiresInMinutes: 600 });

	  				res.json( 200, 
	  				{
	  					_id:     user._id,
	  					msg:     info.msg,
	  					token:   token,
	  				});
	  				
					res.end();
				}
			})(req,res,next);
		});

		app.post('/reset', function( req, res ){

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

					var mailOptions = config.mailOptionsReset,
						transporter = config.transporter;

					mailOptions.html =  '<body style="padding:10px;">'
											   + '<p style="background:#eee; padding:20px">Try to connect with this one : '
											   + resetToken 
											   + '</p>'
										       + '</body>';

					mailOptions.to  = email;

					transporter.sendMail( mailOptions, function( err, info ){

					    if( err ){
					        console.log( err );
					    }
					    else{
					        console.log('Message sent: ' + info.response );
					    }

					});

					res.json( 200, { msg: "New passport has been sent to your email" });
					res.end();
					return;

				});

			});		

		});

} 


	function handleFacebookAuth( req, res ){

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
		  				res.end();

				});

				

			});

	}

