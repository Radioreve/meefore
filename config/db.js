
	var mongoose      = require('mongoose'),
		schedule = require('node-schedule'),
		Event         = require('../models/EventModel');

	var db = function( config ){ 

		mongoose.connect( config.db.localUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected the the MongoHQ databased!');
		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

	}

	module.exports = db;