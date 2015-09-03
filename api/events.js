	
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Event      = require('../models/EventModel'),
		moment     = require('moment'),
		rd		   = require('../globals/rd');

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

	    	/* Cache hosts ids for chat performance */
	    	rd.sadd('chat/'+new_event._id+'/hosts', _.pluck( new_event.hosts, 'facebook_id' ) );

	    	User.update({ 'facebook_id': { $in: _.pluck( data.hosts, 'facebook_id') } },
	    				{ $push: { 'events': event_item }},
	    				{ multi: true },
	    				function( err, users ){

	    					if( err )
	    						return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});

					    	console.log('Event created!!');

					    	eventUtils.sendSuccess( res, new_event );
					    	pusher.trigger('app', 'new test', { msg: "This channel works" });
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
				event_id    : req.event_id,
				begins_at   : evt.begins_at,
				group_id	: evt.makeGroupId( req.group.members_facebook_id )
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

						var data = {
							evt   : evt,
							group : req.group 
						};
						/* Envoyer une notification aux hosts, et aux users déja présent */
						pusher.trigger( req.event_id, 'new request', data, req.socket_id );

						/* Envoyer une notification aux amis au courant de rien à priori */
						req.users.forEach(function( user ){
							pusher.trigger( user.channels.me, 'new request', data, req.socket_id );
						});	

					});
				});
	};

	var changeEventStatus = function( req, res ){

		var status = req.event_status;
		var evt    = req.evt;

		console.log('Changing event status, new status : ' + status + ' for event: ' + req.event_id );

		evt.status = status
		evt.save(function( err, evt ){

			if( err )
				return eventUtils.raiseError({
				 err: err,
				 res: res,
				 toClient: "api error"
			});

			eventUtils.sendSuccess( res, evt );
			pusher.trigger('app', 'new event status', evt, req.socket_id );

		});


	};

	var changeGroupStatus = function( req, res ){
			
		console.log('Changing group status, new status : ' + req.group_status );

		var evt = req.evt;
		var groups = evt.groups;

		/* Find the current group in event, and modify it with req.group object */
		var updated_group = evt.getGroupById( req.group_id );

		groups.forEach(function(group,i){
			if( group.group_id === updated_group.group_id ){
				groups[i].status = req.group_status;
				rd.set('event/' + evt._id + '/' + 'group/' + updated_group.group_id + '/status', req.group_status);
				if( req.group_status == 'accepted' ){
					groups[i].accepted_at = new Date();
					rd.sadd('chat/' + evt._id + '/' + 'audience', [ updated_group.group_id ]);
				} else {
					groups[i].kicked_at = new Date();
					rd.srem('chat/' + evt._id + '/' + 'audience', [ updated_group.group_id ])
				}
			}
		});

		evt.groups = groups;
		evt.markModified('groups');

		evt.save(function( err, evt ){

			if( err || !evt ) 
				return eventUtils.raiseError({
					err: err,
					res: res,
					toClient: "api error"
				});

			var group = evt.getGroupById( req.group_id );

			var data = {
				evt: evt,
				group: group
			};

			console.log('Pushing new group status to clients');
			eventUtils.sendSuccess( res, data );
			pusher.trigger( evt._id + '', "new group status",  data, req.socket_id );

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
		changeEventStatus: changeEventStatus,
		changeGroupStatus: changeGroupStatus,
		fetchEvents: fetchEvents,
		fetchEventById: fetchEventById,
		updateEvent: updateEvent,
		fetchGroups: fetchGroups
	};