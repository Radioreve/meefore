
			 
	var Event    = require('../models/EventModel'),
		User     = require('../models/UserModel'),
   EventTemplate = require('../models/EventTemplateModel'),
	  	settings = require('../config/settings'),
	  	schedule = require('node-schedule');

	var pusher = require('./pusher');

	var eventsTerminateAt = settings.eventsTerminateAt;
	var eventsRestartAt = settings.eventsRestartAt;

	function restartEvents(){
		pusher.trigger( 'default', 'restart-events', {} );
	}

	function resetUsersAndEvents(){

		var eventConditions   = { 'state': { $in : ['open', 'suspended'] } },
	   	    eventUpdate     = { 'state': 'ended' },
	   	    eventOptions    = {  multi: true };

   		var eventCallback   = function( err, numberAffected, raw ){
	
   			if( err ) return console.log( err );
   			console.log('[events] The number of updated documents was %d', numberAffected);
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

	   	    userOptions    = {  multi: true };

   		var userCallback   = function( err, numberAffected, raw ){

   			if( err ) return console.log( err );
   			console.log('\n\n');
   			console.log('[users] The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);
  			console.log('\n\n');

	   		};

	   	var templateConditions = {},
	   		templateUpdate = {
	   			$set : {
	   				'active': false
	   			}
	   		},
	   		templateOptions = { multi: true };

		var templateCallback   = function( err, numberAffected, raw ){

			if( err ) return console.log( err );
			console.log('\n\n');
			console.log('[templates] The number of updated documents was %d', numberAffected);
			console.log('The raw response from Mongo was ', raw);
		
		};

	   		User.update( userConditions, userUpdate, userOptions, userCallback );
			Event.update( eventConditions, eventUpdate, eventOptions, eventCallback );
			EventTemplate.update( templateConditions, templateUpdate, templateOptions, templateCallback );
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


