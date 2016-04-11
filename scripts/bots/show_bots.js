
	var dir      = process.cwd();
	
	var mongoose = require('mongoose');
	var _        = require('lodash');
	var async    = require('async');
	var moment   = require('moment');
	
	var User     = require( dir +  '/models/UserModel');
	var config   = require( dir + '/config/config');

	mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

	mongoose.connection.on( 'open', function(){
		
		console.log('Connected to the database! Running operation... : ');

		User.find({ 'access': { '$in': ['bot'] } }, function( err, users ){

			if( err ) return console.log( err );

			if( users.length == 0 ){
				console.log('Zero user with bot access in database');
				return process.exit(0);
			}

			users.forEach(function( user ){

				console.log(
					JSON.stringify( _.pick( user, [
						'facebook_id',
						'gender',
						'ideal_night',
						'job',
						'name',
						'age',
					]), null, 4 ) );

			});

			console.log('All user have been fetched, quitting...');
			process.exit();

		});

	});

	mongoose.connection.on('error', function(err){
		console.log('Connection to the database failed : '+err);
	});

	function randomInt(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	};