
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Event      = require('../models/EventModel'),
		Message    = require('../models/MessageModel'),
		rd		   = require('../globals/rd'),
		moment     = require('moment');

	var pusher     = require('../globals/pusher');


	var addChatMessage = function( req, res ){

		/* Caching everything for performance */
		var count_ns	= 'chat/' + req.id + '/count';
		var message_ns  = 'chat/' + req.id + '/messages/';
		var audience_ns = 'chat/' + req.id + '/audience';

		rd.smembers( audience_ns, function( err, audience ){

			var data = {
				id          : req.id,
				msg         : req.msg,
				name        : req.name,
				facebook_id : req.facebook_id,
				img_id      : req.img_id,
				img_vs      : req.img_vs,
				sent_at     : new Date(),
				audience    : audience
			};


			rd.incr( count_ns, function( err, response ){

				rd.get( count_ns, function( err, count ){

					rd.hmset( chat_ns + '/messages/' + count, data, function( err, response ){

						eventUtils.sendSuccess( res, data );
						pusher.trigger( req.id, 'new chat message', data );

					});
				});

			});
		});

	};

	var fetchChatMessages = function( req, res ){

		var all_messages = [];

		var count_ns	= 'chat/' + req.id + '/count';
		var message_ns  = 'chat/' + req.id + '/messages/';


			rd.get( count_ns, function( err, count ){

				for( var i = 0; i <= count; i++ ){

					(function( i ){ // closure required to capture i value

						rd.hgetall( message_ns + i, function( err, message ){
							
							all_messages.push( message );

							if( messages.length == count  ){

								var filtered_messages = [];

								/* Tri par ordr croissant de date */
								all_messages.sort(function( e1, e2 ){
									return new Date( e1.sent_at ) < new Date( e2.sent_at );
								});

								/* On cherche les N derniers messages où l'on était validé par les orgas */
								all_messages.forEach(function( msg ){

									if( !req.group_id || req.group_id && msg.audience.indexOf( group_id ) != -1 )
										filtered_messages.push( msg );

								});
								/* Sending back filtered messages by audience */
								eventUtils.sendSuccess( res, filtered_messages );

							}
						});

					})( i );
				}

			}); 

	};

	module.exports = {
		addChatMessage: addChatMessage,
		fetchChatMessages: fetchChatMessages
	};