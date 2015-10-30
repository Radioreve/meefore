
	var config = require( process.cwd() + '/config/config');
	var redis = require('redis');

	var node_env = process.env.NODE_ENV;

	var client = redis.createClient( config.redis[ node_env ].port, config.redis[ node_env ].host, {
			auth_pass: process.env.PW
		}
	);

	client.on('error', function(err){
		console.log(err);
	});

	client.on('ready', function(){
		console.log('client rdy!');
	});

	client.flushall();
