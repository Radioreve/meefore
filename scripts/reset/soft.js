
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		Party = require('../models/PartyModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config.db[ process.env.APP_ENV ].uri );

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

				var hosted_events = [];
				user.events.forEach(function( evt ){

					if( evt.status != "hosting" )
						hosted_events.push( evt );

				});

				user.events = hosted_events;
				user.markModified('events');

				user.save(function( err, user ){
					console.log('User modified');
				});

			});

			Event.find({}, function( err, events ){

				var i = 0;
				var n = events.length;
				events.forEach(function( evt ){

					evt.groups = [];
					evt.markModified('groups');
					evt.save();
					i++
					if( i == n-1 )
						console.log('Events groups all cleared');				

				});

				Party.find({}, function( err, parties ){

					parties.forEach(function( p ){
						p = {};
						p.save();

					});

				})

			});


		});



		});
		
