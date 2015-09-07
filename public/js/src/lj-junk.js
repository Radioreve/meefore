	
	function testPusher(){
		$.ajax({
			method:'get', url:'/pusher/test',
			beforeSend: function( req ){
				req.setRequestHeader('x-access-token', LJ.accessToken );
			}
		});
	};

	function testPusherEvent( event_id ){
		$.ajax({
			beforeSend: function( req ){
				req.setRequestHeader('x-access-token', LJ.accessToken );
			},
			method:'get', url:'/pusher/test/event/'+event_id
		});
	};

	function fakeMessage( chatid ){
		LJ.fn.addChatLine({
			id          : chatid,
			msg         : "Hello the moon",
			name        : "Meefore",
			facebook_id : LJ.bot_profile.facebook_id,
			img_vs      : LJ.bot_profile.img_vs,
			img_id      : LJ.bot_profile.img_id,
			sent_at     : new Date()
		});
	}

	function l(){
		console.log('Response:');
		console.log( arguments[0] )
		console.log( arguments[1] )
		console.log( arguments[2] )
	}