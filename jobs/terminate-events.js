	
	// Databases
	var mongoose = require('mongoose');
	var redis    = require('redis');
	var mailer   = require( process.cwd() + '/services/mailer');

	redis.RedisClient.prototype.delw = function( key, callback ) {

		var redis = this
	 
		redis.keys(key, function(err, rows) {
			async.each(rows, function(row, callbackDelete) {
				redis.del(row, callbackDelete)
			}, callback)
		});
	};

	// Models
	var User     = require('../models/UserModel');
	var Event    = require('../models/EventModel');
	var Parties  = require('../models/PartyModel');
	var Message  = require('../models/MessageModel');

	// Helpers
	var config   = require('../config/config');
	var async 	 = require('async');
	var moment   = require('moment');
	var _		 = require('lodash');

	// Parameters
	var mongo_uri  = config.db[ process.env.NODE_ENV ].uri;
	var redis_host = config.redis[ process.env.NODE_ENV ].host;
	var redis_port = config.redis[ process.env.NODE_ENV ].port;
	var redis_pass = config.redis[ process.env.NODE_ENV ].pass;

	var tracked = {};

	// Given an hour and a timezone, return the timezone in which it is 6 am
	function findDiffDay( day ){

		var hour     = day.hour();
		var timezone = day.utcOffset();

		// Get the absolute number of hours separating today and target day
		var diff;
		if( hour > 6 ){
			diff = 24 - hour + 6;
		} else {
			diff = 6 - hour;
		}
		// Get the timezone in which it is 6am
		var new_timezone = timezone + diff * 60;
    	if( new_timezone > 720 ){
    		new_timezone =  -720 + ( new_timezone - 720 );
        } 
        // @Marie Anne Krebs formula
    	var mak = hour + ( new_timezone/60 - timezone/60 );  	
   		if( mak == -18 ){
        	day_add = -1;
        } else if( mak == 6 ){
            day_add = 0;
        } else if( mak == 30 ){
            day_add = 1;
        } else {
            console.log("Error, mak parameter didnt match anything expected");
        }
    
		return {
			timezone: new_timezone,
			day_add : day_add
		}
	}

	var terminateEvents = function( options ){

		/*
			Scheduler auto-update events
			Each event start date is stored in UTC time
			Each timezone in which event is created is also stored
			The scheduler can be launched anywhere in the world, in anytime zone
			Everyhour find
				- In which timezone it is 6am
				- Find if the day in this timezone is tomorrow, today or yesterday (which is event's timezone and scheduler-localzone dependend)
				- Find all events in this timezone whose begins_at is < 14 hours, so when users connect after 6AM on a particular day,
			      all of yesterday's events have been cleaned out from database, from cache, and finally from user interface

			@Special thanks to Marie Anne Krebs who helped find a formula to know the adjusting day!
			
			All event's status parameter are set to "ended"

		*/

		var options = options || {};

		var event_ids			 = []; // outside reference to event ids that need to be cleared
		var today                = moment();
		var target 				 = findDiffDay( today );

		/* Build the right hour in the target timezone */
		var target_day = today.add( target.day_add, 'days' )
							  .utcOffset( target.timezone )
							  .set('hour', 14 )
							  .set('minute', 0 )
							  .set('second', 0 );
		
		keeptrack({
			timezone   : target.timezone/60,
			local_time : moment().toString(),
			target_time: target_day.toString()
		});


		// Custom overrides to have control via API
		if( options.timezone ){
			target.timezone = options.timezone;
		}

		if( options.target_day ){
			target_day = moment( options.target_day, 'DD/MM/YYYY' );
		}

		// Cast moment dates to Date objects
		var date_range_query     = { $lt: target_day.toDate() };// $gt: target_day.add( -2, 'days' ).toDate() };
		var timezone_range_query = { $gt: target.timezone - 60, $lt: target.timezone + 60 };

		// Pass the "status" because the date_range is loose. Meaning, it will allows to also update
		// All events of few days before that for somereason didnt get updated on the last call.
		var full_event_query = {
			'begins_at' : date_range_query,
			'timezone'  : timezone_range_query,
			'status'    : { $nin: ['ended'] }
		};

		var full_party_query = {
			'begins_at' : date_range_query,
			'timezone'  : timezone_range_query,
			'status'    : { $nin: ['ended'] }
		};

		var full_event_in_user_query = {
			'begins_at' : date_range_query,
			'timezone'  : timezone_range_query
		};

		console.log( JSON.stringify(full_event_query, null, 4) );

		mongoose.connection.on('error', function( err ){

			var mail_html = []
			mail_html.push('Connection to the database failed, Couldnt execute the cron job @reset-events ');
			mail_html.push( err );
			mailer.sendSimpleAdminEmail('Error connecting to Database', mail_html.join('') );
			mail_html = [];

		});

		// If already connected, fire handlers
		if( mongoose.connection.readyState != 1 ){
			console.log('Connection not opened yet, opening...');
			mongoose.connect( mongo_uri );
		} else {
			console.log('Connection already opened');
			handleMongooseOpen();
		}

		mongoose.connection.on('open', function(){
			
			handleMongooseOpen();

		});

		function handleMongooseOpen(){
			
			console.log('Connected to the database! Updating... ');

				async.waterfall([
					updateRedis,
					updateUsers,
					updateEvents,
					updateParties
				], function(){

					if( tracked.n_events_matched == 0 ){
						return console.log('No event matched the query');
					}

					var mail_html = [
						'<div>Scheduler updated the database and cleared the cache successfully in zone : ' + tracked.timezone + '</div>',
						'<div>Local time 	   	         : ' + tracked.local_time 		 +'</div>',
						'<div>Target time 	   	         : ' + tracked.target_time 		 +'</div>',
						'<div>Number of events match     : ' + tracked.n_events_matched  +'</div>',
						'<div>Number of events updated   : ' + tracked.n_events_updated  +'</div>',
						'<div>Number of users updated    : ' + tracked.n_users_updated   +'</div>',
						'<div>Number of chats cleared    : ' + tracked.n_chats_cleared   +'</div>',
						'<div>Number of parties cleared  : ' + tracked.n_parties_updated +'</div>'
					];

					console.log('Scheduled job completed successfully');
					mailer.sendSimpleAdminEmail('Scheduler [' + process.env.NODE_ENV + '], '+ tracked.n_events_updated + ' events have been successfully updated', mail_html.join('') );
					// mongoose.connection.close();

				});
		}

		function keeptrack( obj ){
			
			_.keys( obj ).forEach(function( key ){
				tracked[ key ] = obj[ key ];
			});
		};

		function updateRedis(){
			var g_callback = arguments[ arguments.length - 1 ];

			var rd = redis.createClient( redis_port, redis_host, { auth_pass: redis_pass } );

			rd.on("error", function( err ){

				var mail_html = []
				mail_html.push('Connection to redis failed, Couldnt execute the cron job @reset-events ');
				mail_html.push( err );
				mailer.sendSimpleAdminEmail('Error connecting to Redis', mail_html.join('') );
				mail_html = [];

			});

			rd.on("ready", function(){
				console.log('Connected to Redis! Updating...');

				Event.find( full_event_query, function( err, events ){

					keeptrack({
						n_events_matched: events.length
					});

					events.forEach(function( evt ){
						event_ids.push( evt._id.toString() );  // (!) Mongoose _id field is parsed as Object. Weird.
					});

					var chats_to_remove = [];
					rd.smembers('chats', function( err, chat_ids ){
						chat_ids.forEach(function( chat_id ){
							// Chat is outdated, need to clear it
							if( event_ids.indexOf( chat_id.split('-')[0] ) != -1 ){
								chats_to_remove.push( chat_id );
							}
						});
						clearAndSaveChats( g_callback, rd, chats_to_remove );
					});

				});
			});

		};		

		function updateEvents(){
			var g_callback = arguments[ arguments.length - 1 ];
			Event.update( full_event_query, {
					$set: {
						'status': 'ended'
					}
				}, {
					multi: true
				}, function( err, raw ){
					if( err ) return handleError( err );
					keeptrack({
						n_events_updated: raw.n
					});
					g_callback( null );

				});
		};

		function updateParties(){
			var g_callback = arguments[ arguments.length - 1 ];
			Parties.update( full_party_query, {
					$set: {
						'status': 'ended'
					}
				}, {
					multi: true
				}, function( err, raw ){
					if( err ) return handleError( err );
					keeptrack({
						n_parties_updated: raw.n
					});
					g_callback( null );
			});
		}

		function updateUsers(){
			var g_callback = arguments[ arguments.length - 1 ];
			User.update({
					events: {
						$elemMatch: full_event_in_user_query
					}
				}, {
					$pull: {
						events: {
							$elemMatch: full_event_in_user_query
							
						}
					}
				}, { 
					multi: true
				}, function( err, raw ){
					if( err ) return handleError( err );

					keeptrack({
						n_users_updated: raw.n
					});

					g_callback( null );

				});
		};

		function clearAndSaveChats( g_callback, rd, chats_to_remove ){

			keeptrack({
				n_chats_cleared: chats_to_remove.length
			});

			var tasks = [];
			chats_to_remove.forEach(function( chat_id ){
				tasks.push(function( callback ){
					var start_ns = 'chat/' + chat_id + '/start';
					var count_ns = 'chat/' + chat_id + '/count';
					var subtasks = [];
					rd.get( start_ns, function( err, start ){
						rd.get( count_ns, function( err, count ){
							var subtasks = [];
							// Removing last message and saving to database
							for( var i= start; i <= count; i++ ){
								(function(i){
									var chat_ns = 'chat/' + chat_id + '/messages/';
									subtasks.push(function( sub_callback ){
										rd.hgetall( chat_ns + i, function( err, message ){
											console.log( message );
											var old_msg = populateNewMessage( message, i, chat_id );
											old_msg.save(function( err ){
												sub_callback( null, chat_id );
											});
										});
									});
								}(i));
							}
							// All messages have been saved, can erase them all
							async.parallel( subtasks, function( err, results ){

								var subbedtasks = [];
								results.forEach(function( chat_id ){

									subbedtasks.push(function( subbed_callback ){
										rd.delw('chat/' + chat_id + '/*', function( err ){
											subbed_callback();
										});
									});

									subbedtasks.push(function( subbed_callback ){
										var cleareventstasks = [];
										event_ids.forEach(function( event_id ){
											cleareventstasks.push(function( clearevent_callback ){
												rd.delw('event/' + event_id + '/*', function( err ){
													clearevent_callback();
												});
											});
										});
										async.parallel( cleareventstasks, function( err ){
											subbed_callback();
										});
									});

									subbedtasks.push(function( subbed_callback ){
										rd.srem('chats', chat_id, function( err ){
											subbed_callback();
										});
									});

								});

								async.parallel( subbedtasks, function( err ){
									callback();
								});
							});
						});
					});
				});			
			});
			async.parallel( tasks, function(){
				if( chats_to_remove.length == 0 ){
					console.log('No chats were to be cleared.');
				} else {
					console.log('Chats have been cleared from Redis and saved in MongoDB successfully');
				}
				g_callback( null );
			});

		};

		function populateNewMessage( message, i, chat_id ){

			var old_msg = new Message();

			if( !message ){
				keeptrack('[ERR] Couldnt find message ' + i + ' from chat_id ' + chat_id );
				return old_msg
			}

			old_msg.chat_id = message.chat_id;
			old_msg.sent_at = message.sent_at;
			old_msg.message = message.msg;

			if( message.whisper_to != 'null' ){
				old_msg.type = 'whisper';
			} else {
				old_msg.type = 'standard';
			}

			old_msg.author  = {
				facebook_id : message.facebook_id,
				img_vs      : message.img_vs,
				img_id      : message.img_id,
				name        : message.name
			};

			return old_msg;

		};

		function handleError( err ){
			keeptrack( err );
		};

	};


	// Test purposes
	// terminateEvents();

	module.exports = {
		terminateEvents : terminateEvents
	};