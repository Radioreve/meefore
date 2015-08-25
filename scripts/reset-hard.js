
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


		User.find({}, function( err, users ){

			if( err || !users){
				console.log('Error fetching user, aborting...')
				return console.log(err);
			}

			users.forEach(function( user ){

				user.channels = {
					"me" : user.facebook_id,
        			"public_chan" : "default"
				};
				user.events = [];
				user.save(function( err, user ){
					console.log('User modified');
				});

			});

			Event.find({}).remove(function(){
				console.log('Events removed');
			});


		});



		});
		
