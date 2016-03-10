
			var config = require('../config/config'),
			User       = require('../models/UserModel'),
			txt        = require('./mailer--textsource'),
			fs         = require('fs'),
			sendgrid   = require('sendgrid')( config.sendgrid.api_user, config.sendgrid.api_key ),
			config     = require('../config/config'),
			swig       = require('swig'),
			_          = require('lodash'),
			request    = require('request');


		var api_key  = config.mailchimp.api_key,
			dc       = config.mailchimp.dc,
			username = config.mailchimp.username,
			list_id  = config.mailchimp.list_id;

		var mailchimp_urls = {
			members: 'https://'+username+':'+api_key+'@' + dc + '.api.mailchimp.com/3.0/lists/' + list_id + '/members'
		};


		var sendWelcomeEmail = function( email, name ){
			
			var tpl = swig.compileFile( process.cwd() + '/views/welcomeEmail.html' );
			var html = tpl({ name: name });

			var welcome_email = new sendgrid.Email({
				from:'littlefinger@meefore.com',
				fromname:'Meefore',
				subject:"Bienvenue sur meefore",
				to: email,
				html: html
			});

			sendMail( welcome_email );
			
		};


		var subscribeUserAtMailchimp = function( email_address, options, callback ){


			var user = {
				email_address : email_address,
				status        : 'subscribed',
				interests 	  : options.interests
			};

			var url = mailchimp_urls.members;

			request({ method: 'POST', url: url, json: user }, function( err, body, response ){

				if( err ) return callback( err, null );

				callback( null, response );

			});
		};

		var updateUserAtMailchimp = function( mailchimp_user_id, update, callback ){

			var url = mailchimp_urls.members + '/' + mailchimp_user_id;

			request({ method: 'PATCH', json: update, url: url }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, response );
				}

			});

		};

		var deleteUserAtMailchimp = function( mailchimp_user_id, callback ){

			var url = mailchimp_urls.members + '/' + mailchimp_user_id;

			request({ method: 'DELETE', url: url }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, response );
				}

			});

		};

		var sendSimpleAdminEmail = function( subject, html ){

			var simple_email = new sendgrid.Email({
				from     :'watcher@meefore.com',
				fromname : 'Watcher',
				subject  : subject,
				to       : ['leo@meefore.com'],
				html     : html
			});

			if( process.env.NODE_ENV == 'prod' ){
				simple_email.to.push('ben@meefore.com');
			}

			sendgrid.send( simple_email, function( err, res ){
				if( err ){
					console.log(err);
				} else {
					console.log(res);
				}
			});
		};

		var sendContactEmail = function( name, email, message, callback ){

			var contact_email = new sendgrid.Email({
				from     : email,
				fromname : name,
				subject  : 'Message using contact form',
				to       : ['contact@meefore.com'],
				html     : '<div style="padding: 12px; background: #f6f6f6">' + message + '</div>'
			});

			sendgrid.send( contact_email, function( err, res ){
				if( err )
					return callback( err, null );

				return callback( null, res );
			});

		};

		var sendAlertEmail_MessageReceived = function( sender_name, receiver_email ){

			User.findOne({ contact_email: receiver_email }, function( err, user ){

				if( err || !user ) return;

				var cc = user.country_code;

				var subject = txt.makeText( cc, "alert_message_received_subject" );
				subject = subject.replace('%sender_name', sender_name );

				var html = txt.makeText( cc, "alert_message_received_body" );
				html = html.replace('%receiver_name', user.name );


				var alert_email = new sendgrid.Email({
					from     : 'no-reply@meefore.com',
					fromname : 'Meefore',
					subject  : subject,
					to       : receiver_email,
					html     : html
				});

				sendgrid.send( alert_email, function( err, res ){
					if( err )
						return console.log(err);
				});

			});
		};


		var sendAlertEmail_RequestAccepted = function( receiver_email ){

			User.findOne({ contact_email: receiver_email }, function( err, user ){

				if( err || !user ) return;

				var cc = user.country_code;

				var subject = txt.makeText( cc, "alert_accepted_in_subject" );

				var html = txt.makeText( cc, "alert_accepted_in_body" );
				html = html.replace('%receiver_name', user.name );


				var alert_email = new sendgrid.Email({
					from     : 'no-reply@meefore.com',
					fromname : 'Meefore',
					subject  : subject,
					to       : receiver_email,
					html     : html
				});

				sendgrid.send( alert_email, function( err, res ){
					if( err )
						return console.log(err);
				});

			});

		};

		// sendAlertEmail_RequestAccepted( 'ljayame@gmail.com' );
		// sendAlertEmail_MessageReceived( 'Jeannette', 'ljayame@gmail.com' );

		var expose = {
			sendContactEmail               : sendContactEmail,
			sendWelcomeEmail               : sendWelcomeEmail,
			sendSimpleAdminEmail           : sendSimpleAdminEmail,
			subscribeUserAtMailchimp       : subscribeUserAtMailchimp,
			updateUserAtMailchimp          : updateUserAtMailchimp,
			deleteUserAtMailchimp 		   : deleteUserAtMailchimp,
			sendAlertEmail_MessageReceived : sendAlertEmail_MessageReceived,
			sendAlertEmail_RequestAccepted : sendAlertEmail_RequestAccepted
		};
		

	module.exports = expose;
