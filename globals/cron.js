
			 
	var Event    = require('../models/EventModel'),
		User     = require('../models/UserModel'),
	  	settings = require('../config/settings'),
	  	schedule = require('node-schedule');

	var pusher = require('./pusher');

	var eventsTerminateAt = settings.eventsTerminateAt;
	var eventsRestartAt = settings.eventsRestartAt;

	function restartEvents(){

		pusher.trigger( 'default', 'restart-events', {} );
	}

	function resetUsersAndEvents(){

		var conditions   = { 'state': { $in : ['open', 'suspended'] } },
	   	    update     = { 'state': 'ended' },
	   	    options    = {  multi : true };

   		var callback   = function( err, numberAffected, raw ){
	
   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);

  			pusher.trigger( 'default', 'reset-events', {} );
   		};

	   	var userConditions = {},
	   	    userUpdate     = 
	   	    { 
	   	    	$set : { 
	   	    		'status': 'idle', // attention, ça affecte aussi les 'new'
	   	    		'eventsAskedList': [],
	   	    		'hostedEventId':''
	   	    	 }},

	   	    userOptions    = {  multi : true };

	   		var userCallback   = function( err, numberAffected, raw ){

	   			if( err ) return console.log( err );
	   			console.log('\n\n');
	   			console.log('The number of updated documents was %d', numberAffected);
	  			console.log('The raw response from Mongo was ', raw);
	  			console.log('\n\n');
	   		};

	   		User.update( userConditions, userUpdate, userOptions, userCallback );
			Event.update( conditions, update, options, callback );

	}

	/* Event Auto Update */
	var ruleTerminate = new schedule.RecurrenceRule();
		ruleTerminate.hour = eventsTerminateAt;
		ruleTerminate.minute = 0; // Sinon il l'envoie toutes les minutes
	    schedule.scheduleJob( ruleTerminate, resetUsersAndEvents );
	
	var ruleRestart = new schedule.RecurrenceRule();
		ruleRestart.hour = eventsRestartAt;
		ruleRestart.minute = 0;
	    schedule.scheduleJob( ruleRestart, restartEvents );

	var min = 0;
	(function checkingTime(){

				min += 1;
				console.log( 'App running for ' + min + ' minutes now. ');
				setTimeout( checkingTime, 60000);

	})();


