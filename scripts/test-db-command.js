
	
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			var updated_group = {
				members_facebook_id: ['139625316382924','10153224803803632']
			}
			var notification = {
				type        : "accepted_in",
				happened_at : new Date(),
				group_name  : "Les beaux mecs"
			};

			var query = {
				facebook_id: { $in: updated_group.members_facebook_id }
			};

			var update = {
				$push: { 'notifications': notification }
			};

			var options = { multi: true };

			User.update( query, update, options, function( err, raw ){
				if( err ) console.log('Error updating notification array');
				console.log('Updated done, modified documents : ' + raw.n );
			});	

			User.find( query, function( err, users ){
				console.log(users);
			})		

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});