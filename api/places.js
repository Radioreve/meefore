	
	var _          = require('lodash');
	var Place      = require('../models/PlaceModel');
	var eventUtils = require('../pushevents/eventUtils');

	var createPlace = function( req, res ){

		var name    = req.body.name,
			address = req.body.address,
			type    = req.body.type;

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

	var fetchPlaces = function( req, res ){

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


	module.exports = {
		fetchPlaces: fetchPlaces,
		createPlace: createPlace
	};