
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var User 	   = require('../models/UserModel');
	var eventUtils = require('../pushevents/eventUtils');

	var handleErr = eventUtils.raiseApiError;

	var setCache = function( req, res, next ){

		var facebook_id = req.sent.facebook_id;

		var name 		= req.sent.name   || settings.default_profile_values.name;
		var age 		= req.sent.age    || settings.default_profile_values.age;
		var job 		= req.sent.job    || settings.default_profile_values.job;
		var img_id      = req.sent.img_id || settings.default_profile_values.img_id;
		var img_vs 		= req.sent.img_vs || settings.default_profile_values.img_vs;

		var profile_ns = 'user_profile/' + facebook_id;

		rd.hmset( profile_ns, {

			'name'   : name,
			'age'    : age,
			'job'	 : job,
			'img_id' : img_id,
			'img_vs' : img_vs

		}, function( err, res ){

			if( err ){
				return handleErr( res, 'setting_profile_cache', [err] );
			}

			next();

		});


	};	


	module.exports = {
		setCache:    setCache
	};