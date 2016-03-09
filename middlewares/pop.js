	
	var eventUtils  = require('../pushevents/eventUtils'),
		_     	    = require('lodash');

	var User        = require('../models/UserModel');

	function handleErr( res, err_ns, err ){
		return eventUtils.raiseApiError( res, err_ns, err );
	};

	var populateUser = function( options ){

		var err_ns  = "populate_user",
			options = options || {};

		return function( req, res, next ){

			var force_presence = options.force_presence || true;

			console.log('Populating user, force_presence : ' + force_presence );

			var query = { facebook_id: req.sent.facebook_id };
			User.findOne( query, function( err, user ){

				if( err ){
					return handleErr( res, err_ns, err );
				}

				if( !user && force_presence ){
					return handleErr( res, err_ns, {
							'err_id': 'ghost_user',
							'msg'   : 'The presence of a user in database was necessary for this route. None was found.'
						});
				}

				console.log('User populated successfully');
				req.sent.user = user;
				next();

			});
		};
	};

	module.exports = {
		populateUser: populateUser
	};