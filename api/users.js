
	var User 	   = require('../models/UserModel'),
		Event 	   = require('../models/EventModel'),
		Place 	   = require('../models/PlaceModel'),
		Ambiance   = require('../models/AmbianceModel'),
		_   	   = require('lodash'),
		settings   = require('../config/settings'),
		eventUtils = require('../pushevents/eventUtils');


	/* get /users/me */
	var fetchMe = function( req, res ){

		var userId = req.user_id;

		if( !userId )
			return eventUtils.raiseError({ res: res, toClient: "api error" });

		User.findById( userId, function( err, user ){

			if( err ) return eventUtils.raiseError({ res: res, toClient: "api error" });

			res.json( user ).end();

		});

	};

	/*  get /users/:user_id */
	var fetchUserById = function( req, res ){

		var userId = req.params.user_id;

		if( !userId )
			return eventUtils.raiseError({ res: res, toClient: "Missing parameter : user id", toServer: "API Error" });

		User.find({ facebook_id: userId }, function( err, users ){

			if( err )
				return eventUtils.raiseError({ res: res, toServer: "API Error (database)", toClient: "API Error" });

			if( users.length == 0 )
				return eventUtils.raiseError({ res: res, toServer: "API Error (database)", toClient: "No user found" });

			res.json( users[0] ).end();

		});

	};

	/* get /users?name=... */
	var fetchUsers = function( req, res ){

		if( _.keys( req.query ).length == 0 )
			return fetchUsersAll( req, res );

		var user_name = req.query.name,
			pattern   = '^'+user_name;

		User
			.find({ name: { $regex: pattern, $options: 'i' }})
			.select({ name: 1, pictures: 1, mood: 1, drink: 1, facebook_id: 1 })
			.limit(10)
			.exec(function( err, users ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				eventUtils.sendSuccess( res, users );

			});
	};

	var fetchUsersAll = function( req, res ){

		var select = {};
		settings.public_properties.users.forEach(function( prop ){
			select[ prop ] = 1;
		});

		User
			.find({})
			.select( select )
			.exec(function( err, users ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				eventUtils.sendSuccess( res, users );

			});

	};

	var fetchUserEvents = function( req, res ){

		console.log('Fetching personnal event for facebook_id: ' + req.facebook_id );
		var facebook_id = req.facebook_id;
		
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

					if( err )
						return eventUtils.raiseError({ err: err, res: res,
							toClient: "Erreur de l'API" 
						});

					eventUtils.sendSuccess( res, events );

				});

	};

	module.exports = {
		fetchMe: fetchMe,
		fetchUserById: fetchUserById,
		fetchUsers: fetchUsers,
		fetchUserEvents: fetchUserEvents
	};