
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');

	var updateCache = function( req, res, next ){

		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data = req.sent.app_preferences.alerts

		data.email = req.sent.contact_email; /* @519481 */

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ){
				return eventUtils.raiseError({
					err      : err,
					res      : res,
					toClient : "Error updating cache",
					toServer : "Error updating cache"
				});
			}

			next();

		});

	};

	var setCache = function( req, res, next ){

		if( req.sent.user ){
			console.log('User already exists, skipping init cache settings subscription...');
			return next();
		}

		if( req.sent.no_email ){
			console.log('User has no mail, skipping init cache for now...');
			return next();
		}

		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data = _.clone( settings.default_app_preferences.alerts );

		data.email = req.sent.facebookProfile.email;

		console.log('Setting cache alert data for user : ' + data.email );
		console.log( JSON.stringify( data, null, 4 ));

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ){
				return eventUtils.raiseError({
					err      : err,
					res      : res,
					toClient : "Error updating cache",
					toServer : "Error updating cache"
				});
			}

			next();

		});

	};

	module.exports = {
		updateCache : updateCache,
		setCache    : setCache
	};