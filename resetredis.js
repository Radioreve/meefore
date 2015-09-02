
	var redis = require('redis');

	var client = redis.createClient("10576", "aws-eu-west-1-portal.1.dblayer.com", { auth_pass: "R4dioreve" });

	client.on('error', function(err){
		console.log(err);
	});

	client.on('ready', function(){
		console.log('client rdy!');
	});

	client.flushall();
