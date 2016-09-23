
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var config     = require('../config/config');
	var Alerter    = require('./alerter');
	var Promise    = require('bluebird');
	var _          = require('lodash');
	var log 	   = require('../services/logger');
	var erh 	   = require('../services/mc');
	var print 	   = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/mailchimp.js' );

	// Mailchimp interface
	var MC        = require('../services/mc');
	var Mailchimp = new MC( config.mailchimp[ process.env.APP_ENV ] );
	// var Mailchimp = new MC( config.mailchimp );


	var api = function( action ){

		return function( req, res, next ){

			// All api calls are non blocking call (important)
			// otherwise, each requests would be slowed hugely
			next();

			if( req.sent.user && req.sent.user.isBot() ){
				return; print.info( req, 'Skipping the mailchimp update... (bearly)');
			}

			return Promise.resolve()
				.then(function(){

					if( action == "ensure_subscription" ){
						return ensureSubscription( req );
					}

					if( action == "update_member" ){
						return updateMember( req );
					}

					if( action == "delete_member"){
						return deleteMember( req );
					}

				})
				.catch(function( err ){
					erh.handleBackErr({
						err: err,
						err_ns: action,
						end_request: false,
						source: err.source || "mailchimp",
						msg: "Something went wrong in the mailchimp middleware"
					});
				});
		}
	}

	var ensureSubscription = function( req ){

		var err_ns = "mailchimp_ensure_subscription";
		var user   = req.sent.user;

		if( user.mailchimp_id ){
			return print.info( req, { mailchimp_id: user.mailchimp_id }, "User already has mailchimp_id. Skipping...");
		}

		if( !Mailchimp.isEmail( user.contact_email ) ){
			return print.warn( req, { email: user.contact_email }, "User has no mailchimp_id but his email is malformed. Skipping until next time...");
		}

		print.info( req, "User has no mailchimp_id and a valid email, subscribing now.");
		return Mailchimp.createMember({ email_address: user.contact_email })
			.then(function( member ){

				print.info( req, { mailchimp_id: member.id }, "Mailchimp's member created");
				return User.findOneAndUpdate(
					{
						facebook_id: user.facebook_id
					},
					{
						mailchimp_id: member.id
					},
					function( err, user ){

						if( err ) throw { err: err, source: "mongo", err_ns: err_ns }

						// Update the req.sent to prevent an infinite subscribe/update loop
						req.sent.user = user;

						print.info( req, "Member have been successfully subscribed");

						return Mailchimp.updateMember( req )
							.then(function(){
								print.info( req, "Member have been successfully patched");
							});
							// Do nothing, the proper error handling is already taken care of
							// inside the update member fonction, propagated either as a mongo err
							// or a mailchimp err
							

						

					});

			});
			
	};


	var updateMember = function( req ){

		var err_ns = "mailchimp_update_member";
		
		var user              = req.sent.user;
		var subscribed_emails = req.sent.app_preferences && req.sent.app_preferences.subscribed_emails;
		var contact_email     = req.sent.contact_email;

		if( !isMailchimpPatchNeeded( req, req.sent.user, req.sent ) ){
			return print.info( req, "User didnt update contact_email or subscription preferences, skippin...");
		}

		if( !user.mailchimp_id ){
			print.warn( req, "User doesnt have a mailchimp_id, trying subscription...");
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

		print.debug( req, patch );
		
		return Mailchimp.updateMember( user.mailchimp_id, patch )
			.then(function( member ){

				print.info( req, { mailchimp_id: member.id, email: member.email_address }, "Member has been patched successfully");
				user.mailchimp_id = member.id;

				return user.save(function( err ){
					if( err ) throw { err: err, source: "mongo" }
					
				});

			});


	};

	var deleteMember = function( req ){

		var err_ns = "mailchimp_delete_member";
		var user   = req.sent.user;

		if( !user.mailchimp_id ){
			return print.info( req, 'No mailchimp_id field, nothing to delete');
		}

		return Mailchimp.deleteMember( user.mailchimp_id )
			.then(function(){
				print.info( req, "Member have been removed from Mailchimp successfully");
			});

	};

	//Write the Mailchimp status each time the server is booted
	(function writeToFile(){

		var p1 = Mailchimp.writeMergeFieldsToFile( process.cwd() + '/json' );
		var p2 = Mailchimp.writeInterestCatsToFile( process.cwd() + '/json' );
		var p3 = Mailchimp.writeInterestsToFile( process.cwd() + '/json' );
		var p4 = Mailchimp.writeMembersToFile( process.cwd() + '/json' );

		Promise.all([ p1, p2, p3, p4 ])
			.catch(function( err ){
				print( req, "err",  err );
			});

	});


	function isMailchimpPatchNeeded( req, user, patch ){

		var is_patch_necessary = false;

		if( patch.contact_email && patch.contact_email != user.contact_email ){
			print.info( req, "Patch email necessary, user is updating his email");
			is_patch_necessary = true;
		}

		if( patch.app_preferences && patch.app_preferences.subscribed_emails ){
			Object.keys( patch.app_preferences.subscribed_emails ).forEach(function( key ){
				if( patch.app_preferences.subscribed_emails[ key ] != user.app_preferences.subscribed_emails[ key ] ){
					print.info( req, "Patch email necessary, user is updating his subscriptions preferences");
					is_patch_necessary = true;
				}
			});
		}

		[ "name", "age", "job" ].forEach(function( up_type ){

			if( patch[ up_type ] ){
				print.info( req, "Patch email necessary, user is updating his " + up_type);
				is_patch_necessary = true;
			}

		});
		
		return is_patch_necessary;
	}


	module.exports = {
		api: api
	};





	

