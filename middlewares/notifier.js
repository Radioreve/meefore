
	var User       = require('../models/UserModel');
	var eventUtils = require('../pushevents/eventUtils');
	var _          = require('lodash');
	var moment     = require('moment');
	var term       = require('terminal-kit').terminal;
	var md5        = require('blueimp-md5');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var hash = function( notification ){
		
		return md5( JSON.stringify( notification ) );

	}

	var addNotification = function( type ){

		// Build the proper notification object based on type
		// Save in in User Model 
		// Append it to the req.sent object for decending functions

		// User just subscribed successfully
		if( type == "inscription_success" ){
			return addNotification__InscriptionSuccess;
		}

		// User has been accepted in a meefore
		if( type == "group_status" ){
			return addNotification__GroupStatus;
		}

		// New friends have joined meefore
		if( type == "new_friends" ){
			return addNotification__NewFriends;
		}

		// Group has asked to join a user's meefore
		if( type == "group_request" ){
			return addNotification__GroupRequest;
		}

		// Group has asked to join a user's meefore
		if( type == "marked_as_host" ){
			return addNotification__MarkedAsHost;
		}

		// Hosts have changed before statuts
		if( type == "before_status" ){
			return addNotification__BeforeStatus;
		}

		if( type == "item_shared" ){
			return addNotification__ItemShared;
		}

	};
		
	function displayError( err, raw ){

		if( err ){
			console.log('Error saving notifications : ' + err );
		} else {
			if( raw.n == 0 ){
				// term.bold.red("Zero users have been notified, could indicate an error..\n");
			} else {
				term.bold.green( raw.n + " users have been notified\n");
			}
		}

	}


	function addNotification__InscriptionSuccess( req, res, next ){

		var err_ns = "notifiying_inscription_success";
		var type   = "inscription_success";
		var user   = req.sent.user;

		var does_exists = _.find( user.notifications, function( n ){
			return n && n.type == type;
		});

		// if( does_exists ){
		// 	return next();
		// }

		if( user.status != "new" ){
			return next();
		}
		
		var n = {
			type 		: type,
			seen_at   	: null,
			clicked_at  : null
		};

		n.happened_at = user.signed_up_at ? new Date( user.signed_up_at ) : new Date();

		n.notification_id = hash( n );

		user.notifications.push( n );
		user.markModified('notifications');
		user.save(function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.user = user;
			next();

		});

	}

	function addNotification__NewFriends( req, res, next ){

		var new_friends = req.sent.new_friends;
		var user 		= req.sent.user;

		if( new_friends.length > 0 ){
			
			var n = {
				type : "new_friends",
				new_friends     : new_friends,
				happened_at     : new Date(),
				seen_at 		: null,
				clicked_at 		: null
			};

			n.notification_id = hash( n );
			
			user.notifications.push( n );
			user.markModified('notifications');
			user.save(function( err, user ){

				if( err ) return handleErr( req, res, err_ns, err );

				next();

			});

		} else {
			next();

		}

	}


	function addNotification__GroupStatus( req, res, next ){

		var type = "accepted_in";

		var status       = req.sent.status;
		var initiated_by = req.sent.facebook_id;
		var before_id    = req.sent.before._id;
		var members      = req.sent.group.members;
		var hosts 	     = req.sent.before.hosts;

		var n = {
			before_id     : before_id,
			happened_at   : new Date(),
			members 	  : members,
			initiated_by  : initiated_by,
			before_id     : before_id,
			hosts 	      : hosts,
			seen_at 	  : null,
			clicked_at 	  : null
		};

		n.notification_id = hash( n );

		// Only notify for now when the group is being accepted
		if( status != "accepted" ){
			return next();
		}

		req.sent.notification_hosts = _.extend({ type: type + '_hosts', }, n );
		req.sent.notification_users = _.extend({ type: type + '_members', }, n );

		// Remove the requester, he already knows he is validating the group
		var query_hosts = { 
			// Let the requester also has a "New match"  notif in this case
			facebook_id: { $in: hosts }
		};
		var update_hosts = { 
			$push: { 'notifications': req.sent.notification_hosts } 
		};
		var query_members = { 
			facebook_id: { $in: members }
		};
		var update_members = { 
			$push: { 'notifications': req.sent.notification_users } 
		};
		var options = {
			multi: true 
		};

		User.update( query_hosts, update_hosts, options, displayError );
		User.update( query_members, update_members, options, displayError );

		next();

	}

	function addNotification__GroupRequest( req, res, next ){

		var type = "group_request";

		var before_id   = req.sent.before._id;
		var hosts       = req.sent.before.hosts;
		var members     = req.sent.members;
		var main_member = req.sent.facebook_id;

		var n = {
			members 	: members,
			main_member : main_member,
			hosts 		: hosts,
			before_id   : before_id,
			happened_at	: new Date(),
			seen_at 	: null,
			clicked_at 	: null
		};

		n.notification_id = hash( n );

		req.sent.notification_hosts = _.extend({ type: type + '_hosts', }, n );
		req.sent.notification_users = _.extend({ type: type + '_members', }, n );

		var query_hosts = { 
			facebook_id: { $in: hosts }
		};
		var update_hosts = { 
			$push: { 'notifications': req.sent.notification_hosts } 
		};
		// Remove the main_member, he already knows he is requesting something
		var query_members = { 
			facebook_id: { $in: _.difference( members, [ main_member ]) }
		};
		var update_members = { 
			$push: { 'notifications': req.sent.notification_users } 
		};
		var options = {
			multi: true 
		};

		User.update( query_hosts, update_hosts, options, displayError );
		User.update( query_members, update_members, options, displayError );

		next();

	};

	function addNotification__MarkedAsHost( req, res, next ){

		var type = "marked_as_host";

		var facebook_id = req.sent.facebook_id;
		var before      = req.sent.before;

		var before_id = before._id;
		var main_host = before.main_host;
		var hosts 	  = before.hosts;
		var address   = before.address.place_name;
		var begins_at = before.begins_at;

		var n = {
			type		 : type,
			initiated_by : facebook_id,
			before_id	 : before_id,
			main_host    : main_host,
			hosts 		 : hosts,
			address 	 : address,
			begins_at  	 : begins_at,
			happened_at  : new Date(),
			seen_at 	 : null,
			clicked_at 	 : null
		};

		n.notification_id = hash( n );

		// Only push notification to 'other' hosts
		var facebook_ids = _.difference( before.hosts, [ facebook_id ] );

		var query = { 
			facebook_id: { $in: facebook_ids }
		};

		var update = { 
			$push: { 'notifications': n } 
		};
		var options = {
			multi: true 
		};

		User.update( query, update, options, displayError );

		// Save notification reference and go to next, dont wait for db call to finish
		req.sent.notification = n;
		next();

	}

	function addNotification__BeforeStatus( req, res, next ){

		var type = "before_status";
		
		var facebook_id = req.sent.facebook_id;
		var before      = req.sent.before;
		var status      = req.sent.status;
		var before_id   = req.sent.before_id;

		// Only notifiy when the before is canceled
		if( status != "canceled" ){
			return next();
		}

		var n = {
			type 		 : "before_canceled",
			before_id	 : before_id,
			initiated_by : facebook_id,
			address 	 : before.address.place_name,
			seen_at 	 : null,
			clicked_at 	 : null,
			happened_at  : new Date()
		};

		n.notification_id = hash( n );

		var hosts        = before.hosts;
		var members      = _.flatten( _.map( before.groups, 'members' ) );
		var facebook_ids = hosts.concat( members );

		var query = { 
			facebook_id: { $in: facebook_ids }
		};
		var update = { 
			$push: { 'notifications': n } 
		};
		var options = {
			multi: true 
		};

		User.update( query, update, options, displayError );

		// Save notification reference and go to next, dont wait for db call to finish
		req.sent.notification = n;
		next();

	}

	function addNotification__ItemShared( req, res, next  ){

		var type = "item_shared";

		var sh           = req.sent.shared_by_object;
		var facebook_ids = req.sent.shared_with_new;

		var n = {
			type  : type,
			target_type      : sh.target_type,
			target_id 		 : sh.target_id,
			initiated_by     : sh.shared_by,
			happened_at  	 : new Date(),
			seen_at 		: null,
			clicked_at 		: null
		};

		n.notification_id = hash( n );

		var query = { 
			facebook_id: { $in: facebook_ids }
		};

		var update = { 
			$push: { 'notifications': n } 
		};
		var options = {
			multi: true 
		};

		User.update( query, update, options, displayError );

		req.sent.notification = n; // not dispatched realtime atm
		next();

	}

	var clearNotifications = function( req, res, next ){

		var err_ns = "clear_notifications";

		var user            = req.sent.user;
		var fetched_befores = req.sent.fetched_befores;

		var updated_needed = false;
		user.notifications.forEach(function( n, i ){
			
			var is_outdated = moment( n.happened_at ).dayOfYear() < moment().dayOfYear();
			var is_today    = moment( n.happened_at ).dayOfYear() == moment().dayOfYear();
			var happn_hour  = moment( n.happened_at ).get("hour");
			var now_hour    = moment().get("hour");

			if( is_outdated || ( is_today && happn_hour > 0 && happn_hour < 14 && now_hour > 14 ) ){
				console.log("Cleaning notification : " + i );
				updated_needed = true;
				delete user.notifications[ i ];
			}

			if( !updated_needed ){
				return next();
			}

		});

		user.notifications = user.notifications.filter( Boolean );
		user.markModified('notifications');
		user.save(function( err, user ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.user = user;
			next();

		});


	}


	module.exports = {
		addNotification    : addNotification,
		clearNotifications : clearNotifications
	};