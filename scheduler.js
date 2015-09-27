	
	var Event    = require('./models/EventModel');
	var User     = require('./models/UserModel');
	var pusher   = require('./services/pusher');
	var schedule = require('node-schedule');
	var moment   = require('moment');
	

	// Job #1 - Put "ended" all events of yesterday, every day at 3:00 am	
	var terminateEvents = require('./jobs/terminate-events').terminateEvents;

	var terminate_events = new schedule.RecurrenceRule();
		terminate_events.hour   = 13;
		terminate_events.minute = 0;

	schedule.scheduleJob( terminate_events, terminateEvents );

	// Friendly logs
	var min = 0;
	(function checkingTime(){

		min += 1;
		console.log( 'Scheduler up and running for ' + min + ' minutes now. ');
		setTimeout( checkingTime, 60000);

	})();
