
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var User 	   = require('../models/UserModel');

	var handleErr = eventUtils.raiseApiError;

	// It's normally impossible for a user to expose its default values
	// Because as soon as he registers, he uploads his main picture with his 
	// Facebook profile picture, setting gender && cc.

	var setCache = function( req, res, next ){
		
		var err_ns = "set_cache";

		var user_profile = req.sent.user;
		var profile_ns  = 'user_profile/' + user_profile.facebook_id;

		if( !user_profile ){
			console.log('No user profile was provided, looking in Db...');

			User.findOne({ facebook_id: user_profile.facebook_id }, function( err, user ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				}

				if( !user ){
					console.log('Definitly unable to find the user, skipping cache set...');
					return next();
				}

				// Augment the req object with user and call fn again
				console.log('...done!');
				req.sent.user = user;
				return setCache( req, res, next );


			});

		} else {
			
			// Reseting the profile cache
			console.log('Reseting the profile cache...');
			var user = req.sent.user;

			var main_pic = _.find( user.pictures, function(p){
				return p.is_main
			});

			var new_profile = {
				'name' 	 : user.name,
				'age'  	 : user.age,
				'job'  	 : user.job,
				'img_id' : main_pic.img_id,
				'img_vs' : main_pic.img_version,
				'g' 	 : user.gender,
				'cc'     : user.country_code

			};

			rd.hmset( profile_ns, new_profile, function( err, res ){

				if( err ) return handleErr( req, res, err_ns, err );
				
				console.log('...done!');
				next();

			});

		}


	};


	var updateCache = function( cache_type ){

		if( cache_type == "base" ){
			return updateCache_Base
		}

		if( cache_type == "picture_mainify" ){
			return updateCache_PictureMainify
		}

		if( cache_type == "picture_upload" )
			return updateCache_PictureUpload


	};

	function updateCache_Base( req, res, next ){

		var err_ns = "update_cache_base";

		var facebook_id = req.sent.facebook_id;
		console.log('Facebook at entry in cache : ' + facebook_id );
		
		var profile_ns = 'user_profile/' + facebook_id;
		rd.hgetall( profile_ns, function( err, user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !user ){
				console.log('User not found in cache, setting default values...');
				return setCache( req, res, next );

			} else {
				var new_profile = {
					'name' 	 : req.sent.name || user.name,
					'age'  	 : req.sent.age  || user.age,
					'job'  	 : req.sent.job  || user.job,
					'img_id' : user.img_id,
					'img_vs' : user.img_vs,
					'g' 	 : user.gender,
					'cc'     : user.country_code
				};

				console.log('User found in cache, setting new_profile for user with facebook_id : ' + req.sent.facebook_id );

			}

			rd.hmset( profile_ns, new_profile, function( err, res ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				}

				next();

			});

		});


	}

	function updateCache_PictureMainify( req, res, next ){
			
		var err_ns = "update_cache_pictures";

		var user   	    = req.sent.user;
		var facebook_id = req.sent.facebook_id;

		var profile_ns = 'user_profile/' + facebook_id;
		rd.hgetall( profile_ns, function( err, cached_user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !cached_user ){

				console.log('User not found in cache, setting default values...');
				return setCache( req, res, next );

			} else {

				var updated_pictures   = req.sent.updated_pictures;
				var mainified_picture = _.find( updated_pictures, function( el ){
						return el.action == "mainify"
					});

				if( !mainified_picture ){
					console.log('The main picture hasnt changed, cache remains the same');
					return next();
				}

				console.log('User found in cache, setting new profile... ');
				console.log('mainified_picture = ' + JSON.stringify( mainified_picture, null, 3 ));

				var new_main_place = mainified_picture.img_place;

				var user_new_main_pic = _.find( user.pictures, function( pic ){
					return pic.img_place == new_main_place;
				});

				var new_profile = {
					'img_id' : user_new_main_pic.img_id,
					'img_vs' : user_new_main_pic.img_version
				};

				rd.hmset( profile_ns, new_profile, function( err, res ){

					if( err ){
						return handleErr( req, res, err_ns, err );
					}

					next();

				});
			}
						
		});

	}

	function updateCache_PictureUpload( req, res, next ){

		var err_ns = "user_cache_picture_url";
		
		var user        = req.sent.user;
		var facebook_id = req.sent.facebook_id;
		var img_id      = req.sent.img_id;
		var img_vs      = req.sent.img_vs;
		var img_place   = req.sent.img_place;

		var main_pic = _.find( user.pictures, function( pic ){
			return pic.is_main; 
		});

		if( main_pic.img_place != img_place ){
			console.log('Uploaded a picture that is not a main picture, skipping cache updating...');
			return next();
		}

		var profile_ns  = 'user_profile/' + facebook_id;
		rd.hgetall( profile_ns, function( err, user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !user ){

				console.log('User not found in cache, setting default values...');
				return setCache( req, res, next );

			} else {

				var new_profile = {
					'img_id' : img_id,
					'img_vs' : img_vs,
					'g'	     : user.gender,
					'cc' 	 : user.country_code
				};

				console.log('User found in cache, new_profile');

				rd.hmset( profile_ns, new_profile, function( err, res ){

					if( err ){
						return handleErr( req, res, err_ns, err );
					}

					next();

				});
			}
		});
	}



	module.exports = {
		setCache 	: setCache,
		updateCache : updateCache
	};