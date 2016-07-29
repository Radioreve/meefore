	
	var pusher     = require('../services/pusher');
	var _          = require('lodash');
	var moment 	   = require('moment');
	var eventUtils = require('../pushevents/eventUtils');
	var User 	   = require('../models/UserModel');
	var Before     = require('../models/BeforeModel');
	var Message    = require('../models/MessageModel');
	var mongoose   = require('mongoose');
	var async 	   = require('async');


	function handlePusherErr( err, req, res ){
		console.log( err );
	}

	function handleErr( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	function handleErrAsync( namespace, err ){

		console.log( err );

	};


	function makePersonnalChannel( facebook_id ){
		return "private-facebook-id=" + facebook_id;
	}

	function makeLocationChannel( place_id ){
		return "placeid=" + place_id;
	}

	function makeBeforeChannel( before_id ){
		return "private-before-id=" + before_id;
	}


	function makeChannelItem__Personnal( user ){

		return {
			type: 'personnal',
			name: makePersonnalChannel( user.facebook_id )
		};

	}

	function makeChannelItem__Location( user ){

		return {
			type: 'location',
			name: makeLocationChannel( user.location.place_id )
		}
	}

	function makeChannelItem__Before( before ){

		return {
			type      : 'before',
			name      : makeBeforeChannel( before._id ),
			before_id : before._id,
			hosts     : before.hosts
		};
	}	


	function makeChannelItem__ChatTeam( members, group_formed_at ){

		return {
			type      : 'chat_team',
			chat_id   : Message.makeTeamId( members ),
			team_id   : Message.makeTeamId( members ),
			name      : 'private-team-' + Message.makeTeamId( members ),
			formed_at : group_formed_at,
			members   : members
		}
	}

	function makeChannelItem__ChatBase( before, group, opts ){

		var chat_id = Message.makeChatId( before._id, before.hosts, group.members );

		return {

			// Common part of the channel object
			type 		  : "chat_all",
			name          : "private-all-" + chat_id,
			chat_id 	  : chat_id,
			before_id     : before._id,
			before_status : before.status,
			members       : group.members,
			main_member   : group.main_member,
			main_host     : before.main_host,
			hosts         : before.hosts,
			status        : group.status,
			requested_at  : group.requested_at,

			// Variable part of the channel object
			role 		  : opts.role,
			team_id       : opts.team_id

		};
	}

	function makeChannelItem__ChatHosts( before, group ){

		return makeChannelItem__ChatBase( before, group, {
			role    : "hosted",
			team_id : Message.makeTeamId( before.hosts )
		});

	}

	function makeChannelItem__ChatUsers( before, group ){

		return makeChannelItem__ChatBase( before, group, {
			role    : "requested",
			team_id : Message.makeTeamId( group.members )
		});

	}

	function addChatChannelHosts( user, before, group ){

		if( group.status != "accepted" ) return;

		var channel_item = makeChannelItem__ChatHosts( before, group );
		user.channels.push( channel_item );

	}

	function addChatChannelUsers( user, before, group ){

		if( group.status != "accepted" ) return;

		var channel_item = makeChannelItem__ChatUsers( before, group );
		user.channels.push( channel_item );
	}

	function addTeamChannel( user, members, group_formed_at ){

		var team_channel = _.find( user.channels, function( chan ){
			return chan.team_id == Message.makeTeamId( members );
		});

		if( !team_channel ){
			user.channels.push( makeChannelItem__ChatTeam( members, group_formed_at ) );
		}

	}

	function resetChannels( user, callback ){

		console.log('Reseting channels');

		user.channels = [];
		user.channels.push( makeChannelItem__Personnal( user ) );
		user.channels.push( makeChannelItem__Location( user ) );

		user.befores = [];

		user.findBeforesByPresence(function( err, befores ){

			if( err ) return handleErr( req, res, err_ns, err );

			// Safe the ref for other middlewares
			befores.forEach(function( before ){

				if( before.status == "canceled" ){
					return console.log("Before was canceled, skipping the add in either before or channels array");
				}

				var is_hosting  = before.hosts.indexOf( user.facebook_id ) != -1;

				if( is_hosting ){

					console.log('User is hosting this event, rendering hosts related channels');

					user.befores.push( User.makeBeforeItem__Host( before ) );
					user.channels.push( makeChannelItem__Before( before ) );

					// Create a team chat with other hosts only if it doesnt already exists
					addTeamChannel( user, before.hosts, before.created_at );

					before.groups.forEach(function( group ){
						addChatChannelHosts( user, before, group );
					});

				} else {

					// User is not hosting, find his group to access members ids
					var mygroup = _.find( before.groups, function( grp ){
						return grp.members.indexOf( user.facebook_id ) != -1;
					});

					user.befores.push( User.makeBeforeItem__Member( before, mygroup.status ) );

					// Create a team chat with other hosts only if it doesnt already exists
					addTeamChannel( user, mygroup.members, mygroup.requested_at );
					addChatChannelUsers( user, before, mygroup );

				}

			});

			user.markModified('channels');
			user.save(function( err, user ){

				if( err ){
					return callback( err );
				} else {
					return callback( null, user, befores );
				}

			}); 

		});

	}

	// At each connexion, dynamically reset the channels that the users is gonna need
	// One private channel to receive personnal events
	// One location channel for pushing befores in his area 
	// For each before,
	// 	- if he is "hosting", join the hosts channel, and join 2 chats channel per groups
	// 	- if he is not hosting, find his group and join 2 chats channels, team & all
	var setChannels = function( req, res, next ){

		var err_ns = "reseting_channels";
		var user   = req.sent.user;

		if( !user ){
			console.log('First connection, dont set channels');
			return next();

		} else {

			resetChannels( user, function( err, user, fetched_befores ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.user            = user;
				req.sent.fetched_befores = fetched_befores;
				next();

			});
		}
	};

	// Update the users channel after a request, so they can ask to join without being
	// rejected by the server. Only update members since for them, it can lead to a new 
	// team channel immediately (hosts had their team channel created at before creation)
	var updateChannelsRequest = function( req, res, next ){

		var err_ns = "updating_channels_request";

		var facebook_id = req.sent.facebook_id;
		var group 		= req.sent.group;

		var channel_item = makeChannelItem__ChatTeam( group.members, group.requested_at );

		User.update(
			{ 'facebook_id': { $in: group.members } },
			{ $push: { 'channels': channel_item }},
			{ multi: true },
			function( err, raw ){

				if( err ){
					handleErr( req, res, err_ns, err );
				} else {
					next();
				}

			});

	};

	// Update the hosts and the users channel after a validation (cheers back), so they can
	// ask join without being rejected by the server. Both of groups need to have a new 
	// channel_item, which looks almost the same
	var updateChannelsGroup = function( req, res, next ){

		var err_ns = "updating_channels_group";

		var facebook_id = req.sent.facebook_id;
		var before 		= req.sent.before;
		var group 		= req.sent.group;

		var channel_item_hosts = makeChannelItem__ChatHosts( before, group );
		var channel_item_users = makeChannelItem__ChatUsers( before, group );

		var tasks = [];


		// Updating channels for the hosts
		tasks.push(function( callback ){
			User.update(
			{
				'facebook_id' : { '$in': before.hosts }
			},
			{
				'$push': { 'channels': channel_item_hosts }
			},
			{
				multi: true
			},
			function( err, users ){

				if( err ){
					handleErrAsync( err_ns, err );
				}
				callback();

			});
		});

		// Updating channels for the members 
		tasks.push(function( callback ){
			User.update(
			{
				'facebook_id' : { '$in': group.members }
			},
			{
				'$push': { 'channels': channel_item_users }
			},
			{
				multi: true
			},
			function( err, users ){

				if( err ){
					handleErrAsync( err_ns, err );
				}
				callback();

			});
		});

		async.parallel( tasks, function( err ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			next();

		});
	}

	// When the user changes its location, his location channels needs to be updated as well.
	// Otherwise, he wouldnt be notified in realtime that new befores occurs (he would though 
	// at his next connection since all channels are dynamically created at each login )
	var updateLocationChannel = function( req, res, next ){

		var err_ns =  "updating_channel_location";

		var user = req.sent.user;

		if( req.sent.location ){

			console.log('User changed its location, updating its channel required...');

			var channel_name = "placeid=" + user.location.place_id;

			// Prefere the remove & push approach over the replace. Just in case user has 0 entries (bug)
			// This way, we make sure it has a brand new one
			 user.channels.forEach(function( chan, i ){
			 	if( chan && chan.type == "location" ){
			 		user.channels[ i ] = undefined;
			 	}
			 })

			user.channels.push({ type: 'location', name: channel_name });
			user.channels = user.channels.filter( Boolean );

			user.markModified('channels');

			user.save(function( err, user ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.user = user;
				next();

			});

		} else {
			next();

		}

	};

	// Update the last_sent_at in each channel, to allow the user
	// to query them by order of activity
	var setLastSentAtInChannels = function( req, res, next ){

		var err_ns = "setting_last_sent_at";

		var user  = req.sent.user;
		var chats = _.map( req.sent.user.channels, 'chat_id' ).filter( Boolean );

		if( !chats || chats.length == 0 ){
			return next();
		}

		Message.aggregate([

			{ '$match': { 'chat_id': { '$in': chats } } },
			{ '$group': { '_id': '$chat_id', 'last_sent_at': { '$last': '$sent_at' } } }

		], function( err, res_objects ){

			if( err ) return handleErr( req, res, err_ns, err );

			// All chats that have 0 entries in the Messages collection still need to have a 
			//'last_sent_at' key updated.
			user.channels.forEach(function( chan ){

				var matching_object = _.find( res_objects, function( o ){
					return o._id == chan.chat_id;
				});

				if( matching_object ){
					chan.last_sent_at = matching_object.last_sent_at;
				} else {
					chan.last_sent_at = chan.formed_at ? chan.formed_at : chan.requested_at;
				}

			});

			user.markModified('channels');
			user.save(function( err, user ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.user = user;
				next();

			});


		});

	};

	var pushNewBefore = function( req, res, next ){

		var err_ns = "pushing_new_before";

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.expose.before;
		var place_id     = req.sent.requester.location.place_id;

		// Convert toObject() to only transport the object and not
		// the prototype inherited form Mongoose model.
		var data = {
			before: before.toObject()
		};

		var channel = makeLocationChannel( place_id );
		pusher.trigger( channel, 'new before', data, handlePusherErr );

		// Hosts only
		data.before_item         = req.sent.expose.before_item;;
		data.channel_item_before = makeChannelItem__Before( before );
		data.channel_item_team   = makeChannelItem__ChatTeam( before.hosts, before.created_at );

		data.channel_item_team.last_sent_at = data.channel_item_team.formed_at;

		// Pushed the channel to the model before, so they wont get rejected when joining
		User.update(
			{
				'facebook_id': { $in: before.hosts }
			},
			{
				$addToSet: { 'channels': { '$each' : [ data.channel_item_before, data.channel_item_team ] } }
			},
			{
				multi: true
			},
			function( err, raw ){

				if( err ) return handleErr( req, res, err_ns, err );

				// Hosts are not yet in a global 'before' channel. Push the update to each one if them separately
				before.hosts.forEach(function( h ){

					var channel = makePersonnalChannel( h );

					data.requester    = req.sent.facebook_id;
					data.notification = req.sent.notification;

					pusher.trigger( channel, 'new before hosts', data, handlePusherErr );

				});

				next();

			});

	};	

	var pushNewBeforeStatus = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.expose.before;
		var notification = req.sent.notification;

		// Carefull, must ne the requester location's place_id and not the before one
		var place_id = req.sent.requester.location.place_id;

		var data_users = {
			before_id 	 : before._id,
			hosts     	 : before.hosts,
			status       : before.status
		};

		var data_members = {
			before_id    : before._id,
			hosts        : before.hosts,
			status       : before.status,
			requester    : req.sent.facebook_id, 
			notification : notification
		};

		var users = before.hosts;
		before.groups.forEach(function( group ){
			users = users.concat( group.members );
		});

		var tasks = [];
		users.forEach(function( user_id ){
			tasks.push(function( callback ){

				User.findOne({ facebook_id: user_id }, function( err, user ){

					if( err ) handleErrAsync( err_ns, err );

					resetChannels( user, function( err, user, fetched_befores ){

						if( err ) handleErrAsync( err_ns, err );
						callback();

					});
				});
			})
		});

		async.parallel( tasks, function( err ){

			if( err ) handleErrAsync( err_ns, err );

			// Global message : everyone will received it.
			var channel = makeLocationChannel( place_id );
			pusher.trigger( channel, 'new before status', data_users, socket_id, handlePusherErr );

			// All members need to resync their chat status
			users.forEach(function( user_id ){
				var channel = makePersonnalChannel( user_id );
				pusher.trigger( channel, 'new before status members', data_members, handlePusherErr );

			});
			
		});

		next();

	};

	var pushNewRequest = function( req, res, next ){
		
		var socket_id        = req.sent.socket_id;
		var before_item 	 = req.sent.before_item;
		var before 	 	     = req.sent.before;
		var group 			 = req.sent.group;
		var facebook_id      = req.sent.facebook_id;

		var data_hosts = {
			before_id    : before._id,
			cheers_item  : User.makeCheersItem__Received( before, group ),
			notification : req.sent.notification_hosts
		};

		var data_members = {
			before_id	 	  : before._id,
			group 			  : group,
			requester 		  : req.sent.facebook_id,
			before_item       : _.merge( _.cloneDeep( before_item ), { status: "pending" }),
			cheers_item 	  : User.makeCheersItem__Sent( before, group ),
			channel_item_team : makeChannelItem__ChatTeam( group.members, group.requested_at ),
			notification      : req.sent.notification_users
		};

    	// Notify hosts
		pusher.trigger( makeBeforeChannel( before._id ), 'new request host', data_hosts, socket_id );
		// Notify group members
		req.sent.members_profiles.forEach(function( user ){
			pusher.trigger( makePersonnalChannel( user.facebook_id ), 'new request group', data_members, handlePusherErr );
		});	

		next();

	};

	var pushNewGroupStatus = function( req, res, next ){

		var before       = req.sent.before;
		var group        = req.sent.group;
		var cheers_id 	 = req.sent.cheers_id;
		var sender_id    = req.sent.facebook_id;
		var status 		 = req.sent.status;

		var before_id = req.sent.before_id;

		var channel_item_hosts = makeChannelItem__ChatHosts( before, group );
		var channel_item_users = makeChannelItem__ChatUsers( before, group );

		var data_hosts = {
			sender_id    : sender_id,
			before_id    : before_id,
			cheers_id    : cheers_id,
			channel_item : channel_item_hosts,
			status 	     : status,
			notification : req.sent.notification_hosts
		};

		var data_members = {
			sender_id    : sender_id,
			before_id    : before_id,
			cheers_id    : cheers_id,
			channel_item : channel_item_users,
			status 	     : status,
			notification : req.sent.notification_users
		};

		// Each team has a team-chat channel already. Dispatch the message in it ( better efficiency )
		var hosts_channel_name = 'private-team-' + Message.makeTeamId( before.hosts );
		var users_channel_name = 'private-team-' + Message.makeTeamId( group.members )

		pusher.trigger( hosts_channel_name, 'new group status hosts', data_hosts, handlePusherErr );
		pusher.trigger( users_channel_name, 'new group status users', data_members, handlePusherErr );

		next();

	}

	var pushNewChatMessage = function( req, res, next ){

		var chat_id = req.sent.chat_id;
		var type    = req.sent.type;

		var data_message = {
			sender_id   : req.sent.facebook_id,
			seen_by 	: [ req.sent.facebook_id ],
			call_id 	: req.sent.call_id,
			message     : req.sent.message,
			sent_at  	: req.sent.sent_at,
			chat_id 	: chat_id	
		};

		// Do not filter by socket_id here for ressource efficiency, let the client react differently
		// when he realizes its his own message that bounced back successfully
		var channel_name = ( type == "chat_all" ) ? "private-all-%chatid" : "private-team-%chatid";
		var channel = channel_name.replace( '%chatid', chat_id );
		pusher.trigger( channel, 'new chat message', data_message, handlePusherErr );
		next();


	};


	var pushNewChatSeenBy = function( req, res, next ){
		
		var chat_id      = req.sent.chat_id;
		var facebook_id  = req.sent.facebook_id;
		var channel_item = req.sent.channel;

		var data_seen_by = {
			chat_id: chat_id,
			seen_by: facebook_id
		};

		pusher.trigger( channel_item.name, 'new chat seen by', data_seen_by, handlePusherErr );
		next();

	};


	module.exports = {
		setChannels 		  	   : setChannels,
		setLastSentAtInChannels    : setLastSentAtInChannels,
		updateChannelsRequest  	   : updateChannelsRequest,
		updateChannelsGroup 	   : updateChannelsGroup,
		updateLocationChannel 	   : updateLocationChannel,
		pushNewBefore         	   : pushNewBefore,
		pushNewBeforeStatus   	   : pushNewBeforeStatus,
		pushNewRequest 		       : pushNewRequest,
		pushNewGroupStatus 	  	   : pushNewGroupStatus,
		pushNewChatMessage  	   : pushNewChatMessage,
		pushNewChatSeenBy 	       : pushNewChatSeenBy
	};
