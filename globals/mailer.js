
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

		var subscribeMailchimpUser = function( email_address, callback ){

			var user = {
				email_address : email_address,
				status        : 'subscribed'
			};

			var url = mailchimp_urls.members;

			request({ method: 'POST', json: user }, function( err, body, response ){

				if( err )
					return callback( err, null );

				return callback( null, response );

			});
		};

		var updateMailchimpUser = function( mailchimp_user_id, update, callback ){

			var url = mailchimp_urls.members + '/' + mailchimp_user_id;

			request({ method: 'PATCH', json: update }, function( err, body, response ){

				if( err )
					return callback( err, null );

				return callback( null, response );

			});

		};

		var expose = {
			sendWelcomeEmail: sendWelcomeEmail,
			subscribeMailchimpUser: subscribeUserToMailchimp,
			updateMailchimpUser: updateMailchimpUser
		};
		

	module.exports = expose;
