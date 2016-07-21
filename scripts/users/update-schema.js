
	var dir      = process.cwd();
	
	var mongoose = require('mongoose');
	var _        = require('lodash');
	var async    = require('async');
	var moment   = require('moment');
	var md5      = require('blueimp-md5');
	
	var User     = require( dir +  '/models/UserModel');
	var config   = require( dir + '/config/config');
	var settings = require( dir + '/config/settings');

	// the Model.js must contain the old and the new value when renaming a key
	// otherwise, it wont work
	var updateSchema = function(){

		mongoose.connect( config.db[ process.env.APP_ENV ].uri );

		mongoose.connection.on( 'open', function(){
			
			console.log('Connected to the database! Running operation... : ');

			User.find({}, function( err, users ){

				if( err ) return console.log( err );

				var tasks = [];
				users.forEach(function( user ){
					tasks.push(function( done ){

						// Update part
						user.pictures.forEach(function( pic ){

							if( /placeholder/i.test( pic.img_id ) ){
								pic.img_id      = settings.placeholder.img_id,
								pic.img_version = settings.placeholder.img_version
							}

						});	
						
						user.markModified('pictures');

						user.save(function( err ){
							if( err ) console.log('Error : ' + err );
							console.log('user updated');
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

	};

	function randomInt(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	};

	module.exports = {
		updateSchema: updateSchema
	}
