	
	var model_path = process.cwd() + '/models';

	var mongoose = require('mongoose'),
		User = require( model_path + '/UserModel'),
		Before = require( model_path + '/BeforeModel'),
		config = require( process.cwd() + '/config/config'),
		_ = require('lodash');

	function resetRequests(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


			User.update({
					befores: {
						$elemMatch: { 'status': { $nin: ['hosting'] } }
					}
				}, {
					$pull: {
						befores: { 'status': { $nin: ['hosting'] } }
					}
				}, { 
					multi: true
				}, function( err, raw ){
					if( err ) console.log( err );
					console.log('Users updated');
				});


			Before.update({},
				{ $set: { 'groups': [] }},
				{ multi: true },
				function( err, raw ){

					if( err ){
						console.log('Error updating befores')
						return console.log(err);
					}

				console.log('Before updated');

			});

		});

	}

	function resetAll(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


			User.find({}, function( err, users ){

				if( err || !users ){
					console.log('Error fetching user, aborting...')
					return console.log(err);
				}

				users.forEach(function( user ){

					user.channels = [];
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
	
	}

	function resetAllChats(){

	}

	module.exports = {
		resetAll      : resetAll,
		resetRequests : resetRequests,
		resetAllChats : resetAllChats
	};
