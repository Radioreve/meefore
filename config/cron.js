
	
/* Contient les variables modifiant le comportant de l'application */
 
var Event    = require('../models/EventModel'),
	User     = require('../models/UserModel'),
	schedule = require('node-schedule'),
	settings = require('./settings');

var eventsFreezeAt = settings.eventsFreezeAt,
	eventsEndAt    = settings.eventsEndAt;

function changeStateToFrozen(){

	var conditions = { 'state': { $in : ['canceled'] } },
   	    update     = { 'state': 'frozen' },
   	    options    = {  multi : true };

   		var callback   = function( err, numberAffected, raw ){
	
   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);

  			global.io.emit('freeze events');
   		};

		Event.update( conditions, update, options, callback );

}

function changeStateToEnded(){

	var eventConditions = { 'state': 'frozen' },
   	    eventUpdate     = { 'state': 'ended' },
   	    eventOptions    = {  multi : true };

   		var eventCallback   = function( err, numberAffected, raw ){

   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);

  			global.io.emit('end events');

   		};

   	var userConditions = { 'state': 'hosting' },
   	    userUpdate     = { 'state': 'idle' },
   	    userOptions    = {  multi : true };

   		var userCallback   = function( err, numberAffected, raw ){

   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);

   		};

   		User.update( userConditions, userUpdate, userOptions, userCallback );
		Event.update( eventConditions, eventUpdate, eventOptions, eventCallback );

}

(function eventAutoUpdate(){
	
		var ruleFrozen = new schedule.RecurrenceRule();
			ruleFrozen.hour = eventsFreezeAt;
			ruleFrozen.minute = 0; // Sinon il l'envoie toutes les minutes

		var job_e = schedule.scheduleJob( ruleFrozen, changeStateToFrozen );

		var ruleEnded = new schedule.RecurrenceRule();
			ruleEnded.hour = eventsEndAt;
			ruleFrozen.minute = 0; 

		var job_f = schedule.scheduleJob( ruleEnded, changeStateToEnded );


	})();

var min = 0;
(function checkingTime(){

			min += 1;
			console.log( 'App running for ' + min + ' minutes now. ');
			setTimeout( checkingTime, 60000)

})();


