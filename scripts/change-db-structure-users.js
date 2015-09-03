
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			var select = {};

			var update = { 
						$unset: { skill: '' }
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


			//User.update( select, update, options, callback_update );

			User.find({}, function(err, users ){
				users.forEach(function(user){
					user.channels = {
						'public_chan': 'default',
						'me': user.facebook_id,
					};
					user.facebook_access_token = {}
					user.save(function(err,svd){
						console.log('done');
					});
				});
			});

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});