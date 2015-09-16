

	var mongoose = require('mongoose');

	mongoose.connect( "mongodb://Radioreve:" + process.env.PW + "@dogen.mongohq.com:10008/meefore-staged" );

	mongoose.connection.on( 'open', function(){
		mail_html.push('<div>Connected to MongoDB</div>');
		mail_html.push('<div>Running test task...</div>');
		watchCache();
	});

	mongoose.connection.on('error', function(err){
		mail_html.push('<div>Connection to the database failed : ' + err + '</div>');
	});


	var rd      = require('../services/rd');
	var Message = require('../models/MessageModel');
	var async   = require('async');
	var mailer   = require('../services/mailer');

	var max_keys      = 20;
	var remove_ratio  = 0.5; // % of max_key's keys that will be removed
	var min_chat_size = 3;
	var mail_html     = [];

	var check_interval = 30 * 1000;  // Check cache every 30 secs

	var watchCache = function( req, res, next){

		/*
		if( new Date() - global.last_cache_check < check_interval ){
			console.log('Cache has been checked less than ' + check_interval + ' seconds ago.')
			return next();
		}; */

		global.last_cache_check = new Date();  

		console.log('Clearing the cache...');
		rd.dbsize(function( err, n_keys ){

			if( n_keys < max_keys ){
				return next();
			}

			keeptrack('There are currently ' + n_keys + ' keys in redis');
	
			//Clearing the cache. Removing 50% of the oldest keys, and saving them to database
			var n_keys_to_remove = parseInt( max_keys * remove_ratio );
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

												// Saving as Message to MongoDB
												var old_msg = populateNewMessage( message, i, chat_id );

												old_msg.save(function( err ){

													// Removing from redis
													rd.del( message_ns + i, function( err ){

														// Upating the starting count of redis chat msgs
														rd.set( start_ns, start + n_key_to_remove_per_chat, function( err ){

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
				async.parallel( tasks, function(){
					// Email the logs to the admin for proper monitoring
					keeptrack('Cache has been updated');
					//mailer.sendSimpleAdminEmail( 'Cache layer', 'Cache has been successfully cleared', mail_html.join('') );
					return process.exit(0); //next();
				});	
			});			
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
