
	var _          = require('lodash');
	var term 	   = require('terminal-kit').terminal;
	var eventUtils = require('../pushevents/eventUtils');
	var User       = require('../models/UserModel');
	var Message    = require('../models/MessageModel');
	var rd		   = require('../services/rd');
	var erh		   = require('../services/err');
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

				if( err ){
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
		var type        = req.sent.user.getChatChannel( chat_id ).type;

		resetSeenBy( chat_id, facebook_id, function( err ){

			if( err ) return erh.handleDbErr( req, res, err_ns, err, "redis" );

			req.sent.sent_at = new Date();
			req.sent.seen_by = [ facebook_id ];

			var data = {
				type 	  : type,
				chat_id   : req.sent.chat_id,
				message   : req.sent.message,
				sender_id : req.sent.facebook_id,
				sent_at   : req.sent.sent_at,
				seen_by   : [ facebook_id ]
			};

			var message = new Message( data );
			message.save(function( err ){

				if( err ) return erh.handleDbErr( req, res, err_ns, err, "mongo" );

				req.sent.expose.response = "Message sent successfully";
				next();

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

			if( err ) return erh.handleDbErr( req, res, err_ns, err, "redis" );

			fetchChatMessagesByDate( chat_id, req.sent, function( err, messages ){

				if( err ) return erh.handleDbErr( req, res, err_ns, err, "mongo" );

				req.sent.expose.messages = messages;
				req.sent.expose.seen_by  = seen_by;
				next();

			});

		});

	}


	var setSeenBy = function( req, res, next ){

		var err_ns    = "chat_set_seen_by";

		var chat_id   = req.sent.chat_id;
		var before_id = req.sent.before_id;

		var seen_by_ns = "seen_by/" + chat_id;

		// Set & Get the updated set
		rd.sadd( seen_by_ns, req.sent.name, function( err ){
			rd.smembers( seen_by_ns, function( err, seen_by ){

				if( err ) return erh.handleDbErr( req, res, err_ns, err, "redis" );

				var data = {
					chat_id   : chat_id,
					before_id : before_id,
					seen_by   : seen_by
				};
				
				req.sent.expose.chat_id   = chat_id;
				req.sent.expose.before_id = before_id;
				req.sent.expose.seen_by   = seen_by;

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
			$addToSet: { seen_by: facebook_id }  // Only push if not exists. Oherwise, use $push
		}, 
		{
			multi: true
		}, function( err, raw ){

			if( err ){
				return erh.handleBackErr( req, res, {
					end_request: false,
					source: "mongo",
					err_ns: err_ns,
					err: err
				});
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