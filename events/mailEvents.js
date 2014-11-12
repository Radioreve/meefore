
	var User 		= require('../models/UserModel'),
	    Event 		= require('../models/EventModel'),
	    _ 			= require('lodash'),
	    cloudinary  = require('cloudinary'),
		eventUtils  = require('./eventUtils'),
		config      = require('../config/mailer'),
	    nodemailer  = require('nodemailer');


	var sendContactEmail = function( data ){

		var userId = data.userId,
			name   = data.username,
			email  = data.email,
			body   = data.bodytext;

		var socket = global.sockets[userId];

		var mailOptions = config.mailOptionsContact,
				transporter = config.transporter;

				mailOptions.from = name + ' <' + email +'>';
				mailOptions.subject = 'Someone has left a comment';
				mailOptions.html = body;

			transporter.sendMail( mailOptions, function( err, info ){

			    if( err ){
			        console.log( err );
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

			var email = user.local.email;

			var mailOptions = config.mailOptionsWelcome,
				transporter = config.transporter;

				mailOptions.to  = email;

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
