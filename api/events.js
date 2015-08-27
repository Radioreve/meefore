	
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Event      = require('../models/EventModel'),
		moment     = require('moment');

	var pusher     = require('../globals/pusher');

	var createEvent = function( req, res ) {
	       
	    var data = req.event_data;
	    
	    var new_event = {};

	    	/* set by client */
	    	new_event.hosts 		  = data.hosts;
	    	new_event.begins_at 	  = moment( data.begins_at, 'DD/MM/YY' );
	    	new_event.address 		  = data.address;
	    	new_event.ambiance 		  = data.ambiance;
	    	new_event.agerange 		  = data.agerange;
	    	new_event.mixity   		  = data.mixity;
	    	new_event.scheduled_party = data.scheduled_party;

	    	/* set by server */
	    	new_event.created_at = moment();
	    	new_event.groups 	 = [];
	    	new_event.status 	 = 'open';
	    	new_event.type       = 'before';
	    	new_event.meta 		 = [];

	    var new_event = new Event( new_event );
	    new_event.save(function( err, new_event ){

	    	if( err )
	    		return eventUtils.raiseError({ err: err, res: res, toClient: "Error saving event"});

	    	var event_item = {
	    		status: 'hosting',
	    		event_id: new_event._id,
	    		begins_at: new_event.begins_at
	    	};

	    	User.update({ 'facebook_id': { $in: _.pluck( data.hosts, 'facebook_id') } },
	    				{ $push: { 'events': event_item }},
	    				{ multi: true },
	    				function( err, users ){

	    					if( err )
	    						return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});

					    	console.log('Event created!!');

					    	eventUtils.sendSuccess( res, new_event );
					    	pusher.trigger('app', 'new event created', new_event, req.socket_id );

	    				});

	    });



	};

	var fetchEvents = function( req, res ){

		var start_date = req.query.start_date;

		Event
			.find(
				{ 
					'begins_at': { $gte: moment( start_date, 'DD/MM/YY' ).toISOString() },
					'status' : { $in : ['open','suspended'] } 
				}
			)
			//.limit( 10 ) no limit needed
			.sort({ 'begins_at': -1 })
			.exec( function( err, events ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				 eventUtils.sendSuccess( res, events );

			});

	};

	var request = function( req, res ){
		
		console.log('Requesting with event_id = ' + req.event_id );

		Event.findByIdAndUpdate( req.event_id, { groups: req.groups }, { new: true }, function( err, evt ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });

			var event_to_push = {
				event_id  : req.event_id,
				status    : 'pending',
				begins_at : evt.begins_at
			};
			/* Mise à jour de l'event array dans chaque user impliqué */
			User
				.update(
					{ 'facebook_id': { $in: req.group.members_facebook_id } },
					{ $push: { 'events' : event_to_push } },
					{ multi: true, new: true },
					function( w ){

						if( err )
							return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });

						eventUtils.sendSuccess( res, evt );

						/* Envoyer une notification aux hosts, et aux users déja présent */
						pusher.trigger( req.event_id, 'new request', { event_id: req.event_id, group: req.group }, req.socket_id );

						/* Envoyer une notification aux amis au courant de rien à priori */
						req.users.forEach(function(user){
							pusher.trigger( user.channels.me, 'new request', { event_id: req.event_id, group: req.group }, req.socket_id );
						});	

					});
				});
	};

	var fetchEventById = function( req, res ){

	};

	var updateEvent = function( req, res ){

	};

	var fetchGroups = function( req, res ){

	};

	module.exports = {
		createEvent: createEvent,
		request: request,
		fetchEvents: fetchEvents,
		fetchEventById: fetchEventById,
		updateEvent: updateEvent,
		fetchGroups: fetchGroups
	};