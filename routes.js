
	var express = require('express'),
		swig = require('swig'),
		cloudinary = require('cloudinary'),
		jwt = require('jsonwebtoken'),
		config = require('./config/config');

		cloudinary.config({ 
							cloud_name: config.cloudinary.cloud_name,
						    api_key: config.cloudinary.api_key,
						    api_secret: config.cloudinary.api_secret
						});

		var mainTpl  = swig.compileFile(__dirname + '/index.html');

	module.exports = function(app,passport){

		app.get('/home', function( req, res){
			res.sendfile( __dirname + '/index.html');
		});

		app.get('/test', function( req, res){
			res.sendfile(__dirname + '/test.html');
		})

		app.get('*', function( req, res){
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

					// Generating cloud uploadg tag with a specific signature, valid 1 hour
					var cloudTag = cloudinary.uploader.image_upload_tag( 'hello_world' , { public_id: user._id });
					var token = jwt.sign(user, config.jwtSecret, { expiresInMinutes: 60*5 });

	  				res.json(200,{
	  					_id:         	 user._id,
	  					email:       	 user.local.email,
	  					name:        	 user.name,
	  					age:         	 user.age,
	  					status:      	 user.status,
	  					description: 	 user.description,
	  					imgId:      	 user.imgId,
	  					imgVersion: 	 user.imgVersion,
	  					eventsAskedList: user.eventsAskedList,
	  					hostedEventId:   user.hostedEventId,
	  					newsletter:      user.newsletter,
	  					msg:         	 info.msg,
	  					token:       	 token,
	  					cloudTag:    	 cloudTag
	  				});
					res.end();
				}
		})(req,res,next);
	});

}
