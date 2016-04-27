
	var pusher = require('../services/pusher');
	var _	   = require('lodash');

	var pusher_max_size = 10000;

	var pushNewEvent = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.before;

		// Convert toObject() to only transport the object and not
		// and the prototype inherited form Mongoose model.
		var data = {
			evt          : before.toObject()
		};

    	if( eventUtils.oSize( data ) > pusher_max_size ){
    		pusher.trigger('app', 'new oversize message' );

    	} else {
    		console.log('Pushing new event created');
    		pusher.trigger('app', 'new event created', data, socket_id, function( err, res, res ){
    			if( err )
    				console.log(err);
    		});

    	}

		next();

	};	
