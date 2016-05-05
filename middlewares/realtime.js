	
	var pusher     = require('../services/pusher');
	var _          = require('lodash');
	var eventUtils = require('../pushevents/eventUtils');
	var md5        = require('blueimp-md5');
	var Before     = require('../models/BeforeModel');
	var mongoose   = require('mongoose');

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
		return "private-" + facebook_id;
	}

	function makeLocationChannel( place_id ){
		return "placeid=" + place_id;
	}

	function makeBeforeChannel( before_id ){
		return "presence-" + before_id;
	}

	function makeChatChannel( before_id, hosts, members, type ){

		if( ['all','hosts','users'].indexOf( type ) == -1 ){
			console.log('Cannt make chat channel without proper type, type: ' + type );
			return null;
		}

		var sorted_hosts   = sortIds( hosts ).join('-');
		var sorted_members = sortIds( members ).join('-');

		var payload 	   = [ before_id, sorted_hosts, sorted_members ].join('__');

		return "presence-" + type + '-' + md5( payload );

	}

	function makeChatChannel__All( before_id, hosts, members ){
		return makeChatChannel( before_id, hosts, members, 'all' );

	}	

	function makeChatChannel__Users( before_id, hosts, members ){
		return makeChatChannel( before_id, hosts, members, 'users' );

	}

	function makeChatChannel__Hosts( before_id, hosts, members ){
		return makeChatChannel( before_id, hosts, members, 'hosts' );

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
			// Personnal channel
			user.channels.push({
				type: 'personnal',
				name: makePersonnalChannel( user.facebook_id )
			});

			// Location channel
			user.channels.push({
				type: 'location',
				name: makeLocationChannel( user.location.place_id )
			});

			// Prepare the before_ids ( cast is needed )
			var before_ids = _.map( user.befores, function( bfr ){
				return mongoose.Types.ObjectId( bfr.before_id );
			});

			Before.find({ '_id': { $in: before_ids } }, function( err, befores ){

				if( err ) return handleErr( req, res, err_ns, err );

				console.log(befores);

				befores.forEach(function( before ){

					var hosts  = before.hosts;
					var groups = before.groups;

					// Check if the user is hosting
					if( before.hosts.indexOf( user.facebook_id ) != -1 ){

						console.log('User is hosting this event, rendering hosts related channels');
						user.channels.push({
							type: 'before',
							name: makeBeforeChannel( before._id )
						});

						groups.forEach(function( group ){

							var members = group.members;

							user.channels.push({
								type: 'chat-all',
								name: makeChatChannel__All( before._id, hosts, members )
							});

							user.channels.push({
								type: 'chat-hosts',
								name: makeChatChannel__Hosts( before._id, hosts, members )
							});
						});

					} else {

						// User is not hosting, find his group to access members ids
						var mygroup = _.find( groups, function( grp ){
							return grp.members.indexOf( user.facebook_id ) != -1;
						});

						var members = mygroup.members;

						user.channels.push({
							type: 'chat-all',
							name: makeChatChannel__All( before._id, hosts, members )
						});

						user.channels.push({
							type: 'chat-users',
							name: makeChatChannel__Users( before._id, hosts, members )
						});

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

	var pushNewBefore = function( req, res, next ){

		var socket_id    = req.sent.socket_id;
		var before       = req.sent.expose.before;
		var before_item  = req.sent.expose.before_item;
		var place_id 	 = req.sent.requester.location.place_id;

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

		var channel_item = {
			type: 'before',
			name: channel_name
		};

		// Expose the new channel for every hosts to subscribe
		data.channel_name = channel_name
		// Expose the channel for the requester, so he knows where to subscribe too!
		req.sent.expose.channel_name = channel_name;

		// Push the channel to the model before, so they wont get rejected when joining
		User.update({ 'facebook_id': { $in: before.hosts } }, { $push: { 'channels': channel_item } }, { multi: true },
			function( err, raw ){

				if( err ) return handleErr( req, res, err_ns, err );

				// Hosts are not yet in a global 'before' channel. Push the update to each one if them separately
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

		var socket_id = req.sent.socket_id;
		var before 	  = req.sent.expose.before;
		// Carefull, must ne the requester location's place_id and not the before one
		var place_id  = req.sent.requester.location.place_id;

		var data_users = {
			before_id : before._id,
			hosts     : before.hosts,
			status    : before.status
		};

		var data_hosts = {
			before_id : before._id,
			hosts     : before.hosts,
			status    : before.status,
			requester : req.sent.facebook_id // Used by ui to display the name of the requester
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
		var before_id        = req.sent.before_id;
		var notification     = req.sent.notification;
		var members_profiles = req.sent.members_profiles;

		var data_hosts = {
			before 			 : _.merge( _.cloneDeep(before), { status: "hosting" }),
			before_item 	 : before_item,
			notification 	 : notification,
			members_profiles : members_profiles
		};

		var data_members = {
			before 			 : _.merge( _.cloneDeep(before), { status: "pending" }),
			before_item 	 : before_item,
			notification 	 : notification,
			members_profiles : members_profiles
		};

    	// Envoyer une notification aux hosts
    	console.log('Notifying new request has been issued');
    	console.log('Host channel: ' + makeBeforeChannel( before_id ) );

		pusher.trigger( makeBeforeChannel( before_id ), 'new request host', data_hosts, socket_id );

		// Envoyer une notification aux amis au courant de rien à priori
		req.sent.members_profiles.forEach(function( user ){
			pusher.trigger( makePersonnalChannel( user.facebook_id ), 'new request group', data_members, socket_id, handlePusherErr );
		});	

		next();

	};


	module.exports = {
		setChannels 		  : setChannels,
		makePersonnalChannel  : makePersonnalChannel,
		makeLocationChannel   : makeLocationChannel,
		makeBeforeChannel 	  : makeBeforeChannel,
		makeChatChannel 	  : makeChatChannel,
		updateLocationChannel : updateLocationChannel,
		pushNewBefore         : pushNewBefore,
		pushNewBeforeStatus   : pushNewBeforeStatus
	};
