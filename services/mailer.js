
		var config 	   = require('../config/config');
		var User       = require('../models/UserModel');
		var config     = require('../config/config');
		var _          = require('lodash');
		var request    = require('request');

		var api_key  = config.mailchimp.api_key;
		var dc       = config.mailchimp.dc;
		var username = config.mailchimp.username;
		var list_id  = config.mailchimp.list_id;

		var mailchimp_urls = {
			members: 'https://' + username + ':' + api_key + '@' + dc + '.api.mailchimp.com/3.0/lists/' + list_id + '/members'
		};


		var getMailchimpUser = function( mailchimp_user_id, callback ){

			var url = mailchimp_urls.members + '/' + mailchimp_user_id;

			request({ method: 'GET', url: url }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, JSON.parse(response) );
				}

			});

		};

		var getMailchimpUsers = function( callback ){

			var url = mailchimp_urls.members;

			request({ method: 'GET', url: url }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, JSON.parse(response) );
				}

			});

		}

		var subscribeUserAtMailchimp = function( email_address, options, callback ){


			var user = {
				email_address : email_address,
				status        : 'subscribed',
				interests 	  : options.interests
			};

			var url = mailchimp_urls.members;

			request({ method: 'POST', url: url, json: user }, function( err, body, response ){

				if( err ){
					callback( err, null );
				} else {
					callback( null, response );
				}

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


		var expose = {
			subscribeUserAtMailchimp       : subscribeUserAtMailchimp,
			updateUserAtMailchimp          : updateUserAtMailchimp,
			deleteUserAtMailchimp 		   : deleteUserAtMailchimp,
			getMailchimpUser 			   : getMailchimpUser,
			getMailchimpUsers			   : getMailchimpUsers
		};
		

	module.exports = expose;
