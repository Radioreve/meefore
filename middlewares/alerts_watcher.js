
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');

	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};

	var updateCache = function( req, res, next ){
		
		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data     = req.sent.app_preferences.alerts

		data.email = req.sent.contact_email; /* @519481 */

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ){
				return handleErr( req, res, 'server_error', {
					err_id: 'updating_cache_alerts'
				});
			}

			next();

		});

	};

	var setCache = function( req, res, next ){

		if( req.sent.user ){
			console.log('User already exists, updating settings cache instead of setting defaults...');

			req.sent.facebook_id 	 = req.sent.user.facebook_id;
			req.sent.contact_email   = req.sent.user.contact_email;
			
			req.sent.app_preferences = {
				alerts: req.sent.user.app_preferences.alerts
			}

			return updateCache( req, res, next );
		}

		if( req.sent.bot ){
			console.log('User is bot, skipping init cache settings subscription...');
			return next();
		}

		if( req.sent.no_email ){
			console.log('User has no mail, skipping init cache for now...');
			return next();
		}

		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data = _.cloneDeep( settings.default_app_preferences.alerts );

		data.email = req.sent.facebook_profile.email;

		console.log('Setting cache alert data for user : ' + data.email );
		console.log( JSON.stringify( data, null, 4 ));

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ) return handleErr( req, res, 'server_error', {
				err_id: 'updating_cache_alerts'
			});

			next();

		});

	};

	var allowSendAlert = function( facebook_id, type, callback ){

		var allow       = false;
		var alert_param = null;

		var alerts_ns          = 'user_alerts';
		var time_last_alert_ns = 'user_alerts_time';

		rd.hgetall( alerts_ns + '/' + facebook_id, function( err, alerts ){

			if( err ){
				console.log( 'An error occured fetching alert params: ' + err );
				return callback( false );
			}

			if( !alerts ){
				console.log('Not notifying about chat because no alerts param');
				return callback( false );
			}

			// Need to respect the pattern: the type provided as argument must match the name in cache
			alert_param = alerts[ type ];

			// Test if a match was provided (or if the type was passed);
			if( !alert_param || !type ){
				console.log('Missing parameters, alert_param: ' + alert_param + ' , type: ' + type );
				return callback( false );
			}


			if( alert_param == 'no' ){
				console.log('User doesnt want to receive this alert ( ' + type + ') , skipping...');
				return callback( false );
			}

			// User wants to get notified by mail.
			// Check when was the last alert.
			var now = new moment();
			rd.get( time_last_alert_ns + '/' + facebook_id, function( err, time_last_alert ){

				if( alerts.min_frequency > 0 && ( now.unix() - time_last_alert) < alerts.min_frequency ){
					
					console.log('Too soon to be alerted again');
					return callback( false );

				} else {

					rd.set( time_last_alert_ns + '/' + facebook_id, now.unix(), function( err ){

						return callback( true, alerts );

					});
				}


			});


		});

	}

	module.exports = {
		updateCache    : updateCache,
		setCache       : setCache,
		allowSendAlert : allowSendAlert
	};