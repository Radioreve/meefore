
		
	/* Contient les variables modifiant le comportant de l'application */
	 
	var Event    = require('../models/EventModel'),
		  User     = require('../models/UserModel'),
	  	schedule = require('node-schedule'),
	  	settings = require('./settings');

	var eventsTerminateAt = settings.eventsTerminateAt;

	function terminateEvents(){

		var conditions   = { 'state': { $in : ['open', 'suspended'] } },
	   	    update     = { 'state': 'ended' },
	   	    options    = {  multi : true };

   		var callback   = function( err, numberAffected, raw ){
	
   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);

  			global.io.emit('terminate events');
   		};

	   	var userConditions = {},
	   	    userUpdate     = 
	   	    { 
	   	    	$set : { 
	   	    		'status': 'idle',
	   	    		'eventsAskedList': [],
	   	    		'hostedEventId':'',
	   	    		'socketRooms': []
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

	(function eventAutoUpdate(){
		
			var ruleTerminate = new schedule.RecurrenceRule();
				ruleTerminate.hour = eventsTerminateAt;
				ruleTerminate.minute = 25; // Sinon il l'envoie toutes les minutes

			var job_terminate = schedule.scheduleJob( ruleTerminate, terminateEvents );

		})();

	var min = 0;
	
	(function checkingTime(){

				min += 1;
				console.log( 'App running for ' + min + ' minutes now. ');
				setTimeout( checkingTime, 60000);

	})();


