	
	var log    = require( process.cwd() + '/services/logger' );
	var print  = require( process.cwd() + '/services/print' )( __dirname.replace( process.cwd()+'/', '' ) + '/rd.js' );
	var config = require('../config/config');
	var redis  = require('redis')

	var APP_ENV = process.env.APP_ENV;

	var client = redis.createClient( config.redis[ APP_ENV ].port, config.redis[ APP_ENV ].host, {
			auth_pass        : process.env.PW,
			socket_keepalive : true // Prevent redis from disconnecting with ETIMEOUT
		}
	);

	client.on("error", function( err ){
		print.err('Error connecting to redis : ' + err );
	});

	client.on("ready", function(){
		print.info("Connected to Redis");
	});

	module.exports = client;

