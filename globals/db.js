
	var mongoose      = require('mongoose'),
		schedule 	  = require('node-schedule'),
		Event         = require('../models/EventModel');

	var db = function( uri ){ 

		mongoose.connect( uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database!');
		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

	}

	module.exports = db;