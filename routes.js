
	var express = require('express'),
		jwt = require('jsonwebtoken'),
		config = require('./config/config');

	module.exports = function(app,passport){

		app.get('/home', function( req, res ){
			res.sendfile( __dirname + '/index.html');
		});

		app.get('/test', function( req, res ){
			res.sendfile(__dirname + '/test.html');
		})

		app.get('*', function( req, res ){
			res.redirect('/home');
		});

		app.post('/signup', function( req, res, next ){
			passport.authenticate('local-signup', function( err, user, info ){
				if( err ){
					console.log('error with the database query');	
				}
				if( !user ){
					console.log('info : '+info.msg);	
	  				res.json( 401, { msg: info.msg });
					res.end();
				}
				else{
					console.log('info : '+info.msg);
	  				res.json( 200, {msg: info.msg });
					res.end();;
				}
			})(req,res,next);

		});

		app.post('/login', function( req, res, next ){
			passport.authenticate('local-login', function( err, user, info ){
				if( err ){
					console.log('error with the database query');	
				}
				if( !user ){
	  				res.json( 401, { msg: "Invalid credentials" });
					res.end();
				}
				else{

					var token = jwt.sign( user, config.jwtSecret, { expiresInMinutes: 60*5 });

	  				res.json( 200, {
	  					_id:         	 user._id,
	  					msg:         	 info.msg,
	  					token:       	 token,
	  				});
	  				
					res.end();
				}
		})(req,res,next);
	});

}
