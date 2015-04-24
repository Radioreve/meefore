
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		config = require('../config/config'),
		moment = require('moment'),
		_ = require('lodash');

		mongoose.connect( config[ 'dev' ].dbUri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			User.find().where('')

		});

		function callback(err,res){
			if(err) return console.log('err');
			for(var i = 0; i< res.length; i++){
				console.log(res.name);
			}
		}

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});