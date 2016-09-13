	
	var Before   = require('./models/BeforeModel');
	var User     = require('./models/UserModel');
	var pusher   = require('./services/pusher');
	var schedule = require('node-schedule');
	var moment   = require('moment');
	var term     = require('terminal-kit').terminal;

	var config = require('./config/config');
	var uri    = config.db[ process.env.APP_ENV ].uri;

	require('./services/db')( uri, startServices );
	
	var every_hour    = 1000 * 60 * 60;
	var every_min     = 1000 * 60;
	var every_5_min   = every_min * 5;
	var every_15_min  = every_min * 15;
	var every_ten_sec = 1000 * 10;

	function randomInt(low, high) {
	    return Math.floor(Math.random() * (parseInt(high) - parseInt(low) + 1) + parseInt(low));
	}

	function startServices( err ){

		if( err ) return console.log("Services unable to connect to the database");

		(function wakeUp(){
			require('http').get("http://staged.meefore.com");
			setTimeout( wakeUp, every_15_min );
		})();

		// Job #0 - Print how long server has been on
		var min = 0;
		(function checkingTime(){
			min += 15;
			console.log('Scheduler up and running for ' + min + ' minutes now. ');
			setTimeout( checkingTime, every_15_min );
		})();


		// Job #1 - Put "ended" all befores of yesterday, every morning
		(function terminateBeforesEveryHour(){
			require('./jobs/terminate-befores').terminateBefores();
			setTimeout( terminateBeforesEveryHour, every_hour );
		})();


		// Job #2 - Schedule activity for bot users
		(function scheduleBotsActivity(){
			if( process.env.BOT_SCHEDULER === "on" ){

				var random_minute = randomInt( process.env.BOT_SCHEDULER_MIN_DELAY, process.env.BOT_SCHEDULER_MAX_DELAY );
				require('./jobs/bots-scheduler').scheduleBotsToCreateBefores( random_minute );

				term.bold.green("Bot scheduler next tick in " + random_minute + " minutes\n");
				setTimeout( scheduleBotsActivity, 1000 * 60 * random_minute );

			} else {
				term.bold.red("Bot scheduler is off\n");
			}
		})();

	}
