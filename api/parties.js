
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Event      = require('../models/EventModel'),
		Party 	   = require('../models/PartyModel'),
		moment     = require('moment'),
		rd		   = require('../services/rd');

	var pusher     = require('../services/pusher');

	var pusher_max_size = 10000;


	var createParty = function( req, res ) {

		var new_party = {};
		var socket_id = req.sent.socket_id;

		// Set by server 
		req.sent.created_at = moment();
		req.sent.status    = 'open';

		[
			'party_name',
			'posted_by',
			'picture',
			'place',
			'description',
			'begins_at',
			'ends_at',
			'timezone',
			'link',
			'price',

		].forEach(function( val ){
			new_party[ val ] = req.sent[ val ];
		});

		// Make sure it's not a string
		new_party.place.address.lat = parseFloat( new_party.place.address.lat );
		new_party.place.address.lng = parseFloat( new_party.place.address.lng );

		// Party is not visible until a moderator has validated its relevance
		new_party.status = "pending";

		new_party = new Party( new_party );
		new_party.save(function( err, new_party ){

			if( err ){
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "Erreur de l'API"
				});
			}

	    	// Send the new party that has been created
	    	eventUtils.sendSuccess( res, new_party );

	    	// Push it to everyone, make sure not too big for pusher
    		var data = new_party.toObject();
	    	if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger('app', 'new oversize message' );
	    	} else {
	    		console.log('Pushing new party created');
	    		pusher.trigger('app', 'new party created', data, socket_id, function( err, res, res ){
	    			if( err ){
	    				console.log(err);
	    			}
	    		});
	    	}

		});

	};

	var updatePartie = function( req, res ){

	};


	var fetchParties = function( req, res ){

		Party
			.find(
				{ 
					'status' : { $in : ['open'] } 
				}
			)
			.sort({ 'begins_at': -1 })
			.exec(function( err, parties ){

				if( err ){
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});
				}

				eventUtils.sendSuccess( res, parties );

			});

	};

	module.exports = {
		createParty  : createParty,
		fetchParties : fetchParties
	};