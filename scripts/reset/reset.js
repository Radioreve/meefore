	
	var model_path = process.cwd() + '/models';

	var mongoose = require('mongoose');
	var User     = require( model_path + '/UserModel');
	var Before   = require( model_path + '/BeforeModel');
	var config   = require( process.cwd() + '/config/config');
	var _        = require('lodash');
	var redis    = require('redis');


	var node_env = process.env.NODE_ENV;


	function resetRedisAll(){

		var rd = redis.createClient( config.redis[ node_env ].port, config.redis[ node_env ].host, {
				auth_pass        : process.env.PW,
				socket_keepalive : true // Prevent redis from disconnecting with ETIMEOUT
			}
		);

		rd.on("error", function( err ){
			console.log('Error connecting to redis : ' + err );

		});

		rd.on("ready", function(){
			console.log('Connected to Redis');
			console.log('Clearing all chats entries...');
			rd.flushall(function(){
				console.log('All cleared');
				process.exit(0);
			});

		});


	}

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

	function resetDbAll(){

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
		db: {
			resetAll      : resetDbAll,
			resetRequests : resetRequests,
			resetAllChats : resetAllChats
		},
		rd: {
			resetAll: resetRedisAll
		}

	};
