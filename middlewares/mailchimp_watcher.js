
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var config     = require('../config/config');
	var _          = require('lodash');
	var mailer     = require('../services/mailer');
	var term       = require('terminal-kit').term;

	var err_ns = "mailchimp";

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	function yn_to_bool( yn ){
			if(yn =='yes') return true;
			return false;;
		};

	var subscribeMailchimpUser = function( req, res, next ){

		var user    = req.sent.user;
		var options = { interests: {} };

		if( req.sent.force_subscribe ){
			var email_address = req.sent.contact_email;

			config.mailchimp.groups.forEach(function( interest_object ){
				options.interests[ interest_object.id ] = yn_to_bool( interest_object.init_value );
			});
			
		} else {
			// If has already mailchimp_id, skip
			if( user.mailchimp_id ){
				console.log('User already have mailchimp_id, skipping mailchimp subscription...');
				return next();
			}

			if( req.sent.bot ){
				console.log('User is bot, skipping mailchimp subscription...');
				return next();
			}

			var email_address = req.sent.user.contact_email;

			config.mailchimp.groups.forEach(function( interest_object ){
				options.interests[ interest_object.id ] = yn_to_bool( interest_object.init_value );
			});
		}

		// Make sure a proper email address is provided
		if( !email_address || !/^.+@.+\..+$/.test( email_address ) ){
			term.bold.red('User email isnt provided, skipping mailchimp subscription...\n');
			return next();
		}

		// If user email is being updated, create new one with the same options to not mess 
		// with previous user preferences.
		options = req.sent.subscribe_options || options;

		console.log('Subscribing user to mailchimp with email address: ' + email_address );
		mailer.subscribeUserAtMailchimp( email_address, options, function( err, response ){

			if( err ){
				return handleErr( req, res, err_ns, { err_id: 'subscribing_user_mc' });
			}

			// Saving the mailchimp id for later api calls to modify newsletter preferences (PATCH) 
			console.log('User subscribed, new mailchimp_id: ' + response.id);
			User.update({ facebook_id: user.facebook_id }, { $set: { 'mailchimp_id' : response.id } },{ multi: false },
			function( err, raw ){

				if( err || raw.n == 0 ){
					term.bold.red('Error updating mailchimp_id' + '\n');
				}

			});

		});

		next();

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
			console.log('contact_email found in database: ' + user.contact_email + ' and sent from client: ' + contact_email );
			need_to_update_hard = true;
		}

		_.keys( new_preferences.email ).forEach( function( group_name ){

			// Control bool to know if an updated to the mailchimp API will be needed
			if( new_preferences.email[ group_name ] != old_preferences.email[ group_name ] ){
				need_to_update_soft = true;
			}

			var group_id = _.find( config.mailchimp.groups, function( group ){
				return group.name == group_name; 
			}).id;

			update.interests[ group_id ] = yn_to_bool( new_preferences.email[ group_name ]);
			
		});

		console.log('mailchimp user id : ' + user.mailchimp_id + ', with email : ' + contact_email );

		if( !need_to_update_soft && !need_to_update_hard ){
			console.log('No update necessary, preferences didnt change');
			return next();
		}

		// There are 3 cases, by priority order :
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

			mailer.getMailchimpUser( user.mailchimp_id, function( err, response ){

				if( err ){
					return handleErr( req, res, err_ns, { err_id: 'getting_user_mc' });
				} else {
					console.log('Mailchimp user has been fetched before destroy.');
					req.sent.subscribe_options = {
						interests    : response.interests,
						merge_fields : response.merge_fields
					};
				}

				mailer.deleteUserAtMailchimp( user.mailchimp_id, function( err, response ){

					req.sent.user.mailchimp_id = null;
					if( err ){
						return handleErr( req, res, err_ns, { err_id: 'deleting_user_mc' });
					} else {
						console.log('Mailchimp user has been deleted, creating new one...');
						req.sent.force_subscribe = true;
						subscribeMailchimpUser( req, res, next );
					}

				});
			});

			return;
		}

		if( need_to_update_soft ){
			console.log('Update mailchimp needed (soft). Updating... [case 3]');

			mailer.updateUserAtMailchimp( user.mailchimp_id, update, function( err, response ){

				if( err ){
					handleErr( req, res, err_ns, { err_id: 'updating_user_mc' });
				} else {
					console.log('Everything went fine with the soft update');
					next();
				}


			});
			
		}

	};

	var deleteMailchimpUser = function( req, res, next ){

		console.log('Deleting mailchimp user with chimp id: ' + req.sent.user.mailchimp_id );
		mailer.deleteUserAtMailchimp( req.sent.user.mailchimp_id, function( err, response ){

			if( err ){
				return handleErr( req, res, err_ns, { err_id: 'deleting_user_mc' });
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