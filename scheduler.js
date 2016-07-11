	
	var Before   = require('./models/BeforeModel');
	var User     = require('./models/UserModel');
	var pusher   = require('./services/pusher');
	var schedule = require('node-schedule');
	var moment   = require('moment');
	

	var every_hour    = 1000 * 60 * 60;
	var every_min     = 1000 * 60;
	var every_ten_sec = 1000 * 10;

	// Job #0 - Print how long server has been on
	var hours = 0;
	(function checkingTime(){
		hours += 1;
		console.log('Scheduler up and running for ' + hours + ' hours now. ');
		setTimeout( checkingTime, every_hour );
	})();


	// Job #1 - Put "ended" all befores of yesterday, every day at 3:30 am	
	(function terminateBeforesEveryHour(){
		require('./jobs/terminate-befores').terminateBefores();
		setTimeout( terminateBeforesEveryHour, every_hour );
	})();

