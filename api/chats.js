
	var _          = require('lodash');
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var Message    = require('../models/MessageModel');
	var rd		   = require('../services/rd');
	var moment     = require('moment');
	var async 	   = require('async');
	var settings   = require('../config/settings');

	var pusher     = require('../services/pusher');


	function resetReadby( chat_id, facebook_id, callback ){

		var readby_ns = "readby/" + chat_id;
		rd.del( readby_ns, function( err ){
				
			if( err ){
				return callback( err );
			}

			rd.sadd( readby_ns, facebook_id, function( err ){

				if( err){
					return callback( err );
				}

				return callback( null );

			});
		});

	}

	function getReadby( chat_id, callback ){

		var readby_ns = "readby/" + chat_id;
		rd.smembers( readby_ns, function( err, readby ){

			if( err ){
				return callback( err );
			} else {
				return callback( null, readby );
			}

		});

	}

	var addChatMessage = function( req, res, next ){

		var err_ns  = "adding_message";

		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;

		resetReadby( chat_id, facebook_id, function( err ){

			req.sent.sent_at = new Date();

			var data = {
				chat_id      : req.sent.chat_id,
				group_id 	 : req.sent.group_id,
				before_id 	 : req.sent.before_id,
				message      : req.sent.message,
				sender_id    : req.sent.facebook_id,
				sent_at      : req.sent.sent_at,
				type 		 : "normal"
			};

			var message = new Message( data );
			message.save(function( err ){

				if( err ) return handleErr( req, res, err_ns, err );

				req.sent.expose.response = "Message sent successfully";
				next();

			});

		});

	};

	var addChatMessage2 = function( req, res, next ){

		// Caching everything for performance 
		var chats 		= 'chats';
		var start_ns    = 'chat/' + req.sent.chat_id + '/start';
		var count_ns	= 'chat/' + req.sent.chat_id + '/count';
		var message_ns  = 'chat/' + req.sent.chat_id + '/messages/';
		var readby_ns   = 'chat/' + req.sent.chat_id + '/readby';

		req.sent.sent_at = moment().toISOString();
		// Store all chat ids to iterate through messages when save to db
		rd.sadd( chats, req.sent.chat_id, function( err ){

			// Set starting messages to 1. This will be changed when updating (clearing) the cache,
			// and is used to find to further message to fetch when browsing history. When clearing cache
			// first messages are erased from redis and stored in mongodb, so start_ns value may increase only 
			rd.setnx( start_ns, 1, function( err ){
				// Reset le readby 
				rd.del( readby_ns, function( err ){
					// Add le sender au readby 
					rd.sadd( readby_ns, req.sent.facebook_id, function( err ){

						var data = {
							chat_id      : req.sent.chat_id,
							group_id 	 : req.sent.group_id,
							before_id 	 : req.sent.before_id,
							message      : req.sent.message,
							sender_id    : req.sent.facebook_id,
							sent_at      : req.sent.sent_at,
							type 		 : "normal"
						};

						// Save to Database but dont wait for the call to finish. This is just used 
						// for deep history retrievals and analytics
						var message = new Message( data );
						message.save(function( err ){
							if( err ){ console.log( err ); }
						});

						rd.incr( count_ns, function( err, response ){
							rd.get( count_ns, function( err, count ){
								rd.hmset( message_ns + count, data, function( err, response ){
									req.sent.expose.data = data;
									next();
								});
							});

						});
					});
				});
			});
		});
	};


	// Send back the first messages that havent been fetched from the cache
	// Messages are ordered so that the lower index is the closest to the date passed
	// ( du plus récent au plus ancient )
	function fetchChatMessagesByDate( chat_id, opts, callback ){

		var sent_at = opts.sent_at ? new Date( opts.sent_at ) : new Date();
		var limit   = opts.limit || 20;

		Message
			.find(
			{
				chat_id: chat_id,
				sent_at: { $lt: sent_at }
			})
			.sort({ sent_at: -1 })
			.limit( limit )
			.exec(function( err, messages ){

				if( err ){
					return callback( err, null );
				} else {
					return callback( null, messages );
				}

			});
	}

	

	var fetchChatMessages = function( req, res, next ){

		var err_ns  = "fetching_messages";
		var chat_id = req.sent.chat_id;

		console.log('Fetching history for chat with id : ' + chat_id );

		getReadby( chat_id, function( err, readby ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			fetchChatMessagesByDate( chat_id, req.sent, function( err, messages ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				};

				req.sent.expose.messages = messages;
				req.sent.expose.readby   = readby;
				next();

			});

		});

	}


	var fetchChatMessages2 = function( req, res, next ){

		var chat_id 			 = req.sent.chat_id;
		var messages_fetched     = parseInt( req.sent.messages_fetched ) || 0;
		var messages_fetched_add = settings.app.chat_fetch_count;

		var count_ns	= 'chat/' + chat_id + '/count';
		var start_ns    = 'chat/' + chat_id + '/start';
		var message_ns  = 'chat/' + chat_id + '/messages/';
		var readby_ns   = 'chat/' + chat_id + '/readby';

		rd.smembers( readby_ns, function( err, readby ){
			rd.get( start_ns, function( err, start ){
				rd.get( count_ns, function( err, count ){

					if( err ){
						console.log( err );
						req.sent.expose.messages = null;
						return next();
					}

					if( !count ){
						req.sent.expose.messages = [];
						return next();
					}

					console.log('Fetching ' + messages_fetched_add + ' messages, starting with last : ' + count + ' until start : ' + start);

					var all_messages = [];
					var async_tasks  = [];
					var end = count - messages_fetched;

					if( end < start ){
						console.log('All messages from cache have been fetched');
					}

					for( var i = end; i >= start; i-- ){
						(function( i ){ // closure required to capture i value

							async_tasks.push(function(){
								var callback = arguments[ arguments.length - 1 ];

								if( all_messages.length == messages_fetched_add ){
									console.log('Stop fetching, ' + messages_fetched_add + ' messages fetched');
									return callback();
								}

								if( i == start - 1 ){
									console.log('Stop fetching, all messages stored in cache have been fetched.');
									return callback();
								}

								rd.hgetall( message_ns + i, function( err, message ){
									
									if( !message ){
										callback();
										return console.error('Couldnt find a redis message');
									}

									all_messages.push( message );
									callback();
						
								});
							});

						})( i );
					}

					async.waterfall( async_tasks, function( err, results ){

						// Tri par ordre croissant de date 
						all_messages.sort(function( e1, e2 ){
							return moment( e2.sent_at ) - moment( e1.sent_at );
						});


						console.log('Sending ' + all_messages.length + ' messages');

						req.sent.expose.messages = all_messages;
						req.sent.expose.readby   = readby;

						next();

					});

				});

			});
		});

	};

	var setReadBy = function( req, res, next ){

		var chat_id   = req.sent.chat_id;
		var before_id = req.sent.before_id;

		var readby_ns = "readby/" + chat_id;

		// Set & Get the updated set
		rd.sadd( readby_ns, req.sent.name, function( err ){
			rd.smembers( readby_ns, function( err, readby ){

				var data = {
					chat_id   : chat_id,
					before_id : before_id,
					readby    : readby
				};
				
				req.sent.expose.chat_id = chat_id;
				req.sent.expose.before_id = before_id;
				req.sent.expose.readby = readby;

				pusher.trigger( 'presence-' + chat_id, 'new chat readby', data );

				next();

			});

		});

	};


	module.exports = {
		addChatMessage    : addChatMessage,
		fetchChatMessages : fetchChatMessages,
		fetchChatMessages2: fetchChatMessages2,
		setReadBy         : setReadBy
	};