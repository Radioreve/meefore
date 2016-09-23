	
	var _          = require('lodash');
	var User       = require('../models/UserModel');
	var config     = require('../config/config');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var log 	   = require('../services/logger');
	var print 	   = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/onboarding.js' );
	var erh 	   = require('../services/err');


	// This checks if any new onboarding content has been defined that the user isnt aware of
	// The list of current onboarding is settings.js. It's the clients responsability to implement
	// it and let the server know that any particular onboarding material has been completed.
	var setOnboardings = function( req, res, next ){

		var err_ns = "setting_onboarding";
		var user   = req.sent.user;

		if( !Array.isArray( user.onboarding ) ){
			user.onboarding = [];
		}

		var update_needed = false;
		settings.onboarding_ids.forEach(function( onb_id ){

			var onboarding = _.find( user.onboarding, function( o ){
				return o.onboarding_id == onb_id;
			});

			if( !onboarding ){
				update_needed = true;
				user.onboarding.push({
					onboarding_id : onb_id,
					seen_at       : null
				});
			}

		});

		if( !update_needed ){
			print.info( req, 'Updating the onboarding not necessary, user up to date.');
			return next();
		}

		user.markModified('onboarding');
		user.save(function( err, user ){

			if( err ) return erh.handleDbErr( req, res, err_ns, err, "mongo" );

			req.sent.expose.user = user;
			next();

		});
		

	};


	module.exports = {
		setOnboardings: setOnboardings
	};