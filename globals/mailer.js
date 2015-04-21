		
		var config = require('../config/config'),
			fs = require('fs'),
			sendgrid = require('sendgrid')( config.sendgrid.api_user, config.sendgrid.api_key );


		var sendMail = function( o ){
			sendgrid.send( o, function(err, json) {
			  if (err) { return console.error(err); }
			  console.log(json);
			});
		}

		
		var sendWelcomeEmail = function( email ){
			
			var welcome_email = new sendgrid.Email({
				from:'robot@meefore.com',
				subject:'Are you ready',
				to: email,
				text:'Hello world',
				html: fs.readFileSync( process.cwd() + '/views/welcomeEmail.html', 'utf8')
			});

			sendMail( welcome_email );
			
		}

		var sendResetPasswordEmail = function( email, token ){

			var resetpassword_email = new sendgrid.Email({
				from:'robot@meefore.com',
				subject:'Are you ready',
				to: email,
				text:'Votre nouveau mot de passe est : <b>'+ token +'</b>',
				html: fs.readFileSync( process.cwd() + '/views/welcomeEmail.html', 'utf8')
			});

			sendMail( resetpassword_email );
		}

		var expose = {

			sendWelcomeEmail: sendWelcomeEmail,
			sendResetPasswordEmail: sendResetPasswordEmail

		};
		

	module.exports = expose;
