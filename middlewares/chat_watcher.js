

	var rd      = require('../services/rd');
	var Message = require('../models/MessageModel');
	var async   = require('async');
	var mailer  = require('../services/mailer');
	var moment  = require('moment');

	var max_keys      = 400;
	var remove_ratio  = 0.5; // % of max_key's keys that will be removed
	var min_chat_size = 20;
	var mail_html     = [];

	var check_interval = 30 * 1000;  // Check cache every 30 secs

	// How it works.
	// For everymessage sent, check if the dbsize is almost "full" as defined by max_keys
	// If last check was done < 30s though, skip the check to avoid spamming rd.dbsize...

	var watchCache = function( req, res, next ){

		if( new Date() - global.last_cache_check < check_interval ){
			console.log('Cache has been checked less than ' + check_interval/1000 + ' seconds ago.')
			return next();
		};

		// Reset the last cache check.
		global.last_cache_check = new Date();  
		
		console.log('Checking the cache status...');
		rd.dbsize(function( err, n_keys ){

			keeptrack('There are currently ' + n_keys + ' keys in redis');

			if( n_keys < max_keys ){
				console.log('Cache doesnt need to be cleared : ' + n_keys + ' (n_keys) < ' + max_keys + ' (max_keys) ');
				return next();
			}
			
			// Use default options
			clearCache( next );

		});


	};

	function populateNewMessage( message, i, chat_id ){

		var old_msg = new Message();

		if( !message ){
			console.log('[ERR] Couldnt find message ' + i + ' from chat_id ' + chat_id );
			return old_msg
		}

		old_msg.chat_id = message.chat_id;
		old_msg.sent_at = message.sent_at;
		old_msg.type    = message.type || 'normal';
		old_msg.message = message.msg;

		old_msg.author  = {
			facebook_id : message.facebook_id,
			img_vs      : message.img_vs,
			img_id      : message.img_id,
			name        : message.name
		};

		return old_msg;

	};

	function keeptrack( msg ){
		console.log( msg );
		mail_html.push('<div>' + msg + '</div>');
		
	};

	var mailOfflineUsers = function( req, res, next ){

		// Mailing users shouldnt slow anything down
		next();

		var offline_users    = req.sent.offline_users;
		var offline_users_ns = 'user_alerts';
		var time_last_alert_ns = 'user_alerts_time';

		if( !offline_users ) return;

		offline_users.forEach(function( facebook_id ){

			rd.hgetall( offline_users_ns + '/' + facebook_id, function( err, alerts ){

				if( err ) return console.log( err );

				// For somereason, if no info available or user doesnt want email, return
				if( !alerts || alerts.message_unread == 'no' ) return;

				// User wants to get notified by mail.
				// Check when was the last alert.
				rd.get( time_last_alert_ns + '/' + facebook_id, function( err, time_last_alert ){

					if( alerts.min_frequency > 0 && (moment().unix() - time_last_alert) < alerts.min_frequency ){
						return console.log('Too soon to be alerted again');
					} else {
						rd.set( time_last_alert_ns + '/' + facebook_id, moment().unix(), function( err ){
							mailer.sendAlertEmail_MessageReceived( req.sent.name, alerts.email /* @519481 */);
						});
					}


				});


			});

		});

	};

	function clearCache( options, next ){

		// Options to override when called by api
		var min_chat_size = options.min_chat_size || min_chat_size;

		//Clearing the cache. Removing X% of the oldest keys, and saving them to database
		var n_keys_to_remove = options.n_keys_to_remove || parseInt( max_keys * remove_ratio );
		keeptrack('Clearning the cache necessary. Removing and saving ' + n_keys_to_remove + ' keys...');

		rd.smembers('chats', function( err, chat_id_array ){

			var n_chat_ids = chat_id_array.length;
			var n_key_to_remove_per_chat = Math.floor( n_keys_to_remove / n_chat_ids );

			keeptrack('Removing ' + n_key_to_remove_per_chat + ' keys per chat. ' + n_chat_ids + ' active chats found.');
			var tasks = [];

			// Fetch all chats that exists in redis and iterate on it
			chat_id_array.forEach(function( chat_id ){

				tasks.push(function( callback ){
					keeptrack('Executing for chat_id : ' + chat_id + '');

					var start_ns = 'chat/' + chat_id + '/start'; 
					rd.get( start_ns, function( err, start ){

						var count_ns = 'chat/' + chat_id + '/count';
						rd.get( count_ns, function( err, count ){

							if( count - start <= min_chat_size ){
								console.log("Chat is too small, keeping the keys for chat : " + chat_id );
								callback();
								return;
							}

							var sub_tasks = [];
							keeptrack('Raw start value : ' + start + '');
							start = parseInt( start );

							keeptrack('Starting at : ' + start + '');
							keeptrack('Ending at : ' + (start + n_key_to_remove_per_chat) + '');

							for( var i = start; i < start + n_key_to_remove_per_chat; i++ ){
								keeptrack('Dealing with message n°' + i + '' );

								(function(i){
									var message_ns = 'chat/' + chat_id + '/messages/';
									sub_tasks.push(function( sub_callback ){

										// Fetching the -i- chat in redis
										rd.hgetall( message_ns + i, function( err, message ){
											if( err ) keeptrack( err );
											// Saving as Message to MongoDB
											var old_msg = populateNewMessage( message, i, chat_id );

											old_msg.save(function( err ){
												if( err ) keeptrack( err );

												// Removing from redis
												rd.del( message_ns + i, function( err ){
													if( err ) keeptrack( err );

													// Upating the starting count of redis chat msgs
													rd.set( start_ns, start + n_key_to_remove_per_chat, function( err ){
														if( err ) keeptrack( err );

														// Signaling the subtask
														sub_callback();
													});
												});
											});
										});
									});
								}(i));
							}
							// Activating all sub_tasks
							async.parallel( sub_tasks, function(){
								callback();
							});
						});
					});
					var message_ns  = 'chat/' + chat_id + '/messages/';					
				});
			});
			async.parallel(tasks, function(){
				// Email the logs to the admin for proper monitoring
				keeptrack('Cache has been updated');
				mailer.sendSimpleAdminEmail('Cache has been successfully cleared', mail_html.join('') );
				mail_html = [];
				return next();
			});	
		});	

	};


	module.exports = {
		watchCache       : watchCache,
		clearCache       : clearCache,
		mailOfflineUsers : mailOfflineUsers
	};