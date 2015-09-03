
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
		var readby_ns   = 'chat/' + req.id + '/readby';

		/* Reset le readby */
		rd.del( readby_ns, function( err ){

			/* Add le sender au readby */
			rd.sadd( readby_ns, req.name, function( err ){

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

							rd.hmset( message_ns + count, data, function( err, response ){

								eventUtils.sendSuccess( res, data );
								pusher.trigger( req.id, 'new chat message', data );

							});
						});

					});
				});						

			});

		});
		
	};

	var fetchChatMessages = function( req, res ){

		var all_messages = [];

		var count_ns	= 'chat/' + req.id + '/count';
		var message_ns  = 'chat/' + req.id + '/messages/';
		var readby_ns   = 'chat/' + req.id + '/readby';

		rd.smembers( readby_ns, function( err, readby ){

			rd.get( count_ns, function( err, count ){

				if( err || !count )
					return eventUtils.sendSuccess( res, [] );


				for( var i = 1; i <= count; i++ ){

					(function( i ){ // closure required to capture i value

						rd.hgetall( message_ns + i, function( err, message ){
							
							all_messages.push( message );

							if( all_messages.length == count  ){

								var filtered_messages = [];

								/* Tri par ordre croissant de date */
								all_messages.sort(function( e1, e2 ){
									return new Date( e1.sent_at ) > new Date( e2.sent_at );
								});

								/* On cherche les N derniers messages où l'on était validé par les orgas */
								all_messages.forEach(function( msg ){

									if( !req.group_id || req.group_id && msg.audience.indexOf( req.group_id ) != -1 )
										filtered_messages.push( msg );

								});
								/* Sending back filtered messages by audience */
								eventUtils.sendSuccess( res, { messages: filtered_messages, readby: readby } );

							}
						});

					})( i );
				}

			}); 
		});

	};

	var setReadBy = function( req, res ){

		var readby_ns = 'chat/' + req.id + '/readby';

		// Set & Get the updated set
		rd.sadd( readby_ns, req.name, function( err ){

			rd.smembers( readby_ns, function( err, readby ){

				var data = {
					id     : req.id,
					readby : readby
				};

				eventUtils.sendSuccess( res, data );
				pusher.trigger( req.id, 'new chat readby', data );

			});

		});

	};

	module.exports = {
		addChatMessage: addChatMessage,
		fetchChatMessages: fetchChatMessages,
		setReadBy: setReadBy
	};