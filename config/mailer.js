	
		var nodemailer = require('nodemailer');

		var transporter = nodemailer.createTransport({

		    service: 'Gmail',
		    auth: {
		        user: 'ljayame@gmail.com',
		        pass: 'R4dioreve'
		    }

		});

		var mailOptions = {  welcome: {}, reset: {}, contact: {}  };

			mailOptions.welcome.from    = 'Jenny <ljayame@gmail.com>';
			mailOptions.welcome.subject = 'Are you ready ?';
			mailOptions.welcome.html    = '<body style="padding:10px;">'
										   + '<p style="background:#eee; padding:20px">Hello world, welcome on board.</p>'
									       + '</body>';

			mailOptions.reset.from    = 'Marianne <ljayame@gmail.com>';
			mailOptions.reset.subject = 'So you forgot your password, huh?';

			mailOptions.contact.from  = 'Feedbacks <ljayame@gmail.com>';
			mailOptions.contact.to    = 'methodezela@gmail.com';

		var mailOptionsWelcome = mailOptions.welcome,
			mailOptionsReset   = mailOptions.reset,
			mailOptionsContact = mailOptions.contact;


		var expose = {

			transporter: transporter,
			mailOptionsWelcome: mailOptionsWelcome,
			mailOptionsReset: mailOptionsReset,
			mailOptionsContact: mailOptionsContact

		};

	module.exports = expose;
