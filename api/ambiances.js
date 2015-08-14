	
	var _          = require('lodash');
	var Ambiance   = require('../models/AmbianceModel');
	var eventUtils = require('../pushevents/eventUtils');

	var createAmbiance = function( req, res ){

		var name        = req.body.name,
			description = req.body.description,
			type        = req.body.type;

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

	var fetchAmbiances = function( req, res ){

		Ambiance.find( {}, function( err, ambiances ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

			eventUtils.sendSuccess( res, ambiances );

		});

	};

	module.exports = {
		fetchAmbiances: fetchAmbiances,
		createAmbiance: createAmbiance
	};