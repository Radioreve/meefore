
	var redis = require('redis');
	var flags = require('flags');

    flags.defineString('id', 1, 'chat id to reset');
    flags.parse();

    var chat_id = flags.get('id');
    console.log('Reseting chat history for chat id : ' + chat_id );

	var rd = redis.createClient("10576", "aws-eu-west-1-portal.1.dblayer.com", { auth_pass: "R4dioreve" });

	rd.on('error', function(err){
		console.log(err);
	});

	rd.on('ready', function(){
		console.log('rd rdy!');
	});


	var count_ns = 'chat/' + chat_id + '/count';

	rd.get( count_ns, function( err, count ){

		console.log( count + ' messaged counted. Removing... ');
		for( var i = 0; i < count; i++ ){
			(function(i){
				rd.del('chat/' + chat_id + '/messages/' + i, function( err, msg ){
					if( err ) return console.log( err );
					console.log('Message /' + i + ' has been removed from cache');
				});
			}(i))
		}

	});

	rd.del( count_ns );