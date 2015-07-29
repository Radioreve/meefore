
	var User = require('../models/UserModel'),
		_    = require('lodash'),
		eventUtils = require('../pushevents/eventUtils');


	/*  GET /users/:user_id */
	var getUserById = function( req, res ){

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

	/* GET /users?name=... */

	var searchUsers = function( req, res ){

		var user_name = req.query.name,
			pattern   = '^'+user_name;

		User
			.find({ name: { $regex: pattern, $options: 'i' }})
			.select({ name: 1, pictures: 1, mood: 1, drink: 1, facebook_id: 1 })
			.exec( function( err, users ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				eventUtils.sendSuccess( res, users);

			});

	};

	var test = function( req, res ){

		var userId = req.params.user_id;

		User.find({ $or: [{ _id: userId },{ facebook_id: { $in: ['1426304224365916'] } }]}, function( err, user ){
			if( err ) 
				return res.json({ msg: "Erreur de type err", err: err });
			if( user.length == 0 ) 
				return res.json({ msg: "Erreur de type []", user: user });
			return res.json({ msg: "Success", err: err, user: user });
		});

	};	

	module.exports = {
		getUserById: getUserById,
		searchUsers: searchUsers,
		test: test
	};