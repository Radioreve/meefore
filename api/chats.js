
	var _          = require('lodash');
	var term 	   = require('terminal-kit').terminal;
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var Message    = require('../models/MessageModel');
	var rd		   = require('../services/rd');
	var moment     = require('moment');
	var async 	   = require('async');
	var settings   = require('../config/settings');

	var pusher     = require('../services/pusher');


	function resetSeenBy( chat_id, facebook_id, callback ){

		var seen_by_ns = "seen_by/" + chat_id;
		rd.del( seen_by_ns, function( err ){
				
			if( err ){
				return callback( err );
			}

			rd.sadd( seen_by_ns, facebook_id, function( err ){

				if( err){
					return callback( err );
				}

				return callback( null );

			});
		});

	}

	function getSeenBy( chat_id, callback ){

		var seen_by_ns = "seen_by/" + chat_id;
		rd.smembers( seen_by_ns, function( err, seen_by ){

			if( err ){
				return callback( err );
			} else {
				return callback( null, seen_by );
			}

		});

	}

	var addChatMessage = function( req, res, next ){

		var err_ns  = "adding_message";

		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;

		resetSeenBy( chat_id, facebook_id, function( err ){

			req.sent.sent_at = new Date();
			req.sent.seen_by = [ facebook_id ];

			var data = {
				chat_id      : req.sent.chat_id,
				group_id 	 : req.sent.group_id,
				before_id 	 : req.sent.before_id,
				message      : req.sent.message,
				sender_id    : req.sent.facebook_id,
				sent_at      : req.sent.sent_at,
				seen_by 	 : [ facebook_id ],
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
		var seen_by_ns   = 'chat/' + req.sent.chat_id + '/seen_by';

		req.sent.sent_at = moment().toISOString();
		// Store all chat ids to iterate through messages when save to db
		rd.sadd( chats, req.sent.chat_id, function( err ){

			// Set starting messages to 1. This will be changed when updating (clearing) the cache,
			// and is used to find to further message to fetch when browsing history. When clearing cache
			// first messages are erased from redis and stored in mongodb, so start_ns value may increase only 
			rd.setnx( start_ns, 1, function( err ){
				// Reset le seen_by 
				rd.del( seen_by_ns, function( err ){
					// Add le sender au seen_by 
					rd.sadd( seen_by_ns, req.sent.facebook_id, function( err ){

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

		getSeenBy( chat_id, function( err, seen_by ){

			if( err ){
				return handleErr( req, res, err_ns, err );
			}

			fetchChatMessagesByDate( chat_id, req.sent, function( err, messages ){

				if( err ){
					return handleErr( req, res, err_ns, err );
				};

				req.sent.expose.messages = messages;
				req.sent.expose.seen_by   = seen_by;
				next();

			});

		});

	}


	var setSeenBy = function( req, res, next ){

		var chat_id   = req.sent.chat_id;
		var before_id = req.sent.before_id;

		var seen_by_ns = "seen_by/" + chat_id;

		// Set & Get the updated set
		rd.sadd( seen_by_ns, req.sent.name, function( err ){
			rd.smembers( seen_by_ns, function( err, seen_by ){

				var data = {
					chat_id   : chat_id,
					before_id : before_id,
					seen_by    : seen_by
				};
				
				req.sent.expose.chat_id = chat_id;
				req.sent.expose.before_id = before_id;
				req.sent.expose.seen_by = seen_by;

				pusher.trigger( 'presence-' + chat_id, 'new chat seen_by', data );

				next();

			});

		});

	};

	var setMessageSeenBy = function( req, res, next ){

		var err_ns      = "set_message_seen_by";
		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;

		Message.update(
		{
			chat_id: chat_id
		},
		{
			$addToSet: { seen_by: facebook_id }  // Only push if exists. Oherwise, use $push
		}, 
		{
			multi: true
		}, function( err, raw ){

			if( err ){
				term.red.bold("Error saving seen_by for user : " + facebook_id + '\n');
			}
		});

		next();


	};

	module.exports = {
		addChatMessage    : addChatMessage,
		fetchChatMessages : fetchChatMessages,
		setSeenBy         : setSeenBy,
		setMessageSeenBy  : setMessageSeenBy
	};