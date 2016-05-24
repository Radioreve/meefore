
	var _              = require('lodash');
	var moment         = require('moment');
	var rd             = require('../services/rd');
	var realtime       = require('./realtime');
	var eventUtils     = require('../pushevents/eventUtils');
	var alerts_watcher = require('../middlewares/alerts_watcher');
	var mailer         = require('../services/mailer');

	var handleErr = function( err ){

		console.log('Error with the Redis cache');
		console.log(err);

	};


	var cacheBeforeHosts = function( req, res, next ){

		var before = req.sent.before;

		// Cache hosts ids for chat performance 
    	var hosts_ns = 'before/' + before._id + '/hosts';
    	rd.sadd( hosts_ns, before.hosts, function( err ){

    		if( err ) handleErr( err );

    		next();

    	});

	};

	var cacheGroupStatus = function( req, res, next ){

		var before       = req.sent.before;
		var target_group = req.sent.target_group;
		var status 		 = req.sent.status;

		var group_id = realtime.makeChatGroupId( before._id, before.hosts, target_group.members );
		var group_ns = 'group/' + group_id + '/status';

		rd.set( group_ns, status, function( err ){

			if( status == 'accepted' ){
				target_group.accepted_at = new Date();

				// target_group.members.forEach(function( facebook_id ){

				// 	alerts_watcher.allowSendAlert( facebook_id, "accepted_in", function( allowed, alerts ){

				// 		if( allowed && alerts.email ){
				// 			mailer.sendAlertEmail_RequestAccepted( alerts.email );
				// 		}

				// 	});

				// });

			}

			if( status == 'kicked' ){
				// target_group.kicked_at = new Date();
			}
			
			next();
				
		});

	};



	module.exports = {

		cacheBeforeHosts: cacheBeforeHosts,
		cacheGroupStatus: cacheGroupStatus

	}