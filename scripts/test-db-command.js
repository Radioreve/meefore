
	
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		_ = require('lodash');

		mongoose.connect( config[ process.env.NODE_ENV ].dbUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			User.findOne( { _id:'55aa3239594bfe743a471c8b' }, function(err, user ){

				if( err ) return console.log( err );
				
				console.log( user );


			});

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});