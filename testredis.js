
	var redis = require('redis');

	var client = redis.createClient("10576", "aws-eu-west-1-portal.1.dblayer.com", { auth_pass: "R4dioreve" });

	client.on('error', function(err){
		console.log(err);
	});

	client.on('ready', function(){
		console.log('client rdy!');
	});

	

	/*
	client.flushall(function(err,res){

		var hosts_fbid = ['1234','5678'];

		client.sadd('events:20294294Uhh2/hosts', hosts_fbid, function( err, res ){

			client.sadd('events:20294294Uhh2/hosts', ['9876'], function(err, res ){

				client.srem('events:20294294Uhh2/hosts', ['5678'], function( err, res ){

					client.smembers('events:20294294Uhh2/hosts', function( err, res ){

						console.log(res);
						console.log( res.indexOf('1234') );
						console.log( res.indexOf('5678') );
						console.log( res.indexOf('9876') );

					});

				});
			});
		});

	});

	*/
	
	var chat_namespace = 'chat/55e706c0ce780a607f76478e';

	var chat_messages = [];
	
	client.incr('chat/55e706c0ce780a607f76478e/count', function( err, res ){

			client.get('chat/55e706c0ce780a607f76478e/count', function( err, i ){

				client.hmset('chat/55e706c0ce780a607f76478e/messages/'+i, {
				 author: "Léo",
				 msg: "Super chat! ceci est mon " + i + "ème message"
				});

				console.log("Displaying all messages");

				for( var k=1; k<i; k++ ){
					client.hgetall("chat/55e706c0ce780a607f76478e/messages/"+k, function( err, res ){
						chat_messages.push( res );
						if( chat_messages.length == i-1 ){
							console.log(chat_messages);
						}
					});
				}
			});
	


	});


	
