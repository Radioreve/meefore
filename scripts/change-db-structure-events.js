
	
	var mongoose = require('mongoose'),
		Event = require('../models/UserModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			var select = {};

			var update = { 
						$set: { 'groups': ['jean'] }
						/*$set :  { 
							"facebook_access_token" : {
								short_lived: null,
								long_lived: null,
								long_lived_valid_until: null
							} 
						}	*/
					};

			var options = { multi: true };

			var callback_update = function( err, nAffected ){
				if(err)
					console.log(err);
				else
					console.log('Done on '+ nAffected.n +' documents.');
			};


			//Event.update( select, update, options, callback_update );

			Event.find( select, function( err, events ){

				events.forEach(function(evt){

					
					
				});

			});

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});