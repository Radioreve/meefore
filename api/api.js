
	var User = require('../models/UserModel'),
		Place = require('../models/PlaceModel'),
		Ambiance = require('../models/AmbianceModel'),
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

	var createPlace = function( req, res ){

		var name = req.body.name,
			address = req.body.address,
			type = req.body.type;

		if( typeof name != 'string' || name.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, name must be a non-empty string" });

		if( typeof address != 'string' || address.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, address must be a non-empty string" });

		if( typeof type != 'string' || type.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, type must be a non-empty string" });

		var new_place = new Place({
			name: name,
			address: address,
			type: type
		});

			new_place.save( function( err, place ){

				if( err )
					return res.status(500).json({ msg: "Database error, please try again later" });

				res.status(200).json({ res: place });

			});

	};

	var createAmbiance = function( req, res ){

		var name = req.body.name,
			description = req.body.description,
			type = req.body.type;

		if( typeof name != 'string' || name.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, name must be a non-empty string" });

		if( typeof description != 'string' || description.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, description must be a non-empty string" });

		if( typeof type != 'string' || type.trim().length == 0 )
			return res.status(400).json({ msg: "Bad request, type must be a non-empty string" });

		var new_ambiance = new Ambiance({
			name: name,
			description: description,
			type: type
		});

			new_ambiance.save( function( err, ambiance ){

				if( err )
					return res.status(500).json({ msg: "Database error, please try again later" });

				res.status(200).json({ res: ambiance });

			});

	};

	var getAmbiances = function( req, res ){

		Ambiance.find( {}, function( err, ambiances ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

			eventUtils.sendSuccess( res, ambiances );

		});

	}

	var searchPlaces = function( req, res ){

		var place_name = req.query.name,
			pattern    = place_name;

		Place
			.find({ name: { $regex: pattern, $options: 'i' }})
			.select({ name: 1, address: 1, type: 1, _id: 1 })
			.exec( function( err, places ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				eventUtils.sendSuccess( res, places );

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
		searchPlaces: searchPlaces,
		createAmbiance: createAmbiance,
		getAmbiances: getAmbiances,
		createPlace: createPlace,
		test: test
	};