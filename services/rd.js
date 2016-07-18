	
	var config = require('../config/config');
	var redis  = require('redis')

	var APP_ENV = process.env.APP_ENV;

	var client = redis.createClient( config.redis[ APP_ENV ].port, config.redis[ APP_ENV ].host, {
			auth_pass        : process.env.PW,
			socket_keepalive : true // Prevent redis from disconnecting with ETIMEOUT
		}
	);

	client.on("error", function( err ){
		console.log('Error connecting to redis : ' + err );
	});

	client.on("ready", function(){
		console.log("Connected to Redis");
	});

	module.exports = client;

