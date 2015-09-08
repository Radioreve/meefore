
	var nv = require('node-validator');
	var rd = require('../../globals/rd');
	var _  = require('lodash');

	var check = function( req, res, next ){

		var facebook_id = req.sent.facebook_id; // Passed in token, surcharged Pusher init clientside method [@48723]
		var socket_id   = req.sent.socket_id;   
		var channel     = req.sent.channel_name;

		var checkJoinRequest = nv.isAnyObject()
			.withRequired('socket_id'	, nv.isString({ match: /^\d+.\d+$/ }) )
			.withRequired('facebook_id' , nv.isString() );

		nv.run( checkJoinRequest, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			var chat_id = channel;
			var members_facebook_id = chat_id.split('-')[2].split('.');

			var event_id = chat_id.split('-')[1];
			var hosts_ns = 'event/' + event_id + '/hosts';
			rd.smembers( hosts_ns, function( err, hosts_facebook_id ){

				// N'est ni un host de l'event, ni un membre du group en question 
				if( hosts_facebook_id.indexOf( facebook_id == - 1 ) && members_facebook_id.indexOf( facebook_id ) == -1 ){

					req.app_errors.push({
						message   : "You cant join this channel, you are not part of the group",
						err_id    : "unauthorized",
						http_code : 403,
						data      : {
							members_facebook_id : members_facebook_id,
							facebook_id         : facebook_id,
							socket_id           : socket_id
						}
					});
					return next();
				}

			});

			next();


		});

	};





	module.exports = {
		check: check
	};
