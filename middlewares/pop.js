	
	var eventUtils  = require('../pushevents/eventUtils');
	var User        = require('../models/UserModel');
	var _     	    = require('lodash');
	var log 		= require('../middlewares/log');
	var erh 		= require('../services/err');


	var populateUser = function( options ){

		var err_ns  = "populate_user";
		var options = options || {};

		return function( req, res, next ){

			var force_presence;
			if( options.force_presence != null ){
				force_presence = options.force_presence;
			} else {
				force_presence = true;
			}

			var facebook_id = req.sent.facebook_id || req.sent.user_id;
			User.findOne({ facebook_id: facebook_id }, function( err, user ){

				if( err ){
					return erh.handleBackErr( req, res, {
						source: "mongo",
						err_ns: err_ns,
						err: err
					});

				}

				if( !user && force_presence ){
					return erh.handleFrontErr( req, res, {
						source: "empty",
						err_ns: err_ns,
						msg: "Unable to find user with id " + facebook_id + " in database"
					});

				}
				
				req.sent.user = user;

				log.addContext("user")( req, res, next );

			});
		};
	};

	module.exports = {
		populateUser: populateUser
	};