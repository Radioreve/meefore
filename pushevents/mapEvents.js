
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    settings = require('../config/settings');

	var pusher = require('../globals/pusher');


	var requestIn = function( req, res ){
				
		Event.findByIdAndUpdate( req.event_id, { groups: req.groups }, function( err, evt ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "api error fetching event" 
				});

			eventUtils.sendSuccess( res, { msg: "La demande a été prise en compte" });

			/* Envoyer une notification aux hosts, et aux users */

		});

	};

	module.exports = {
		requestIn: requestIn
	};