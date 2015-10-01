	
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

	var mail_html = [];

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

	var terminateEvents = function(){

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

		var today                = moment();
		var target 				 = findDiffDay( today );

		/* Build the right hour in the target timezone */
		var target_day = today.add( target.day_add, 'days' )
							  .utcOffset( target.timezone )
							  .hours( 14 );
		
		keeptrack('Ending events in timezone : ' + target.timezone/60 + ' (' + target.timezone + ')');
		keeptrack('Day of local time         : ' + today.format('DD/MM') );
		keeptrack('Day of target time        : ' + target_day.format('DD/MM') );

		var date_range_query     = { $lt: target_day.toDate(), $gt: target_day.add( -2, 'days' ).toDate() };
		var timezone_range_query = { $gt: target.timezone - 60, $lt: target.timezone + 60 };

		// Init connection database
		mongoose.connect( mongo_uri );

		mongoose.connection.on('error', function( err ){

			mail_html.push('Connection to the database failed, Couldnt execute the cron job @reset-events ');
			mail_html.push( err );
			mailer.sendSimpleAdminEmail( 'Event watcher', 'Error connecting to Database', mail_html.join('') );
			mail_html = [];

		});

		mongoose.connection.on('open', function(){
			
			keeptrack('Connected to the database! Updating... ');

				async.waterfall([
					updateRedis,
					updateUsers,
					updateEvents
				], function(){

						keeptrack('Scheduled job completed successfully');
						mailer.sendSimpleAdminEmail( 'Event watcher', 'Events of the day has been successfully updated', mail_html.join('') );
						mail_html = [];

				});


		});

		function keeptrack( msg ){
			mail_html.push('<div>' + msg + '</div>');
			console.log( msg );
		};

		function updateRedis(){
			var g_callback = arguments[ arguments.length - 1 ];

			var rd = redis.createClient( redis_port, redis_host, { auth_pass: redis_pass } );

			rd.on("error", function( err ){
				
				mail_html.push('Connection to redis failed, Couldnt execute the cron job @reset-events ');
				mail_html.push( err );
				mailer.sendSimpleAdminEmail( 'Event watcher', 'Error connecting to Redis', mail_html.join('') );
				mail_html = [];

			});

			rd.on("ready", function(){
				keeptrack('Connected to Redis! Updating...');

				Event.find({
					'begins_at' : date_range_query,
					'timezone'  : timezone_range_query
				}, function( err, events ){

					keeptrack( events.length + ' event(s) have matched the date query.');
					var event_ids = [];
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
			Event.update({
					'begins_at' : date_range_query,
					'timezone'  : timezone_range_query
				}, {
					$set: {
						'status': 'ended'
					}
				}, {
					multi: true
				}, function( err, raw ){
					if( err ) return handleError( err );

					keeptrack( "Events have been successfully updated. Total events updated : " + raw.n )
					g_callback( null );

				});
		};

		function updateUsers(){
			var g_callback = arguments[ arguments.length - 1 ];
			User.update({
					'events.begins_at' : date_range_query
				}, {
					$pull: {
						'events': {
							'begins_at' : date_range_query
						}
					}
				}, { 
					multi: true
				}, function( err, raw ){
					if( err ) return handleError( err );

					keeptrack( "Users have been successfully updated. Total users updated : " + raw.n );
					g_callback( null );

				});

		};

		function clearAndSaveChats( g_callback, rd, chats_to_remove ){

			keeptrack( chats_to_remove.length + ' chat(s) need to be cleared');
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
										rd.delw('event/' + chat_id.split('-')[0] + '/*', function( err ){
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
				keeptrack( 'Redis has been cleared of todays events and chats' )
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

		function handleError( err ){
			keeptrack( err );
		};

	};


	// Test purposes
	terminateEvents();


	module.exports = {
		terminateEvents : terminateEvents
	};