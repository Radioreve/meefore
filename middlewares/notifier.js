
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
			return addNotification_AcceptedIn
		}

		// Group has asked to join a user's meefore
		if( notification_id == "group_request" ){
			return addNotification_GroupRequest
		}

		// Group has asked to join a user's meefore
		if( notification_id == "marked_as_host" ){
			return addNotification_MarkedAsHost
		}


	};
		
	function displayError( err, raw ){

		if( err ){
			console.log('Error saving notifications : ' + err );
		} else {
			console.log( raw.n + ' users notified');
		}

	}
		
	function addNotification_AcceptedIn( req, res, next ){

		var notification_id = "accepted_in";

		var status    = req.sent.status;
		var before_id = req.sent.before_id;
		var members   = req.sent.members;

		// Shortcut reference
		var n = {
			notification_id : notification_id,
			before_id       : before_id,
			happened_at     : moment().toISOString()
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

	function addNotification_GroupRequest( req, res, next ){

		var notification_id = "group_request";

		var before_id    = req.sent.before_id;
		var members      = req.sent.target_group.members;

		// Shortcut reference
		var n = {
			notification_id : notification_id,
			members 	    : members,
			before_id   	: before_id,
			happened_at		: moment().toISOString()
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

	function addNotification_MarkedAsHost( req, res, next ){

		var notification_id = "marked_as_host";
		var before			= req.sent.expose.before;
		// At this stage, we cannt access the before_id (not constructed yet) so we pass
		// begins_at to uniquely find the before clientside based on dayOfYear() (since users
		// cant host multiple befores on the same day )
		var begins_at    = req.sent.begins_at;
		var facebook_id  = req.sent.facebook_id;

		// Only push notification to 'other' hosts
		var facebook_ids = _.difference( req.sent.hosts_facebook_id, [facebook_id] );

		// Shortcut reference
		var n = {
			before_id	    : before._id,
			notification_id : notification_id,
			before_begins_at : begins_at,
			created_by      : facebook_id,
			happened_at     : moment().toISOString()
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

		// Save notification reference and go to next, dont wait for db call to finish
		req.sent.notification = n;
		next();

	}


	module.exports = {
		addNotification: addNotification
	};