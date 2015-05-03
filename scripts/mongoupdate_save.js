
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		config = require('../config/config'),
		moment = require('moment'),
		_ = require('lodash');

		mongoose.connect( config[ process.env.NODE_ENV ].dbUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			var select = { "email" : { $regex: /bot/ } };

			var callback_find = function( err, docs ){
				if( err ) 
					return console.log( err );
				else
					docs.forEach( function( el ){

						
						/*Update start*/
						el.access.push('bot');
						el.gender = "female";

						//if( moment() < moment({year:'2015',month:'6', day:'1'}) )
						//el.access.push('early-adopter');
						/*Update end*/

						el.save();
					});
				console.log('Done  on : '+ docs.length + ' docs');
			};

			User.find( select, callback_find );

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});