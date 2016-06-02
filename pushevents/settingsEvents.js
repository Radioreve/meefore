
	var mongoose     = require('mongoose');
	var _            = require('lodash');
	var validator    = require('validator');
	var moment		 = require('moment');
	var querystring  = require('querystring');
	var request      = require('request');

	var User 	     = require('../models/UserModel');
	var config       = require('../config/config');
	var settings     = require('../config/settings');
	var Before 	     = require('../models/BeforeModel');
	var eventUtils   = require('./eventUtils');

	// shyMerge function by Léo Jacquemin :)
	// @params  a{ object }
	// @params  b{ object }
	// @returns o{ object }
	// This function copies b prooerties in the a object, only if they
	// already exist in the a object and have the same type. Its like a safe "replace";
	// Works recursively throughout all the keys of course
	// The behavior can be easily altered to allow the b object to copy "new keys", even if
	// they are not present in the a object. 
	function shyMerge( a, b ){

		var o = {};
	  	var distinct_keys = [];
	  
		for( key in a ){
	  		distinct_keys.push( key );
	  	}
	  
	  	for( key in b ){
		  	if( distinct_keys.indexOf( key ) == -1 ){
		    	distinct_keys.push( key );
		  	}
	  	}
	  
	 	 distinct_keys.forEach(function( key ){
		  	
		    if( !a[ key ] ){
		    	return;
		    }
		    
		    if( a[ key ] && !b[ key ] ){
		    	return o[ key ] = a[ key ];
		    }
		    
		    if( a[ key ] && b[ key ] && (typeof a[ key ] == typeof b[ key ]) ){
		    	
		      if( typeof a[ key ] == "object" ){
		      	return o[ key ] = shyMerge( a[ key ], b[ key ] );
		      } else {
		      	return o[ key ] = b[ key ];
		      }
		    	
		    } else {

		    	o[ key ] = a[ key ];

		    	// Useful for the other version
		    	// throw {
		     //   		error: 'These two objects have different type for the same key ('+ key +') skipping...',
		     //    	typeof_a: typeof a[ key ],
		     //    	typeof_b: typeof b[ key ]
		     //  	};
		    }
	    
	 	});
	  
	  	return o;

	}




	var settings_ns = 'update_settings';
	
	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

    var updateSettings = function( req, res, next ){

    	var app_preferences = req.sent.app_preferences;
    	var facebook_id	    = req.sent.user_id;


    	User.findOne({ facebook_id: facebook_id }, function( err, user ){

    		if( err ) return handleErr( req, res, err_ns, err );

    		if( !user ){
    			return handleErr( req, res, err_ns, {
    				err_id: 'ghost_user'
    			})
    		}

    		user.app_preferences = shyMerge( user.app_preferences, app_preferences );
    		user.save(function( err, user ){

    			if( err ) return handleErr( req, res, err_ns, err );

	    		req.sent.expose.user = user;
	    		next();

    		});

    	});

	};

	var updateSettingsContact = function( req, res, next ){

		var contact_email = req.sent.contact_email;
		var facebook_id   = req.sent.user_id;

		var update = {
			contact_email: contact_email
		};

		if( req.sent.mailchimp_id ){
			console.log('Updating also mailchimp_id, new is: ' + req.sent.mailchimp_id );
			update.mailchimp_id = req.sent.mailchimp_id
		}

		console.log('Updating contact email (' + contact_email + ') for facebook_id: ' + facebook_id );

		User.findOneAndUpdate(
			{ facebook_id: facebook_id },
			update,
			{ new: true },
			function( err, user ){

			if( err ){
    			return handleErr( req, res, settings_ns, {
    				err_id: 'saving_to_db'
    			});
    		}
    		
    		req.sent.expose.user = user;
    		next();

		});
	};

	var deleteProfile = function( req, res, next ){

		var facebook_id = req.sent.user_id;

		console.log('Deleting profile ' + facebook_id + ' and everything associated with it..');
		console.log('Good bye ' + req.sent.user.name + '..');

		User.update({ 'friends': facebook_id }, { $pull: { 'friends': facebook_id } }, { multi: true },
			function( err, users ){

			if( err ){
    			return handleErr( req, res, settings_ns, {
    				err_id: 'saving_to_db'
    			});
    		}

			User.findOneAndRemove({ facebook_id: facebook_id }, function( err, user ){
				
				if( err ){
	    			return handleErr( req, res, settings_ns, {
	    				err_id: 'saving_to_db'
	    			});
	    		}

				next();


			});

		});

	};

    module.exports = {
		updateSettings        : updateSettings,
		updateSettingsContact : updateSettingsContact,
		deleteProfile 		  : deleteProfile
    };