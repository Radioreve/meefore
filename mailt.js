
		
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

		var mailOptions = {};
		mailOptions.from = 'Magic Mike <ljayame@gmail.com>';
		mailOptions.subject = 'Quelqu\'un a laissé un message';
		mailOptions.html = 'Hello world';
		mailOptions.to = 'leo@meefore.com'

		transporter.sendMail( mailOptions, function( err, info ){

		    if( err ){
		        console.log( err );
		    }
		    else{
		        console.log('Message sent: ' + info.response );
		    }
		});



