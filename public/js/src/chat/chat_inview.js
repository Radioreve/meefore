
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		groupname_show_duration: 500,
		groupname_hide_duration: 150,

		handleDomEvents__Inview: function(){

			$('.chat').on('click', '.js-user-profile', LJ.chat.handleShowUserProfile );
			$('.chat').on('click', '.chat-inview__icon.--options', LJ.chat.handleShowOptions );
			$('.chat').on('click', '.js-show-before', LJ.chat.handleShowBefore );
			$('.chat').on('click', '.js-show-users', LJ.chat.handleShowUsers );
			$('.chat').on('click', '.js-chat-back', LJ.chat.handleChatBack );
			$('.chat').on('click', '.js-validate-now', LJ.chat.handleValidateNow );
			$('.chat').on('click', '.js-validate-later', LJ.chat.handleValidateLater );
			$('.chat').on('click', '.js-chat-switch', LJ.chat.handleSwitchChatInview );
			$('.chat').on('keydown', '.js-send-message', LJ.chat.handleSendMessage );

		},
		handleSwitchChatInview: function(){

			var $s = $(this);
			var chat_id = $s.closest('.chat-inview')
							.find('.chat-inview-item:not(.--active)')
							.attr('data-chat-id');
			
			LJ.chat.switchChatInview( chat_id );

		},
		handleValidateLater: function(){

			LJ.chat.hideChatInview();

		},
		handleChatBack: function(){

			LJ.chat.hideChatInview();

		},
		loaderifyChatInview: function( chat_id ){
			
			var $chatinview = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var $mwrap      = $chatinview.find('.chat-inview-messages');
			var $messages   = $chatinview.find('.chat-inview-message');
			var $loader     = $( LJ.static.renderStaticImage("chat_loader") );

			$messages.velocity({ opacity: [ 0.3, 1 ]}, {
				duration: 350
			});

			$loader.hide().appendTo( $chatinview ).velocity('fadeIn', {
				duration: 350
			});
				

		},
		deloaderifyChatInview: function( chat_id, callback ){

			var $chatinview = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var $messages   = $chatinview.find('.chat-inview-message');
			var $loader     = $chatinview.find('.chat__loader');

			$messages.velocity({ opacity: [ 1, 0.3 ]}, {
				duration: 350
			});

			$loader.velocity('fadeOut', {
				duration: 350,
				complete: function(){
					$(this).remove();
					if( typeof callback == "function" ){
						callback();
					}
				}
			});


		},
		activateChat: function( chat_id ){
			
			var group_id = LJ.chat.getGroupIdByChatId( chat_id );
			
			LJ.chat.deactivateChats(); // Never have more than one chat with the active status
			LJ.chat.getChatById( chat_id ).ui_status = "active";
			LJ.chat.viewifyChatInview( chat_id ); // Always "seen" all messages of a chat that gets active
			LJ.chat.refreshChatInviewBubbles( group_id );
			LJ.chat.refreshChatIconBubble();
			LJ.chat.focusOnInput( chat_id );
			
		},
		focusOnInput: function( chat_id ){

			$('.chat-inview-item[data-chat-id="'+ chat_id +'"]').find('input').focus();

		},
		deactivateChats: function(){

			LJ.chat.getChatIds().forEach(function( chat_id ){
				LJ.chat.getChatById( chat_id ).ui_status = "inactive";
			});

		},
		switchChatInview: function( chat_id ){

			var $inview_target  = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var $inview_current = $inview_target.siblings('.chat-inview-item');
					
			var $groupname_target  = $('.js-chat-groupname[data-chat-id="'+ chat_id +'"]');
			var $groupname_current = $groupname_target.siblings('.js-chat-groupname');
			
			// Save the last scroll pose y before its too late
			LJ.chat.saveActiveChatInviewScrollPose();

			$inview_current.removeClass('--active').hide();
			$inview_target.addClass('--active').show();

			$groupname_current.removeClass('--active').hide();

			 				  // .velocity('shradeOut', {
			 				  // 	duration: LJ.chat.groupname_hide_duration
			 				  // });

			$groupname_target.addClass('--active').show();
			
			 				 // .velocity('shradeIn', {
			 				 // 	duration : LJ.chat.groupname_show_duration,
			 				 // 	delay    : LJ.chat.groupname_hide_duration
			 				 // });
			
			LJ.chat.activateChat( chat_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.tallifyAllChatLines( chat_id );

		},
		showChatInview: function( group_id ){

			var $chat_rows        = $('.chat-row-wrap');
			var $chat_inview_wrap = $('.chat-inview-wrap');

			$chat_rows.hide().removeClass('--active');
			$chat_inview_wrap.show().addClass('--active');

			$chat_inview_wrap.find('.chat-inview').removeClass('--active');
			
			var $t = $chat_inview_wrap.find('.chat-inview[data-group-id="'+ group_id +'"]');
			var chat_id = $t.find('.chat-inview-item.--active').attr('data-chat-id');

			$t.addClass('--active').show();
		
			LJ.chat.activateChat( chat_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.tallifyAllChatLines( chat_id );

		},
		hideChatInview: function(){
			
			var $chat_rows        = $('.chat-row-wrap');
			var $chat_inview_wrap = $('.chat-inview-wrap');
			
			LJ.chat.saveActiveChatInviewScrollPose();
			
			$chat_inview_wrap.hide().removeClass('--active');
			$chat_rows.show().addClass('--active');

			$chat_inview_wrap.find('.chat-inview').hide();
			
			LJ.chat.deactivateChats();
			LJ.chat.refreshChatRowsJsp();

		},
		saveActiveChatInviewScrollPose: function(){
			
			var chat_id = LJ.chat.getActiveChatId();
			LJ.chat.getChatById( chat_id ).last_position_y = LJ.ui.jsp[ chat_id ].getContentPositionY();
				
		},
		handleShowUserProfile: function(){

			var facebook_id = $( this ).attr('data-facebook-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},
		renderChatInview__HostsEmpty: function( group_name ){

			return LJ.chat.renderChatEmpty({
				type 	 : 'hosts',
				icon 	 : '<i class="icon icon-chat-bubble-duo"></i>',
				title 	 : '<span data-lid="chat_empty_title_inview_hosts"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_hosts" data-lpm="'+ group_name +'"></span>'
			});

		},
		renderChatInview__PendingEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	 : 'pending',
				icon 	 : '<i class="icon icon-pending"></i>',
				title 	 : '<span data-lid="chat_empty_title_inview_pending"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_pending"</span>'
			});

		},
		renderChatInview__AcceptedEmpty: function( group_name ){

			return LJ.chat.renderChatEmpty({
				type 	 : 'accepted',
				icon 	 : '<i class="icon icon-chat-bubble-duo"></i>',
				title 	 : '<span data-lid="chat_empty_title_inview_accepted"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_accepted" data-lpm="'+ group_name +'"></span>'
			});

		},
		renderChatInview__TeamEmpty: function( group_name ){

			return LJ.chat.renderChatEmpty({
				type 	 : 'team',
				icon 	 : '<i class="icon icon-chat-bubble-duo"></i>',
				title 	 : '<span data-lid="chat_empty_title_inview_team" data-lpm="'+ group_name +'"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_team"></span>'
			});

		},
		handleSendMessage: function( e ){

			var $s = $(this);

			var keyCode = e.keyCode || e.which;
            if( keyCode === 13 ){

                var $w = $s.closest('.chat-inview-item');
                var $p = $s.closest('.chat-inview');

				var group_id  = $w.attr('data-group-id');
				var chat_id   = $w.attr('data-chat-id');
				var before_id = $p.attr('data-before-id');
				var message   = $s.val();

				if( message.length == 0 ) return;

            	$s.val('');

                LJ.chat.sendMessage({
                	group_id  : group_id,
                	before_id : before_id,
                	chat_id   : chat_id,
                	message   : message
                });

            }

		},
		sendMessage: function( data ){

			LJ.log('Sending message...');

			var chat_id 	= data.chat_id;
			var sender_id   = LJ.user.facebook_id;
			var call_id 	= LJ.generateId();

			LJ.chat.addChatLine( _.merge( data, {
				sender_id: sender_id }), call_id
			);

			LJ.chat.pendifyChatLine( call_id );

			LJ.api.sendChatMessage(
				_.merge( data, { call_id: call_id })
			)
			.then(function( res ){
				LJ.log('Message sent')

			});


		},
		getMessageElById: function( call_id ){
			var $el = $('.chat-inview-message__bubble[data-call-id="'+ call_id +'"]');
			return $el;
		},
		addChatLine: function( data, call_id, opts ){

			opts = opts || {};

			var chat_id        = data.chat_id;
			var chat_line_html = LJ.chat.renderChatLine( data, call_id );

			LJ.chat.insertChatLine( chat_id, chat_line_html, opts.insert_mode );
			LJ.chat.tallifyChatLine( call_id );
			LJ.chat.horodateChatLine( call_id );
			LJ.chat.mergeChatLine( call_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.classifyChatLine( call_id );
			LJ.chat.showChatLine( call_id );


		},
		dependifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).removeClass('--pending');

		},
		pendifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).addClass('--pending');

		},
		classifyChatLine: function( call_id ){
			var $msg = LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message');
			var sender_id = $msg.attr('data-sender-id');

			if( LJ.user.facebook_id == sender_id ){
				return $msg.addClass('--me');
			}

			if( LJ.user.friends.indexOf( sender_id ) != -1 ){
				return $msg.addClass('--friend');
			}

		},
		tallifyAllChatLines: function( chat_id ){

			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			$w.find('.chat-inview-message__bubble').each(function( i, el ){
				LJ.chat.tallifyChatLine( $(el).attr('data-call-id') );
			});

		},
		tallifyChatLine: function( call_id ){

			var $m = LJ.chat.getMessageElById( call_id );
			// Detect when the message is written on more than one line
			if( $m.height() > 20 ){
				$m.addClass('--tall');
			}

		},
		refetchChatHistory: function( chat_id ){

			var $w               = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var messages_fetched = $w.find('.chat-inview-message__bubble:not(.--pending)').length;

			if( $w.hasClass('--fetching-history') ){
				LJ.log('Cant fetch chat history, already fetching...');
				return;
			}

			var call_id = $w.find('.chat-inview-message__bubble').first().attr('data-call-id');
			LJ.chat.horodateChatLine( call_id, { force: true });

			$w.addClass('--fetching-history');
			LJ.chat.loaderifyChatInview( chat_id );
			LJ.chat.saveActiveChatInviewScrollPose();

			var $g = $w.find('.chat-inview-message').first();
			$g.addClass('--glue');

			LJ.api.fetchChatHistory( chat_id, messages_fetched )
				.then(function( res ){

					var chat_messages = res.messages;

					if( chat_messages.length == 0 ){
						return LJ.chat.allMessagesFetched( chat_id );
					}


					LJ.chat.deloaderifyChatInview( chat_id, function(){

						chat_messages.forEach(function( message_object ){
							LJ.chat.addChatLine( message_object, LJ.generateId(), { insert_mode: "prepend" });
						});
						
						LJ.chat.cacheChatMessages( chat_id, chat_messages );
						$w.removeClass('--fetching-history');
						$g.removeClass('--glue');
						
					});


				});
		},
		allMessagesFetched: function( chat_id ){

			LJ.chat.deloaderifyChatInview( chat_id );
			$('.chat-inview-item[data-chat-id="'+ chat_id +'"]').removeClass('--fetching-history').addClass('--fetching-done');
			LJ.wlog('All messages have been fetched');

		},
		refreshChatJsp: function( chat_id ){

			LJ.log('Refreshing chat jsp!');

			var j = LJ.ui.jsp[ chat_id ];

			if( !j ){
				return LJ.log('Chat hasnt been jsp-initialized yet, nothing to reinitialize');
			}

			var $w   = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var $g   = $w.find('.--glue');
			var chat = LJ.chat.getChatById( chat_id );

			var is_fetching_history = $w.hasClass('--fetching-history');
			var has_few_chat_lines  = $w.find('.chat-inview-message__bubble').length < 16;
			var is_almost_at_bottom = j.getPercentScrolledY() > 0.85;
			var is_at_top 			= j.getContentPositionY() == 0;
			var last_position_y     = chat.last_position_y;

			// Prevent an arriving chatline to accidentaly triggering a fetch history
			// by removing the fetch ready class right before reinitialise happens.
			$w.removeClass('--fetch-ready');
			j.reinitialise();
			
			LJ.delay(300).then(function() { $w.addClass('--fetch-ready'); });

			// fetching history state, started when the loading happens and ends after all 
			// chat messages have been added. During this, always stick to the saved position
			if( is_fetching_history ){
				LJ.log('User is fetching history, scrolling to the glued element...');
	           	j.scrollToElement( $g, true );
                j.scrollToY( j.getContentPositionY() );
	           	return;
			}

			if( !last_position_y ){
				LJ.log('User has unknown last position, first time he opens the chat. Put him to bottom...');
				j.scrollToBottom();
				return;
			}

			// User is almost at the end of the chat, scroll to the bottom to display the last message
			if( is_almost_at_bottom ){
				LJ.log('User is almost at bottom, scrolling bottom...');
				j.scrollToBottom();
				return;
			}

			// In order to allow for one single fixed ratio (see just above), split the algorithm into a fix part
			// where the use is forced to go down when too few chat lines.
			if( has_few_chat_lines ){
				LJ.log('User has too few chat lines, forcing to scroll down ');
				j.scrollToBottom();
				return;
			}
			// User happens to be at top without fetching history state, which means that either the history
			// is complete, or that its a jsp anomaly. Put him back right where he was before coming
			if( is_at_top ){
				LJ.log('User is at top for some weird reason, scrolling to the last position...');
				j.scrollToY( last_position_y );
				return;
			}

			LJ.log('Nothing special happened, let the user exactly where he is...');


		},
		horodateChatLine: function( call_id, opts ){

			opts = opts || {};

			var $curr_message = LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message');
			var $prev_message = $curr_message.prev();
			var $next_message = $curr_message.next();

			var $curr_message_bubble = $curr_message.find('.chat-inview-message__bubble').last();
			var $prev_message_bubble = $prev_message.find('.chat-inview-message__bubble').last();
			var $next_message_bubble = $next_message.find('.chat-inview-message__bubble').last();

			var curr_message_sent_at = parseInt( $curr_message_bubble.attr('data-sent-at') );
			var prev_message_sent_at = parseInt( $prev_message_bubble.attr('data-sent-at') );
			var next_message_sent_at = parseInt( $next_message_bubble.attr('data-sent-at') );

			var date_html = LJ.chat.renderChatLine__Date( curr_message_sent_at );
			var $date     = $( date_html );

			// if( $prev_message.length == 0 && $('.chat-inview-message').length > 1 ){
			// 	$date.insertBefore( $curr_message );
			// }

			if( opts.force == true ){
				return $date.insertBefore( $curr_message );
			}

			if( $next_message.length == 0 && $prev_message.length != 0 ){
				var diff = curr_message_sent_at - prev_message_sent_at;
				if( diff >= 7200 ){
					$date.insertBefore( $curr_message );
				}
			}

			if( $prev_message.length == 0 && $next_message.length != 0 ){
				var diff = next_message_sent_at - curr_message_sent_at;
				if( diff >= 7200 ){
					$date.insertBefore( $next_message );
				}
			}

		},
		mergeChatLine: function( call_id ){

			var $bubble = LJ.chat.getMessageElById( call_id );
			var $w      = $bubble.closest('.chat-inview-message');

			var $prev   = $w.prev();
			var $next   = $w.next();

			if( $prev.hasClass('chat-inview-message__date') && $next.length == 0 ){
				return LJ.log('Cant merge chat, already horodated');
			}

			if( $prev.attr('data-sender-id') != $w.attr('data-sender-id') && $next.length == 0 ){
				return LJ.log('Cant merge chat, not the same sender');
			}

			if( $next.hasClass('chat-inview-message__date') && $prev.length == 0 ){
				return LJ.log('Cant merge chat, already horodated');
			}

			if( $next.attr('data-sender-id') != $w.attr('data-sender-id') && $prev.length == 0 ){
				return LJ.log('Cant merge chat, not the same sender');
			}

			if( $next.length == 0 ){
				var $bubbles_wrap = $prev.find('.chat-inview-message__bubble-wrap');
			} else {
				var $bubbles_wrap = $next.find('.chat-inview-message__bubble-wrap');
			}

			$bubble.appendTo( $bubbles_wrap );
			$w.remove();

			var $children = $bubbles_wrap.children();			

			$children.each(function( i, bubble ){

				var $b = $( bubble );

				$b.removeClass('--last'); // Reset the last each time new bubbles are merged

				if( i == 0 ){
					$b.addClass('--first');
				}

				if( i == $bubbles_wrap.children().length - 1 ){
					$b.addClass('--last')
				}
				
				$b.addClass('--merged');

			});

		},
		insertChatLine: function( chat_id, chat_line_html, insert_mode ){

			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]')
						.find('.chat-inview-messages')
						

			if( $w.find('.jspPane').length != 0 ){
				$w = $w.find('.jspPane');
			}

			var $e = $w.find('.chat-empty');

			$e.remove();
			$( chat_line_html ).css({
				'opacity': 0 // If display "none", its not detected by jScrollPane when refreshing the overflow
			}); 

			if( insert_mode == "prepend" ){
				$( chat_line_html ).prependTo( $w );

			} else {
				$( chat_line_html ).appendTo( $w );

			}

		},
		showChatLine: function( call_id ){
			
			var $set;
			var $message = LJ.chat.getMessageElById( call_id );

			if( $message.hasClass('--merged') ){
				$set = $message;

			} else {
				$set = $message.closest('.chat-inview-message');
			}
			$set.velocity({ opacity: [ 1, 0 ] }, {
					duration: 450,
					complete: function(){
						
					}
				});		

		},
		findChatSender: function( group_id, facebook_id ){

			var group_object  = LJ.chat.fetched_groups[ group_id ];
			
			var sender = _.find( _.concat( group_object.members_profiles, group_object.hosts_profiles ), function( u ){
				return u.facebook_id == facebook_id;
			});

			return sender;

		},
		renderChatLine: function( data, call_id ){

			var sender_id   = data.sender_id;
			var message     = data.message;
			var sent_at     = data.sent_at;
			var chat_id 	= data.chat_id;
			var group_id 	= data.group_id;

			var sender = LJ.chat.findChatSender( group_id, sender_id );
			var m = moment( sent_at );

			var img_html = LJ.pictures.makeImgHtml( sender.img_id, sender.img_vs, "chat-line" );

			return LJ.ui.render([

				'<div class="chat-inview-message" data-sender-id="'+ sender_id +'">',
	              '<div class="chat-inview-message-head">',
	                '<div class="chat-inview-message__picture js-user-profile" data-facebook-id="'+ sender_id +'">',
	               	  '<span class="hint hint--top hint--rounded hint--no-animate" data-hint="'+ m.format('HH:mm') +'"></span>',
	                  img_html, // size 35
	                  '<span class="js-user-online user-online --online"></span>',
	                '</div>',
	                '<div class="chat-inview-message__name">'+ sender.name +'</div>',
	              '</div>',
	              '<div class="chat-inview-message-body">',
	                '<div class="chat-inview-message__bubble-wrap">',
	                  '<span class="chat-inview-message__bubble" data-call-id="'+ call_id +'" data-sent-at="'+ m.unix() +'">',
	                  	message,
	                  '</span>',
	                '</div>',
	              '</div>',
	            '</div>'

			].join(''));


		},
		renderChatLine__Date: function( sent_at ){

			var m = moment.unix( parseInt( sent_at ) );

			var day_week  = LJ.text("day")[ m.day() ];
			var day_digit = m.format('DD/MM');
			var day_hour  = m.format('HH:mm'); 

			return LJ.ui.render([

				 '<div class="chat-inview-message__date">',
	              '<span class="--day">'+ day_week +'</span>',
	              '<span class="--month">'+ day_digit +',</span>',
	              '<span class="--hour">'+ day_hour +'</span>',
             	'</div>'

			].join(''));

		},
		renderChatOptions__All: function(){

			return LJ.chat.renderChatOptions({
				show_users_html: '<span data-lid="chat_inview_options_message_show_users_all"></span>'
			});

		},
		renderChatOptions__Team: function(){

			return LJ.chat.renderChatOptions({
				show_users_html: '<span data-lid="chat_inview_options_message_show_users_team"></span>'
			});

		},
		renderChatOptions: function( opts ){

			return LJ.ui.render([

				'<div class="ioptions__actions">',
		            '<div class="ioptions__action-message">',
		              '<span data-lid="chat_inview_options_message"></span>',
		            '</div>',
		            '<div class="ioptions__action js-show-before">',
		              '<span data-lid="chat_inview_options_message_show_before"></span>',
		            '</div>',
		            '<div class="ioptions__action js-show-users">',
		              opts.show_users_html,
		            '</div>',
		            '<div class="ioptions__action --back js-ioptions-close">',
		             ' <span data-lid="slide_overlay_back"></span>',
		            '</div>',
	          	'</div>'

			].join(''));


		},
		renderChatOptions__GroupHosts: function( hosts_html ){

			return LJ.ui.render([

				'<div class="chat-inview-users__group">',
	              	'<i class="icon icon-star"></i>',
	              	'<span data-lid="chat_inview_users_group_hosts"></span>',
		        '</div>',
		        hosts_html

		    ].join(''));

		},
		renderChatOptions__GroupMembers: function( members_html ){

			return LJ.ui.render([

				'<div class="chat-inview-users__group">',
		              '<i class="icon icon-bookmark"></i>',
		              '<span data-lid="chat_inview_users_group_users"></span>',
			    '</div>',
			    members_html

		    ].join(''));

		},
		renderChatOptions__GroupTeam: function( group_id ){

			var group_object = LJ.chat.fetched_groups[ group_id ];

			var members_profiles = group_object.members_profiles;
			var members_html 	 = LJ.renderUserRows( members_profiles );
			var hosts_profiles   = group_object.hosts_profiles;
			var hosts_html  	 = LJ.renderUserRows( hosts_profiles );
			
			var hosts = _.map( hosts_profiles, 'facebook_id' );
			if( hosts.indexOf( LJ.user.facebook_id ) == -1 ){

				return LJ.chat.renderChatOptions__Group({
					members_group_html: LJ.chat.renderChatOptions__GroupMembers( members_html )
				});
				
			} else {

				return LJ.chat.renderChatOptions__Group({
					hosts_group_html: LJ.chat.renderChatOptions__GroupHosts( hosts_html )
				});

			}

		},
		renderChatOptions__GroupAll: function( group_id ){

			var group_object = LJ.chat.fetched_groups[ group_id ];

			var members_profiles = group_object.members_profiles;
			var members_html 	 = LJ.renderUserRows( members_profiles );
			var hosts_profiles   = group_object.hosts_profiles;
			var hosts_html  	 = LJ.renderUserRows( hosts_profiles );

			return LJ.chat.renderChatOptions__Group({
				members_group_html : LJ.chat.renderChatOptions__GroupMembers( members_html ),
				hosts_group_html   : LJ.chat.renderChatOptions__GroupHosts( hosts_html )
			});	

		},
		renderChatOptions__Group: function( opts ){

			return LJ.ui.render([
				
				'<div class="chat-inview-options__close --round-icon js-ioptions-close">',
		            '<i class="icon icon-cancel"></i>',
		        '</div>',
		        '<div class="chat-inview-users">',
		        	opts.hosts_group_html,
		        	opts.members_group_html,
		        '</div>'

			].join(''));

		},
		renderChatInview: function( data ){

			var group_id     = data.group_id;
			var before_id 	 = data.before_id;
			var chat_id_all  = data.chat_id_all;
			var chat_id_team = data.chat_id_team;
			var place_name   = data.place_name;
			var begins_at    = data.begins_at;

			var header_address_html = LJ.chat.renderChatInviewHeaderAddress( place_name, begins_at );

			return LJ.ui.render([

				'<div class="chat-inview" data-group-id="'+ group_id +'" data-before-id="'+ before_id +'">',
			        '<div class="chat-inview-header">',
						'<div class="chat-inview__icon --previous js-chat-back --round-icon">',
		            		'<i class="icon icon-arrow-left"></i>',
				        '</div>',
				        '<div class="chat-inview__icon --switch js-chat-switch --round-icon">',
				            '<i class="icon icon-switch"></i>',
				        '</div>',
				        '<div class="chat-inview__icon --options --round-icon">',
				            '<i class="icon icon-pending-vertical"></i>',
				        '</div>',		          
			          '<div class="chat-inview-title">',
			            '<div class="chat-inview-title__groupname">',
			              '<span data-lid="chat_groupname_all" class="js-chat-groupname --all --active" data-chat-id="'+ chat_id_all +'">Tout le monde</span>',
			              '<span data-lid="chat_groupname_team" class="js-chat-groupname --team" data-chat-id="'+ chat_id_team +'">Mon groupe</span>',
			            '</div>',
			            header_address_html,
			          '</div>',
			        '</div>',
			        '<div class="chat-inview-item --all --active" data-group-id="'+ group_id + '" data-chat-id="'+ chat_id_all +'">',
			        	'<div class="chat-inview-options"></div>',
	          			'<div class="chat-inview-messages">',
	          				// Dynamically injected
	          			'</div>',
			          	'<div class="chat-inview-footer">',
				            '<div class="chat-inview__input">',
				              '<input class="js-send-message" type="text" placeholder="Envoyer votre message">',
				            '</div>',
			          	'</div>', 
	          		'</div>',
	          		'<div class="chat-inview-item --team" data-group-id="'+ group_id + '" data-chat-id="'+ chat_id_team +'">',
	          			'<div class="chat-inview-options"></div>',
	          			'<div class="chat-inview-messages">',
	          				// Dynamically injected
	          			'</div>',
	          			'<div class="chat-inview-footer">',
				            '<div class="chat-inview__input">',
				              '<input class="js-send-message" type="text" placeholder="Envoyer votre message">',
				            '</div>',
			          	'</div>', 
	          		'</div>',
			    '</div>'

			].join(''));

		},
		renderChatInviewHeaderAddress: function( place_name, begins_at ){

			var m = moment( begins_at );
			var formatted_date = m.format('HH:mm') + ' ' + m.format('DD/MM');

			return LJ.ui.render([

				'<div class="chat-inview-title__address">',
		        	'<span class="--date">'+ formatted_date +'</span>,<span class="--place-name">'+ place_name +'</span>',
		        '</div>',

			].join(''));

		},
		handleShowOptions: function(){

			var $s 	  = $(this);

			var $wrap = $s.closest('.chat-inview').find('.chat-inview-item.--active');
			var $opts = $wrap.find('.chat-inview-options');

			var html;
			if( $wrap.hasClass('--all') ){
				html = LJ.chat.renderChatOptions__All();
			} else {
				html = LJ.chat.renderChatOptions__Team();
			}

			LJ.ui.showIoptions( $wrap, html );

		},
		handleShowUsers: function(){

			var $s = $(this);
			var $w = $s.closest('.chat-inview');
			var $c = $w.find('.chat-inview-item.--active');

			var group_id = $w.attr('data-group-id');

			if( $c.hasClass('--all') ){
				LJ.ui.updateIoptions( LJ.chat.renderChatOptions__GroupAll( group_id ) );

			} else {
				LJ.ui.updateIoptions( LJ.chat.renderChatOptions__GroupTeam( group_id ) );

			}


		},
		handleShowBefore: function(){

			var $s = $(this);
			var $w = $s.closest('.chat-inview');

			var before_id = $w.attr('data-before-id');
			LJ.before.fetchAndShowBeforeInview( before_id );

		},
		validateifyChatInview: function( group_id, chat_id ){

			var members_profiles = LJ.chat.fetched_groups[ group_id ].members_profiles;

			var html = LJ.chat.renderChatInview__ValidateGroup( members_profiles );
			var $w   = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');

			$w.children().hide();
			$( html ).appendTo( $w );

			LJ.chat.processChatInviewValidationPreDisplay( group_id, chat_id );

		},
		devalidateifyChatInview: function( chat_id ){

			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');

			var duration = 350;
			$w.find('.chat-inview-group').velocity('shradeOut', {
				duration : duration,
				complete : function(){
					$( this ).remove();
				}
			});

			$w.children().velocity('shradeIn', {
				duration : duration,
				delay    : duration,
				display  : 'flex'
			});

		},
		acceptifyChatInview: function( group_id, chat_id ){

			var $w         = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');

			var name       = LJ.chat.fetched_groups[ group_id ].main_member_profile.name;
			var group_name = LJ.renderGroupName( name );
			var html       = LJ.chat.renderChatInview__AcceptedEmpty( group_name );

			$w.removeClass('--pending');
			
			var duration = 350;
			$w.find('.chat-empty').velocity('shradeOut', {
				duration : duration,
				complete : function(){
					$( html )
					.hide()
					.replaceAll( $w.find('.chat-empty') )
					.velocity('shradeIn', {
						duration : duration,
						display  : 'flex'
					});
				}
			});
			

		},
		renderChatInview__ValidateGroup: function( members_profiles ){

			var be_pictures = LJ.before.renderBeforePictures( members_profiles );
			var user_rows   = LJ.renderUserRows( members_profiles );

			return LJ.ui.render([

				'<div class="chat-inview-group">',
					// '<div class="be-pictures">',
			  //         '<div class="be-pictures__overlay --filterlay"></div>',
			  //         be_pictures,
			  //       '</div>',
			        '<div class="be-users">',
			        	user_rows,
			        '</div>',
			        '<div class="be-request">',
			        	'<button class="--round-icon --later js-validate-later">',
			        		'<i class="icon icon-pending"></i>',
			        		'<span data-lid="chat_inview_validate_later"></span>',
			        	'</button>',
			        	'<button class="--round-icon --now js-validate-now">',
			        		'<i class="icon icon-drinks"></i>',
			        		'<span data-lid="chat_inview_validate_now"></span>',
			        	'</button>',
			        '</div>',
				'</div>'

			].join(''));

		},
		processChatInviewValidationPreDisplay: function( group_id, chat_id ){

			var $w 			= $('.chat-inview-item[data-chat-id="'+ chat_id +'"]').find('.chat-inview-group');
			var main_member = LJ.chat.fetched_groups[ group_id ].main_member_profile.facebook_id;

        	// Dynamically render the size of the pictures to fit, with a shade
        	// LJ.before.setPicturesSizes( $w );

        	// Make sure the host is always on top of the list
        	LJ.mainifyUserRow( $w, main_member );

        	// Prepend and hide the content, so that jsp compute the right height
			// $w.css({ 'opacity': 0 }).show();

			// LJ.ui.turnToJsp( $w.find('.be-users'), {
			// 	jsp_id: 'chat_inview_validate'
			// });

			// Little delay to give Jsp the time to act
			return LJ.delay( 100 );

        },
        handleValidateNow: function(){

			var $s = $(this);

			if( $s.hasClass('--validating') ) return;
			$s.addClass('--validating');

        	LJ.log('Validating request...!');
			
			var group_id = $s.closest('[data-group-id]').attr('data-group-id');
			var main_member = LJ.chat.fetched_groups[ group_id ].main_member_profile.facebook_id;

        	LJ.chat.processValidation({
        		status      : "accepted",
        		main_member : main_member,
				chat_id     : $s.closest('[data-chat-id]').attr('data-chat-id'),
				group_id    : group_id,
				before_id   : $s.closest('[data-before-id]').attr('data-before-id')
        	});

        },
        processValidation: function( opts ){

			var before_id = opts.before_id;
			var group_id  = opts.group_id;
			var chat_id   = opts.chat_id;

        	LJ.chat.loaderifyChatInview( chat_id );
        	LJ.api.changeGroupStatus( opts )
        		.then(function( res ){

        			LJ.chat.devalidateifyChatInview( chat_id );
        			LJ.chat.deloaderifyChatInview( chat_id );
        			LJ.chat.acceptifyChatRow( group_id );

        		})
        		.catch(function( e ){

        			LJ.ui.showToast('Une erreur est survenue');
        			LJ.chat.deloaderifyChatInview( chat_id );
        			$('.chat-inview-item[data-chat-id="'+ chat_id +'"]')
        				.find('.button.--now')
        				.removeClass('--validating');

        		});

        }


	});


