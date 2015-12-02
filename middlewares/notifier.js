
	var User   = require('../models/UserModel');
	var _      = require('lodash');
	var moment = require('moment');

	var addNotification = function( type ){

		// Build the proper notification object based on type
		// Save in in User Model 
		// Append it to the req.sent object for decending functions

		// User has been accepted in a meefore
		if( type == "accepted_in" ){
			return addNotification_AcceptedIn
		}

		// Group has asked to join a user's meefore
		if( type == "group_request" ){
			return addNotification_GroupRequest
		}

		// User has unread messages
		if( type == "unread_messages" ){
			return addNotification_UnreadMessages
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

		var type         = "accepted_in";
		var status       = req.sent.group_status;
		var group_name   = req.sent.group_name;
		var facebook_ids = req.sent.members_facebook_id;

		// Shortcut reference
		var n = {
			type       : type,
			group_name : group_name,
			happened_at: moment().toISOString()
		};

		// Only save notification if group got accepted
		if( status == "accepted" ){

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

		} else {
			next();
		}

	}

	function addNotification_GroupRequest( req, res, next ){

		var type         = "group_request";
		var group_name   = req.sent.new_group.group_name;
		var facebook_ids = req.sent.hosts_facebook_id;

		// Shortcut reference
		var n = {
			type       : type,
			group_name : group_name,
			happened_at: moment().toISOString()
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