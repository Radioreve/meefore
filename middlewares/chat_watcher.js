
	var rd             = require('../services/rd');
	var alerts_watcher = require('../middlewares/alerts_watcher');
	var Message        = require('../models/MessageModel');
	var async          = require('async');
	var mailer         = require('../services/mailer');

	function keeptrack( msg ){
		console.log( msg );
		mail_html.push('<div>' + msg + '</div>');
		
	};

	var mailOfflineUsers = function( req, res, next ){

		// Mailing users shouldnt slow anything down
		next();

		var offline_users = req.sent.offline_users;

		if( !offline_users ){
			return console.log('Everybody is offline, no need to send any email');
		}

		offline_users.forEach(function( facebook_id ){

			alerts_watcher.allowSendAlert( facebook_id, "new_message_received", function( allowed, alerts ){

				if( allowed && alerts.email ){
					mailer.sendAlertEmail_MessageReceived( req.sent.name, alerts.email /* @519481 */);
				}

			});


			// rd.hgetall( alerts_ns + '/' + facebook_id, function( err, alerts ){

			// 	if( err ) return console.log( err );

			// 	// For somereason, if no info available or user doesnt want email, return
			// 	if( !alerts || alerts.new_message_received == 'no' ){
			// 		return console.log('Not notifying about chat because no alerts param or unread == no');
			// 	}

			// 	// User wants to get notified by mail.
			// 	// Check when was the last alert.
			// 	rd.get( time_last_alert_ns + '/' + facebook_id, function( err, time_last_alert ){

			// 		if( alerts.min_frequency > 0 && (moment().unix() - time_last_alert) < alerts.min_frequency ){
			// 			return console.log('Too soon to be alerted again');
			// 		} else {
			// 			rd.set( time_last_alert_ns + '/' + facebook_id, moment().unix(), function( err ){
			// 				mailer.sendAlertEmail_MessageReceived( req.sent.name, alerts.email /* @519481 */);
			// 			});
			// 		}


			// 	});


			// });

		});

	};



	module.exports = {
		mailOfflineUsers : mailOfflineUsers
	};