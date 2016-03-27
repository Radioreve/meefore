
	var User 	   = require('../models/UserModel');
	var Event 	   = require('../models/EventModel');
	var Place 	   = require('../models/PlaceModel');
	var _   	   = require('lodash');
	var rd 		   = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var mailer     = require('../services/mailer');



	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var select = {};
		settings.public_properties.users.forEach(function( prop ){
			select[ prop ] = 1;
		});

	/* get /users/me */
	var fetchMe = function( req, res, next ){

		var err_ns 		= 'fetching_me';
		var facebook_id = req.sent.facebook_id;

		if( !facebook_id ){
			return handleErr( req, res, err_ns, {
				'err_id' : 'missing_id',
				'msg'    : 'Missing the user_id field from the request'
			});
		}

		User.findOne({ facebook_id: facebook_id }, function( err, user ){

			if( err ){
				return handleErr( req, res, 'fetching_me', err );
			}

			req.sent.expose.me = user;
			req.sent.expose.settings = settings; 

			next();

		});

	};

	var fetchUserShared = function( req, res, next ){

		var err_ns 		= 'fetching_me_shared';
		var facebook_id = req.sent.facebook_id;

		console.log('Fetching shared prop for user with id : ' + facebook_id );

		User
			.findOne({ facebook_id: facebook_id })
			.select({ 'shared': 1 })
			.exec(function( err, user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !user ){
				return handleErr( req, res, err, {
					'err_id' 	  : 'ghost_user',
					'msg'         : 'No user was found with this id in the database in the database',
					'facebook_id' : facebook_id
				});
			}

			console.log( user );

			req.sent.expose.shared = user.shared;
			next();

			});

	};

	var fetchUserMeepass = function( req, res, next ){

		var err_ns 		= 'fetching_me_meepass';
		var facebook_id = req.sent.facebook_id;

		User
			.findOne({ facebook_id: facebook_id })
			.select({ 'meepass': 1 })
			.exec(function( err, user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !user ){
				return handleErr( req, res, err, {
					'err_id' 	  : 'ghost_user',
					'msg'         : 'No user was found with this id in the database in the database',
					'facebook_id' : facebook_id
				});
			}

			req.sent.expose.meepass = user.meepass;
			next();

			});

	};

	/*  get /users/:facebook_id */
	var fetchUserById_Full = function( req, res, next ){

		var err_ns = 'fetching_user_full';
		var facebook_id = req.sent.facebook_id;

		if( !facebook_id )
			return handleErr( req, res, err_ns, {
				'err_id' : 'missing_facebook_id',
				'msg'    : 'Missing the facebook_id field from the request',
				'facebook_id': facebook_id
			});

		User
			.findOne({ facebook_id: facebook_id })
			.select( select )
			.exec(function( err, user ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			if( !user ){
				return handleErr( req, res, err, {
					'err_id' 	  : 'ghost_user',
					'msg'         : 'No user was found with this id in the database in the database',
					'facebook_id' : facebook_id
				});
			}

			req.sent.expose.user = user;

			next();

		});

	};

	// Used to check for redis 
	var fetchUserById_Core = function( req, res, next ){

		var facebook_id = req.sent.facebook_id;
		var error_ns    = 'fetching_user_core';

		if( !facebook_id ){
			return handleErr( req, res, error_ns, {
				'err_id': 'no_facebook_id',
				'msg'   : 'Unable to retrieve facebook_id value in the body of the request'
			});
		}

		var profile_ns = 'user_profile/' + facebook_id;
		rd.hgetall( profile_ns, function( err, user ){

			if( err ){
				return handleErr( req, res, 'api_error', err );
			}

			if( !user ){

				console.log('User wasnt found in cache, looking in Db...');
				User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

					if( err ){
						return handleErr( req, res, 'api_error', [err] );
					}

					if( !user ){
						console.log('User wasnt found either in cache or in db');
						return next();
					}

					console.log('...user found! Name is : ' + user.name );
					var user_main_img = _.find( user.pictures, function( pic ){
						return pic.is_main == true; 
					});

					// Important to construct the object the same way as it is in the cache 
					// to keep the result consistant
					var user = {
						'facebook_id' : facebook_id,
						'name' 		  : user.name,
						'age' 		  : user.age,
						'job' 		  : user.job,
						'img_id'	  : user_main_img.img_id,
						'img_vs'	  : user_main_img.img_version
					};

					req.sent.expose.user = user;
					
					next();

				});

			} else {

				req.sent.expose.user = user;
				req.sent.expose.user.facebook_id = facebook_id;
					
				next();

			}

		});

	}

	/* get /users?name=... */
	var fetchUsers = function( req, res, next ){

		var err_ns = 'fetching_users_by_name';

		if( _.keys( req.sent ).length == 0 ){
			return fetchUsersAll( req, res );
		}

		var user_name = req.sent.name,
			pattern   = '^' + user_name;

		User
			.find({ 
				'name': { $regex: pattern, $options: 'i' }
			})
			.select( select )
			.limit( 10 )
			.exec(function( err, users ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				}

				req.sent.expose.users = users;


				next();

			});
	};

	var fetchUsersAll = function( req, res, next ){

		var err_ns = 'fetching_users_all';

		User
			.find()
			.select( select )
			.exec(function( err, users ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				}

				req.sent.expose.users = users;
				
				next();

			});

	};

	var fetchUserEvents = function( req, res, next ){

		var err_ns = 'fetching_user_events';
		var facebook_id = req.sent.facebook_id;

		console.log('Fetching personnal event for facebook_id: ' + facebook_id );
		
		Event
			.find(
				{
					'status': { $in: ['open','suspended'] },
					 $or: 
						[ 
							{ 'groups.members.facebook_id' : facebook_id },
							{ 'hosts.facebook_id' : facebook_id }
						]

				},
				function( err, events ){

					if( err ){
						return handleErr( req, res, err_ns, err );
					}

					req.sent.expose.events = events;
					
					next();

				});

	};

	var getMailchimpStatus = function( req, res, next ){

		var err_ns       = 'mailchimp_status';
		var mailchimp_id = req.sent.user.mailchimp_id;

		if( !mailchimp_id ){
			return handleErr( req, res, err_ns, {
				err_id: 'ghost_mailchimp_id',
				mailchimp_id: mailchimp_id
			});
		}

		mailer.getMailchimpUser( mailchimp_id, function( err, res ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			req.sent.expose.mailchimp_data = res;
			next();

		});

	};

	module.exports = {
		fetchMe 				: fetchMe,
		fetchUserShared			: fetchUserShared,
		fetchUserMeepass 		: fetchUserMeepass,
		fetchUserById_Full	    : fetchUserById_Full,
		fetchUserById_Core		: fetchUserById_Core,
		fetchUsers 				: fetchUsers,
		fetchUsersAll 			: fetchUsersAll,
		fetchUserEvents 		: fetchUserEvents,
		getMailchimpStatus 		: getMailchimpStatus
	};