
	var _          = require('lodash');
	var rd         = require('../services/rd');
	var erh 	   = require('../services/err');
	var print 	   = require('../services/print')(  __dirname.replace( process.cwd()+'/', '' ) + '/alerts_watcher.js' )
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');


	var updateCache = function( req, res, next ){
		
		var err_ns   = 'updating_cache_alerts';

		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data     = req.sent.app_preferences.alerts

		data.email = req.sent.contact_email; /* @519481 */

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ) return erh.handleRedisErr( req, res, err_ns, err );

			next();

		});

	};

	var setCache = function( req, res, next ){

		if( req.sent.user ){
			print.info('User already exists, updating settings cache instead of setting defaults...');

			req.sent.facebook_id 	 = req.sent.user.facebook_id;
			req.sent.contact_email   = req.sent.user.contact_email;
			
			req.sent.app_preferences = {
				alerts: req.sent.user.app_preferences.alerts
			}

			return updateCache( req, res, next );
		}

		if( req.sent.bot ){
			print.info('User is bot, skipping init cache settings subscription...');
			return next();
		}

		if( req.sent.no_email ){
			print.info('User has no mail, skipping init cache for now...');
			return next();
		}

		var alert_ns = 'user_alerts/' + req.sent.facebook_id;
		var data = _.cloneDeep( settings.default_app_preferences.alerts );

		data.email = req.sent.facebook_profile.email;

		print.info('Setting cache alert data for user : ' + data.email );
		print.debug({ settings_data: data }, "data object" );

		rd.hmset( alert_ns, data, function( err, res ){

			if( err ) return erh.handleRedisErr( req, res, err_ns, err );

			next();

		});

	};


	module.exports = {
		updateCache    : updateCache,
		setCache       : setCache
	};