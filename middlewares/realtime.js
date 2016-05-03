	
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

	function makeHostsChannel( before_id ){
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

		return "presence-" + type + '-' + md5.hash( payload );

	}

	function makeChatChannel_All( before_id, hosts, members ){
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

			user.channels.push({
				type: 'Baby',
				name: 'Elyna'
			});

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
							name: makeHostsChannel( before._id )
						});

						groups.forEach(function( group ){

							var members = group.members;

							user.channels.push({
								type: 'chat-all',
								name: makeChatChannel_All( before._id, hosts, members )
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
							name: makeChatChannel__All( bfr.before_id, hosts, members )
						});

						user.channels.push({
							type: 'chat-users',
							name: makeChatChannel__Users( bfr.before_id, hosts, members )
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
		var place_id 	 = req.sent.requester.location.place_id;

		// Convert toObject() to only transport the object and not
		// and the prototype inherited form Mongoose model.
		var data = { before: before.toObject() };

		var channel = makeLocationChannel( place_id );
		pusher.trigger( channel, 'new before', data, socket_id, handlePusherErr );

		next();

	};	

	var pushNewBeforeStatus = function( req, res, next ){

		var socket_id = req.sent.socket_id;
		var bfr 	  = req.sent.expose.before;
		var place_id  = bfr.address.place_id;

		var data = {
			before_id : bfr._id,
			hosts     : bfr.hosts,
			status    : bfr.status
		};

		var channel = makeLocationChannel( place_id );
		pusher.trigger( channel, 'new before status', data, socket_id, handlePusherErr );

		next();

	};

	var pushNewRequest = function( req, res, next ){
		
		var socket_id        = req.sent.socket_id;
		var before_id        = req.sent.before._id;
		var notification     = req.sent.notification;
		var members_profiles = req.sent.members_profiles;

		var data = {
			members_profiles : members_profiles,
			member 			 : members,
			notification 	 : notification, 
			before_id        : before_id
		};

    	// Envoyer une notification aux hosts
    	console.log('Notifying new request has been issued');
    	console.log('Host channel: ' + makeHostsChannel( before_id ) );

		pusher.trigger( makeHostsChannel( before_id ), 'new request host', data, socket_id );

		// Envoyer une notification aux amis au courant de rien à priori
		req.sent.members_profiles.forEach(function( user ){
			pusher.trigger( makePersonnalChannel( user.facebook_id ), 'new request group', data, socket_id, handlePusherErr );
		});	

		next();

	};


	module.exports = {
		setChannels 		  : setChannels,
		makePersonnalChannel  : makePersonnalChannel,
		makeLocationChannel   : makeLocationChannel,
		makeHostsChannel 	  : makeHostsChannel,
		makeChatChannel 	  : makeChatChannel,
		updateLocationChannel : updateLocationChannel,
		pushNewBefore         : pushNewBefore,
		pushNewBeforeStatus   : pushNewBeforeStatus
	};
