
	var User = require('../models/UserModel'),
		Place = require('../models/PlaceModel'),
		Ambiance = require('../models/AmbianceModel'),
		_    = require('lodash'),
		eventUtils = require('../pushevents/eventUtils');


	/*  fetch /users/:user_id */
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

	/* fetch /users?name=... */
	var fetchUsers = function( req, res ){

		var user_name = req.query.name,
			pattern   = '^'+user_name;

		User
			.find({ name: { $regex: pattern, $options: 'i' }})
			.select({ name: 1, pictures: 1, mood: 1, drink: 1, facebook_id: 1 })
			.limit(10)
			.exec( function( err, users ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				eventUtils.sendSuccess( res, users );

			});
	};



	module.exports = {
		fetchUserById: fetchUserById,
		fetchUsers: fetchUsers
	};