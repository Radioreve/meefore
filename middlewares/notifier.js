
	var User   = require('../models/UserModel');
	var _      = require('lodash');
	var moment = require('moment');

	var addNotification = function( notification_id ){

		// Build the proper notification object based on notification_id
		// Save in in User Model 
		// Append it to the req.sent object for decending functions

		return function( req, res, next ){
			next();
		}

		// User has been accepted in a meefore
		if( notification_id == "accepted_in" ){
			return addNotification__AcceptedIn
		}

		// Group has asked to join a user's meefore
		if( notification_id == "group_request" ){
			return addNotification__GroupRequest
		}

		// Group has asked to join a user's meefore
		if( notification_id == "marked_as_host" ){
			return addNotification__MarkedAsHost
		}

		// Hosts have changed before statuts
		if( notification_id == "before_status" ){
			return addNotification__BeforeStatus
		}

		if( notification_id == "item_shared" ){
			return addNotification__ItemShared
		}

	};
		
	function displayError( err, raw ){

		if( err ){
			console.log('Error saving notifications : ' + err );
		} else {
			console.log( raw.n + ' users notified');
		}

	}
		
	function addNotification__AcceptedIn( req, res, next ){

		var notification_id = "accepted_in";

		var status    = req.sent.status;
		var before_id = req.sent.before._id;
		var members   = req.sent.members;

		var n = {
			notification_id : notification_id,
			before_id       : before_id,
			happened_at     : new Date()
		};

		// Only save notification if group got accepted
		if( status == "accepted" ){

			var query = { 
				facebook_id: { $in: members }
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

		} else {
			next();

		}

	}

	function addNotification__GroupRequest( req, res, next ){

		var notification_id = "group_request";

		var before_id = req.sent.before._id;
		var members   = req.sent.members;

		var n = {
			notification_id : notification_id,
			members 	    : members,
			before_id   	: before_id,
			happened_at		: new Date()
		};

		var query = { 
			facebook_id: { $in: members }
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

	};

	function addNotification__MarkedAsHost( req, res, next ){

		var notification_id = "marked_as_host";

		var facebook_id = req.sent.facebook_id;
		var before      = req.sent.before;

		var before_id = before._id;
		var main_host = before.main_host;
		var address   = before.address.place_name;

		var n = {
			notification_id : notification_id,
			before_id	    : before_id,
			main_host       : main_host,
			address 		: address,
			happened_at     : new Date()
		};

		// Only push notification to 'other' hosts
		var facebook_ids = _.difference( req.sent.hosts, [ facebook_id ] );

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

		var notification_id = "before_status";
		
		var facebook_id = req.sent.facebook_id;
		var before      = req.sent.before;
		var status      = req.sent.status;
		var before_id   = req.sent.before_id;

		// Only notifiy when the before is canceled
		if( status != "canceled" ){
			return next();
		}

		var n = {
			notification_id : notification_id,
			before_id	    : before_id,
			canceled_by     : facebook_id,
			address 		: before.address.place_name,
			happened_at     : new Date()
		};

		// Notify every hosts and every members of every group, except the sender
		var hosts        = before.hosts;
		var members      = _.flatten( _.map( before.groups, 'members' ) );
		var facebook_ids = _.difference( hosts.concat( members ), [ facebook_id ] );

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

		var notification_id = "item_shared";

		var sh           = req.sent.shared_by_object;
		var facebook_ids = req.sent.shared_with_new;

		var n = {
			notification_id  : notification_id,
			target_type      : sh.target_type,
			target_id 		 : sh.target_id,
			shared_by 		 : sh.shared_by,
			happened_at  	 : new Date()
		};

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


	module.exports = {
		addNotification: addNotification
	};