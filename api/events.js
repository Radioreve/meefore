	
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Event      = require('../models/EventModel'),
		moment     = require('moment'),
		rd		   = require('../services/rd');

	var pusher     = require('../services/pusher');

	var pusher_max_size = 10000;

	var createEvent = function( req, res ) {
	       
		var data      = req.sent.event_data;
		var socket_id = req.sent.socket_id;
	    
	    var new_event = {};

	    	/* set by client */
	    	new_event.hosts 		  = data.hosts;
	    	new_event.begins_at 	  = moment( data.begins_at );
	    	new_event.address 		  = data.address;
	    	new_event.scheduled 	  = data.scheduled;
	    	new_event.ambiance 		  = data.ambiance;
	    	new_event.agerange 		  = data.agerange;
	    	new_event.mixity   		  = data.mixity;

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

	    	var hosts_ns = 'event/' + new_event._id + '/hosts';
	    	/* Cache hosts ids for chat performance */
	    	rd.sadd( hosts_ns, _.pluck( new_event.hosts, 'facebook_id' ), function( err ){

		    	User.update({ 'facebook_id': { $in: _.pluck( data.hosts, 'facebook_id') } },
		    				{ $push: { 'events': event_item }},
		    				{ multi: true },

					function( err, users ){

						if( err )
							return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});

				    	console.log('Event created!');
				    	eventUtils.sendSuccess( res, new_event );

				    	var data = new_event.toObject();

				    	if( eventUtils.oSize( data ) > pusher_max_size ){
				    		pusher.trigger('app', 'new oversize message' );
				    	} else {
				    		console.log('Pushing new event created');
				    		pusher.trigger('app', 'new event created', data, socket_id, function( err, res, res ){
				    			if( err )
				    				console.log(err);
				    		});
				    	}

					});

		    	});

	    	});



	};

	var fetchEvents = function( req, res ){

		var start_date = req.sent.start_date;

		Event
			.find(
				{ 
					//'begins_at': { $gte: moment( start_date, 'DD/MM/YY' ).toISOString() },
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

				var filtered_events = [];
				events.forEach(function( evt ){

					evt.n_groups = evt.groups.length;
					delete evt.groups;
					filtered_events.push( evt );

				});

				 eventUtils.sendSuccess( res, filtered_events );

			});

	};

	var request = function( req, res ){
		
		var groups    = req.sent.groups;
		var event_id  = req.sent.event_id;
		var socket_id = req.sent.socket_id;

		var new_group           = req.sent.new_group;
		var group_id            = req.sent.new_group.group_id;
		var members 			= req.sent.new_group.members;
		var members_facebook_id = req.sent.new_group.members_facebook_id;

		console.log('Requesting in with event_id = ' + event_id );

		Event.findByIdAndUpdate( event_id, { groups: groups }, { new: true }, function( err, evt ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });

			var event_to_push = {
				event_id    : event_id,
				begins_at   : evt.begins_at,
				//group_id	: group_id,
				status 		: 'pending'
			};

			/* Mise à jour de l'event array dans chaque user impliqué */
			User
				.update(
					{ 'facebook_id': { $in: members_facebook_id } },
					{ $push: { 'events' : event_to_push } },
					{ multi: true, new: true },
					function( w ){

						if( err )
							return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });

						var data = 
						{
							event_id          : event_id,
							hosts_facebook_id : _.pluck( evt.hosts, 'facebook_id' ),
							group             : new_group 
						};

						eventUtils.sendSuccess( res, data );
					
						/* Envoyer une notification aux hosts, et aux users déja présent */
						if( eventUtils.oSize( data ) > pusher_max_size ){
								console.log('Max size reached : ' + eventUtils.oSize( data ) );
					    		pusher.trigger( event_id, 'new oversize message', {} );
					    } else {

					    	/* Envoyer une notification aux hosts */
					    	console.log('Notifying new request has been issued');
					    	console.log('Host channel: ' + evt.getHostsChannel() );
							pusher.trigger( 'presence-' + evt.getHostsChannel() , 'new request host', data, socket_id );

							/* Envoyer une notification aux amis au courant de rien à priori */
							members.forEach(function( user ){
								pusher.trigger( user.channels.me, 'new request group', data, socket_id );
							});	
						}

					});
				});
	};

	var changeEventStatus = function( req, res ){

		var evt       = req.sent.evt;
		var status    = req.sent.status;
		var event_id  = req.sent.event_id;
		var socket_id = req.sent.socket_id;

		console.log('Changing event status, new status : ' + status + ' for event: ' + event_id );

		evt.status = status
		evt.save(function( err, evt ){

			if( err )
				return eventUtils.raiseError({
				 err: err,
				 res: res,
				 toClient: "api error"
			});

			var data = 
			{
				event_id          : event_id,
				hosts_facebook_id : _.pluck( evt.hosts, 'facebook_id' ),
				status            : evt.status
			}

			eventUtils.sendSuccess( res, data );

			if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger('app', 'new oversize message' );
			} else {
				pusher.trigger('app', 'new event status', data, socket_id );
			}

		});


	};

	var changeGroupStatus = function( req, res ){
		
		var evt       = req.sent.evt;
		var groups    = evt.groups;
		var event_id  = req.sent.event_id;
		var group_id  = req.sent.group_id;
		var chat_id   = req.sent.chat_id;
		var status    = req.sent.group_status;
		var socket_id = req.sent.socket_id;

		console.log('Changing group status, new status : ' + status );

		/* Find the current group in event, and modify it with req.group object */
		var updated_group = evt.getGroupById( group_id );

		groups.forEach(function( group, i ){

			if( group.group_id === updated_group.group_id ){

				groups[i].status = status;

				rd.set('event/' + event_id + '/' + 'group/' + group_id + '/status', status, function(err){

					if( status == 'accepted' ){
						groups[i].accepted_at = new Date();
					} else {
						groups[i].kicked_at = new Date();
					}
					
				});
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

			var group = evt.getGroupById( group_id );


			console.log( eventUtils.oSize( group ) );

			var data = {
				event_id          : evt._id,
				hosts_facebook_id : _.pluck( evt.hosts, 'facebook_id' ),
				group             : group,
				chat_id			  : chat_id
			};

			eventUtils.sendSuccess( res, data );

			if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger( event_id, 'new oversize message' );
	    	} else {
				console.log('Pushing new group status to clients in eventid: ' + event_id );
				pusher.trigger( 'presence-' + chat_id, 'new group status', data, socket_id );
			}


		});

	};

	var fetchEventById = function( req, res ){

		var event_id = req.sent.event_id;

		console.log('Requesting event by id : ' + req.event_id	);

		Event.findById( event_id, function( err, evt ){

			if( err || !evt )
				eventUtils.raiseError({ err: err, toClient: "api error" });

			res.json( evt ).end();

		});

	};

	var updateEvent = function( req, res ){

	};

	var fetchGroups = function( req, res ){

	};

	module.exports = {
		createEvent       : createEvent,
		request           : request,
		changeEventStatus : changeEventStatus,
		changeGroupStatus : changeGroupStatus,
		fetchEvents       : fetchEvents,
		fetchEventById    : fetchEventById,
		updateEvent       : updateEvent,
		fetchGroups       : fetchGroups
	};