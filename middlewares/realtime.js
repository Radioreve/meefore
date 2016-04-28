
	var pusher = require('../services/pusher');
	var _	   = require('lodash');

	function handlePusherErr( err, req, res ){
		console.log( err );
	}

	var pushNewEvent = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.expose.before;

		// Convert toObject() to only transport the object and not
		// and the prototype inherited form Mongoose model.
		var data = { before: before.toObject() };

		var channel = 'place_id=' + req.sent.requester.location.place_id;
		pusher.trigger( channel, 'new before', data, socket_id, handlePusherErr );

		next();

	};	

	module.exports = {
		pushNewEvent: pushNewEvent
	};
