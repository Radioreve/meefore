	
	var Event    = require('./models/EventModel');
	var User     = require('./models/UserModel');
	var pusher   = require('./services/pusher');
	var schedule = require('node-schedule');
	var moment   = require('moment');
	

	// Job #0 - Print how long server has been on

	var min = 0;
	(function checkingTime(){
		min += 1;
		console.log( 'Scheduler up and running for ' + min + ' minutes now. ');
		setTimeout( checkingTime, 60000);
	})();


	// Job #1 - Put "ended" all events of yesterday, every day at 3:30 am	

	var every_hour    = 1000 * 60 * 60;
	var every_min     = 1000 * 60;
	var every_ten_sec = 1000 * 10;
	(function terminateEventsEveryHour(){
		require('./jobs/terminate-events').terminateEvents();
		setTimeout( terminateEventsEveryHour, every_hour );
	})();

