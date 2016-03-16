
	var User 	   = require('../models/UserModel'),
		Event 	   = require('../models/EventModel'),
		Place 	   = require('../models/PlaceModel'),
		_   	   = require('lodash'),
		rd 		   = require('../services/rd'),
		settings   = require('../config/settings'),
		eventUtils = require('../pushevents/eventUtils');
 

	var handleErr = eventUtils.raiseApiError;

	/* get /users/me */
	var fetchMe = function( req, res, next ){

		var err_ns = 'fetching_me';
		var userId = req.sent.user_id;

		if( !userId ){
			return handleErr( res, err_ns, {
				'err_id' : 'missing_id',
				'msg'    : 'Missing the user_id field from the request'
			});
		}

		User.findById( userId, function( err, user ){

			if( err ){
				return handleErr( res, 'fetching_me', err );
			}

			req.sent.expose = {
				me 		 : user,
				settings : settings
			};

			next();

		});

	};

	/*  get /users/:facebook_id */
	var fetchUserById_Full = function( req, res ){

		var err_ns = 'fetching_user_full';
		var facebook_id = req.sent.facebook_id;

		if( !facebook_id )
			return handleErr( res, err_ns, {
				'err_id' : 'missing_facebook_id',
				'msg'    : 'Missing the facebook_id field from the request',
				'facebook_id': facebook_id
			});

		User.findOne({ facebook_id: facebook_id }, function( err, user ){

			if( err ){
				return handleErr( res, err_ns, err );
			}

			if( !user ){
				return handleErr( res, err, {
					'err_id' 	  : 'ghost_user',
					'msg'         : 'No user was found with this id in the database in the database',
					'facebook_id' : facebook_id
				});
			}

			var expose = {
				'user': user 
			};

			res.json( expose );

		});

	};

	// Used to check for redis 
	var fetchUserById_Core = function( req, res ){

		var facebook_id = req.sent.facebook_id;
		var error_ns    = 'fetching_user_core';

		if( !facebook_id ){
			return handleErr( res, error_ns, {
				'err_id': 'no_facebook_id',
				'msg'   : 'Unable to retrieve facebook_id value in the body of the request'
			});
		}

		var profile_ns = 'user_profile/' + facebook_id;
		rd.hgetall( profile_ns, function( err, user ){

			if( err ){
				return handleErr( res, 'api_error', err );
			}

			if( !user ){

				console.log('User wasnt found in cache, looking in Db...');
				User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

					if( err ){
						return handleErr( res, 'api_error', [err] );
					}

					if( !user ){
						return handleErr( res, error_ns, {
							'err_id': 'no_user_found',
							'msg'   : 'Unable to find user either in cache or database'
						});
					}

					console.log('...user found! Name is : ' + user.name );
					var user_main_img = _.find( user.pictures, function( pic ){
						return pic.is_main == true; 
					});

					// Important to construct the object the same way as it is in the cache 
					// to keep the result consistant
					var user = {
						'facebook_id' : user.facebook_id,
						'name' 		  : user.name,
						'age' 		  : user.age,
						'job' 		  : user.job,
						'img_id'	  : user_main_img.img_id,
						'img_vs'	  : user_main_img.img_version
					};

					req.sent.expose = {
						'user': user
					};
					
					next();

				});

			} else {

				req.sent.expose = {
					'user': user
				};
					
				next();

			}

		});

	}

	/* get /users?name=... */
	var fetchUsers = function( req, res ){

		var err_ns = 'fetching_users_by_name';

		if( _.keys( req.sent ).length == 0 ){
			return fetchUsersAll( req, res );
		}

		var user_name = req.sent.name,
			pattern   = '^' + user_name;

		var select = {};
		['name', 'pictures', 'age', 'job', 'location', 'facebook_id'].forEach(function( prop ){
			select[ prop ] = 1;
		});

		User
			.find({ 
				'name': { $regex: pattern, $options: 'i' }
			})
			.select( select )
			.limit( 10 )
			.exec(function( err, users ){

				if( err ){
					return handleErr( res, err_ns, err );
				}

				req.sent.expose = {
					'users': users
				};

				next();

			});
	};

	var fetchUsersAll = function( req, res ){

		var err_ns = 'fetching_users_all';

		var select = {};
		settings.public_properties.users.forEach(function( prop ){
			select[ prop ] = 1;
		});

		User
			.find()
			.select( select )
			.exec(function( err, users ){

				if( err ){
					return handleErr( res, err_ns, err );
				}

				req.sent.expose = {
					'users': users
				}
				
				next();

			});

	};

	var fetchUserEvents = function( req, res ){

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
						return handleErr( err, err_ns, err );
					}

					req.sent.expose = {
						'events': events
					};
					
					next();

				});

	};

	module.exports = {
		fetchMe 				: fetchMe,
		fetchUserById_Full	    : fetchUserById_Full,
		fetchUserById_Core		: fetchUserById_Core,
		fetchUsers 				: fetchUsers,
		fetchUserEvents 		: fetchUserEvents
	};