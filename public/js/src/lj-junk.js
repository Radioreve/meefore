
	function j_testPusher(){
		$.ajax({
			method:'get', url:'/pusher/test',
			beforeSend: function( req ){
				req.setRequestHeader('x-access-token', LJ.accessToken );
			}
		});
	};

	function j_testPusherEvent( event_id ){
		$.ajax({
			beforeSend: function( req ){
				req.setRequestHeader('x-access-token', LJ.accessToken );
			},
			method:'get', url:'/pusher/test/event/'+event_id
		});
	};

	function j_fakeMessage( chatid ){
		LJ.fn.addChatLine({
			chat_id     : chatid,
			msg         : "Hello the moon",
			name        : "Meefore",
			facebook_id : LJ.bot_profile.facebook_id,
			img_vs      : LJ.bot_profile.img_vs,
			img_id      : LJ.bot_profile.img_id,
			sent_at     : new Date()
		});
	};

	function j_fakeMessageOther(msg){

		var $event_wrap = $( _.filter( $('.row-events-accepted-inview'), function(el){ return $(el).css('display') == 'block' }) );
		
		var gid   = $event_wrap.find('.event-accepted-chatgroup.active').attr('data-groupid').split('-')[0];
		var $chat = $event_wrap.find('.event-accepted-chat-wrap[data-groupid="' + gid + '"]');
		var chid  = $chat.attr('data-chatid');

		var $userswrap = $chat.parents('.event-accepted-chat').siblings('.event-accepted-users');
		var $users     = $userswrap.find('.event-accepted-user');

		var i = LJ.fn.randomInt( 0, $users.length-1 );

		var $user = $users.eq( i );
		
		var $img = $user.find('img');
		var img_id =  $img.attr('src').split('/').slice(-1)[0];
		
		LJ.fn.addChatLine({
			chat_id     : chid,
			msg         : msg,
			name        : $user.find('.event-accepted-user-name'),
			facebook_id : $user.attr('data-userid'),
			img_vs      : $img.attr('img_version'),
			img_id      :img_id,
			sent_at     : new Date()
		}); 

	};

	function j_fakeMessageWhisper(msg){
		
		var $event_wrap = $( _.filter( $('.row-events-accepted-inview'), function(el){ return $(el).css('display') == 'block' }) );
		
		var gid   = $event_wrap.find('.event-accepted-chatgroup.active').attr('data-groupid').split('-')[0];
		var $chat = $event_wrap.find('.event-accepted-chat-wrap[data-groupid="' + gid + '"]');
		var chid  = $chat.attr('data-chatid');

		var $userswrap = $chat.parents('.event-accepted-chat').siblings('.event-accepted-users');
		var $users     = $userswrap.find('.event-accepted-user');

		var i = LJ.fn.randomInt( 0, $users.length-1 );

		var $user = $users.eq( i );
		
		var $img = $user.find('img');
		var img_id =  $img.attr('src').split('/').slice(-1)[0];

		var whisper_to = [];
		$users.each(function( i, user ){
			whisper_to.push(
				$(user).attr('data-userid')
			);
		});

		LJ.fn.addChatLineWhisper({
			whisper_to   : whisper_to,
			whispered_by : $user.attr('data-userid'),
			chat_id      : chid,
			msg          : msg,
			name         : $user.find('.event-accepted-user-name'),
			facebook_id  : $user.attr('data-userid'),
			img_vs       : $user.find('img').attr('img_version'),
			img_id       : img_id,
			sent_at      : new Date()
		}); 

	};

	function l(){
		console.log('Response:');
		console.log( arguments[0] )
		console.log( arguments[1] )
		console.log( arguments[2] )
	};