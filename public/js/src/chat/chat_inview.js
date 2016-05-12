
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		groupname_show_duration: 250,
		groupname_hide_duration: 150,

		handleDomEvents__Inview: function(){

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
			$chat_inview_wrap.find('.chat-inview[data-group-id="'+ group_id +'"]').addClass('--active')
						 	 .show();

		},
		hideChatInview: function(){
			
			var $chat_rows        = $('.chat-row-wrap');
			var $chat_inview_wrap = $('.chat-inview-wrap');

			$chat_inview_wrap.hide().removeClass('--active');
			$chat_rows.show().addClass('--active');

			$chat_inview_wrap.find('.chat-inview').hide();

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

                var $wrap = $s.closest('.chat-inview-item');

				var group_id = $wrap.attr('data-group-id');
				var chat_id  = $wrap.attr('data-chat-id');
				var message  = $s.val();

            	$s.val('');

                LJ.chat.sendMessage({
                	group_id : group_id,
                	chat_id  : chat_id,
                	message  : message
                });

            }

		},
		sendMessage: function( data ){

			LJ.log('Sending message...');

			var facebook_id = data.facebook_id;
			var message     = data.message;
			var chat_id 	= data.chat_id;
			var group_id 	= data.group_id;

			var call_id 	= LJ.generateId();

			LJ.chat.addChatLine( data, call_id );

			LJ.api.sendChatMessage({
				facebook_id : facebook_id,
				message     : message,
				chat_id     : chat_id,
				group_id    : group_id,
				call_id     : call_id

			})
			.then(function( res ){
				LJ.log('Message sent')
				LJ.log(res);

			});



		},
		getMessageElById: function( call_id ){
			return $('.chat-inview-message[data-call-id="'+ call_id +'"]');

		},
		addChatLine: function( data, call_id ){

			var chat_line_html = LJ.chat.renderChatLine( data, call_id );

			LJ.insertChatLine( chat_id, chat_line_html, call_id );
			LJ.pendifyChatLine( call_id );
			LJ.classifyChatLine( call_id );
			LJ.showChatLine( call_id );

		},
		dependifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).removeClass('--pending');

		},
		pendifyChatLine: function( call_id ){
			LJ.chat.getMessageElById( call_id ).addClass('--pending');

		},
		classifyChatLine: function( call_id ){
			var $msg = LJ.chat.getMessageElById( call_id );
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
		horodatifyChatLine: function( call_id ){

			var $curr_message = LJ.chat.getMessageElById( call_id );
			var $prev_message = $curr_message.before();

			if( $prev_message.length == 0 ){
				return LJ.log('No message to horidatify with');
			}

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

			$('.chat-inview-message[data-call-id="'+ call_id +'"]')
				.velocity({ opacity: [ 1, 0 ] }, {
					duration: 450
				});

		},
		renderChatLine: function( data, call_id ){

			var sender_id   = data.facebook_id;
			var message     = data.message;
			var chat_id 	= data.chat_id;
			var group_id 	= data.group_id;

			var chat_object  = LJ.chat.fetched_chats[ group_id ];

			var sender = _.find( _.concat( chat_object.members_profiles, chat_object.hosts_profiles ), function( u ){
				return u.facebook_id == sender_id;
			});

			var img_html = LJ.pictures.makeImgHtml( sender.img_id, sender.img_vs, "chat-line" );

			return LJ.ui.render([

				'<div class="chat-inview-message" data-call-id="'+ call_id +'" data-sender-id="'+ sender_id +'">',
	              '<div class="chat-inview-message-head">',
	                '<div class="chat-inview-message__picture">',
	                  img_html, // size 35
	                  '<span class="js-user-online user-online --online"></span>',
	                '</div>',
	                '<div class="chat-inview-message__name">'+ sender.name +'</div>',
	              '</div>',
	              '<div class="chat-inview-message-body">',
	                '<div class="chat-inview-message__bubble-wrap">',
	                  '<span class="chat-inview-message__bubble">',
	                  	message,
	                  '</span>',
	                '</div>',
	              '</div>',
	            '</div>'

			].join(''));


		},
		renderChatOptions: function(){

			return LJ.ui.render([

				'<div class="ioptions__actions">',
		            '<div class="ioptions__action-message">',
		              '<span data-lid="chat_inview_options_message"></span>',
		            '</div>',
		            '<div class="ioptions__action js-show-before">',
		              '<span data-lid="chat_inview_options_message_show_before"></span>',
		            '</div>',
		            '<div class="ioptions__action js-show-users">',
		              '<span data-lid="chat_inview_options_message_show_users"></span>',
		            '</div>',
		            '<div class="ioptions__action --back js-ioptions-close">',
		             ' <span data-lid="slide_overlay_back"></span>',
		            '</div>',
	          	'</div>'

			].join(''));

		},
		renderChatInviewOptions: function(){
			// <div chat-inview-options>
			// <div class="chat-inview-options__close js-ioptions-close">
   //          <i class="icon icon-cancel"></i>
   //        </div>
   //        <div class="chat-inview-users">
   //          <div class="chat-inview-users__group">
   //            <i class="icon icon-star"></i>
   //            <span data-lid="chat_inview_users_group_hosts"></span>
   //          </div>
   //          <div class="user-row --host" data-facebook-id="102066130199795"><div class="user-row__pic"><img width="60" height="60" src="http://res.cloudinary.com/radioreve/image/upload/c_fill,g_face,h_60,w_60/v1462349307/102066130199795--0" data-scopeid="user-before-sm"><div class="user-gender --undefined js-user-gender"></div><div class="user-country js-user-country"><i class="flag-icon flag-icon-undefined"></i></div></div><div class="user-row__informations"><div class="user-row__about"><span class="user-name">Victoriale</span><span class="user-comma">,</span><span class="user-age">22</span><span class="user-online user__status js-user-online"></span><i class="icon icon-star user-host-icon"></i></div><div class="user-row__education"><span class="user-row__education-icon --round-icon"><i class="icon icon-education"></i></span><span class="user-row__education-label">Etudiante en pharma</span></div></div></div>
   //          <div class="chat-inview-users__group">
   //            <i class="icon icon-bookmark"></i>
   //            <span data-lid="chat_inview_users_group_users"></span>
   //          </div>
   //          <div class="user-row --host" data-facebook-id="102066130199795"><div class="user-row__pic"><img width="60" height="60" src="http://res.cloudinary.com/radioreve/image/upload/c_fill,g_face,h_60,w_60/v1462349307/102066130199795--0" data-scopeid="user-before-sm"><div class="user-gender --undefined js-user-gender"></div><div class="user-country js-user-country"><i class="flag-icon flag-icon-undefined"></i></div></div><div class="user-row__informations"><div class="user-row__about"><span class="user-name">Victoriale</span><span class="user-comma">,</span><span class="user-age">22</span><span class="user-online user__status js-user-online"></span><i class="icon icon-star user-host-icon"></i></div><div class="user-row__education"><span class="user-row__education-icon --round-icon"><i class="icon icon-education"></i></span><span class="user-row__education-label">Etudiante en pharma</span></div></div></div>
   //        </div>

		},
		renderChatInview: function( data ){

			var group_id     = data.group_id;
			var chat_id_all  = data.chat_id_all;
			var chat_id_team = data.chat_id_team;
			var place_name   = data.place_name;
			var begins_at    = data.begins_at;

			var header_address_html = LJ.chat.renderChatInviewHeaderAddress( place_name, begins_at );

			return LJ.ui.render([

				'<div class="chat-inview" data-group-id="'+ group_id +'">',
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
	          			'<div class="chat-inview-messages">',
	          				// Dynamically injected
	          			'</div>',
			          	'<div class="chat-inview-footer">',
				            '<div class="chat-inview__input">',
				              '<input type="text" placeholder="Envoyer votre message">',
				            '</div>',
			          	'</div>', 
	          		'</div>',
	          		'<div class="chat-inview-item --team" data-group-id="'+ group_id + '" data-chat-id="'+ chat_id_team +'">',
	          			'<div class="chat-inview-messages">',
	          				// Dynamically injected
	          			'</div>',
	          			'<div class="chat-inview-footer">',
				            '<div class="chat-inview__input">',
				              '<input type="text" placeholder="Envoyer votre message">',
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
			var $wrap = $s.closest('.chat-inview').find('.chat-inview-options');
			var html  = LJ.chat.renderChatOptions()

			LJ.ui.showIoptions( $wrap, html );

		},
		handleShowUsers: function(){


		},
		handleShowBefore: function(){


		}


	});






// <div class="chat-inview" data-chat-id="ch1">
//         <div class="chat-inview-header">
//           <div class="chat-inview__icon --previous js-chat-back --round-icon">
//             <i class="icon icon-arrow-left"></i>
//           </div>
//           <div class="chat-inview__icon --switch js-chat-switch --round-icon">
//             <i class="icon icon-switch"></i>
//           </div>
//           <div class="chat-inview__icon --options --round-icon">
//             <i class="icon icon-pending-vertical"></i>
//           </div>
//           <div class="chat-inview-title">
//             <div class="chat-inview-title__groupname">
//               <span data-lid="chat_groupname_all" class="js-chat-groupname --all --active" data-chat-id="ch1">Tout le monde</span>
//               <span data-lid="chat_groupname_team" class="js-chat-groupname --team" data-chat-id="ch2">Mon groupe</span>
//             </div>
//             <div class="chat-inview-title__address">
//               <span>37 rue du four, 75006 Paris</span>
//             </div>
//           </div>
//         </div>
//         <div class="chat-inview-item --all --active" data-chat-id="ch1">
//           <div class="chat-inview-messages">
//             <div class="chat-inview-message --left">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot13f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Léah
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                     Coucou tout le monde ! Super soirée hier, ça vous dit d'y retourner ? 
//                     Aller, s'il vous plait... -)
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message --left">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot21f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                     Pourquoi pas...
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message__date">
//               <span class="--day">Jeudi</span>
//               <span class="--month">30/12</span>
//               <span class="--hour">14:30</span>
//             </div>
//             <div class="chat-inview-message --me --right">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot22f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                     J'avoue c'est pas mal ! ça me plait comme idée.
//                   </span>
//                   <span class="chat-inview-message__bubble">
//                     Avec Cécile ?
//                   </span>
//                   <span class="chat-inview-message__bubble">
//                     Ou tout seul ?
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message --friend --right">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot10f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble">
//                   Juste tous les 4 ! on s'amusera beaucoup plus :) 
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div class="chat-inview-footer">
//             <div class="chat-inview__input">
//               <input type="text" placeholder="Envoyer votre message">
//             </div>
//             <div class="chat-inview__button">
//               <button>Envoyer</button>
//             </div>
//           </div> 
//         </div>
//         <div class="chat-inview-item --team" data-chat-id="ch2">
//           <div class="chat-inview-messages">
//             <div class="chat-inview-message --left --friend">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot13f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Léah
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                     Pas mal quand même les mecs
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message --left --friend">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot21f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                    J'avoue
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message__date">
//               <span class="--day">Jeudi</span>
//               <span class="--month">30/12</span>
//               <span class="--hour">14:30</span>
//             </div>
//             <div class="chat-inview-message --me --right">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot22f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble-wrap">
//                   <span class="chat-inview-message__bubble">
//                     Hmm...
//                   </span>
//                   <span class="chat-inview-message__bubble">
//                     Vous préferez lequel? -)
//                   </span>
//                   <span class="chat-inview-message__bubble">
//                     Moi je vais pas faire le difficile...
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div class="chat-inview-message --friend --left">
//               <div class="chat-inview-message-head">
//                 <div class="chat-inview-message__picture">
//                   <img src="/img/bots/bot10f.jpg" width="35" alt="Just another bot">
//                   <span class="user-online --online"></span>
//                 </div>
//                 <div class="chat-inview-message__name">
//                   Jenny
//                 </div>
//               </div>
//               <div class="chat-inview-message-body">
//                 <div class="chat-inview-message__bubble">
//                   Moi non plus xD
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div class="chat-inview-footer">
//             <div class="chat-inview__input">
//               <input type="text" placeholder="Envoyer votre message">
//             </div>
//             <div class="chat-inview__button">
//               <button>Envoyer</button>
//             </div>
//           </div>
//         </div> 
//       </div>  