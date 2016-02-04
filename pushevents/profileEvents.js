
	var User   = require('../models/UserModel');
	var mongoose   = require('mongoose');
	var Event      = require('../models/EventModel');
	var eventUtils = require('./eventUtils');
	var _          = require('lodash');
	var cloudinary = require('cloudinary');
	var config     = require('../config/config');
	var settings   = require('../config/settings');
	var validator  = require("validator");

	    cloudinary.config({ 

			cloud_name : config.cloudinary.cloud_name,
			api_key    : config.cloudinary.api_key,
			api_secret : config.cloudinary.api_secret

		});

	var pusher = require('../services/pusher');

	var handleErr = function( res, errors ){
		eventUtils.raiseApiError( res, 'update_profile', errors );
	}

	var updateProfile = function( req, res ){

			var data = req.body;

			var userId = req.body.userId;

			if( !validator.isInt( data.age ) ){
				return handleErr( res, [{
					'err_id': 'age_no_int',
					'age_sent': data.age
				}]);
			}

			var update = {
				name   : data.name,
				age    : data.age,
				motto  : data.motto,
				drink  : data.drink,
				mood   : data.mood,
				job    : data.job,
				status : data.status
			};

			var callback = function( err, user ) {

		        if( err ) return handleErr( res );
	         
	            console.log('Emtting event update profile success')
	            var expose = { user: user };
	            eventUtils.sendSuccess( res, expose );
		    }
		
			User.findByIdAndUpdate( userId, update, { new: true }, callback );

	};

	var updatePicture = function( req, res ){

		var data = req.body;

	   	var userId 		    = data._id,
	        newimg_id   	= data.img_id,
	    	newimg_version  = data.img_version,
	    	img_place       = data.img_place;

	    console.log('New img id : ' + newimg_id );
	    User.findById( userId, function( err, myUser ){

	    	if( err ) return handleErr( res );

	    	var i = _.findIndex( myUser.pictures, function( el ){
	    		return el.img_place == img_place;
	    	});

	    	var newPicture = myUser.pictures[i];

	    	if( newPicture == undefined ) return handleErr( res );

			newPicture.img_id      = newimg_id;
			newPicture.img_version = newimg_version;

	    	myUser.pictures.set( i, newPicture );
	    	myUser.save(function( err, savedUser ){

	    		if( err ) return handleErr( res );

	    		eventUtils.sendSuccess( res, { user: savedUser, msg: "Votre photo a été uploadée" });

	    	});
	    });
	};


	var updatePictureWithUrl = function( req, res ){

		var userId    = req.body.userId,
			url       = req.body.url,
			img_id	  = req.body.img_id,
			img_place = req.body.img_place;

		cloudinary.uploader.upload( url, function( response ){

			User.findById( userId, function( err, user ){

				if( err ) return handleErr( res );

				var picture = _.find( user.pictures, function( pic ){
					return pic.img_place == img_place;
				});

				if( typeof picture == 'undefined' ) return handleErr( res );

				picture.img_id  	= img_id;
				picture.img_version = response.version + '';

				user.pictures.set( img_place, picture );
				user.status = "idle";

				user.save(function( err ){

					if( err ) return handleErr( res );

					res.json({ 
						msg         : "Votre photo a été chargée à partir de Facebook",
						img_id      : img_id,
						img_version : response.version
					});

				});
							
			});
		}, {
			public_id: img_id // Important, force the image id to have the defined pattern
		});

	};

	var updatePictures = function( req, res ){

		console.log('updating all pictures');
		var data = req.body;

		var updatedPictures = data.updatedPictures,
			userId			= data.userId;

		var old_main_picture;

		User.findById( userId, function( err, myUser ){

			if( err ) return handleErr( res );

			var mainified_picture = _.find( updatedPictures, function( el ){
			 return el.action == "mainify"
			});

			if( mainified_picture && myUser.pictures[ mainified_picture.img_place ].img_id == settings.placeholder.img_id ){
				return handleErr( res, [{ 'err_id': 'mainify_placeholder' }] );
			}

			// Store reference for criteria in Mongo update
			var current_main = _.find( myUser.pictures, function( el ){ 
					return el.is_main == true 
				});
			old_main_picture = current_main;

			for( var i = 0; i < updatedPictures.length; i++ ){

				var current_picture = _.find( myUser.pictures, function( el ){ 
						return el.img_place == updatedPictures[i].img_place
					});
				
				if( updatedPictures[i].action == "mainify" )
				{	

					current_main.is_main = false;

					myUser.pictures.set( parseInt( current_main.img_place ), current_main );
					current_picture.is_main = true;
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );

				}

				if( updatedPictures[i].action == "delete" )
				{
					current_picture.img_id      = settings.placeholder.img_id;
					current_picture.img_version = settings.placeholder.img_version;
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );
				}

				if( updatedPictures[i].action == "hashtag" )
				{
					current_picture.hashtag = updatedPictures[i].new_hashtag;
					myUser.pictures.set( parseInt( current_picture.img_place ), current_picture );
				}

			}

			// Saving picture modifications to user profile
			myUser.save(function( err, saved_user ){

				if( err ) return handleErr( res );

				console.log('sending success');
				eventUtils.sendSuccess( res, { msg: "Mise à jour effectuée!", pictures: saved_user.pictures });

				//Propagating to all events he's been in
				console.log('Propagating photo update in all events');

				var event_ids = _.pluck( saved_user.events, 'event_id' );
				var main_picture = _.find( saved_user.pictures, function( pic ){
					return pic.is_main;
				});

				// Switch to true to match the criteria. Old pic is still tagged as main in events;
				old_main_picture.is_main = true;

				console.log( old_main_picture);
				console.log( main_picture );

				// Update events where he is host
				Event.update({
					'hosts.main_picture': old_main_picture
				}, {
					$set: {
						'hosts.$.main_picture': main_picture
					}
				}, {
					multi: true
				}, function( err, raw ){
					if( err ) return console.log( err );
					console.log('Propagated as host in ' + raw.n + ' events' );
				});

				// Update events where he is asker
				Event.update({
					'groups.members.main_picture': old_main_picture
				}, {
					$set: {
						'groups.members.$.main_picture': main_picture
					}
				}, {
					multi: true
				}, function( err, raw ){
					if( err ) return console.log( err );
					console.log('Propagated as member in ' + raw.n + ' events' );
				});

			});


		});
	};

	var fetchAndSyncFriends = function( req, res ){

			var userId         = req.body.userId;
			var fb_friends_ids = req.body.fb_friends_ids || [];

		User.find({ $or: [{ _id: userId },{ facebook_id: { $in: fb_friends_ids } }]}, function( err, users ){

			var mySelf           = _.find( users, function( el ){ return el._id == userId });
			var friends          = _.pull( users, mySelf );
			var filtered_friends = [];

				friends.forEach(function(friend){
					var filtered_friend = {};
					filtered_friends.push( _.pick( friend, settings.public_properties.users ) );
				});

				mySelf.friends = filtered_friends;
				mySelf.save( function( err, mySelf ){

					if( err ) return handleErr( res );

					eventUtils.sendSuccess( res, { friends: mySelf.friends });
				});

		});

	};

	var fetchCloudinaryTags = function( req, res ){

		var userId = req.sent.user_id;
		// Make sure all HTML Tags internally have a specific img_id pattern
		// So we can easily find them on cloudinary
		var cloudinary_tags = [];
		for( var i = 0; i < 5; i ++){
			cloudinary_tags.push( 
				cloudinary.uploader.image_upload_tag( 'hello_world' , {
					public_id: userId + '--' + i 
				})
			);
		}

		eventUtils.sendSuccess( res, { cloudinary_tags: cloudinary_tags });

	};


	module.exports = {

		updateProfile        : updateProfile,
		updatePicture        : updatePicture,
		updatePictures       : updatePictures,
		updatePictureWithUrl : updatePictureWithUrl,
		fetchAndSyncFriends  : fetchAndSyncFriends,
		fetchCloudinaryTags  : fetchCloudinaryTags
	    
	};