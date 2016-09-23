
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var User 	   = require('../models/UserModel');
	var print      = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/profile_watcher.js' )


	var updateCachedProfile = function( req, res, next ){

		print.info( req, "Updating cached profile");

		var err_ns = "update_cache_base";

		var facebook_id = req.sent.facebook_id;
		var user 		= req.sent.user;

		if( !user ){
			print.warn( req, 'Unable to find user object, make sure it was populated' );
			return next();
		}

		var main_img = _.find( user.pictures, function( img ){
			return img.is_main;
		});

		var profile_ns = 'user_profile/' + facebook_id;
		var updated_profile = {
			'name' 	 : user.name,
			'age'  	 : user.age,
			'job'  	 : user.job,
			'img_id' : main_img.img_id,
			'img_vs' : main_img.img_version,
			'g' 	 : user.gender,
			'cc'     : user.country_code
		};

		rd.hmset( profile_ns, updated_profile, function( err, res ){

			if( err ){
				print.warn( req, "Error saving to redis");
				erh.handleDbErr( err_ns, err, "redis" );
				return next();
			}

			var one_week = 604800;
			rd.expire( profile_ns, one_week, function( err, res ){

				if( err ){
					erh.handleDbErr( err_ns, err, "redis" );
				}
				
				next();

			});
			

		});

	}


	module.exports = {
		updateCachedProfile: updateCachedProfile
	};