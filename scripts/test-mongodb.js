
		
		var mongoose = require('mongoose');
		var moment   = require('moment');
		var User     = require('../models/UserModel');
		var Before   = require('../models/BeforeModel');
		var config   = require('../config/config');
		var _        = require('lodash');

		mongoose.connect( config.db[ process.env.APP_ENV ].uri );


		/*
			Conclusions that have been found so far about mongoose
				- When you have a nested ObjectId property, you can target by casting with `mongoose.Types.ObjectId(...)`
				  It is not necessary when looking for the non-nested property `_id` (mongoose auto cast internally?)
				  Also, the returned '_id' field of a mongoose call is already of type ObjectId.
				  ==> When using a clientside code value for an '_id' and querying for a nested ObjectId, then cast manually :)

		*/

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			
			

		});


		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});