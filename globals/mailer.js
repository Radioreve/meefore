
		var config = require('../config/config'),
			fs = require('fs'),
			sendgrid = require('sendgrid')( config.sendgrid.api_user, config.sendgrid.api_key ),
			swig = require('swig');


		var sendMail = function( o ){
			sendgrid.send( o, function(err, json) {
			  if (err) { return console.error(err); }
			  console.log(json);
			});
		}

		
		var sendWelcomeEmail = function( email, name ){
			
			var tpl = swig.compileFile( process.cwd() + '/views/welcomeEmail.html' );
			var html = tpl({ name: name });

			var welcome_email = new sendgrid.Email({
				from:'juliette@meefore.com',
				fromname:'Littlefinger',
				subject:"Les soirées bidon, c'est terminé",
				to: email,
				html: html
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
