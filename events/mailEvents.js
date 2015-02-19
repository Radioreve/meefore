
	var User 		= require('../models/UserModel'),
	    Event 		= require('../models/EventModel'),
	    _ 			= require('lodash'),
	    cloudinary  = require('cloudinary'),
		eventUtils  = require('./eventUtils'),
		config      = require('../config/mailer'),
	    nodemailer  = require('nodemailer'),
	    validator   = require('validator');


	var sendContactEmail = function( data ){

		var userId = data.userId,
			name   = data.username,
			email  = data.email,
			body   = data.bodytext;

		var socket = global.sockets[userId];

		var mailOptions = config.mailOptionsContact,
				transporter = config.transporter;

				mailOptions.from = name + ' <' + email +'>';
				mailOptions.subject = 'Someone has left a message!';
				mailOptions.html = body;


		if( !validator.isEmail(email) )
		{
			return eventUtils.raiseError({
				socket: socket,
				toClient: "L'email est incorrecte",
				toServer: "Mail not sent, wrong email input"
			});
		}

			transporter.sendMail( mailOptions, function( err, info ){

			    if( err ){
			        console.log( err );
			        if( err.responseCode == 550 )
			        {
			        	return eventUtils.raiseError({
			        		err:err,
			        		socket: socket,
			        		toServer: "Fake mail",
			        		toClient: "L'email a été rejetée par nos serveurs"
			        	});
			        }
			    }
			    else{
			        console.log('Message sent: ' + info.response );
			        socket.emit('send contact email success');
			    }
			});
		
	};

	var requestWelcomeEmail = function( userId ){

		var userSocket = global.sockets[userId];

		User.findById( userId, {}, function( err, user ){

			if( err ){

		        return eventUtils.raiseError({
					socket: userSocket,
					err: err,
					toServer: "Can't send mail (no user found)",
					toClient: "Can't send mail (no user found)"
				});

			}

			var mailOptions = config.mailOptionsWelcome,
				transporter = config.transporter;

				mailOptions.to  = user.local.email;

			transporter.sendMail( mailOptions, function( err, info ){

			    if( err ){
			        console.log( err );
			    }
			    else{
			        console.log('Message sent: ' + info.response );
			    }
			});

		});

	};

	module.exports = {

		requestWelcomeEmail: requestWelcomeEmail,
		sendContactEmail: sendContactEmail

	}
