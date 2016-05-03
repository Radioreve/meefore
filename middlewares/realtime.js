
	var pusher = require('../services/pusher');
	var _	   = require('lodash');
	var eventUtils = require('../pushevents/eventUtils');
	var md5 	   = require('blueimp-md5');

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

	function makeChatChannel( before_id, hosts, members ){

		var sorted_hosts   = sortIds( hosts ).join('-');
		var sorted_members = sortIds( members ).join('-');

		var payload 	   = [ before_id, sorted_hosts, sorted_members ].join('__');

		return "presence-" + md5.hash( payload );

	}


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

		var socket_id    = req.sent.socket_id;
		var before_id	 = req.sent.before._id;
		var hosts 		 = req.sent.before.hosts;
		var new_group    = req.sent.new_group;
		var notification = req.sent.notification;

		var data = {
			before_id    : before_id,
			hosts        : hosts,
			group        : new_group,
			notification : notification 
		};

    	// Envoyer une notification aux hosts
    	console.log('Notifying new request has been issued');
    	console.log('Host channel: ' + makeHostsChannel( before_id ) );

		pusher.trigger( makeHostsChannel( before_id ), 'new request host', data, socket_id );

		// Envoyer une notification aux amis au courant de rien à priori
		req.sent.members_profiles.forEach(function( user ){
			pusher.trigger( makePersonnalChannel( user.facebook_id ), 'new request group', data, socket_id );
		});	

	};


	module.exports = {
		makePersonnalChannel  : makePersonnalChannel,
		makeLocationChannel   : makeLocationChannel,
		makeHostsChannel 	  : makeHostsChannel,
		makeChatChannel 	  : makeChatChannel,
		updateLocationChannel : updateLocationChannel,
		pushNewBefore         : pushNewBefore,
		pushNewBeforeStatus   : pushNewBeforeStatus
	};
