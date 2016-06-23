	
	var pusher     = require('../services/pusher');
	var _          = require('lodash');
	var eventUtils = require('../pushevents/eventUtils');
	var md5        = require('blueimp-md5');
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

	function sortIds( ids ){
		return ids.sort(function( i1, i2 ){
			return parseInt( i1 ) - parseInt( i2 );
		});
	}

	function makePersonnalChannel( facebook_id ){
		return "private-facebook-id=" + facebook_id;
	}

	function makeLocationChannel( place_id ){
		return "placeid=" + place_id;
	}

	function makeBeforeChannel( before_id ){
		return "private-before-id=" + before_id;
	}

	function makeChatGroupId( before_id, hosts, members ){
		
		var sorted_hosts   = sortIds( hosts ).join('-');
		var sorted_members = sortIds( members ).join('-');

		var payload 	   = [ before_id, sorted_hosts, sorted_members ].join('__');

		return md5( payload );

	}

	function makeChatTeamId( members ){

		var sorted_members = sortIds( members ).join('-');
		var payload 	   = sorted_members;

		return md5( payload );
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


	function makeChannelItem__ChatTeam( group, group_formed_at ){

		return {
			type      : 'chat_team',
			chat_id   : makeChatTeamId( group ),
			team_id   : makeChatTeamId( group ),
			name      : 'private-team-' + makeChatTeamId( group ),
			formed_at : group_formed_at,
			members   : group
		}
	}

	function makeChannelItem__ChatBase( before, group, opts ){

		var chat_id = makeChatGroupId( before._id, before.hosts, group.members );

		return {

			type 		  : "chat_all",
			name          : "private-all-" + chat_id,
			chat_id 	  : chat_id,
			team_id       : opts.team_id,
			before_id     : before._id,
			before_status : before.status,
			members       : group.members,
			main_member   : group.main_member,
			main_host     : before.main_host,
			hosts         : before.hosts,
			status        : group.status,
			role 		  : opts.role,
			requested_at  : group.requested_at

		};
	}

	function makeChannelItem__ChatHosts( before, group ){

		return makeChannelItem__ChatBase( before, group, {
			role    : "hosted",
			team_id : makeChatTeamId( before.hosts )
		});

	}

	function makeChannelItem__ChatUsers( before, group ){

		return makeChannelItem__ChatBase( before, group, {
			role    : "requested",
			team_id : makeChatTeamId( group.members )
		});

	}

	function addTeamChannel( user, group, group_formed_at ){

		var team_channel = _.find( user.channels, function( chan ){
			return chan.team_id == makeChatTeamId( group );
		});

		if( !team_channel ){
			user.channels.push( makeChannelItem__ChatTeam( group, group_formed_at ) );
		}

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
			console.log('Reseting channels');

			user.channels = [];
			user.channels.push( makeChannelItem__Personnal( user ) );
			user.channels.push( makeChannelItem__Location( user ) );

			user.findBeforesByPresence(function( err, befores ){

				if( err ) return handleErr( req, res, err_ns, err );

				befores.forEach(function( before ){

					// Check if the user is hosting
					if( before.hosts.indexOf( user.facebook_id ) != -1 ){

						console.log('User is hosting this event, rendering hosts related channels');
						user.channels.push( makeChannelItem__Before( before ) );

						// Create a team chat with other hosts only if it doesnt already exists
						addTeamChannel( user, before.hosts, before.created_at );

						before.groups.forEach(function( group ){
							user.channels.push( makeChannelItem__ChatHosts( before, group ));

						});

					} else {

						// User is not hosting, find his group to access members ids
						var mygroup = _.find( before.groups, function( grp ){
							return grp.members.indexOf( user.facebook_id ) != -1;
						});

						// Create a team chat with other hosts only if it doesnt already exists
						addTeamChannel( user, mygroup.members, mygroup.requested_at );

						user.channels.push( makeChannelItem__ChatUsers( before, mygroup ) );

					}

				});

				user.markModified('channels');
				user.save(function( err, user ){

					if( err ) return handleErr( req, res, err_ns, err );

					req.sent.user = user;
					next();

				});

			});

		}
	};

	// Update the users channel after a request, so they can ask to join without being
	// rejected by the server
	var updateChannelsRequest = function( req, res, next ){

		var err_ns = "updating_channels_request";

		var facebook_id = req.sent.facebook_id;
		var before      = req.sent.before;

		var mygroup = _.find( before.groups, function( grp ){
			return grp.members.indexOf( facebook_id ) != -1;
		});

		var channel_item_hosts   = makeChannelItem__ChatHosts( before, mygroup );
		var channel_item_members = makeChannelItem__ChatUsers( before, mygroup );

		var tasks = [];

		var hosts   = before.hosts;
		var members = mygroup.members;

		tasks.push(function( callback ){
			User.update(
				{ 'facebook_id': { $in: members } },
				{ $push: { 'channels': channel_item_members }},
				{ multi: true },
				function( err, raw ){

					if( err ){
						handleErr( req, res, err_ns, err );
					} else {
						callback();
					}

				});
		});

		tasks.push(function( callback ){
			User.update(
				{ 'facebook_id': { $in: hosts } },
				{ $push: { 'channels': channel_item_hosts }},
				{ multi: true },
				function( err, raw ){

					if( err ){
						handleErr( req, res, err_ns, err );
					} else {
						callback();
					}

				});
		});

		async.parallel( tasks, function(){

			next();

		});


	};

	var updateLocationChannel = function( req, res, next ){

		var err_ns =  "updating_channel_location";

		var user = req.sent.expose.user;

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

				if( err ) handleErr( req, res, err_ns, err );

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
		var before_item  = req.sent.expose.before_item;
		var place_id     = req.sent.requester.location.place_id;
		var notification = req.sent.notification;

		// Convert toObject() to only transport the object and not
		// and the prototype inherited form Mongoose model.
		var data = {
			before      : before.toObject(),
			before_item : before_item
		};

		var channel = makeLocationChannel( place_id );
		pusher.trigger( channel, 'new before', data, socket_id, handlePusherErr );

		// Send a special message to all other hosts to let them know a before was created
		// by one of their friends and they are marked as host
		var channel_name = makeBeforeChannel( before._id );
		var channel_item = makeChannelItem__Before( before );

		// Expose the new channel for every hosts to subscribe
		data.channel_name = channel_name

		// Expose the channel for the requester, so he knows where to subscribe too!
		req.sent.expose.channel_name = channel_name;

		// Push the channel to the model before, so they wont get rejected when joining
		User.update({ 'facebook_id': { $in: before.hosts } }, { $push: { 'channels': channel_item } }, { multi: true },
			function( err, raw ){

				if( err ) return handleErr( req, res, err_ns, err );

				// Hosts are not yet in a global 'before' channel. Push the update to each one if them separately
				// with a proper notification object, nicely formatted by notifier.js !
				data.notification = notification;
				before.hosts.forEach(function( h ){

					if( h != req.sent.facebook_id ){ // Exclude the creator from the list
						var channel = makePersonnalChannel( h );
						pusher.trigger( channel, 'new before hosts', data, socket_id, handlePusherErr );
					}

				});

				next();

			});


	};	

	var pushNewBeforeStatus = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.expose.before;
		var notification = req.sent.notification;

		// Carefull, must ne the requester location's place_id and not the before one
		var place_id  = req.sent.requester.location.place_id;

		var data_users = {
			before_id 	 : before._id,
			hosts     	 : before.hosts,
			status       : before.status,
			notification : before.notification
		};

		var data_hosts = {
			before_id    : before._id,
			hosts        : before.hosts,
			status       : before.status,
			requester    : req.sent.facebook_id, // Used by ui to display the name of the requester,
			notification : before.notification
		};

		// Global message : everyone will received it and react. Hosts too, but they are not
		// supposed to react to it (see below)
		var channel = makeLocationChannel( place_id );
		pusher.trigger( channel, 'new before status', data_users, socket_id, handlePusherErr );

		// Send a special message to all other hosts to let them know a before status was updated
		// by one of their friends, on which they were also hosts
		var channel = makeBeforeChannel( before._id );
		pusher.trigger( channel, 'new before status hosts', data_hosts, socket_id, handlePusherErr );

		next();


	};

	var pushNewRequest = function( req, res, next ){
		
		var socket_id        = req.sent.socket_id;
		var notification     = req.sent.notification;
		var before_item 	 = req.sent.before_item;
		var before 	 	     = req.sent.before;
		var group 			 = req.sent.group;

		var data_hosts = {
			before 			 : _.merge( _.cloneDeep( before ), { status: "hosting" }),
			channel_item 	 : makeChannelItem__ChatHosts( before, group ),
			notification 	 : notification
		};

		var data_members = {
			before 			 : _.merge( _.cloneDeep( before ), { status: "pending" }),
			before_item 	 : before_item,
			channel_item     : makeChannelItem__ChatUsers( before, group ),
			notification 	 : notification
		};

		// Add the users channel to the requester
		req.sent.expose.channel_item = makeChannelItem__ChatUsers( before, group );

    	// Envoyer une notification aux hosts
    	console.log('Notifying new request has been issued');
    	console.log('Host channel: ' + makeBeforeChannel( before._id ) );

		pusher.trigger( makeBeforeChannel( before._id ), 'new request host', data_hosts, socket_id );

		// Envoyer une notification aux amis au courant de rien à priori
		req.sent.members_profiles.forEach(function( user ){
			pusher.trigger( makePersonnalChannel( user.facebook_id ), 'new request group', data_members, socket_id, handlePusherErr );
		});	

		next();

	};

	var pushNewGroupStatus = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.before;
		var notification = req.sent.notification;
		var sender_id    = req.sent.facebook_id;
		var status 		 = req.sent.status;

		var before_id = req.sent.before_id;
		var chat_id   = req.sent.chat_id;

		var data = {
			sender_id    : sender_id,
			before_id    : before_id,
			chat_id      : chat_id,
			status 	     : status,
			notification : notification
		};

		pusher.trigger( chat_id, 'new group status', data, handlePusherErr );
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

		var channel_name = ( type == "chat_all" ) ? "private-all-%chatid" : "private-team-%chatid";
		// Do not filter by socket_id here for ressource efficiency, let the client react differently
		// when he realizes its his own message that bounced back successfully
		var channel = channel_name.replace('%chatid', chat_id);
		pusher.trigger( channel, 'new chat message', data_message, handlePusherErr );
		next();


	};


	var pushNewChatSeenBy = function( req, res, next ){
		
		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;

		var data_seen_by = {
			chat_id: chat_id,
			seen_by: facebook_id
		};

		pusher.trigger( chat_id, 'new chat seen by', data_seen_by, handlePusherErr );
		next();


	};


	module.exports = {
		setChannels 		  	   : setChannels,
		setLastSentAtInChannels    : setLastSentAtInChannels,
		updateChannelsRequest  	   : updateChannelsRequest,
		makeChatGroupId 		   : makeChatGroupId,
		updateLocationChannel 	   : updateLocationChannel,
		pushNewBefore         	   : pushNewBefore,
		pushNewBeforeStatus   	   : pushNewBeforeStatus,
		pushNewRequest 		       : pushNewRequest,
		pushNewGroupStatus 	  	   : pushNewGroupStatus,
		pushNewChatMessage  	   : pushNewChatMessage,
		pushNewChatSeenBy 	       : pushNewChatSeenBy
	};
