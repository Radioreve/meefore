
var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config[ process.env.NODE_ENV ].dbUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


var conditions   = { 'state': { $in : ['open', 'suspended'] } },
	   	    update     = { 'state': 'ended' },
	   	    options    = {  multi : true };

   		var callback   = function( err, numberAffected, raw ){
	
   			if( err ) return console.log( err );
   			console.log('The number of updated documents was %d', numberAffected);
  			console.log('The raw response from Mongo was ', raw);
   		};

	   	var userConditions = {},
	   	    userUpdate     = 
	   	    { 
	   	    	$set : { 
	   	    		'status': 'idle', // attention, ça affecte aussi les 'new'
	   	    		'asked_events': [],
	   	    		'hosted_event_id':''
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

		});