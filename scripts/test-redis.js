
	var Message = require('../models/MessageModel');
	var rd      = require('../services/rd');
	var async   = require('async');

	rd.on('error', function(err){
		console.log(err);
	});

	rd.on('ready', function(){
		console.log('rd rdy!');
	});

	function handleError(err){
		console.log(err);
	}				


	rd.smembers('chats', function( err, chat_ids ){

		chat_ids.forEach(function( chat_id ){

			rd.get('chat/' + chat_id + '/count', function( err, n ){

				var async_tasks = [];
				console.log('Populating tasks...');
				for( var i = 1; i <= n; i++ ){

					console.log('Task..');
					(function(i){
						async_tasks.push(function( callback ){
							console.log(i);
							rd.hgetall('chat/' + chat_id + '/messages/' + i, function( err, msg ){

								console.log(msg);
								var message = new Message();

								message.chat_id = chat_id;
								message.sent_at = msg.sent_at;
								message.message = msg.message;

								message.author  = {
									name        : msg.name,
									facebook_id : msg.facebook_id,
									img_id		: msg.img_id,
									img_vs		: msg.img_vs
								};

								// message.type = ...

								message.save(function( err, msg ){
									if( err ) return handleError( err );

									// Async task is done
									console.log('Message has been saved');
									callback();

								});


							});

						});

					})(i);
					
				}

				async.parallel( async_tasks, function(){

					// All messages have been hard saved. Clear the cache. Tomorrow is another day...
					rd.flushall(function( err, res ){
						console.log('Redis cache has been cleared');
					});

				});


			});


		});

	});
	


	/*
	rd.flushall(function(err,res){

		var hosts_fbid = ['1234','5678'];

		rd.sadd('events:20294294Uhh2/hosts', hosts_fbid, function( err, res ){

			rd.sadd('events:20294294Uhh2/hosts', ['9876'], function(err, res ){

				rd.srem('events:20294294Uhh2/hosts', ['5678'], function( err, res ){

					rd.smembers('events:20294294Uhh2/hosts', function( err, res ){

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
	


	/*
	var chat_namespace = 'chat/55e706c0ce780a607f76478e';

	var chat_messages = [];
	
	rd.incr('chat/55e706c0ce780a607f76478e/count', function( err, res ){

			rd.get('chat/55e706c0ce780a607f76478e/count', function( err, i ){

				rd.hmset('chat/55e706c0ce780a607f76478e/messages/'+i, {
				 author: "Léo",
				 msg: "Super chat! ceci est mon " + i + "ème message"
				});

				console.log("Displaying all messages");

				for( var k=1; k<i; k++ ){
					rd.hgetall("chat/55e706c0ce780a607f76478e/messages/"+k, function( err, res ){
						chat_messages.push( res );
						if( chat_messages.length == i-1 ){
							console.log(chat_messages);
						}
					});
				}
			});
	


	});


	*/