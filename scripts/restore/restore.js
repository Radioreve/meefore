
	var model_path = process.cwd() + '/models';

	var mongoose = require('mongoose');
	var User     = require( model_path + '/UserModel');
	var Before   = require( model_path + '/BeforeModel');
	var config   = require( process.cwd() + '/config/config');
	var _        = require('lodash');
	var redis    = require('redis');
	var async 	 = require('async');
	var realtime = require( process.cwd() + '/middlewares/realtime');

	var node_env = process.env.NODE_ENV;

	function restoreBeforeCache(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

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
				console.log('Restoring all before cache entries...');

				Before.find({ status: 'open' }, function( err, befores ){

					console.log( befores.length + ' befores found');
					var tasks = [];
					befores.forEach(function( bfr ){
						tasks.push(function( done ){
							var hosts_ns = 'before/' + bfr._id + '/hosts';
		    				rd.sadd( hosts_ns, bfr.hosts, function( err ){
		    					done();
							});
					});
					async.parallel(tasks, function( err ){
						console.log('...done!');
						process.exit(0);
					});


					});

				});
			});
		});

	}



	function restoreGroupStatusCache(){

		mongoose.connect( config.db['dev'].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

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
				console.log('Restoring all before cache entries...');

				Before.find({ status: 'open' }, function( err, befores ){

					console.log( befores.length + ' befores found');
					var tasks = [];
					befores.forEach(function( bfr ){
						tasks.push(function( done ){

							var subtasks = [];
							bfr.groups.forEach(function( group ){
								subtasks.push(function( subdone ){

									var group_id = realtime.makeChatGroupId( bfr._id, bfr.hosts, group.members );
									var group_ns = 'group/' + group_id + '/status';

				    				rd.set( group_ns, group.status, function( err ){
				    					subdone();
									});

								});
							});

							async.parallel( subtasks, function(){
								done();
							});

					});
					async.parallel(tasks, function( err ){
						console.log('...done!');
						process.exit(0);
					});


					});

				});
			});
		});

	}



	module.exports = {
		restoreBeforeCache     : restoreBeforeCache,
		restoreGroupStatusCache : restoreGroupStatusCache

	};
