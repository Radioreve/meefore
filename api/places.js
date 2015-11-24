	
	var _          = require('lodash');
	var Place      = require('../models/PlaceModel');
	var eventUtils = require('../pushevents/eventUtils');

	var createPlace = function( req, res ){

		var r = req.sent;
		var new_place = new Place({
			name    : r.name,
			address : r.address,
			type    : r.type,
			capacity: r.capacity,
			contact : r.contact
		});

		new_place.save( function( err, place ){
			if( err ){
				return res.status(500).json({ msg: "Database error, please try again later" });
			} else {
				res.status(200).json({ res: place });
			}
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