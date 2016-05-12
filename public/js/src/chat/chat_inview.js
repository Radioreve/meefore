
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		groupname_show_duration: 500,
		groupname_hide_duration: 150,

		handleDomEvents__Inview: function(){

			$('.chat').on('click', '.js-user-profile', LJ.chat.handleShowUserProfile );
			$('.chat').on('click', '.chat-inview__icon.--options', LJ.chat.handleShowOptions );
			$('.chat').on('click', '.js-show-before', LJ.chat.handleShowBefore );
			$('.chat').on('click', '.js-show-users', LJ.chat.handleShowUsers );
			$('.chat').on('click', '.js-chat-back', LJ.chat.handleChatBack );
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
		handleChatBack: function(){

			LJ.chat.hideChatInview();

		},
		switchChatInview: function( chat_id ){

			var $inview_target  = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');
			var $inview_current = $inview_target.siblings('.chat-inview-item');

			var $groupname_target  = $('.js-chat-groupname[data-chat-id="'+ chat_id +'"]');
			var $groupname_current = $groupname_target.siblings('.js-chat-groupname');

			$inview_current.removeClass('--active').hide();
			$inview_target.addClass('--active').show();

			$groupname_current.removeClass('--active')
			 				  .velocity('shradeOut', {
			 				  	duration: LJ.chat.groupname_hide_duration
			 				  });

			$groupname_target.addClass('--active')
			 				 .velocity('shradeIn', {
			 				 	duration : LJ.chat.groupname_show_duration,
			 				 	delay    : LJ.chat.groupname_hide_duration
			 				 });


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

			LJ.chat.refreshChatJsp( chat_id );

		},
		hideChatInview: function(){
			
			var $chat_rows        = $('.chat-row-wrap');
			var $chat_inview_wrap = $('.chat-inview-wrap');

			$chat_inview_wrap.hide().removeClass('--active');
			$chat_rows.show().addClass('--active');

			$chat_inview_wrap.find('.chat-inview').hide();

		},
		handleShowUserProfile: function(){

			var facebook_id = $(this).attr('data-facebook-id');
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
		handleNewMessageReceived: function( data ){

			LJ.log('New message received');

			var message = data.message;
			var chat_id = data.chat_id;

			LJ.chat.updateChatRow( data );

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

            	$s.val('');

                LJ.chat.sendMessage({
                	group_id    : group_id,
                	before_id   : before_id,
                	chat_id     : chat_id,
                	message     : message
                });

            }

		},
		sendMessage: function( data ){

			LJ.log('Sending message...');

			var facebook_id = LJ.user.facebook_id;
			var call_id 	= LJ.generateId();

			LJ.chat.addChatLine( _.merge( data, {
				facebook_id: facebook_id }), call_id );

			LJ.api.sendChatMessage(
				_.merge( data, { call_id: call_id })
			)
			.then(function( res ){
				LJ.log('Message sent')
				LJ.log(res);

			});


		},
		getMessageElById: function( call_id ){
			return $('.chat-inview-message__bubble[data-call-id="'+ call_id +'"]');

		},
		addChatLine: function( data, call_id ){

			var chat_id = data.chat_id;
			
			var chat_line_html = LJ.chat.renderChatLine( data, call_id );

			LJ.chat.insertChatLine( chat_id, chat_line_html, call_id );
			LJ.chat.horodateChatLine( call_id );
			LJ.chat.mergeChatLine( call_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.classifyChatLine( call_id );
			LJ.chat.showChatLine( call_id );
			LJ.chat.pendifyChatLine( call_id );

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
		refreshChatJsp: function( chat_id ){

			var j  = LJ.ui.jsp[ chat_id ];
			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');

			j.reinitialise();

			if( $w.find('.chat-inview-message').length < 16 && !$w.hasClass('--fetching') ){
				return j.scrollToBottom();
			}

			if( j.getPercentScrolledY() > 0.85 || ( j.getPercentScrolledY() == 0 && !$w.hasClass('--fetching') ) ){
				return j.scrollToBottom();
			}


		},
		horodateChatLine: function( call_id ){

			var $curr_message = LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message');
			var $prev_message = $curr_message.prev();

			var $curr_message_bubble = $curr_message.find('.chat-inview-message__bubble').last();
			var $prev_message_bubble = $prev_message.find('.chat-inview-message__bubble').last();

			var curr_message_sent_at = parseInt( $curr_message_bubble.attr('data-sent-at') );
			var prev_message_sent_at = parseInt( $prev_message_bubble.attr('data-sent-at') );

			var date_html = LJ.chat.renderChatLine__Date( curr_message_sent_at );
			var $date     = $( date_html );


			if( $prev_message.length == 0 ){
				$date.insertBefore( $curr_message );
			}
			
			var diff = curr_message_sent_at - prev_message_sent_at;
			if( diff >= 7200 ){
				$date.insertBefore( $curr_message );
			}

		},
		mergeChatLine: function( call_id ){

			var $bubble = LJ.chat.getMessageElById( call_id );
			var $w      = $bubble.closest('.chat-inview-message');

			var $prev   = $w.prev();

			if( $prev.hasClass('chat-inview-message__date') ){
				return LJ.log('Cant merge chat, already horodated');
			}

			if( $prev.attr('data-sender-id') != $w.attr('data-sender-id') ){
				return LJ.log('Cant merge chat, not the same sender');
			}

			var $bubbles_wrap = $prev.find('.chat-inview-message__bubble-wrap');
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
		insertChatLine: function( chat_id, chat_line_html ){

			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]')
						.find('.chat-inview-messages')
						.find('.jspPane');

			var $e = $w.find('.chat-empty');

			$e.remove();
			$( chat_line_html )
				.css({ 'opacity': 0 }) // If display "none", its not detected by jScrollPane when refreshing the overflow
				.appendTo( $w );

		},
		showChatLine: function( call_id ){

			LJ.chat.getMessageElById( call_id ).closest('.chat-inview-message')
				.velocity({ opacity: [ 1, 0 ] }, {
					duration: 450
				});

		},
		findChatSender: function( group_id, facebook_id ){

			var chat_object  = LJ.chat.fetched_chats[ group_id ];
			
			var sender = _.find( _.concat( chat_object.members_profiles, chat_object.hosts_profiles ), function( u ){
				return u.facebook_id == facebook_id;
			});

			return sender;

		},
		renderChatLine: function( data, call_id ){

			var sender_id   = data.facebook_id;
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

			var m = moment( parseInt(sent_at) );

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

			var chat_object = LJ.chat.fetched_chats[ group_id ];

			var members_profiles = chat_object.members_profiles;
			var members_html 	 = LJ.renderUserRows( members_profiles );
			var hosts_profiles   = chat_object.hosts_profiles;
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

			var chat_object = LJ.chat.fetched_chats[ group_id ];

			var members_profiles = chat_object.members_profiles;
			var members_html 	 = LJ.renderUserRows( members_profiles );
			var hosts_profiles   = chat_object.hosts_profiles;
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
			var formatted_date = m.format('DD/MM');

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

		}


	});


