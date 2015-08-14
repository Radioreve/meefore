	
	var eventUtils  = require('../pushevents/eventUtils'),
		_     	    = require('lodash');

	var User        = require('../models/UserModel');

		var populateUser = function( options ){

		var options = options || { auth_type: null, force_presence: true };

		var auth_type = options.auth_type;
		var force_presence = options.force_presence;

		return function( req, res, next ){

			/* Détection automatique du mode d'authentification */
			if( auth_type == 'facebook_id' && req.body.facebook_id )
				var query = { 'facebook_id': req.body.facebook_id };

			if( !auth_type && req.body.facebook_id )
				var query = { 'facebook_id': req.body.facebook_id };

			if( auth_type == 'app_id' && req.body.userId )
				var query = { '_id' : req.body.userId };

			if( !auth_type && req.body.userId )
				var query = { '_id' : req.body.userId };

			if( !query )
				return eventUtils.raiseError({
					toClient: "The auth type didnt match any parameters",
					res: res
				});

			req.body.query = query;

			User.findOne( query, function( err, user ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res, toClient: "Bad request (E83)" });

				if( user ){
					req.body.user = user;
				} else {

					if( force_presence == true )
						return eventUtils.raiseError({
							res: res,
							toClient: "No user has been found, when necessary"
						});

					req.body.user = null;
				}
			
				return next();

			});

		};
	};

	module.exports = {
		populateUser: populateUser
	};