
	eventUtils  = require('../pushevents/eventUtils'),
	User 		= require('../models/UserModel'),
	config      = require('../config/config'),
	_     	    = require('lodash'),
	mailer      = require('../services/mailer');

	function yn_to_bool( yn ){
			if(yn =='yes') return true;
			return false;;
		};

	var subscribeMailchimpUser = function( req, res, next ){

		var options = {};

		if( req.sent.force_subscribe ){
			var email_address = req.sent.contact_email;

			options.interests = {
				"bdb7938e4e": yn_to_bool( req.sent.app_preferences.email["invitations"] ),		//  
        		"042add1e79": yn_to_bool( req.sent.app_preferences.email["newsletter"] )
			};
			
		} else {
			// If exists, user has been populated by previous mdw 
			if( req.sent.user ){
				console.log('User already exists, skipping mailchimp subscription...');
				return next();
			}
			var email_address = req.sent.facebook_profile.email;

			options.interests = {
				"bdb7938e4e": yn_to_bool( config.mailchimp.groups["invitations"].init_value ),		//  
        		"042add1e79": yn_to_bool( config.mailchimp.groups["newsletter"].init_value )
			}
		}

		// Make sure a proper email address is provided
		if( !email_address || !/^.+@.+\..+$/.test( email_address ) ){
			req.sent.no_email = true;
			console.log('User email isnt provided, skipping mailchimp subscription...');
			return next();
		}

		console.log('Subscribing user to mailchimp with email address: ' + email_address );
		mailer.subscribeUserAtMailchimp( email_address, options, function( err, response ){

			if( err ){
				return eventUtils.raiseError({
					res: res,
					err: err,
					toClient: "Error calling mailchimp api"
				});
			}

			// Saving the mailchimp id for later api calls to modify newsletter preferences (PATCH) 
			console.log('User subscribed, new mailchimp_id: ' + response.id);
			req.sent.mailchimp_id = response.id;
			next();

		});

	};

	var updateMailchimpUser = function( req, res, next ){

		// Populated
		var user = req.sent.user;

		var new_preferences = req.sent.app_preferences;
		var contact_email   = req.sent.contact_email;

		var old_preferences = user.app_preferences;

		var need_to_update_soft = false;
		var need_to_update_hard = false;

		var update = { interests: {} };

		if( user.contact_email != contact_email ){
			console.log('user.contact_email: ' + user.contact_email);
			console.log('contact_email:' + contact_email);
			need_to_update_hard = true;
		}

		_.keys( new_preferences.email ).forEach( function( key ){

			// Control bool to know if an updated to the mailchimp API will be needed
			if( new_preferences.email[ key ] != old_preferences.email[ key ] ){
				need_to_update_soft = true;
			}

			var bool = new_preferences.email[ key ] == 'yes' ? true : false;
			update.interests[ config.mailchimp.groups[ key ].id ] = bool;
			
		});

		console.log('mailchimp user id : ' + user.mailchimp_id + ', with email : ' + contact_email );

		if( !need_to_update_soft && !need_to_update_hard ){
			console.log('No update necessary, preferences didnt change');
			return next();
		}

		// There are 3 cases, in priority order
		// User has no mailchimp_id --> subscribe him immediately
		// User has mailchimp_id but changd email: delete old mailchimp ref and create new one
		// User has mailchimp_id and didt change email but change preferences

		// Is the user subscribed to mailchimp ? 
		if( !user.mailchimp_id ){
			console.log('User isnt on mailchimp yet. Subscribing instead of updating... [case 1]');
			req.sent.force_subscribe = true;
			subscribeMailchimpUser( req, res, next );
			return;
		}
		
		if( need_to_update_hard ){
			console.log('User is on mailchimp but changed email. Erasing out dated ref and saving new one... [case 2]');

			mailer.deleteUserAtMailchimp( user.mailchimp_id, function( err, response ){

				req.sent.user.mailchimp_id = null;
				if( err ){
					return eventUtils.raiseError({
						err: err, res: res, toClient: "Une erreur s'est produite, veuillez nous excuser"
					});
				} else {
					console.log('Mailchimp user has been deleted, creating new one...');
					req.sent.force_subscribe = true;
					subscribeMailchimpUser( req, res, next );
				}

			});
			return;
		}

		if( need_to_update_soft ){
			console.log('Update mailchimp needed (soft). Updating... [case 3]');

			mailer.updateUserAtMailchimp( user.mailchimp_id, update, function( err, response ){

				if( err ){
					return eventUtils.raiseError({
						err: err, res: res, toClient: "Une erreur s'est produite, veuillez nous excuser"
					});
				}

				next();

			});
			
		}

	};

	var deleteMailchimpUser = function( req, res, next ){

		console.log('Deleting mailchimp user with chimp id: ' + req.sent.user.mailchimp_id );
		mailer.deleteUserAtMailchimp( req.sent.user.mailchimp_id, function( err, response ){

			if( err ){
				return eventUtils.raiseError({
					err: err, toClient:"Couldnt delete user from mailchimp", res: res
				});
			}

			console.log('User (' + req.sent.user.contact_email + ') successfully deleted from mailchimp');
			next();

		});

	};

	module.exports = {
		subscribeMailchimpUser : subscribeMailchimpUser,
		updateMailchimpUser    : updateMailchimpUser,
		deleteMailchimpUser    : deleteMailchimpUser
	};