
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');

	var handleErr = eventUtils.raiseApiError;

	var setCache = function( req, res, next ){
		
		var err_ns = "set_cache";

		var facebook_id = req.sent.facebook_id;
		var profile_ns  = 'user_profile/' + facebook_id;
		var new_profile = settings.default_profile_values;

		_.keys( new_profile, function( key ){
			if( req.sent[ key ] && typeof req.sent[ key ] == typeof new_profile[ key ] ){
				new_profile[ key ] = req.sent[ key ];
			}
		});

		rd.hmset( profile_ns, new_profile, function( err, res ){

			if( err ){
				return handleErr( res, err_ns, err );
			}

			next();

		});

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
				return handleErr( res, err_ns, err );
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
					'img_vs' : user.img_vs
				};

				console.log('User found in cache, setting new_profile for user with facebook_id : ' + req.sent.facebook_id );

			}

			rd.hmset( profile_ns, new_profile, function( err, res ){

				if( err ){
					return handleErr( res, err_ns, err );
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
		rd.hgetall( profile_ns, function( err, user ){

			if( err ){
				return handleErr( res, err_ns, err );
			}

			if( !user ){

				console.log('User not found in cache, setting default values...');
				return setCache( req, res, next );

			} else {

				var updatedPictures = req.sent.updatedPictures;
				var mainified_picture = _.find( updatedPictures, function( el ){
						return el.action == "mainify"
					});

				if( !mainified_picture ){
					console.log('The main picture hasnt changed, cache remains the same');
					return next();
				}

				var new_main_place = mainified_picture.img_place;

				var user_new_main_pic = _.find( user.pictures, function( pic ){
					return pic.img_place == new_main_place;
				});

				var new_profile = {
					'img_id' : user_new_main_pic.img_id,
					'img_vs' : user_new_main_pic.img_version
				};

				console.log('User found in cache, new_profile');

				rd.hmset( profile_ns, new_profile, function( err, res ){

					if( err ){
						return handleErr( res, err_ns, err );
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
				return handleErr( req, err_ns, err );
			}

			if( !user ){

				console.log('User not found in cache, setting default values...');
				return setCache( req, res, next );

			} else {

				var new_profile = {
					'img_id' : img_id,
					'img_vs' : img_vs
				};

				console.log('User found in cache, new_profile');

				rd.hmset( profile_ns, new_profile, function( err, res ){

					if( err ){
						return handleErr( res, err_ns, err );
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