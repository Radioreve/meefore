
	var places = require('./places');
	var dir      = process.cwd() + '/../..'
	var mongoose = require('mongoose');
	var _        = require('lodash');
	var async    = require('async');
	var moment   = require('moment');
	var Before    = require( dir +  '/models/BeforeModel');
	var config   = require( dir + '/config/config');

	mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

	mongoose.connection.on( 'open', function(){
		
		console.log('Connected to the database! Running operation... : ');

		Before.find({}, function( err, befores ){

			if( err ) return console.log( err );

			var tasks = [];
			befores.forEach(function( before ){
				tasks.push(function( done ){

					// Update part
					before.geojson = {
						type: "Point",
						coordinates: [ before.address.lng, before.address.lat ]
					};
					before.save(function(){
						if( err ) console.log('Error : ' + err );
							console.log('before updated');
							done();
					});

				});
			});

			async.parallel( tasks, function( err, result){

				if( err ) return console.log( err );
				console.log('Everything has been updated successfully');
				process.exit(0);
			});

		});

	});

	mongoose.connection.on('error', function(err){
		console.log('Connection to the database failed : '+err);
	});

	function randomInt(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	};