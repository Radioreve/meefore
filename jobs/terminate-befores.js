	
	// Databases
	var mongoose = require('mongoose');
	var mailer   = require( process.cwd() + '/services/mailer');
	// Models
	var User     = require('../models/UserModel');
	var Before   = require('../models/BeforeModel');
	var Message  = require('../models/MessageModel');
	// Helpers
	var config   = require('../config/config');
	var async 	 = require('async');
	var moment   = require('moment');
	var _		 = require('lodash');
	// Parameters
	var mongo_uri  = config.db[ process.env.NODE_ENV ].uri;

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

	var terminateBefores = function( options ){

		/*
			Scheduler auto-update befores
			Each before start date is stored in UTC time
			Each timezone in which before is created is also stored
			The scheduler can be launched anywhere in the world, in anytime zone
			Everyhour find
				- In which timezone it is 6am
				- Find if the day in this timezone is tomorrow, today or yesterday (which is before's timezone and scheduler-localzone dependend)
				- Find all befores in this timezone whose begins_at is < 14 hours, so when users connect after 6AM on a particular day,
			      all of yesterday's befores have been cleaned out from database, and finally from user interface

			@Special thanks to Marie Anne Krebs who helped find a formula to know the adjusting day!
			
			All before's status parameter are set to "ended"

		*/

		var options = options || {};

		var before_ids			 = []; // outside reference to before ids that need to be cleared
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
			target_day = moment( options.target_day, 'DD/MM/YYYY' )
						  .utcOffset( target.timezone )
						  .set('hour', 14 )
						  .set('minute', 0 )
						  .set('second', 0 );
		}

		// Cast moment dates to Date objects
		var date_range_query     = { $lt: target_day.toDate() };// $gt: target_day.add( -2, 'days' ).toDate() };
		var timezone_range_query = { $gt: target.timezone - 60, $lt: target.timezone + 60 };

		// Pass the "status" because the date_range is loose. Meaning, it will allows to also update
		// all befores of few days before that for somereason didnt get updated on the last call.
		var full_before_query = {
			'begins_at' : date_range_query,
			'timezone'  : timezone_range_query,
			'status'    : { $in: ['open'] }
		};

		mongoose.connection.on('error', function( err ){

			var mail_html = []
			mail_html.push('Connection to the database failed, Couldnt execute the cron job @reset-befores ');
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

		mongoose.connection.on('open', handleMongooseOpen );
			
		function handleMongooseOpen(){
			
			console.log('Connected to the database! Updating... ');

				async.waterfall([
					updateBefores
				], function(){

					if( tracked.n_befores_matched == 0 ){
						return console.log('No before matched the query');
					}

					console.log( tracked.n_users_updated + ' users updated');

					var mail_html = [
						'<div>Scheduler updated the database successfully in zone : ' + tracked.timezone + '</div>',
						'<div>Local time 	   	         : ' + tracked.local_time 		 +'</div>',
						'<div>Target time 	   	         : ' + tracked.target_time 		 +'</div>',
						'<div>Number of befores match    : ' + tracked.n_befores_matched  +'</div>',
						'<div>Number of befores updated  : ' + tracked.n_befores_updated  +'</div>'
					];

					console.log('Scheduled job completed successfully');
					mailer.sendSimpleAdminEmail('Scheduler [' + process.env.NODE_ENV + '], '+ tracked.n_befores_updated + ' befores have been successfully updated', mail_html.join('') );
					// mongoose.connection.close();

				});
		}

		function keeptrack( obj ){
			
			_.keys( obj ).forEach(function( key ){
				tracked[ key ] = obj[ key ];
			});
		};
	

		function updateBefores(){

			var g_callback = arguments[ arguments.length - 1 ];

			Before.find( full_before_query, function( err, befores ){

					if( err ) return handleError( err );

					var tasks = [];
					befores.forEach(function( bfr ){
						tasks.push(function( callback ){
							bfr.status = "ended";
							bfr.save(function( err ){
								callback();
							});
						});
					});

					async.parallel( tasks, function( err ){

						if( err ) return handleError( err );

						keeptrack({ n_befores_updated: befores.length });
						g_callback( null, _.map( befores, '_id') );

					});


				});
		};

		function handleError( err ){
			keeptrack( err );
		};

	};


	// Test purposes
	// terminateBefores();

	module.exports = {
		terminateBefores : terminateBefores
	};

