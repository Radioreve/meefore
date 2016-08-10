	
	var _          = require('lodash');
	var User       = require('../models/UserModel');
	var config     = require('../config/config');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

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
			console.log('Updating the onboarding unnecessary, user up to date.');
			return next();
		}

		user.markModified('onboarding');
		user.save(function( err, user ){

			if( err ) return handleErr( req, res, err, err_ns );

			req.sent.expose.user = user;
			next();

		});
		

	};


	module.exports = {
		setOnboardings: setOnboardings
	};