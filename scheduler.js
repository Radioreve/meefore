	
	var Before   = require('./models/BeforeModel');
	var User     = require('./models/UserModel');
	var pusher   = require('./services/pusher');
	var schedule = require('node-schedule');
	var moment   = require('moment');
	

	var every_hour    = 1000 * 60 * 60;
	var every_min     = 1000 * 60;
	var every_15_min  = every_min * 15;
	var every_ten_sec = 1000 * 10;

	// Job #0 - Print how long server has been on
	var min = 0;
	(function checkingTime(){
		min += 15;
		console.log('Scheduler up and running for ' + min + ' minutes now. ');
		setTimeout( checkingTime, every_15_min );
	})();


	// Job #1 - Put "ended" all befores of yesterday, every day at 6 am	
	(function terminateBeforesEveryHour(){
		require('./jobs/terminate-befores').terminateBefores();
		setTimeout( terminateBeforesEveryHour, every_hour );
	})();

