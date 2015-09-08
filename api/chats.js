
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
		var count_ns	= 'chat/' + req.sent.chat_id + '/count';
		var message_ns  = 'chat/' + req.sent.chat_id + '/messages/';
		var readby_ns   = 'chat/' + req.sent.chat_id + '/readby';

		/* Reset le readby */
		rd.del( readby_ns, function( err ){

			/* Add le sender au readby */
			rd.sadd( readby_ns, req.sent.name, function( err ){

					var data = {
						chat_id     : req.sent.chat_id,
						msg         : req.sent.msg,
						name        : req.sent.name,
						facebook_id : req.sent.facebook_id,
						img_id      : req.sent.img_id,
						img_vs      : req.sent.img_vs,
						sent_at     : new Date()
					};

					rd.incr( count_ns, function( err, response ){

						rd.get( count_ns, function( err, count ){

							rd.hmset( message_ns + count, data, function( err, response ){

								eventUtils.sendSuccess( res, data );
								pusher.trigger( 'presence-' + req.sent.chat_id, 'new chat message', data );

							});
						});

					});

			});

		});
		
	};

	var fetchChatMessages = function( req, res ){

		var all_messages = [];

		var count_ns	= 'chat/' + req.sent.chat_id + '/count';
		var message_ns  = 'chat/' + req.sent.chat_id + '/messages/';
		var readby_ns   = 'chat/' + req.sent.chat_id + '/readby';

		rd.smembers( readby_ns, function( err, readby ){

			rd.get( count_ns, function( err, count ){

				if( err || !count ){
					console.log( err )
					return eventUtils.sendSuccess( res, [] );
				}

				for( var i = 1; i <= count; i++ ){

					(function( i ){ // closure required to capture i value

						rd.hgetall( message_ns + i, function( err, message ){
							
							all_messages.push( message );
							if( all_messages.length == count  ){

								/* Tri par ordre croissant de date */
								all_messages.sort(function( e1, e2 ){
									return new Date( e1.sent_at ) > new Date( e2.sent_at );
								});

								eventUtils.sendSuccess( res, { messages: all_messages, readby: readby } );

							}
						});

					})( i );
				}

			}); 
		});

	};

	var setReadBy = function( req, res ){

		var chat_id  = req.sent.chat_id;
		var event_id = req.sent.event_id;

		var readby_ns = 'chat/' + req.sent.chat_id + '/readby';

		// Set & Get the updated set
		rd.sadd( readby_ns, req.sent.name, function( err ){

			rd.smembers( readby_ns, function( err, readby ){

				var data = {
					chat_id  : chat_id,
					event_id : event_id,
					readby   : readby
				};

				eventUtils.sendSuccess( res, data );
				pusher.trigger( 'presence-' + chat_id, 'new chat readby', data );

			});

		});

	};


	module.exports = {
		addChatMessage    : addChatMessage,
		fetchChatMessages : fetchChatMessages,
		setReadBy         : setReadBy
	};