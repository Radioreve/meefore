
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		config = require('../config/config');

		mongoose.connect( config[ process.env.NODE_ENV ].dbUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			var select = {};

			var update = { 
						 $unset :  { 'local' : 1 }	 
					};

			var options = { multi: true };



			var callback_update = function(err,docs){
				if(err)
					console.log(err);
				else
					console.log('Done');
			};



			var callback_find = function(err,docs){
				if(err) 
					return console.log(err);
				else
					docs.forEach( function(el){

						/*Update start*/
						el.email    = el.local.email;
						el.password = el.local.password
						/*Update end*/

						el.save();
					});
				console.log('Done');
			};

			User.update( select, update, options, callback_update );
			//User.find( select, callback_find );

		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});