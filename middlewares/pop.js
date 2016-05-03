	
	var eventUtils  = require('../pushevents/eventUtils'),
		_     	    = require('lodash');

	var User        = require('../models/UserModel');

	function handleErr( req, res, err_ns, err ){
		return eventUtils.raiseApiError( req, res, err_ns, err );
	};

	var populateUser = function( options ){

		var err_ns  = "populate_user",
			options = options || {};

		return function( req, res, next ){

			var force_presence;
			if( options.force_presence != null ){
				force_presence = options.force_presence;
			} else {
				force_presence = true;
			}

			console.log('Populating user, force_presence : ' + force_presence + ' for facebook_id : ' + req.sent.facebook_id );

			var query = { facebook_id: req.sent.facebook_id };
			User.findOne( query, function( err, user ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				}

				if( !user && force_presence ){
					return handleErr( req, res, err_ns, {
							'err_id': 'ghost_user',
							'msg'   : 'The presence of a user in database was necessary for this route. None was found.'
						});
				}

				if( user ){
					console.log('Populated success, user name is : ' + user.name );
				}
				
				req.sent.user = user;
				next();

			});
		};
	};

	module.exports = {
		populateUser: populateUser
	};