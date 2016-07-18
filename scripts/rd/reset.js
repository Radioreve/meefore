
	var config = require( process.cwd() + '/config/config');
	var redis = require('redis');

	var APP_ENV = process.env.APP_ENV;

	var client = redis.createClient( config.redis[ APP_ENV ].port, config.redis[ APP_ENV ].host, {
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
