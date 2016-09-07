
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		groupname_show_duration: 500,
		groupname_hide_duration: 150,

		handleDomEvents__Inview: function(){

			$('.chat').on('click', '.js-user-profile', LJ.chat.handleShowUserProfile );
			$('.chat').on('click', '.chat-inview__icon.x--options', LJ.chat.handleShowOptions );
			$('.chat').on('click', '.js-show-before', LJ.chat.handleShowBefore );
			$('.chat').on('click', '.js-show-users', LJ.chat.handleShowUsers );
			$('.chat').on('click', '.js-chat-back', LJ.chat.handleChatBack );
			$('.chat').on('keydown', '.js-send-message', LJ.chat.handleSendMessageKeypress );
			$('.chat').on('keydown', '.js-send-message', LJ.chat.handleToggleShiftKeyStatus );
			$('.chat').on('keyup', '.js-send-message', LJ.chat.handleToggleShiftKeyStatus );
			$('.chat').on('keyup', '.js-send-message', LJ.chat.handleShowPlaceholder );
			$('.chat').on('keydown', '.js-send-message', LJ.chat.handleShowPlaceholder );
			$('.chat').on('click', 'button.js-send-message', LJ.chat.handleSendMessageClick );

		},
		handleChatBack: function(){

			LJ.chat.checkAllChats();
			LJ.chat.refreshChatStates();
			LJ.chat.hideChatInview();

		},
		loaderifyChatInview: function( chat_id ){
			
			var $chatinview = LJ.chat.getChatInview( chat_id );
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

			var $chatinview = LJ.chat.getChatInview( chat_id );
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
			
			// Never have more than one chat with the active status
			LJ.chat.deactivateChats(); 
			LJ.chat.getChat( chat_id ).ui_status = "active";
			
		},
		focusOnInput: function( chat_id ){

			LJ.chat.getChatInview( chat_id ).find('chat-inview-input__text').last().focus();

		},
		deactivateChats: function(){

			LJ.chat.getChatIds().forEach(function( chat_id ){
				LJ.chat.getChat( chat_id ).ui_status = "inactive";
			});

		},
		showChatInview: function( chat_id ){

			var $chat_inview  = LJ.chat.getChatInview( chat_id ).closest('.chat-inview');
			var $chat_inviews = LJ.chat.getChatInviews();

			if( $chat_inview.length == 0 ){
				return LJ.wlog('Unable to target chatinview for id : ' + chat_id );
			}

			$chat_inviews.hide();
			$chat_inview.show();
			
			LJ.chat.showChatInviewWrap();

		},
		hideChatInview: function(){
			
			if( !LJ.chat.getActiveChatId() ) return;
			
			var $chat_rows        = $('.chat-row-wrap');
			var $chat_inview_wrap = $('.chat-inview-wrap');
			
			LJ.chat.saveActiveChatInviewScrollPose();
						
			LJ.chat.hideChatInviewWrap();
			LJ.chat.deactivateChats();

		},
		removeChatInview: function( chat_id ){

			if( LJ.chat.getActiveChatId() == chat_id ){
				LJ.chat.deactivateChats();
				LJ.chat.hideChatInviewWrap();
			}

			LJ.chat.getChatInview( chat_id ).remove();

		},
		showChatInviewWrap: function(){

			$('.chat-inview-wrap').show();

		},
		hideChatInviewWrap: function(){

			$('.chat-inview-wrap').hide();

		},
		saveActiveChatInviewScrollPose: function(){
			
			var chat_id = LJ.chat.getActiveChatId();
			LJ.chat.getChat( chat_id ).last_position_y = LJ.ui.jsp[ chat_id ].getContentPositionY();
				
		},
		handleShowUserProfile: function(){

			var facebook_id = $( this ).attr('data-facebook-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},
		renderChatInview__AllEmpty: function( group_name, img_html ){

			return LJ.chat.renderChatEmpty({
				type 	 : 'accepted',
				img_html : img_html,
				title 	 : '<span data-lid="chat_empty_title_inview_accepted"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_accepted" data-lpm="'+ group_name +'"></span>'
			});

		},
		renderChatInview__TeamEmpty: function( group_name, img_html ){

			return LJ.chat.renderChatEmpty({
				type 	 : 'team',
				img_html : img_html,
				title 	 : '<span data-lid="chat_empty_title_inview_team" data-lpm="'+ group_name +'"></span>',
				subtitle : '<span data-lid="chat_empty_subtitle_inview_team"></span>'
			});

		},
		handleShowPlaceholder: function(){
			
			var $s      = $( this );
			var chat_id = $s.closest('[data-chat-id]').attr('data-chat-id');
			var $input  = LJ.chat.getChatInview( chat_id ).find('.chat-inview__input');
		
			LJ.delay( 15 ).then(function(){

				var message = $input.text();

				if( message.length == 0 ){
					LJ.chat.showPlaceholder( chat_id );
				} else {
					LJ.chat.hidePlaceholder( chat_id );
				}

			});

		},
		showPlaceholder: function( chat_id ){

			LJ.chat.getChatInview( chat_id ).find('.chat-inview__placeholder').show();

		},
		hidePlaceholder: function( chat_id ){

			LJ.chat.getChatInview( chat_id ).find('.chat-inview__placeholder').hide();

		},
		handleSendMessageKeypress: function( e ){

			var $s      = $( this );
			var chat_id = $s.closest('[data-chat-id]').attr('data-chat-id');
			var keyname = LJ.getKeyname( e.keyCode || e.which );
			var $input  = LJ.chat.getChatInview( chat_id ).find('.chat-inview__input');
			var message = $input.text();

            if( keyname == "enter" && !LJ.chat.isShiftKeyPressed() && message.length > 0 ){

            	LJ.delay( 100 ).then(function(){
            		$input.text('');
            		LJ.chat.showPlaceholder( chat_id );
            	});

                LJ.chat.sendAndAddMessage({
                	chat_id  : chat_id,
                	message  : message
                });
                return;

            }

            if( keyname == "arrow-left" ){

            }

            if( keyname == "arrow-right" ){

            }


		},
		handleSendMessageClick: function(){

			var $s      = $( this );
			var chat_id = $s.closest('[data-chat-id]').attr('data-chat-id');
			var $input  = LJ.chat.getChatInview( chat_id ).find('.chat-inview__input');
			var message = $input.text();

			if( message.length == 0 ) return;

        	LJ.delay( 100 ).then(function(){
            		$input.text('');
            		LJ.chat.showPlaceholder( chat_id );
            	});

            LJ.chat.sendAndAddMessage({
            	chat_id  : chat_id,
            	message  : message
            });

		},
		sendAndAddMessage: function( data ){

			LJ.log('Sending and adding message...');

			var chat_id = data.chat_id;

			data.sender_id = LJ.user.facebook_id;
			data.call_id   = LJ.generateId();

			LJ.chat.emptifyChatSeenBy( chat_id );
			LJ.chat.addChatLine( data );
			LJ.chat.pendifyChatLine( data.call_id );

			LJ.api.sendChatMessage( data )
				.then(function( res ){
					LJ.log('Message sent')

				});

		},
		getMessageElById: function( call_id ){

			return $('.chat-inview-message__bubble[data-call-id="'+ call_id +'"]');

		},
		addChatLine: function( data, opts ){

			opts = opts || {};

			var chat_id        = data.chat_id;
			var call_id 	   = data.call_id;
			var chat_line_html = LJ.chat.renderChatLine( data );
			
			var $seen_by = LJ.chat.popSeenBy( chat_id );
			LJ.chat.insertChatLine( chat_id, chat_line_html, opts.insert_mode );
			LJ.chat.urlifyChatLine( call_id );
			LJ.chat.tallifyChatLine( call_id );
			LJ.chat.horodateChatLine( call_id );
			LJ.chat.mergeChatLine( call_id ); 
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.classifyChatLine( call_id );
			LJ.chat.showChatLine( call_id );
			LJ.chat.pushBackSeenBy( chat_id, $seen_by );
 

		},
		popSeenBy: function( chat_id ){

			var $w = LJ.chat.getChatInview( chat_id );
			var $e = $w.find('.chat-inview-seen-by');
			var $b = _.clone( $e );
			
			$e.remove();
			
			return $b;
				
		},	
		pushBackSeenBy: function( chat_id, $seen_by ){

			var $w = LJ.chat.getChatInview( chat_id );

			$seen_by.insertAfter( $w.find('.chat-inview-message').last() )
			  
		},
		dependifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).removeClass('x--pending');

		},
		pendifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).addClass('x--pending');

		},
		urlifyChatLine: function( call_id ){

			var $msg       = LJ.chat.getMessageElById( call_id );
			var msg_parts = $msg.text().split(' ');

			msg_parts.forEach(function( msg_part, i ){

				var prefix = /https:\/\//i.test( msg_part ) ? "https://" : "http://";

				if( /http:\/\/|www\.|^\w+\.(com|fr|io|be|us|uk|org|net)$/i.test( msg_part ) ){
					msg_parts[ i ] = '<a target="_blank" href="'+ prefix + msg_part.replace(/https?:\/\//i, '') +'">'+ msg_part +'</a>';
				}

			});

			$msg.html( msg_parts.join(' ') );


		},
		classifyChatLine: function( call_id ){

			var $msg = LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message');
			var sender_id = $msg.attr('data-sender-id');

			if( LJ.user.facebook_id == sender_id ){
				return $msg.addClass('x--me');
			}

			if( LJ.user.friends.indexOf( sender_id ) != -1 ){
				return $msg.addClass('x--friend');
			}

		},
		tallifyAllChatLines: function( chat_id ){

			var $w = LJ.chat.getChatInview( chat_id );
			$w.find('.chat-inview-message__bubble').each(function( i, el ){
				LJ.chat.tallifyChatLine( $( el ).attr('data-call-id') );
			});

		},
		tallifyChatLine: function( call_id ){

			var $m = LJ.chat.getMessageElById( call_id );
			// Detect when the message is written on more than one line
			if( $m.height() > 20 ){
				$m.addClass('x--tall');
			}

		},
		refetchChatHistory: function( chat_id ){

			var $w = LJ.chat.getChatInview( chat_id );
			var $g = $w.find('.chat-inview-message').first();

			var sent_at = $w.find('.chat-inview-message__bubble:not(.x--pending)').first().attr('data-sent-at');
			var call_id = $w.find('.chat-inview-message__bubble').first().attr('data-call-id');

			if( $w.hasClass('x--fetching-history') ){
				LJ.log('Cant fetch chat history, already fetching...');
				return;
			}

			$w.addClass('x--fetching-history');
			$g.addClass('x--glue');

			LJ.chat.horodateChatLine( call_id, { force: true });
			LJ.chat.loaderifyChatInview( chat_id );
			LJ.chat.saveActiveChatInviewScrollPose();

			LJ.api.fetchChatHistory( chat_id, { 
				sent_at: sent_at 
			})
			.then(function( res ){

				var chat_messages = res.messages;

				if( chat_messages.length == 0 ){
					return LJ.chat.allMessagesFetched( chat_id );
				}

				LJ.chat.deloaderifyChatInview( chat_id, function(){

					chat_messages.sort(function( ch1, ch2 ){
						return moment( ch2.sent_at ) - moment( ch1.sent_at );
					});

					chat_messages.forEach(function( message_object ){
						message_object.call_id = LJ.generateId();
						LJ.chat.addChatLine( message_object, { insert_mode: "prepend" });
					});
					
					LJ.chat.cacheChatMessages( chat_id, chat_messages );
					$w.removeClass('x--fetching-history');
					$g.removeClass('x--glue');
					
				});
			});
		},
		allMessagesFetched: function( chat_id ){

			var $w      = LJ.chat.getChatInview( chat_id );
			var call_id = $w.find('.chat-inview-message__bubble').first().attr('data-call-id');

			LJ.chat.deloaderifyChatInview( chat_id );
			LJ.chat.horodateChatLine( call_id );
			LJ.chat.getChatInview( chat_id ).removeClass('x--fetching-history').addClass('x--fetching-done');
			LJ.wlog('All messages have been fetched');

		},
		refreshChatJsp: function( chat_id ){

			// LJ.log('Refreshing chat jsp!');

			var j = LJ.ui.jsp[ chat_id ];

			if( !j ){
				return // LJ.log('Chat hasnt been jsp-initialized yet, nothing to reinitialize');
			}

			var $w   = LJ.chat.getChatInview( chat_id );
			var $g   = $w.find('.x--glue');
			var chat = LJ.chat.getChat( chat_id );

			var is_fetching_history = $w.hasClass('x--fetching-history');
			var has_few_chat_lines  = $w.find('.chat-inview-message__bubble').length < 16;
			var is_almost_at_bottom = j.getPercentScrolledY() > 0.85;
			var is_at_top 			= j.getContentPositionY() == 0;
			var last_position_y     = chat.last_position_y;

			// Prevent an arriving chatline to accidentaly triggering a fetch history
			// by removing the fetch ready class right before reinitialise happens.
			$w.removeClass('x--fetch-ready');
			j.reinitialise();
			
			LJ.delay( 300 )
				.then(function(){
					$w.addClass('x--fetch-ready');
				});

			// fetching history state, started when the loading happens and ends after all 
			// chat messages have been added. During this, always stick to the saved position
			if( is_fetching_history ){
				// LJ.log('User is fetching history, scrolling to the glued element...');
	           	j.scrollToElement( $g, true );
                j.scrollToY( j.getContentPositionY() );
	           	return;
			}

			if( !last_position_y ){
				// LJ.log('User has unknown last position, first time he opens the chat. Put him to bottom...');
				j.scrollToBottom();
				return;
			}

			// User is almost at the end of the chat, scroll to the bottom to display the last message
			if( is_almost_at_bottom ){
				// LJ.log('User is almost at bottom, scrolling bottom...');
				j.scrollToBottom();
				return;
			}

			// In order to allow for one single fixed ratio (see just above), split the algorithm into a fix part
			// where the use is forced to go down when too few chat lines.
			if( has_few_chat_lines ){
				// LJ.log('User has too few chat lines, forcing to scroll down ');
				j.scrollToBottom();
				return;
			}
			// User happens to be at top without fetching history state, which means that either the history
			// is complete, or that its a jsp anomaly. Put him back right where he was before coming
			if( is_at_top ){
				// LJ.log('User is at top for some weird reason, scrolling to the last position...');
				j.scrollToY( last_position_y );
				return;
			}

			// LJ.log('Nothing special happened, let the user exactly where he is...');


		},
		horodateChatLine: function( call_id, opts ){

			opts = opts || {};

			var $curr_message = LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message');
			var $prev_message = $curr_message.prev();
			var $next_message = $curr_message.next();

			var $curr_message_bubble = $curr_message.find('.chat-inview-message__bubble').last();
			var $prev_message_bubble = $prev_message.find('.chat-inview-message__bubble').last();
			var $next_message_bubble = $next_message.find('.chat-inview-message__bubble').last();

			var curr_message_sent_at = $curr_message_bubble.attr('data-sent-at');
			var prev_message_sent_at = $prev_message_bubble.attr('data-sent-at');
			var next_message_sent_at = $next_message_bubble.attr('data-sent-at');

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
				$bubble.appendTo( $bubbles_wrap );
			} else {
				var $bubbles_wrap = $next.find('.chat-inview-message__bubble-wrap');
				$bubble.prependTo( $bubbles_wrap );
			}

			$w.remove();

			var $children = $bubbles_wrap.children();			

			$children.each(function( i, bubble ){

				var $b = $( bubble );

				$b.removeClass('x--last'); // Reset the last each time new bubbles are merged
				$b.removeClass('x--first');

				if( i == 0 ){
					$b.addClass('x--first');
				}

				if( i == $bubbles_wrap.children().length - 1 ){
					$b.addClass('x--last')
				}
				
				$b.addClass('x--merged');

			});

		},
		insertChatLine: function( chat_id, chat_line_html, insert_mode ){

			var $w = LJ.chat.getChatInview( chat_id ).find('.chat-inview-messages')						

			if( $w.find('.jspPane').length != 0 ){
				$w = $w.find('.jspPane');
			}

			LJ.chat.unemptifyChatInview( chat_id );
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

			if( $message.hasClass('x--merged') ){
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
		renderChatLine: function( data ){

			var sender_id   = data.sender_id;
			var message     = data.message;
			var sent_at     = data.sent_at;
			var call_id 	= data.call_id;
			
			var sender = LJ.chat.getUser( sender_id );
			var m      = moment( sent_at );

			var img_html = LJ.pictures.makeImgHtml( sender.img_id, sender.img_vs, "chat-line" );

			return LJ.ui.render([

				'<div class="chat-inview-message" data-sender-id="'+ sender_id +'">',
	              '<div class="chat-inview-message-head">',
	                '<div class="chat-inview-message__picture js-user-profile" data-facebook-id="'+ sender_id +'">',
	               	  '<span class="hint hint--top hint--rounded hint--no-animate" data-hint="'+ m.format('HH:mm') +'"></span>',
	                  img_html, // size 35
	                  '<span class="js-user-online user-online x--online" data-facebook-id="'+ sender_id +'"></span>',
	                '</div>',
	                '<div class="chat-inview-message__name">'+ sender.name +'</div>',
	              '</div>',
	              '<div class="chat-inview-message-body">',
	                '<div class="chat-inview-message__bubble-wrap">',
	                  '<span class="chat-inview-message__bubble" data-call-id="'+ call_id +'" data-sent-at="'+ m.toISOString() +'">',
	                  	message,
	                  '</span>',
	                '</div>',
	              '</div>',
	            '</div>'

			].join(''));


		},
		renderChatLine__Date: function( sent_at ){

			var m = moment( sent_at );

			var day_week  = LJ.text("day")[ m.day() ];
			var day_digit = m.format('DD/MM');
			var day_hour  = m.format('HH:mm'); 

			return LJ.ui.render([

				 '<div class="chat-inview-message__date">',
	              '<span class="x--day">'+ day_week +'</span>',
	              '<span class="x--month">'+ day_digit +',</span>',
	              '<span class="x--hour">'+ day_hour +'</span>',
             	'</div>'

			].join(''));

		},
		renderChatOptions__All: function(){

			return LJ.chat.renderChatOptions({
				show_users_html  : '<span data-lid="chat_inview_options_message_show_users"></span>',
				show_before_html : '<span data-lid="chat_inview_options_message_show_before"></span>'
			});

		},
		renderChatOptions__Team: function(){

			return LJ.chat.renderChatOptions({
				show_users_html: '<span data-lid="chat_inview_options_message_show_users"></span>'
			});

		},
		renderChatOptions: function( opts ){

			var show_users_html = opts.show_users_html ?
				'<div class="ioptions__action js-show-users">' + opts.show_users_html + '</div>' : '';

			var show_before_html = opts.show_before_html ?
				'<div class="ioptions__action js-show-before">' + opts.show_before_html + '</div>' : '';

			return LJ.ui.render([

				'<div class="ioptions__actions">',
		            '<div class="ioptions__action-message">',
		              '<span data-lid="chat_inview_options_message"></span>',
		            '</div>',
		            show_before_html,
		            show_users_html,
		            '<div class="ioptions__action x--back js-ioptions-close">',
		             ' <span data-lid="slide_overlay_back"></span>',
		            '</div>',
	          	'</div>'

			].join(''));


		},
		renderChatOptions__GroupHosts: function( hosts_html ){

			return LJ.ui.render([

				'<header class="chat-inview-users__group">',
	              	// '<i class="icon icon-star"></i>',
	              	'<span data-lid="chat_inview_users_group"></span>',
		        '</header>',
		        hosts_html

		    ].join(''));

		},
		renderChatOptions__GroupMembers: function( members_html ){

			return LJ.ui.render([

				'<header class="chat-inview-users__group">',
		              // '<i class="icon icon-bookmark"></i>',
		              '<span data-lid="chat_inview_users_group"></span>',
			    '</header>',
			    members_html

		    ].join(''));

		},
		renderChatOptions__Group: function( opts ){

			return LJ.ui.render([
				
				'<div class="chat-inview-options__close x--round-icon js-ioptions-close">',
		            '<i class="icon icon-cross-fat"></i>',
		        '</div>',
		        '<div class="chat-inview-users">',
		        	opts.hosts_group_html,
		        	opts.members_group_html,
		        '</div>'

			].join(''));

		},
		renderChatInviewHeader: function(){

			return [
					'<div class="chat-inview-header">',
						'<div class="chat-inview__icon x--previous js-chat-back x--round-icon">',
		            		'<i class="icon icon-arrow-left-rounded"></i>',
				        '</div>',
				        '<div class="chat-inview__icon x--options x--round-icon">',
				            '<i class="icon icon-pending-vertical"></i>',
				        '</div>',		          
			          '<div class="chat-inview-title">',
			            '<div class="chat-inview-title__h1">',
			            	// Dynamically injected
			            '</div>',
			            '<div class="chat-inview-title__h2">',
			            	// Dynamically injected
			            '</div>',
			          '</div>',
			        '</div>'
			    ].join('');

		},
		renderChatInview: function( channel_item ){

			var team_id = channel_item.team_id;
			var chat_id = channel_item.chat_id;

			var chat_inview_header_html = LJ.chat.renderChatInviewHeader();

			return LJ.ui.render([

				'<div class="chat-inview" data-team-id="'+ team_id +'" data-chat-id="'+ chat_id +'">',
			        chat_inview_header_html,
			        '<div class="chat-inview-item x--'+ channel_item.type +'" data-chat-id="'+ chat_id +'">',
			        	'<div class="chat-inview-options"></div>',
	          			'<div class="chat-inview-messages">',
		          			'<div class="chat-inview-seen-by">',
				          		'<span class="chat-inview-seen-by__label"></span>',
				          	'</div>',
	          				// Dynamically injected
	          			'</div>',
	          		'</div>',
		          	'<div class="chat-inview-footer">',
			            '<div class="chat-inview-input js-send-message">',
			             	'<div contenteditable="true" class="chat-inview__input"></div>',
			             	'<div class="chat-inview__placeholder" data-lid="chat_input_ph"></div>',
			            '</div>',
			            '<button class="x--mb js-send-message"><span data-lid="w_send"></span></button>',
		          	'</div>', 
			    '</div>'

			].join(''));

		},
		handleShowOptions: function(){

			var $s      = $( this );
			var $wrap   = $s.closest('.chat-inview');
			var chat_id = $wrap.attr('data-chat-id');
			var chan    = LJ.chat.getChannelItem( chat_id );

			var html;
			if( chan.type == "chat_all" ){
				html = LJ.chat.renderChatOptions__All();
			} else {
				html = LJ.chat.renderChatOptions__Team();
			}

			LJ.ui.showIoptions( $wrap, html );

		},
		handleShowUsers: function(){

			var $s      = $( this );
			var $w      = $s.closest('.chat-inview');
			var chat_id = $w.attr('data-chat-id');
			var chan    = LJ.chat.getChannelItem( chat_id );
	
			// In each case, members will be there			
			var members_profiles = LJ.chat.getMembers( chat_id );
			var members_html = LJ.renderUserRows( members_profiles );

			if( chan.type == "chat_all" ){

				var hosts_profiles = LJ.chat.getHosts( chat_id );
				var hosts_html     = LJ.renderUserRows( hosts_profiles );

				var h = LJ.chat.renderChatOptions__Group({
					members_group_html : LJ.chat.renderChatOptions__GroupMembers( members_html ),
					hosts_group_html   : LJ.chat.renderChatOptions__GroupHosts( hosts_html )
				});	

			} else {
				
				var h = LJ.chat.renderChatOptions__Group({
					members_group_html : LJ.chat.renderChatOptions__GroupMembers( members_html ),
				});	

			}

			LJ.ui.updateIoptions( h );

		},
		handleShowBefore: function(){
			
			var $s        = $( this) ;
			var $w        = $s.closest('.chat-inview');
			var chat_id   = $w.attr('data-chat-id');
			var chan      = LJ.chat.getChannelItem( chat_id );
			var before_id = chan.before_id;

			LJ.before.fetchAndShowBeforeInview( before_id );

		},
        getLastChatMessage: function( chat_id ){

        	var chat = LJ.chat.getChat( chat_id );
        	var last_message = chat && chat.messages && chat.messages[0];

        	return last_message;

        },
        sendSeenBy: function( chat_id ){

        	var last_message = LJ.chat.getLastChatMessage( chat_id );

			if( !last_message ){
				return;
			}

			var last_seen_by = last_message.seen_by;

			if( !Array.isArray( last_seen_by ) ){
				return LJ.wlog('Last_seen_by aint no array');
			}

			if( last_seen_by.indexOf( LJ.user.facebook_id ) != -1 ){
				return LJ.log('Already sent seen by, not calling the api');
			}

			// Reset the parameters of the proxy version, since were about to call the api no matter what
			var chat = LJ.chat.getChat( chat_id );
			clearTimeout( chat.seen_by_timeout );
			chat.seen_by_batch = 0;

        	LJ.log('Sending seen by...');
        	LJ.api.updateChatSeenBy( chat_id )
        		.then(function(){ LJ.log("...success!"); })
        		.catch(function( err ){ LJ.wlog( err ); });


        },
        sendSeenByProxy: function( chat_id, skip_cache ){
        	
        	var last_message = LJ.chat.getLastChatMessage( chat_id );

			if( !last_message ){
				return;
			}

			var last_seen_by = last_message.seen_by;

			if( !Array.isArray( last_seen_by ) ){
				return LJ.wlog('Last_seen_by aint no array');
			}

			if( last_seen_by.indexOf( LJ.user.facebook_id ) != -1 && !skip_cache ){
				return LJ.log('Already sent seen by, not calling the api');
			}

			// Proxy the request because everytime a message is received and the user
			// has the chat in active state, a request must be made. Hence, send a request
			// every 10 messages, or every 10 seconds. Huge performance boost.
			var chat = LJ.chat.getChat( chat_id );

			chat.seen_by_batch = chat.seen_by_batch || 0;

			if( chat.seen_by_batch < 10 && !skip_cache ){

				chat.seen_by_batch += 1;

				if( chat.seen_by_timeout ){
					clearTimeout( chat.seen_by_timeout );
				}

				chat.seen_by_timeout = setTimeout(function(){
					LJ.chat.sendSeenByProxy( chat_id, true );

				}, 10000 );
				

			} else {

	        	LJ.log('Sending seen by...');
	        	LJ.api.updateChatSeenBy( chat_id )
	        		.then(function(){ LJ.log("...success!"); })
	        		.catch(function( err ){ LJ.wlog( err ); });

	        	chat.seen_by_batch = 0;				

			}

        },

        getUsersCountById: function( chat_id ){

        	var channel   = LJ.chat.getChannelItem( chat_id );

        	var n_hosts   = channel.hosts && channel.hosts.length;
        	var n_members = channel.members && channel.members.length;

        	if( !n_hosts && n_members ){
        		return n_members;
        	}

        	if( !n_members && n_hosts ){
        		return n_hosts;
        	}

        	return n_members + n_hosts;

        },
        // Update the "seen by..." element
        refreshChatSeenBy: function( chat_id ){

			var $w           = LJ.chat.getChatInview( chat_id );
			var last_message = LJ.chat.getLastChatMessage( chat_id );

			if( !last_message || !LJ.user.app_preferences.ux.message_seen ){
				return //LJ.log("No last message or app_preferences message_seen disabled");
			}

			var seen_by   = last_message.seen_by;
			var sender_id = last_message.sender_id;

			var names = [];
			seen_by.forEach(function( facebook_id ){

				// It would be dumb to let others know that the sender has read its own message
				// and weird for the user to see his own name on the "seen_by" list
				if( facebook_id != sender_id && LJ.user.facebook_id != facebook_id ){
					names.push( LJ.chat.getUser( facebook_id ).name );
				}

			});

			// Substract 1 because the user owns id has already been removed
			var c = LJ.chat.getUsersCountById( chat_id );
        	var s = LJ.chat.makeSeenByText( names, seen_by.length, c );

        	$w.find('.chat-inview-seen-by__label').html( s );
        	LJ.chat.refreshChatJsp( chat_id );

        },
        makeSeenByText: function( names, seen_by_length, count ){

        	if( names.length == 0 ){
        		return '';
        	}

        	// This rule is in conflict with the fact that users can choose not to activate the readby feature
        	// if( seen_by_length == count ){
        	// 	return LJ.text('seen_by_everyone') + '<i class="icon icon-check"></i>';
        	// }

        	return LJ.text('seen_by_some', names );

        },
        emptifyChatInview: function( chat_id ){

        	var chan = LJ.chat.getChannelItem( chat_id );

        	if( chan.type == "chat_team" ){
				
				var members    = LJ.chat.getMembers( chat_id );
				var names      = _.map( members, 'name' );
				var group_name = LJ.renderMultipleNames( names, { lastify_user: LJ.user.name });
				var img_html   = LJ.pictures.makeGroupRosace( members, 2, 'chat-inview' );

				html = LJ.chat.renderChatInview__TeamEmpty( group_name, img_html );

			} else {

				var members = chan.role == "hosted" ?
					LJ.chat.getMembers( chat_id ) :
					LJ.chat.getHosts( chat_id );

				var names      = _.map( members, 'name' );
				var group_name = LJ.renderMultipleNames( names );
				var img_html   = LJ.pictures.makeGroupRosace( members, 2, 'chat-inview' );

				html = LJ.chat.renderChatInview__AllEmpty( group_name, img_html );
				
			}

        	LJ.chat.getChatInview( chat_id )
        		.find('.chat-inview-item')
        		.append( html )
        		.find('.chat-inview-messages')
        		.hide();

        	LJ.chat.refreshChatJsp( chat_id );

        },	
        unemptifyChatInview: function( chat_id ){

        	LJ.chat.getChatInview( chat_id ).find('.chat-empty').remove();
        	LJ.chat.getChatInview( chat_id ).find('.chat-inview-messages').show();
        	LJ.chat.refreshChatJsp( chat_id );

        },
        getChatInview: function( chat_id ){

        	if( !chat_id ){
				return LJ.wlog('Cannot target chat row without chat_id');
			}

			return $('.chat-inview[data-chat-id="'+ chat_id +'"]');

        },
        getChatInviews: function(){

        	return $('.chat-inview');

        },
        bounceChatHeaderIcons: function( chat_id, delay ){

        	LJ.chat.getChatInview( chat_id )
        		.closest('.chat-inview')
        		.find('.chat-inview__icon')
        		.hide()
        		.velocity('slideUpIn', {
        			duration : 750,
        			delay    : delay,
        			display  : 'flex'
        		});

        },
        emptifyChatSeenBy: function( chat_id ){

        	LJ.chat.getChatInview( chat_id )
        		.find('.chat-inview-seen-by__label').text('');

        },
        renderTextInputElement: function( reset ){

			return LJ.ui.render( '<div class="chat-inview-input__text" contenteditable="true"></div>' );

		},
		parseChatInput: function( chat_id ){

		},
		refreshChatInput: function( chat_id ){

		}


	});


