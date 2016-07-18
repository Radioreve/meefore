
	
		var mongoose  = require('mongoose'),
		moment        = require('moment'),
		User          = require('../models/UserModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config        = require('../config/config'),
		_             = require('lodash');

		mongoose.connect( config.db[ process.env.APP_ENV ].uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


			var query = {
					'events': {
						$elemMatch: {
							'begins_at': {
								$lte: moment('2015-16-12','YYYY-MM-DD').toDate()
							},
							'timezone': {
								$lt: 120, $gt: 0
							}
						}
					}
			};


			var update = {
					$pull: {
						'events': {
							$and: [
								{ 'begins_at': { $lte: moment('2015-16-12','YYYY-MM-DD').toDate() } },
								{ 'timezone': { $lt: 120, $gt: 0 } }
							]
						}
					}
			};

			var options = { multi: true };

			User.update( query, update, options, function( err, raw ){
				if( err ) console.log('Error updating notification array');
				console.log('Updated done, modified documents : ' + raw.n );
			});	

			User
				.find( query )
				.select({ events: 1 })
				.exec(function( err, users ){
				console.log(users);
			});		

		});


		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});