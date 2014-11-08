	
	var nodemailer = require('nodemailer');

	var config = function(){

		var transporter = nodemailer.createTransport({

		    service: 'Gmail',
		    auth: {
		        user: 'ljayame@gmail.com',
		        pass: 'R4dioreve'
		    }

		});

		var mailOptions = {  welcome: {}, reset: {}  };

			mailOptions.welcome.from    = 'John Bamboo ✔ <ljayame@gmail.com>',
			mailOptions.welcome.subject = 'Are you ready ?',
			mailOptions.welcome.html    = '<body style="padding:10px;">'
										   + '<p style="background:#eee; padding:20px">Hello world, welcome on board.</p>'
									       + '</body>';

			mailOptions.reset.from    = 'John Bamboo ✔ <ljayame@gmail.com>',
			mailOptions.reset.subject = 'So you forgot your password, huh?';

		var mailOptionsWelcome = mailOptions.welcome,
			mailOptionsReset   = mailOptions.reset;
		
		return {

			db:{
				composeUri:"mongodb://radioreve:R4dioreve@kahana.mongohq.com:10063/Testers",
				localUri:"localhost:27017"
			},
			jwtSecret:"R4dioreve",
			mail:{
				user:"phonetrackercp@gmail.com",
				password:"PH0netracker"
			},
			cloudinary:{
				cloud_name:"radioreve",
				api_key:"835413516756943",
				api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
			},
			transporter: transporter,
			mailOptionsWelcome: mailOptionsWelcome,
			mailOptionsReset: mailOptionsReset

		}
	};

	module.exports = config();