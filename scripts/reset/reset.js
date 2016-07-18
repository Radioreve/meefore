	
	var model_path = process.cwd() + '/models';

	var mongoose = require('mongoose');
	var User     = require( model_path + '/UserModel');
	var Before   = require( model_path + '/BeforeModel');
	var Message  = require( model_path + '/MessageModel');
	var config   = require( process.cwd() + '/config/config');
	var _        = require('lodash');
	var redis    = require('redis');
	var async    = require('async');


	var APP_ENV = process.env.APP_ENV;


	function resetRedisAll(){

		var rd = redis.createClient( config.redis[ APP_ENV ].port, config.redis[ APP_ENV ].host, {
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
	function resetStatus(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


			var tasks = [];
			tasks.push(function( callback ){

				User.find({}, function( err, users ){

					if( err ){
							console.log('Error updating users');
							return console.log( err );
						}

					var subtasks = [];

					users.forEach(function( usr ){
						subtasks.push(function( subcallback ){

							usr.befores.forEach(function( bfr ){
								if( bfr.status == "accepted" ){
									console.log('Modified (usr)');
									bfr.status == "pending";
								}
							});
							usr.markModified('befores');
							usr.save(function( err ){
								subcallback();
							});

						});
					});

					async.parallel( subtasks, function( err ){

						if( err ){
							console.log('Error paralleling users');
							console.log( err );
						} else {
							callback();
						}

					});

				});

			});

			tasks.push(function( callback ){

				Before.find({}, function( err, befores ){

					if( err ){
						console.log('Error updating before');
						return console.log( err );
					}

					var subtasks = [];

					befores.forEach(function( bfr ){
						subtasks.push(function( subcallback ){

							bfr.groups.forEach(function( grp ){
								if( grp.status == "accepted" ){
									console.log('Modified (bfr)');
									grp.status = "pending";
								}
							});
							bfr.markModified('groups');
							bfr.save(function( err ){
								subcallback();
							});

						});
					});

					async.parallel( subtasks, function( err ){

						if( err ){
							console.log('Error paralleling befores');
							console.log( err );
						} else {
							callback();
						}

					});

				});

			});

			async.parallel( tasks, function( err ){
				if( err ){
					console.log( err );
				} else {
					console.log('Update done');
					process.exit(0);
				}
			})

		});

	}

	function resetDbAll(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');


			var tasks = [];

			tasks.push(function( cb ){
				User.find({}, function( err, users ){

					if( err || !users ){
						console.log('Error fetching user, aborting...')
						return console.log(err);
					}

					var subtasks = [];
					users.forEach(function( user ){
						subtasks.push(function( cb ){

							user.notifications = [];
							user.markModified('notifications');

							user.channels = [];
							user.markModified('channels');

							user.befores = [];
							user.save(function( err, user ){
								console.log('User modified');
								cb();
							});

						});
					});

					async.parallel( subtasks, function(){
						console.log('Users updated (cleaned)')
						cb();
					})

				});
			});

			tasks.push(function( cb ){
				Before.find({}).remove(function(){
					console.log('Befores updated (removed)');
					cb();
				});
			});

			tasks.push(function( cb ){
				Message.find({}).remove(function(){
					console.log('Messages updated (removed)');
					cb();
				});
			});

			async.parallel( tasks, function(){
				process.exit(0);
			})

		});

	
	}

	function resetAllChats(){

	}

	module.exports = {
		db: {
			resetAll      : resetDbAll,
			resetRequests : resetRequests,
			resetStatus   : resetStatus,
			resetAllChats : resetAllChats
		},
		rd: {
			resetAll: resetRedisAll
		}

	};
