
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var config     = require('../config/config');
	var Alerter    = require('./alerter');
	var _          = require('lodash');
	var term 	   = require('terminal-kit').terminal;

	// Mailchimp interface
	var MC        = require('../services/mc');
	var Mailchimp = new MC( config.mailchimp[ process.env.APP_ENV ] );
	// var Mailchimp = new MC( config.mailchimp );

	var handleErr = function( err, err_ns ){

		MailchimpInterface.errLog( err_ns );
		Alerter.sendAdminEmail({
			subject : "Error in the mailchimp middleware ("+ err_ns +")",
			html    : err
		});
	};

	var api = function( action ){

		return function( req, res, next ){

			Mailchimp.infoLog( action );
			// All api calls are non blocking call (important)
			// otherwise, each requests would be slowed hugely
			next();

			if( req.sent.user && req.sent.user.isBot() ){
				term.bold.green('Skipping the mailchimp update... (bearly)\n');
				return next();
			}

			if( action == "ensure_subscription" ){
				ensureSubscription( req );
			}

			if( action == "update_member" ){
				updateMember( req );
			}

			if( action == "delete_member"){
				deleteMember( req );
			}

		}
	}

	var ensureSubscription = function( req ){

		var err_ns = "mailchimp_ensure_subscription";
		var user   = req.sent.user;

		if( user.mailchimp_id ){
			return Mailchimp.infoLog("User already has mailchimp_id " + user.mailchimp_id +'. Skipping...');
		}

		if( !Mailchimp.isEmail( user.contact_email ) ){
			return Mailchimp.warnLog("User has no mailchimp_id but his email is malformed. Skipping until next time...");
		}

		Mailchimp.infoLog("User has no mailchimp_id and a valid email, subscribing now.");
		Mailchimp.createMember({ email_address: user.contact_email })
			.then(function( member ){

				Mailchimp.successLog("Mailchimp's member created with id : " + member.id );
				User.findOneAndUpdate(
					{
						facebook_id: user.facebook_id
					},
					{
						mailchimp_id: member.id
					},
					function( err, user ){

						if( err ){
							handleErr( err, err_ns );
						} else {

							// Update the req.sent to prevent an infinite subscribe/update loop
							req.sent.user = user;

							Mailchimp.successLog("Member have been successfully subscribed");
							Mailchimp.updateMember( req )
								.then(function(){
									Mailchimp.successLog("Member have been successfully patched");
								});

						}

					});

				return;

			});
			
	};


	var updateMember = function( req ){

		var err_ns = "mailchimp_update_member";
		
		var user              = req.sent.user;
		var subscribed_emails = req.sent.app_preferences && req.sent.app_preferences.subscribed_emails;
		var contact_email     = req.sent.contact_email;

		if( !isMailchimpPatchNeeded( req.sent.user, req.sent ) ){
			return Mailchimp.infoLog("User didnt update contact_email or subscription preferences, skippin...");
		}

		if( !user.mailchimp_id ){
			Mailchimp.warnLog("User doesnt have a mailchimp_id, trying subscription...");
			return ensureSubscription( req );
		}

		// Initialization, put all the informations we have about the user into the mailchimp's member
		var patch = {
			id            : user.mailchimp_id,
			language      : user.country_code,
			location      : { latitude: parseFloat( user.location.lat ), longitude: parseFloat( user.location.lng )},
			merge_fields  : {},
			interests     : {}
		};

		// Patching merge fields 
		patch.merge_fields[ "NAME" ]   = user.name;
		patch.merge_fields[ "AGE" ]    = user.age;
		patch.merge_fields[ "GENDER" ] = user.gender;
		patch.merge_fields[ "JOB" ]    = user.job;

		// Patching interests
		if( req.sent.app_preferences ){
			var sub_emails = Mailchimp.patchify( user.app_preferences.subscribed_emails, req.sent.app_preferences.subscribed_emails );
			_.keys( sub_emails ).forEach(function( subscription_name ){

				var interest_id = Mailchimp.getInterestId( subscription_name );
				patch.interests[ interest_id ] = sub_emails[ subscription_name ];

			});
		}

		// Only append the contact_email to the patch if its asked. Otherwise, the patch wont work
		// as the interface will believe that user tries to update the email (which is handled differently)
		if( contact_email ){
			patch.email_address = contact_email;
		}

		Mailchimp.debugLog( patch );
		
		Mailchimp.updateMember( user.mailchimp_id, patch )
			.then(function( member ){
				Mailchimp.successLog("Member has been patched successfully, new_id: " + member.id + ", new_mail: " + member.email_address );
				user.mailchimp_id = member.id;
				user.save(function( err ){
					if( err ) handleErr( err, err_ns );
				});
			})
			.catch(function( err ){
				handleErr( err, err_ns );
			});


	};

	var deleteMember = function( req ){

		var err_ns = "mailchimp_delete_member";
		var user   = req.sent.user;

		if( !user.mailchimp_id ){
			return Mailchimp.infoLog('No mailchimp_id field, nothing to delete');
		}

		Mailchimp.deleteMember( user.mailchimp_id )
			.then(function(){
				Mailchimp.successLog("Member have been removed from Mailchimp successfully");
			})
			.catch(function( err ){
				handleErr( err, err_ns );
			})

	};

	//Write the Mailchimp status each time the server is booted
	(function writeToFile(){

		var p1 = Mailchimp.writeMergeFieldsToFile( process.cwd() + '/json' );
		var p2 = Mailchimp.writeInterestCatsToFile( process.cwd() + '/json' );
		var p3 = Mailchimp.writeInterestsToFile( process.cwd() + '/json' );
		var p4 = Mailchimp.writeMembersToFile( process.cwd() + '/json' );

		Promise.all([ p1, p2, p3, p4 ])
			.catch(function( err ){
				Mailchimp.errLog( err );
			});

	});


	function isMailchimpPatchNeeded( user, patch ){

		var is_patch_necessary = false;

		if( patch.contact_email && patch.contact_email != user.contact_email ){
			Mailchimp.infoLog("Patch email necessary, user is updating his email");
			is_patch_necessary = true;
		}

		if( patch.app_preferences && patch.app_preferences.subscribed_emails ){
			Object.keys( patch.app_preferences.subscribed_emails ).forEach(function( key ){
				if( patch.app_preferences.subscribed_emails[ key ] != user.app_preferences.subscribed_emails[ key ] ){
					Mailchimp.infoLog("Patch email necessary, user is updating his subscriptions preferences");
					is_patch_necessary = true;
				}
			});
		}

		[ "name", "age", "job" ].forEach(function( up_type ){

			if( patch[ up_type ] ){
				Mailchimp.infoLog("Patch email necessary, user is updating his " + up_type);
				is_patch_necessary = true;
			}

		});
		
		return is_patch_necessary;
	}


	module.exports = {
		api: api
	};





	

