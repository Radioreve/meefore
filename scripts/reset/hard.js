	
	var model_path = process.cwd() + '/models';

	var mongoose = require('mongoose'),
		User = require( model_path + '/UserModel'),
		Before = require( model_path + '/BeforeModel'),
		config = require( process.cwd() + '/config/config'),
		_ = require('lodash')
		realtime = require( process.cwd() + '/middlewares/realtime');

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

				user.channels = [{
					type: 'personnal',
					name: realtime.makePersonnalChannel( user.facebook_id )
				}, {
					type: 'location',
					name: realtime.makeLocationChannel( user.location.place_id )
				}];

				user.markModified('channels');

				user.befores = [];
				user.save(function( err, user ){
					console.log('User modified');
				});

			});

			Before.find({}).remove(function(){
				console.log('Befores removed');
			});


		});



		});
		
