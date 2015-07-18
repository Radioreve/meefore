
	var User = require('../models/UserModel'),
		_    = require('lodash'),
		eventUtils = require('../pushevents/eventUtils');


	/*  GET /users/:user_id */
	var getUserById = function( req, res ){

		var userId = req.params.user_id;

		if( !userId )
			return eventUtils.raiseError({
				res: res,
				toClient: "Missing parameter : user id",
				toServer: "API Error"
			});

		User.find({ facebook_id: userId }, function( err, myUser ){

			if( err )
				return eventUtils.raiseError({
					res: res,
					toServer: "API Error (database)",
					toClient: "API Error"
				});

			if( myUser.length == 0 )
				return eventUtils.raiseError({
					res: res,
					toServer: "API Error (database)",
					toClient: "No user found"
				});

			res.json( myUser ).end();

		});

	};

	module.exports = {
		getUserById: getUserById
	};