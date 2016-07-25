	
	// Databases
	var mongoose = require('mongoose');
	var Alerter  = require( process.cwd() + '/middlewares/alerter');
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
	var mongo_uri  = config.db[ process.env.APP_ENV ].uri;

	var tracked = {
		timezone          : null,
		server_time		  : null,
		target_time		  : null,
		n_befores_updated : 0,
		before_list       : []
	};

	// Given an hour and a timezone, return the timezone in which it is 6 am
	function findDiffDay( date ){

		var hour     = date.hour();
		var timezone = date.utcOffset();

		// Get the absolute number of hours separating today and target date
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

	var terminateBefores = function( options, callback ){

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

		keeptrack({
			timezone    : target.timezone,
			server_time : formatTime( moment() ),
			target_time : formatTime( target_day )
		});

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
			mail_html.push('Connection to the database failed, Couldnt execute the cron job "terminateBefores"');
			mail_html.push( err );
			Alerter.sendAdminEmail({ subjet: 'Error connecting to Database', html: mail_html.join('') });
			mail_html = [];

		});

		// If already connected, fire handlers
		if( mongoose.connection.readyState != 1 ){
			console.log('Connection not opened yet, opening...');
			mongoose.connect( mongo_uri );
		} else {
			console.log('Connection already opened');
			handleMongooseOpen( callback );
		}

		mongoose.connection.on('open', function(){
			handleMongooseOpen( callback );
		});
		
		function formatTime( m ){
			if( !m._isAMomentObject ){
				m = moment( m );
			}
			return m.format('DD/MM') + ' - ' + m.format('HH:mm') 
		}

		function handleMongooseOpen( callback ){
			
			console.log('Connected to the database! Updating... ');

				updateBefores(function(){

					var before_list_html = [];
					tracked.before_list.forEach(function( bfr, i ){
						before_list_html.push([
							'<div>'+ i +' - ' + bfr._id + ' - ' + bfr.address.place_name + ' - ' + formatTime( moment( bfr.begins_at ) )+ '</div>'
						].join(''));
					});

					before_list_html = before_list_html.join('');

					var mail_html = [
						'<div>Scheduler updated the database successfully in zone : ' + tracked.timezone + '</div>',
						'<div>Local time 	   	         : ' + tracked.server_time 		 +'</div>',
						'<div>Target time 	   	         : ' + tracked.target_time 		 +'</div>',
						'<div>Number of befores updated  : ' + tracked.n_befores_updated  +'</div>',
						'<div>---------------------------</div>',
						before_list_html
					];

					console.log('Scheduled job completed successfully');

					if( tracked.n_befores_updated != 0 ){
						Alerter.sendAdminEmail({
							subject : 'Scheduler [' + process.env.APP_ENV + '], '+ tracked.n_befores_updated + ' befores have been successfully updated',
							html    : mail_html.join('') 
						});
					}

					console.log( JSON.stringify( tracked, null, 4 ) );
					
					if( typeof callback == "function" ){
						callback( null, tracked );
					}
					// mongoose.connection.close();

				});
		}

		function keeptrack( obj ){
			
			tracked = _.merge( tracked || {}, obj );
		};
	

		function updateBefores( callback ){

			Before.find( full_before_query, function( err, befores ){

					if( err ){
						return callback( err, null );
					}

					var tasks = [];
					befores.forEach(function( bfr ){
						tasks.push(function( callback ){
							bfr.status = "ended";
							bfr.save(function( err ){
								tracked.before_list.push( bfr );
								callback();
							});
						});
					});

					async.parallel( tasks, function( err ){

						if( err ){
							callback( err, null );
						} else {
							keeptrack({ n_befores_updated: befores.length });
							callback();
						}

					});

				});
		};

	};


	module.exports = {
		terminateBefores : terminateBefores
	};

