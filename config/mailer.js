	
		var nodemailer = require('nodemailer');

		var transporter = nodemailer.createTransport({

			host:'mail.gandi.net',
			port:'587',
			use_authentication:true,
		    auth: {
		        user: 'leo@meefore.com',
		        pass: 'R4dioreve'
		    }

		});

		var mailOptions = {  welcome: {}, reset: {}, contact: {}  };

			mailOptions.welcome.from    = 'Mike Meefore <leo@meefore.com>';
			mailOptions.welcome.subject = 'Are you ready ?';
			mailOptions.welcome.html    = '<body style="padding:10px;">'
										   + '<p style="background:#eee; padding:20px">Hello world, welcome on board.</p>'
									       + '</body>';

			mailOptions.reset.from    = 'Marianne <ljayame@gmail.com>';
			mailOptions.reset.subject = 'So you forgot your password, huh?';

			mailOptions.contact.from  = 'Mike <leo@meefore.com>';
			mailOptions.contact.to    = 'leo@meefore.com';

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
