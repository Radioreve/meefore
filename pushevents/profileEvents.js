
	var User   = require('../models/UserModel');
	var mongoose   = require('mongoose');
	var Event      = require('../models/EventModel');
	var eventUtils = require('./eventUtils');
	var _          = require('lodash');
	var cloudinary = require('cloudinary');
	var config     = require('../config/config');
	var settings   = require('../config/settings');
	var validator  = require("validator");
	var moment 	   = require('moment');

    cloudinary.config({ 

		cloud_name : config.cloudinary.cloud_name,
		api_key    : config.cloudinary.api_key,
		api_secret : config.cloudinary.api_secret

	});

	var pusher = require('../services/pusher');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var updateProfile = function( req, res, next ){

		var err_ns = 'update_profile';
		var facebook_id = req.sent.facebook_id;

		var update = {};
		['name','age','job', 'location', 'ideal_night'].forEach(function( attr ){
			if( req.sent[ attr ] ){
				update[ attr ] = req.sent[ attr ];
			}
		});

		var callback = function( err, user ) {

	        if( err ) return handleErr( req, res, err_ns, err );
         
            console.log('Emtting event update profile success')
            req.sent.expose.user = user;

            next();
	    }
	
		User.findOneAndUpdate({ facebook_id: facebook_id }, update, { new: true }, callback );

	};

	var updatePicture = function( req, res, next ){

		var err_ns = 'update_picture_client';
		var user   = req.sent.user;

	   	var newimg_id   	= req.sent.img_id,
	    	newimg_version  = req.sent.img_version,
	    	img_place       = req.sent.img_place;

    	var i = _.findIndex( user.pictures, function( el ){
    		return el.img_place == img_place;
    	});

    	var new_picture = user.pictures[ i ];

		new_picture.img_id      = newimg_id;
		new_picture.img_version = newimg_version;

    	user.pictures.set( i, new_picture );
    	user.save(function( err, user ){

    		if( err ) return handleErr( req, res, err_ns, err );

    		req.sent.expose.user = user;
    		req.sent.expose.new_picture = new_picture;

    		// Used by cache mdw
    		req.sent.img_id = newimg_id;
    		req.sent.img_vs = newimg_version;

    		next();

	    });
	};


	var uploadPictureWithUrl = function( req, res, next ){

		var err_ns 	  = 'update_picture_url';
		var user  	  = req.sent.user;

		var url       = req.sent.url;
		var img_id	  = req.sent.img_id;
		var img_place = req.sent.img_place;

		cloudinary.uploader.upload( url, function( response ){

			var img_version = response.version + '';
			var img_id	    = response.public_id

			var picture = _.find( user.pictures, function( pic ){
				return pic.img_place == img_place;
			});

			picture.img_id  	= img_id;
			picture.img_version = img_version;

			user.pictures.set( img_place, picture );
			user.status = "idle";

			user.save(function( err, user ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.pictures = user.pictures;
				
				req.sent.img_id = img_id;
				req.sent.img_vs = img_version;
				next();

			});
		}, {
			public_id: img_id // Important, force the image id to have the defined pattern
		});
	};

	var updatePictures = function( req, res, next ){

		var err_ns = "update_pictures";

		var user   			 = req.sent.user;
		var updated_pictures = req.sent.updated_pictures;

		var old_main_picture;
		var mainified_picture = _.find( updated_pictures, function( el ){
			return el.action == "mainify"
		});

		if( mainified_picture && user.pictures[ mainified_picture.img_place ].img_id == settings.placeholder.img_id ){
			return handleErr( req, res, err_ns, { 'err_id': 'mainify_placeholder' });
		}

		// Store reference for criteria in Mongo update
		var current_main = _.find( user.pictures, function( el ){ 
			return el.is_main == true 
		});


		old_main_picture = current_main;

		for( var i = 0; i < updated_pictures.length; i++ ){

			var up_pic = updated_pictures[i];

			if( up_pic.action == "delete" && (up_pic.img_place == current_main.img_place )){
				return handleErr( req, res, err_ns, { 'err_id': 'delete_main_picture' });
			}

			var current_picture = _.find( user.pictures, function( el ){ 
					return el.img_place == updated_pictures[i].img_place
				});
			
			if( up_pic.action == "mainify" ){	
				current_main.is_main = false;
				user.pictures.set( parseInt( current_main.img_place ), current_main );
				current_picture.is_main = true;
				user.pictures.set( parseInt( current_picture.img_place ), current_picture );
			}


			if( up_pic.action == "delete" ){
				current_picture.img_id      = settings.placeholder.img_id;
				current_picture.img_version = settings.placeholder.img_version;
				user.pictures.set( parseInt( current_picture.img_place ), current_picture );
			}


			if( up_pic.action == "hashtag" ){
				current_picture.hashtag = up_pic.new_hashtag;
				user.pictures.set( parseInt( current_picture.img_place ), current_picture );
			}

		}

		// Saving picture modifications to user profile
		user.save(function( err, saved_user ){

			if( err ) return handleErr( req, res, err_ns, err );

			console.log('sending success');

			req.sent.expose.pictures = saved_user.pictures;

			next();


			// LEGACY -> NOW EACH TIME AN EVENT IS RENDERER, THUMB PICTURES ARE FETCHED
			// FROM CACHE WHICH IS ALWAYS UP TO DATE. NO NEED TO PROPAGATE THE CHANGES ANYMORE

			//Propagating to all events he's been in
			// console.log('Propagating photo update in all events');

			// var event_ids    = _.pluck( saved_user.events, 'event_id' );
			// var main_picture = _.find( saved_user.pictures, function( pic ){
			// 	return pic.is_main;
			// });

			// // Switch to true to match the criteria. Old pic is still tagged as main in events;
			// old_main_picture.is_main = true;

			// console.log( old_main_picture);
			// console.log( main_picture );

			// // Update events where he is host
			// Event.update({
			// 	'hosts.main_picture': old_main_picture
			// }, {
			// 	$set: {
			// 		'hosts.$.main_picture': main_picture
			// 	}
			// }, {
			// 	multi: true
			// }, function( err, raw ){

			// 	if( err ) return handleErr( req, res, err_ns, err );

			// 	console.log('Propagated as host in ' + raw.n + ' events' );

			// });

			// // Update events where he is asker
			// Event.update({
			// 	'groups.members.main_picture': old_main_picture
			// }, {
			// 	$set: {
			// 		'groups.members.$.main_picture': main_picture
			// 	}
			// }, {
			// 	multi: true
			// }, function( err, raw ){

			// 	if( err ) return handleErr( req, res, err_ns, err );

			// 	console.log('Propagated as member in ' + raw.n + ' events' );

			// });
		});
	};

	var fetchAndSyncFriends = function( req, res, next ){

		var err_ns = 'syncing_friends';

		var userId         = req.body.userId;
		var fb_friends_ids = req.body.fb_friends_ids || [];

		User.findByIdAndUpdate( userId, { friends: fb_friends_ids }, { new: true }, function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.friends = user.friends

			next();

		});

		// LEGACY -> NOW WE ONLY STORE FB_ID of friends ALONG WITH CACHE OPTIMISATION
		// MORE MAINTANABLE AND DECOUPLED		

		// User.find({ 

		// 	$or: [
		// 		{ _id: userId },
		// 		{ facebook_id: { $in: fb_friends_ids } }
		// 	]

		// }, function( err, users ){

		// 	var me      = _.find( users, function( el ){ return el._id == userId });
		// 	var friends = _.pull( users, me );

		// 	var filtered_friends = [];

		// 		friends.forEach(function( friend ){
		// 			var filtered_friend = [];
		// 			// filtered_friends.push( _.pick( friend, settings.public_properties.users ) );
		// 			filtered_friends.push( )
		// 		});

		// 		me.friends = filtered_friends;
		// 		me.save( function( err, me ){

		// 			if( err ) return handleErr( req, res );

		// 			eventUtils.sendSuccess( res, { friends: me.friends });
		// 		});

		// });

	};

	var fetchCloudinaryTags = function( req, res, next ){

		var facebook_id = req.sent.facebook_id;
		// Make sure all HTML Tags internally have a specific img_id pattern
		// So we can easily find them on cloudinary
		var cloudinary_tags = [];
		for( var i = 0; i < 5; i ++){
			cloudinary_tags.push( 
				cloudinary.uploader.image_upload_tag( 'hello_world' , {
					public_id: facebook_id + '--' + i 
				})
			);
		}

		req.sent.expose.cloudinary_tags = cloudinary_tags

		next();

	};

	var updateMeepass = function( req, res, next ){

		var err_ns = 'meepass';

		var sender   = req.sent.sender;
		var receiver = req.sent.receiver;

		var meepass_sent = {
			'type'    : 'sent',
			'sent_at' : moment().toISOString(),
			'sent_to' : receiver.facebook_id
		};

		var meepass_received = {
			'type'	  : 'received',
			'sent_at' : moment().toISOString(),
			'sent_by' : sender.facebook_id
		};

		sender.meepass.push( meepass_sent );
		receiver.meepass.push( meepass_received );

		sender.save(function( err ){

			if( err ) return handleErr( req, res, err_ns, err );

			receiver.save(function( err ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.meepass_sent = meepass_sent 
				
				next();

			});
		});
	};

	var updateSpotted = function( req, res, next ){

		var err_ns = 'spotted';

		var user 		= req.sent.user;
		var facebook_id = req.sent.facebook_id;

		var spotted_object = {
			"target_id"   : req.sent.target_id,
			"target_type" : req.sent.target_type,
			"spotted_at"  : moment().toISOString()
		};

		user.spotted.push( spotted_object );
		user.save(function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.spotted_object = spotted_object

			next();

		});
	};

	var updateShared = function( req, res, next ){

		var err_ns = 'shared';

		var user 	    = req.sent.user;
		var facebook_id = req.sent.facebook_id;

		var shared_by_object = {
			"share_type"  : "shared_by",
			"shared_by"   : facebook_id,
			"target_type" : req.sent.target_type,
			"target_id"   : req.sent.target_id,
			"shared_at"   : moment().toISOString()
		};

		var query   = { 'facebook_id': { '$in': req.sent.shared_with_new } };
		var update  = { '$push': { 'shared': shared_by_object }};
		var options = { 'multi': true } ;

		User.update( query, update, options, function( err, users ){

			if( err ) return handleErr( req, err, res, err_ns );

			user.markModified('shared');
			user.save(function( err, user ){

				if( err ) return handleErr( req, err, res, err_ns );

				req.sent.expose.user = user

				next();

			});
		});
	};

	var updateInviteCode = function( req, res, next ){

		var err_ns = 'invite_code';

		var facebook_id = req.sent.facebook_id;
		var invite_code = req.sent.invite_code;

		User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			if( !user ){
				return handleErr( req, res, err_ns, {
					'err_id'	  : 'ghost_user',
					'facebook_id' : facebook_id
				});
			}

			user.invite_code = invite_code;
			user.save(function( err, user ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.user = user

				next();

			});
		});	
	};

	var activateSponsor = function( req, res, next ){

		var err_ns = 'sponsor';

		var sponsor = req.sent.sponsor;
		var sponsee = req.sent.sponsee;

		sponsor.sponsees.push({
			'facebook_id'  : sponsee.facebook_id,
			'sponsored_at' : moment().toISOString()
		});

		sponsee.sponsor = {
			'facebook_id'  : sponsor.facebook_id,
			'sponsored_at' : moment().toISOString()
		};

		sponsor.save(function( err, sponsor ){

			if( err ) return handleErr( req, res, err_ns, err );

			sponsee.save(function( err, sponsee ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.user = sponsee
				
				next();

			});
		});
	};


	module.exports = {

		updateProfile        : updateProfile,
		updatePicture        : updatePicture,
		updatePictures       : updatePictures,
		uploadPictureWithUrl : uploadPictureWithUrl,
		fetchAndSyncFriends  : fetchAndSyncFriends,
		fetchCloudinaryTags  : fetchCloudinaryTags,
		updateMeepass 		 : updateMeepass,
		updateSpotted        : updateSpotted,
		updateShared 		 : updateShared,
		updateInviteCode     : updateInviteCode,
		activateSponsor 	 : activateSponsor
	    
	};