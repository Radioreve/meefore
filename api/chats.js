
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		User       = require('../models/UserModel'),
		Message    = require('../models/MessageModel'),
		rd		   = require('../services/rd'),
		moment     = require('moment'),
		async 	   = require('async');

	var pusher     = require('../services/pusher');


	var addChatMessage = function( req, res ){

		/* Caching everything for performance */
		var chats 		= 'chats';
		var start_ns    = 'chat/' + req.sent.chat_id + '/start';
		var count_ns	= 'chat/' + req.sent.chat_id + '/count';
		var message_ns  = 'chat/' + req.sent.chat_id + '/messages/';
		var readby_ns   = 'chat/' + req.sent.chat_id + '/readby';

		/* Store all chat ids to iterate through messages when save to db */
		rd.sadd( chats, req.sent.chat_id, function( err ){

			/* Set starting messages to 1. This will be changed when updating (clearing) the cache,
			   and is used to find to further message to fetch when browsing history. When clearing cache
			   first messages are erased from redis and stored in mongodb, so start_ns value may increase only */
			rd.setnx( start_ns, 1, function( err ){

				/* Reset le readby */
				rd.del( readby_ns, function( err ){

					/* Add le sender au readby */
					rd.sadd( readby_ns, req.sent.name, function( err ){

							var data = {
								chat_id      : req.sent.chat_id,
								msg          : req.sent.msg,
								name         : req.sent.name,
								facebook_id  : req.sent.facebook_id,
								img_id       : req.sent.img_id,
								img_vs       : req.sent.img_vs,
								whisper_to   : req.sent.whisper_to || null,
								sent_at      : new Date()
							};

							rd.incr( count_ns, function( err, response ){

								rd.get( count_ns, function( err, count ){

									rd.hmset( message_ns + count, data, function( err, response ){

										eventUtils.sendSuccess( res, data );

										if( req.sent.whisper_to ){
											pusher.trigger( 'private-' + req.sent.facebook_id, 'new chat whisper', data );
											req.sent.whisper_to.forEach(function( whisper_to_id ){
												pusher.trigger( 'private-' + whisper_to_id, 'new chat whisper', data );
											});
										} else {
											pusher.trigger( 'presence-' + req.sent.chat_id, 'new chat message', data );
										}

									});
								});

							});

					});

				});

			});

		});
		
	};

	var fetchChatMessages = function( req, res ){

		var messages_fetched     = parseInt( req.sent.messages_fetched ) || 0;
		var messages_fetched_add = 8;

		// Total amount of messages in cache
		var count_ns	= 'chat/' + req.sent.chat_id + '/count';

		// Starting index from which to fetch chat messages
		var start_ns    = 'chat/' + req.sent.chat_id + '/start';

		// Message object store in cache
		var message_ns  = 'chat/' + req.sent.chat_id + '/messages/';

		// Has the message been read
		var readby_ns   = 'chat/' + req.sent.chat_id + '/readby';

		rd.smembers( readby_ns, function( err, readby ){

			rd.get( start_ns, function( err, start ){

				rd.get( count_ns, function( err, count ){

					if( err || !count ){
						console.log( err )
						return eventUtils.sendSuccess( res, [] );
					}

					console.log('Fetching ' + messages_fetched_add + ' messages, starting with last : ' + count + ' until start : ' + start);

					var all_messages = [];
					var async_tasks  = [];
					var end =  count - messages_fetched;

					for( var i = end; i >= start; i-- ){
						(function( i ){ // closure required to capture i value

							async_tasks.push(function(){
								var callback = arguments[ arguments.length - 1 ];

								if( all_messages.length == messages_fetched_add ){
									console.log('Stop fetching, ' + messages_fetched_add + ' messages fetched');
									return callback( null );
								}

								if( i == start - 1 ){
									console.log('Stop fetching, all messages stored in cache have been fetched.');
									return callback( null );
								}

								rd.hgetall( message_ns + i, function( err, message ){
									
									if( !message ){
										callback( null );
										return console.error('Couldnt find a redis message');
									}

									if( Array.isArray( message.whisper_to ) && message.whisper_to.indexOf( req.sent.facebook_id ) == -1 ){
										console.log('Not adding message ' + i + '/' + count + ', whispered to someone else');
										console.log('facebook_id: ' + req.sent.facebook_id );
										console.log('whisper_to: ' + message.whisper_to );
										callback( null );
										return;
									}

									var whisper_s = Array.isArray( message.whisper_to ) ? ' (whisper)' : '';
									console.log('Normally adding message ' + i + '/' + count + whisper_s );
									all_messages.push( message );
									callback( null );
						
								});
							});

						})( i );
					}

					async.waterfall( async_tasks, function( err, results ){

						/* Tri par ordre croissant de date */
						all_messages.sort(function( e1, e2 ){
							return new Date( e1.sent_at ) > new Date( e2.sent_at );
						});

						console.log('Sending ' + all_messages.length + ' messages');
						eventUtils.sendSuccess( res, { messages: all_messages, readby: readby } );

					});

				});

			});
		});

	};

	var setReadBy = function( req, res ){

		var chat_id  = req.sent.chat_id;
		var before_id = req.sent.before_id;

		var readby_ns = 'chat/' + req.sent.chat_id + '/readby';

		// Set & Get the updated set
		rd.sadd( readby_ns, req.sent.name, function( err ){

			rd.smembers( readby_ns, function( err, readby ){

				var data = {
					chat_id  : chat_id,
					before_id : before_id,
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