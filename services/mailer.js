
		var config = require('../config/config'),
			fs = require('fs'),
			sendgrid = require('sendgrid')( config.sendgrid.api_user, config.sendgrid.api_key ),
			config = require('../config/config'),
			swig = require('swig'),
			_ = require('lodash'),
			request = require('request');


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


		var subscribeUserToMailchimp = function( email_address, options, callback ){


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

		var updateMailchimpUser = function( mailchimp_user_id, update, callback ){

			var url = mailchimp_urls.members + '/' + mailchimp_user_id;

			request({ method: 'PATCH', json: update, url: url }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, response );
				}

			});

		};

		var deleteMailchimpUser = function( mailchimp_user_id, callback ){

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
				to       : 'leo@meefore.com',
				html     : html
			});

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

			var subject = sender_name + ' vous a envoyé un message!';

			var alert_email = new sendgrid.Email({
				from     : 'no-reply@meefore.com',
				fromname : 'Meefore',
				subject  : subject,
				to       : receiver_email,
				html     : [
							'<div>Quelqu\'un a laissé un message pour toi...</div>'
						   ].join('')
			});

			sendgrid.send( alert_email, function( err, res ){
				if( err )
					return console.log(err);
			});

		};

		var sendAlertEmail_RequestAccepted = function( receiver_email ){

			var subject = 'Vous avez été accepté dans un meefore !';

			var alert_email = new sendgrid.Email({
				from     : 'no-reply@meefore.com',
				fromname : 'Meefore',
				subject  : subject,
				to       : receiver_email,
				html     : [
							'<div>Body text</div>'
						   ].join('')
			});

			sendgrid.send( alert_email, function( err, res ){
				if( err )
					return console.log(err);
			});

		};

		var expose = {
			sendContactEmail               : sendContactEmail,
			sendWelcomeEmail               : sendWelcomeEmail,
			sendSimpleAdminEmail           : sendSimpleAdminEmail,
			subscribeUserToMailchimp       : subscribeUserToMailchimp,
			updateMailchimpUser            : updateMailchimpUser,
			deleteMailchimpUser 		   : deleteMailchimpUser,
			sendAlertEmail_MessageReceived : sendAlertEmail_MessageReceived,
			sendAlertEmail_RequestAccepted : sendAlertEmail_RequestAccepted
		};
		

	module.exports = expose;
