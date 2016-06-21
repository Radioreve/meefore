
	var User 	   = require('../models/UserModel');
	var Before 	   = require('../models/BeforeModel');
	var Place 	   = require('../models/PlaceModel');
	var _   	   = require('lodash');
	var rd 		   = require('../services/rd');
	var md5 	   = require('blueimp-md5');
	var connecter  = require('../middlewares/connecter');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var mailer     = require('../services/mailer');
	var moment	   = require('moment');


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

	var fetchMe = function( req, res, next ){

		var err_ns 		= 'fetching_me';
		var facebook_id = req.sent.user_id;

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

			req.sent.expose.me       = user;
			req.sent.expose.settings = settings; 

			next();

		});

	};

	var fetchFriends = function( req, res, next ){

		var err_ns      = "fetching_user_friends";
		var facebook_id = req.sent.user_id;

		User.findOne({ 'facebook_id': facebook_id }, function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			if( !user ){
				return handleErr( req, res, err_ns, {
					'err_id'      : 'ghost_user',
					'facebook_id' : facebook_id
				});
			}

			req.sent.expose.friends = user.friends;
			next();

		});			

	};

	var fetchUserShared = function( req, res, next ){

		var err_ns 		= 'fetching_me_shared';
		var facebook_id = req.sent.user_id;

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
		var facebook_id = req.sent.user_id;

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
		var facebook_id = req.sent.user_id;

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

		console.log('Fetching user by id (core)...');
		
		var facebook_id = req.sent.user_id;
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
			.limit( 9 )
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

		var err_ns = 'fetching_user_befores';
		var facebook_id = req.sent.user_id;

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
				function( err, befores ){

					if( err ){
						return handleErr( req, res, err_ns, err );
					}

					req.sent.expose.befores = befores;
					
					next();

				});

	};

	var getMailchimpStatus = function( req, res, next ){

		var err_ns       = 'mailchimp_status';
		var mailchimp_id = req.sent.user.mailchimp_id;

		if( !mailchimp_id ){
			return handleErr( req, res, err_ns, {
				err_id       : 'ghost_mailchimp_id',
				mailchimp_id : mailchimp_id
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


	var fetchMoreUsers = function( req, res, next ){

		var err_ns        = "fetching_more_users";

		var facebook_ids  = req.sent.facebook_ids;
		var min 		  = req.sent.filters.age[0];
		var max 		  = req.sent.filters.age[1];
		var gender 		  = req.sent.filters.gender;
		var country_codes = req.sent.filters.countries;

		var query = {};

		if( facebook_ids && facebook_ids.length > 0 ){
			query.facebook_id = { '$nin': facebook_ids };
		}

		if( min > settings.app.min_age ){
			query.age = _.extend( query.age || {}, { '$gte': min });
		}
		if( max < settings.app.max_age ){
			query.age = _.extend( query.age || {}, { '$lte': max });
		}

		// Either solely male or female. If no preference or both, dont extend the query!
		if( gender && gender.length == 1 ){
			query.gender = { '$in': gender }; 
		}

		if( country_codes && country_codes.length > 0 ){
			query.country_code = { '$in': country_codes };
		}

		console.log('Final query is : ' + JSON.stringify( query, null, 4 ));

		User
			.find( query )
			.limit( 100 )
			.select( select )
			.exec(function( err, users ){

				if( err ) return handleErr( req, res, err_ns, err );

				var random_users = _.chunk( _.shuffle( users ), 12 )[0];
				req.sent.expose.users = random_users || [];
				next();

			});

	};


	// Consider that we have the same countries for periods of 5s ! 
	var distinct_countries = [];
	var last_fetch = 0

	var fetchDistinctCountries = function( req, res, next ){

		var err_ns = "fetching_distinct_countries";

		if( (new Date()) - last_fetch > 5000 ) {

			last_fetch = new moment();

			User
				.find()
				.distinct('country_code')
				.exec(function( err, res ){

					if( err ) return handleErr( req, res, ns, err );

					req.sent.expose.countries = res;
					distinct_countries = res;
					next();

				});

		} else {
			req.sent.expose.countries = distinct_countries;
			req.sent.expose.cached    = true;
			next();
		}

	};


	// User have access locally to all the channels for the events to come
	// However, if he wants to access its history, he needs to be able to fetch
	// oldest chat messages, and so request the associated group_ids;
	var parallel_fetch_count = 2;
	var fetchMoreChannels = function( req, res, next ){

		var err_ns = "fetching_more_channels";

		var facebook_id = req.sent.user_id;
		var group_ids 	= req.sent.group_ids || [];

		User.findOne({ facebook_id: facebook_id }, function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			var channels = user.channels;

			channels = _.filter( channels, function( chan ){
				return chan.type == "chat" && group_ids.indexOf( chan.group_id ) == -1;
			});

			channels.sort(function( ch1, ch2 ){
				return moment( ch2.last_sent_at ) - moment( ch1.last_sent_at );
			});

			var nu_channels = channels.slice( 0, parallel_fetch_count );

			req.sent.expose.channels = nu_channels || [];
			next();


		});

	};

	// This is used primarily by the search module to know if a user
	// has fetched every user in database or not.
	var cached_user_count;
	var last_request_time = 0;
	var minute = 1000 * 60;

	var fetchUserCount = function( req, res, next ){

		var ns = 'fetching_users_count';

		var request_time = (new Date());
		if( (new Date() - last_request_time ) > 15 * minute ){

			User.count( {}, function( err, n ){

				if( err ) return handleErr( req, res, ns, err );

				last_request_time = request_time;
				cached_user_count = n;
				req.sent.expose.users_count = n;
				next();

			});

		} else {
			req.sent.expose.cache = true;
			req.sent.expose.users_count = cached_user_count;
			next();
		}

	};

	// Already fetched by the connecter middleware
	var fetchOnlineUsers = function( req, res, next ){

		req.sent.expose.online_users       = req.sent.online_users;
		req.sent.expose.online_users_count = req.sent.online_users.length;
		next();

	};

	var updateNotificationsSeenAt = function( req, res, next ){

		var err_ns = "updating_notifications_seen_at";

		var user = req.sent.user;
		var date = new Date();

		user.notifications.forEach(function( n ){

			if( !n.seen_at ){
				n.seen_at = date;
			}

		});

		user.markModified('notifications');
		user.save(function( err, user ){

			if( err && !err.name == "VersionError" ) return handleErr( req, res, err_ns, err );

			req.sent.expose.user = user;
			next();

		});

	};

	var updateNotificationsClickedAt = function( req, res, next ){

		var err_ns = "updating_notifications_clicked_at";

		var user = req.sent.user;
		var date = new Date();
		var n_id = req.sent.notification_id;

		user.notifications.forEach(function( n ){

			if( n.notification_id == n_id ){
				n.clicked_at = date;
			}

		});

		user.markModified('notifications');
		user.save(function( err, user ){

			if( err && !err.name == "VersionError" ) return handleErr( req, res, err_ns, err );

			req.sent.expose.user = user;
			next();

		});

	};

	// Construct 'virtual' "cheers" property, based on other objects from the models
	// This is abstracted away for the client
	var fetchUserCheers = function( req, res, next ){

		var err_ns = "fetching_user_cheers";

		var user        = req.sent.user;
		var facebook_id = req.sent.user_id;

		var cheers = [];

		user.findBeforesByPresence(function( err, befores ){

			if( err ) return handleErr( req, res, err_ns, err );

			befores.forEach(function( bfr ){

				// User has sent a cheers in that before
				if( bfr.hosts.indexOf( facebook_id ) == -1 ){

					var user_group = _.find( bfr.groups, function( group ){
						return group.members.indexOf( facebook_id ) != -1;
					});

					var o = {
						"cheers_type"    : "sent",
						"status"         : user_group.status,
						"main_member"    : user_group.main_member,
						"main_host"      : bfr.main_host,
						"address" 		 : bfr.address.place_name,
						"requested_with" : _.difference( user_group.members, [ facebook_id ] ),
						"requested_at"   : user_group.requested_at
					};
					o.cheers_id = md5( o );
					cheers.push( o );

				// User is host, add a cheers object for every group 
				} else {

					bfr.groups.forEach(function( group ){

						var o = {
							"cheers_type"  : "received",
							"status" 	   : group.status,
							"main_member"  : group.main_member,
							"address"      : bfr.address.place_name,
							"requested_at" : group.requested_at
						};
						o.cheers_id = md5( o );
						cheers.push( o );

					});
				}


			});

			req.sent.expose.cheers = cheers;
			next();

		});



	};

	module.exports = {
		fetchMe 				  	 : fetchMe,
		fetchFriends 				 : fetchFriends,
		fetchUserShared			  	 : fetchUserShared,
		fetchUserMeepass 		  	 : fetchUserMeepass,
		fetchUserById_Full	      	 : fetchUserById_Full,
		fetchUserById_Core		  	 : fetchUserById_Core,
		fetchUsers 				  	 : fetchUsers,
		fetchUsersAll 			  	 : fetchUsersAll,
		fetchUserEvents 		  	 : fetchUserEvents,
		fetchUserCount 			  	 : fetchUserCount,
		fetchOnlineUsers          	 : fetchOnlineUsers,
		getMailchimpStatus 		  	 : getMailchimpStatus,
		fetchMoreUsers 			  	 : fetchMoreUsers,
		fetchDistinctCountries    	 : fetchDistinctCountries,
		fetchMoreChannels 	 	  	 : fetchMoreChannels,
		updateNotificationsSeenAt 	 : updateNotificationsSeenAt,
		updateNotificationsClickedAt : updateNotificationsClickedAt,
		fetchUserCheers 			 : fetchUserCheers
	};