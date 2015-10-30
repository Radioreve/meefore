	
	var config = require('../config/config');
	var redis  = require('redis')

	var node_env = process.env.NODE_ENV;

	var client = redis.createClient( config.redis[ node_env ].port, config.redis[ node_env ].host, {
			auth_pass: process.env.PW
		}
	);

	client.on("error", function( err ){
		console.log('Error connecting to redis : ' + err );
	});

	client.on("ready", function(){
		console.log("Connected to Redis");
	});

	module.exports = client;

