
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		parallel_fetches_count: 30,

		state: 'hidden',
		fetched_profiles: {},
		fetched_chats: {},

		init: function(){
				
			LJ.chat.handleDomEvents();
			LJ.chat.setupChat();
			
			LJ.chat.setupChatRowsJsp()
				.then(function(){
					LJ.chat.emptifyChatRows();
					return LJ.chat.addAndFetchChats();
				})
				.then(function(){
					LJ.chat.refreshLocalChats();
				})
			// Non blocking promise, return now
			return;

		},
		handleDomEvents: function(){

			$('.app__menu-item.--chats').on('click', LJ.chat.handleToggleChatWrap );
			$('.chat__close').on('click', LJ.chat.hideChatWrap );
			$('.chat').on('click', '.chat-row', LJ.chat.handleChatRowClicked );

			LJ.chat.handleDomEvents__Inview();

		},
		setupChat: function(){

			// Set chat dimensions for jsp compliance
			var height = $( window ).height() - LJ.ui.slide_top;

			$('.chat').css({ height: height });
			$('.chat-rows').css({
				height : height - ( $('.chat-header').height() + $('.chat-subheader').height() )
			});

		},
		getChatState: function(){

			return LJ.chat.state;

		},
		refreshChatRowsJsp: function(){

			return LJ.delay( 40 ).then(function(){
				LJ.ui.jsp[ "chat_rows" ].reinitialise();
			});

		},
		// Sort all chat messages by descendant order : messages[0] is the oldest
		sortChatMessages: function( chat_id ){

			LJ.chat.getChat( chat_id ).messages.sort(function( ch1, ch2 ){
				return moment( ch2.sent_at ) - moment( ch1.sent_at );
			})

		},
		cacheChatMessage: function( chat_id, message ){

			var chat = LJ.chat.getChat( chat_id );
			var chan = LJ.chat.getChannelItem( chat_id );

			if( !chat ){
				return LJ.wlog('Cannot cache chat message, chat has not been set');
			}

			chan.last_sent_at = message.sent_at;
			chat.messages.push( message );
			LJ.chat.sortChatMessages( chat_id ); 

		},
		cacheChatMessages: function( chat_id, messages, channel_item ){

			if( !Array.isArray( messages ) ){
				return LJ.wlog('Cannot setup cache for chat without a messages array');
			}

			var chat = LJ.chat.getChat( chat_id ) 
					 ? LJ.chat.getChat( chat_id ) 
					 : LJ.chat.setChat( chat_id, channel_item );
			
			messages.forEach(function( message_object ){
				chat.messages.push( message_object );
			});

			LJ.chat.sortChatMessages( chat_id );


		},
		getActiveChatId: function(){

			var active_chat_id = null;
			LJ.chat.getChatIds().forEach(function( chat_id ){
				if( LJ.chat.getChat( chat_id ).ui_status == "active" ){
					active_chat_id = chat_id;
				}
			});
			return active_chat_id;

		},
		seenifyChatInview: function( chat_id, facebook_id ){

			var chat = LJ.chat.getChat( chat_id );

			chat.messages.forEach(function( m ){
					
				m.seen_by.push( facebook_id );
				m.seen_by = _.uniq( m.seen_by );

			});
			

		},
		refreshChatIconBubble: function(){

			LJ.chat.resetBubbleToChatIcon();
			var display_bubble = false;
			
			LJ.chat.getChatIds().forEach(function( chat_id ){

				if( LJ.chat.getLastMessage( chat_id ) && LJ.chat.getUnseenMessagesCount( chat_id ) > 0 ){
					display_bubble = true;
				} else {
					if( !LJ.chat.getLastMessage( chat_id ) && LJ.chat.wasNeverSeen( chat_id ) ){
						display_bubble = true;
					}
				}

			});

			if( display_bubble ){
				LJ.chat.addBubbleToChatIcon();
			}

		},
		wasNeverSeen: function( chat_id ){

			var seen_chats = LJ.store.get('seen_chats') || [];

			return seen_chats.indexOf( chat_id ) == -1 ? true : false;

		},	
		refreshChatRowBubbles: function( chat_id ){

			var chat = LJ.chat.getChat( chat_id );

			LJ.chat.resetBubbleToChatRow( chat_id );
			
			if( chat.messages.length == 0 ){

				if( LJ.chat.wasNeverSeen( chat_id ) ){
					LJ.chat.addBubbleToChatRow( chat_id );
				} 
				
			} else {

				chat.messages.forEach(function( m ){

					if( m.seen_by.indexOf( LJ.user.facebook_id ) == -1 ){
						LJ.chat.addBubbleToChatRow( chat_id );
					} 

				});

			}

		},
		getRelatedChats: function( team_chat_id ){

			var team_id       = LJ.chat.getChannelItem( team_chat_id ).team_id;
			var related_chats = [];

			LJ.chat.getChatIds().forEach(function( chat_id ){

				var chan = LJ.chat.getChannelItem( chat_id );
				if( chan.type == "chat_all" && chan.team_id == team_chat_id ){
					related_chats.push( chat_id );
				}

			});

			return related_chats;

		},
		refreshLocalChats: function(){

			var seen_chats = LJ.store.get('seen_chats');

			_.remove( seen_chats, function( seen_chat_id ){
				return LJ.chat.getChatIds().indexOf( seen_chat_id ) == -1;
			});

			LJ.store.set( "seen_chats", seen_chats );

		},
		getUnseenMessagesCount: function( chat_id ){

			var i    = 0;
			var chat = LJ.chat.getChat( chat_id );

			chat.messages.forEach(function( m ){

				 if( m.seen_by.indexOf( LJ.user.facebook_id ) == -1 ){
					i++;
				} 
			});

			return i;

		},
		addBubbleToChatIcon: function(){

			LJ.ui.showBubble( $('.app__menu-item.--chats') );

		},
		resetBubbleToChatIcon: function(){

			LJ.ui.hideBubble( $('.app__menu-item.--chats') );

		},
		addBubbleToChatRow: function( chat_id ){

			var $chatrowpic = LJ.chat.getChatRow( chat_id ).find('.chat-row-pictures');
			LJ.ui.showBubble( $chatrowpic );

		},
		resetBubbleToChatRow: function( chat_id ){

			var $chatrowpic = LJ.chat.getChatRow( chat_id ).find('.chat-row-pictures');
			LJ.ui.hideBubble( $chatrowpic );

		},
		getChatIds: function(){

			return _.keys( LJ.chat.fetched_chats );

		},
		setChat: function( chat_id, channel_item ){

			LJ.chat.fetched_chats[ chat_id ] = {};
			
			var chat = LJ.chat.fetched_chats[ chat_id ];

			chat.messages = [];
			// Copy extra properties on chat objects that are chat-related and useful. Functions regarding 
			// the ui will base their behavior on the state that is stored here
			if( channel_item ){
				[ 'before_id', 'requested_at', 'last_sent_at' ].forEach(function( prop ){
					if( chat[ prop ] ){
						chat[ prop ] = channel_item[ prop ];
					}
				});
			} else {
				LJ.wlog('Setting chat somewhere without channel_item');
			}

			return chat;

		},
		getChat: function( chat_id ){

			var c = LJ.chat.fetched_chats[ chat_id ];

			if( !c ){
				return null;
			} else {
				return c;
			}

		},
		addAndFetchChats: function(){

			// Keep only the channels that are chat-related (= have a team_id parameter)
			var channels = _.filter( LJ.user.channels, 'team_id' );

			var sorted_channels = channels.sort(function( ch1, ch2 ){
				return moment( ch2.last_sent_at ) - moment( ch1.last_sent_at );
			});

			var last_channels = sorted_channels.slice( 0, LJ.chat.parallel_fetches_count );

			var all_chat_fetched = [];
			last_channels.forEach(function( channel_item ){
				var chat_fetched = LJ.chat.addAndFetchOneChat( channel_item, {
					row_insert_mode: "top"
				});
				all_chat_fetched.push( chat_fetched );
			});

			return LJ.Promise.all( all_chat_fetched );

		},
		readdAndFetchChats: function(){

			LJ.log('Refetching more group ids');

			LJ.chat.fetchMoreChannels()
				.then(function( channels ){

					if( channels.length == 0 ){
						return LJ.chat.allChannelsFetched();
					}

					channels.forEach(function( channel_item ){
						LJ.chat.addAndFetchOneChat( channel_item, {
							row_insert_mode: "bottom"
						});
					});


				});
			
				
		},
		allChannelsFetched: function(){

			LJ.wlog('All channels have been fetched');

		},
		addAndFetchOneChat: function( channel_item, opts ){

			var type 		 = channel_item.type;
			var chat_id      = channel_item.chat_id;
			var hosts        = channel_item.hosts;
			var members      = channel_item.members;

			if( LJ.chat.getChat( chat_id ) ){
				return LJ.log('Chat already initialized, stop fetching');
			}

			LJ.log('Initializing one chat...');
			LJ.chat.deemptifyChatRows();

			return LJ.Promise.resolve()
					// Render static HTML that will be dynamically filled (sync)
					.then(function(){
						LJ.chat.setupChatRow( channel_item, opts );
						LJ.chat.setupChatInview( channel_item );
						
					})
					// Find the profiles of everyone 
					.then(function(){
						var hosts_profiles   = LJ.api.fetchUsers( hosts );
						var members_profiles = LJ.api.fetchUsers( members );

						return LJ.Promise.all([ hosts_profiles, members_profiles ]);

					})
					// Update the pictures based on users id (async)
					.then(function( res ){

						var hosts_profiles   = _.map( res[0], 'user' );
						var members_profiles = _.map( res[1], 'user' );

						// need to use uniqBy here, to specify the parameter on which to compute the uniqueness
						LJ.chat.fetched_profiles = _.uniqBy( _.concat( LJ.chat.fetched_profiles, hosts_profiles, members_profiles ), 'facebook_id' );
						
					})
					// Fetch the last chat messages (async)
					.then(function(){
						return LJ.api.fetchChatHistory( chat_id );

					})
					// Add them to the DOM (sync)
					.then(function( res ){

						// Add messages to the all chat
						LJ.chat.cacheChatMessages( chat_id,  res.messages, _.cloneDeep( channel_item ) );

						
						// Set all chats internal ui_status to "inactive";
						LJ.chat.deactivateChats();
						
						// Add chat messages to the chat inview
						LJ.chat.addChatMessages({
							channel_item  : channel_item,
							chat_messages : res.messages
						});

						// Turn the chat inview to a jscrollpane element and bind the handle to fetch chat history
						LJ.chat.setupChatInviewJsp( chat_id );

						// Remove loaders
						LJ.chat.deloaderifyChatRow( chat_id );
						LJ.chat.deloaderifyChatInview( chat_id );

						// Update the inview header with dynamic parameters
						LJ.chat.setChatInviewHeader( channel_item );

						// Set the picture and the default
						LJ.chat.setChatRowPicture( channel_item );
						LJ.chat.setChatRowPreview( channel_item );
						LJ.chat.setChatRowTime( channel_item );
						return;

					})
					.then(function(){
						return LJ.chat.refreshChatState( chat_id );

					})
					.catch(function( e ){
						LJ.wlog(e);

					});


		},
		fetchMoreChannels: function(){

			var fetched_chat_ids = _.uniq( _.map( LJ.chat.fetched_chats, 'chat_id' ) );
			return LJ.api.fetchMoreChannels( fetched_chat_ids );

		},
		setupChatRowsJsp: function(){

			var $w = $('.chat-rows');

			// Jspify the chat rows container
			return LJ.ui.turnToJsp('.chat-rows', {
					jsp_id: 'chat_rows',
					handlers: [{
						'event_name' : 'jsp-scroll-y',
						'callback'   : function( e, scroll_pose_y, is_at_top, is_at_bottom ){

							if( is_at_bottom
								&& !$w.hasClass('--fetching-history')
								&& !$w.hasClass('--fetching-done')
								&& !$w.find('.chat-row').length >= LJ.chat.parallel_fetches_count
							){	

								// Find all the group ids that have been fetched so far
								// Server will respond n more ids orderered by most recent activity
								// excluding the ones passed in
								LJ.log('Fetching history... (rows)');
								LJ.chat.readdAndFetchChats();
							}

						}
					}]
				});

		},
		setupChatInviewJsp: function( chat_id ){

			var $w = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]');

			return LJ.ui.turnToJsp('.chat-inview-item[data-chat-id="'+ chat_id +'"] .chat-inview-messages', {
					jsp_id   : chat_id,
					handlers : [{
						'event_name' : 'jsp-scroll-y',
						'callback'   : function( e, scroll_pose_y, is_at_top, is_at_bottom ){

							// To make sure the first time usr loads the chat, no automatic refetch takes place
							if( !$w.hasClass('--fetch-ready') ){
								return //LJ.log('Cant fetch history, the chat is not set as ready');
							}

							// After a fetch history, the 'seen_by' element might be bugged (half hidden)
							// This will that when scroll down, the chat will be like "magneted" down 
							// and properly display the 'seen_by' element
							if( is_at_bottom ){
								return LJ.chat.refreshChatJsp( chat_id );
							}

							if( is_at_top
								&& !$w.hasClass('--fetching-history')
								&& !$w.hasClass('--fetching-done') 
								&& $w.find('.chat-inview-message__bubble:not(.--pending)').length >= LJ.app_settings.app.chat_fetch_count
							){
								LJ.log('Fetching history...(inview)');
								LJ.chat.refetchChatHistory( chat_id );
							} 

						}
					}]
				});

		},
		setupChatRow: function( channel_item , opts ){
			
			var type	= channel_item.type;
			var chat_id = channel_item.chat_id;
			
			var html = LJ.chat.renderChatRow( chat_id );

			// Add chat row in a different location, based on the type
			type == "chat_all" ? 
				LJ.chat.addChatRow( html, _.extend( {}, opts, { $wrap: $('.chat-rows-body.--all') }) ):
				LJ.chat.addChatRow( html, _.extend( {}, opts, { $wrap: $('.chat-rows-body.--team') }) );

			LJ.chat.refreshChatRowsJsp();
			LJ.chat.loaderifyChatRow( chat_id );
			LJ.chat.showChatRow( chat_id );

		},
		setupChatInview: function( channel_item ){

			var chat_id = channel_item.chat_id;

			chat_inview_html = LJ.chat.renderChatInview( channel_item );

			LJ.chat.addChatInview( chat_inview_html );
			LJ.chat.adjustChatInviewDimensions( chat_id );
			LJ.chat.loaderifyChatInview( chat_id );


		},
		adjustChatInviewDimensions: function( chat_id ){

			var $chat               = $('.chat');
			var $chat_inview        = $('.chat-inview[data-chat-id="'+ chat_id +'"]');
			
			var $chat_inview_header = $chat_inview.find('.chat-inview-header');
			var $chat_inview_footer = $chat_inview.find('.chat-inview-footer');

			$chat_inview.find('.chat-inview-messages').css({
				height: $chat.height() - ( $chat_inview_header.height() + $chat_inview_footer.height() )
			});


		},
		loaderifyChatRow: function( chat_id ){

			var $chatrow = LJ.chat.getChatRow( chat_id );
			var $loader  = LJ.static.renderStaticImage("chat_loader");

			$chatrow.children().hide();
			$chatrow.append( $loader );

		},
		deloaderifyChatRow: function( chat_id ){

			var $chatrow = LJ.chat.getChatRow( chat_id );
			var $loader  = $chatrow.find('.chat__loader');

			$chatrow.children().show();
			$loader.remove();

		},
		addChatInview: function( html ){

			$( html )
				.hide()
				.appendTo('.chat-inview-wrap');

		},
		refreshChatRowsOrder: function(){

			var ordered_channel_items = LJ.chat.getOrderedChats();

			ordered_channel_items.forEach(function( channel_item, i ){
				LJ.chat.getChatRow( channel_item.chat_id ).css({ 'order': i });
			});

		},
		getLastMessage: function( chat_id ){

			var last_message  = LJ.chat.getChat( chat_id ).messages[0];

			// If no messages was sent, let's use the fact that each chat has at least a last_sent_at attribute
			// that is equals to requested_at. It is set server-side to help clientside deal with issues when no
			// messages have been sent. 
			if( !last_message ){
				return null;
			} else {
				return last_message;
			}

		},
		getOrderedChats: function(){

			var ordered_channel_items = [];
			var chat_ids = LJ.chat.getChatIds();

			if( chat_ids.length == 0 ){
				return LJ.log('No chat to order (empty array)');
			}

			chat_ids.forEach(function( chat_id ){
				ordered_channel_items.push( LJ.chat.getChannelItem( chat_id ) );				
			});

			// Clear the array
			ordered_channel_items = ordered_channel_items.filter( Boolean );

			// Lowest order are displayed the highest, so sort by desc
			ordered_channel_items.sort(function( m1, m2 ){
				return moment( m2.last_sent_at ) - moment( m1.last_sent_at );
			});

			return ordered_channel_items;

		},
		getLastMessageOfAll: function(){

			var ordered_channel_items = LJ.chat.getOrderedChats();

			if( ordered_channel_items[ 0 ] ){
				return LJ.chat.getLastMessage( ordered_channel_items[ 0 ].chat_id );
			}

		},
		addChatRow: function( html, opts ){
			
			var $html = $( html );
			$html.css({ opacity: 0 }); // jsp compliance

			if( opts.row_insert_mode == "bottom" ){
				$html.css({ 'order': $('.chat-rows').length + 1 }).appendTo( opts.$wrap );

			} else {
				$html.css({ 'order': '-1' }).prependTo( opts.$wrap );

			}

		},
		sortChatRows: function(){

			var L = $('.chat-row').length;
			for( var i = 0; i < L; i++ ){
				for( var j = i; j < L; j++ ){

					var e1 = $('.chat-row').eq(i);
					var e2 = $('.chat-row').eq(j);

					var t1 = e1.attr('data-last-message-at');
					var t2 = e2.attr('data-last-message-at');

					if( t1 < t2 ){
						LJ.swapNodes( t1[0], t2[0] );
					}
				}
			}

		},
		showChatRow: function( chat_id ){

			var $chatrow = LJ.chat.getChatRow( chat_id );
			$chatrow.css({ display: 'flex', opacity: 1 });

		},
		addChatMessages: function( opts ){

			LJ.log('Adding chat messages...');
			
			var type          = opts.channel_item.type;
			var chat_id 	  = opts.channel_item.chat_id;
			var status        = opts.channel_item.status;
			var role          = opts.channel_item.role;

			var chat_messages = opts.chat_messages;

			var $wrap = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]').find('.chat-inview-messages');
			var html;

			// No chat messages to append, render the proper empty view based on status
			if( chat_messages.length == 0 ){

				LJ.chat.emptifyChatInview( chat_id );

			} else {

				chat_messages.forEach(function( message_object ){
					// Generate a local call_id to allow merge, horodate fn etc to properly work
					// We cant use the messages real _id cause at this stage, it is unknown. So 
					// for consistency, let's always use a client-side generated one everywhere
					message_object.call_id = LJ.generateId();
					LJ.chat.addChatLine( message_object, {
						insert_mode: "prepend"
					});

				});

			}
		},
		handleChatRowClicked: function(){

			var $s        = $( this );
			var chat_id   = $s.attr('data-chat-id');

			// Store in local storage the info to know if user has "seen" a chat. Only used when no messages
			// have been sent. Act like a "seen_by"  property, even if none is available (cause no message)
			LJ.chat.setChatRowSeenLocal( chat_id );

			// Show the chat panel
			LJ.chat.showChatInview( chat_id );

			// Toggle the ui_status property to determine which what is active
			LJ.chat.activateChat( chat_id );

			// Update the fact that user has seen all messages. Needs to be placed before viewify, otherwise
			// the local state will alrady have changed and no api call will happen to prevent api spam
			LJ.chat.sendSeenBy( chat_id ); 

			// Update the local state of the "seen_by" property for all messages of this chat
			LJ.chat.seenifyChatInview( chat_id, LJ.user.facebook_id );

			// Focus on the input for better ease of use
			LJ.chat.focusOnInput( chat_id );

			// Refresh the jsp for the ui and tallify all chatlines (need to happen after the jsp process);
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.tallifyAllChatLines( chat_id );

			// Finally, refresh the whole chat state (only bubbles and newified should be affected)
			LJ.chat.refreshChatState( chat_id );

		},
		handleToggleChatWrap: function( e ){

			e.preventDefault();
			var $s = $(this);

			LJ.chat.toggleChatWrap();

		},
		toggleChatWrap: function(){

			if( LJ.chat.state == 'hidden' ){
				LJ.chat.showChatWrap();

			} else {
				LJ.chat.hideChatWrap();

			}

		},
		showChatWrap: function( opts ){
			
			opts = opts || {};

			LJ.chat.state = 'visible';

			var $c = $('.chat');
			var d  = 200;

			$('.app__menu-item.--chats').addClass('--active');

			if( opts.wrap_only ){
				return LJ.ui.shradeIn( $c );
			}

			LJ.chat.refreshChatRowsJsp();
			return LJ.ui.shradeAndStagger( $c, {
				duration: d
			});

		},
		hideChatWrap: function(){

			if( LJ.cheers.getActiveCheersBack() ){
				LJ.log('Cheers back is active, resolving now');
				return LJ.Promise.resolve();
			}

			LJ.chat.state = 'hidden';
			$('.app__menu-item.--chats').removeClass('--active');

			var $c  = $('.chat');
			var $cc = $c.children();
			var d   = 200;

			[ $cc, $c ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				});
			});

			return LJ.delay( d );

		},
		loaderifyChatWrap: function( duration ){

			duration = duration || 450;
        	return LJ.promise(function( resolve, reject ){	

        		// Hiding logic
        		$('.chat')
        			.children()
        			.velocity('fadeOut', { duration: duration, display: 'none' });

        		// Showing logic
				$( LJ.static.renderStaticImage('slide_loader') )
					  .addClass('js-chat-loader')
					  .hide()
					  .appendTo('.chat')
					  .velocity('fadeIn', { duration: duration, delay: duration } );

				// Promise resolve at the right time
				LJ.delay( 2 * duration ).then( resolve );

        	});
		},
		deloaderifyChatWrap: function( duration ){

			duration = duration || 450;
			return LJ.promise(function( resolve, reject ){	

        		// Hiding logic
				$('.chat .js-chat-loader')
					  .velocity('fadeOut', { duration: duration, complete: function(){
					  	$( this ).remove();
					  }});

        		// Showing logic
        		$('.chat')
        			.children(':not(.js-chat-loader)')
        			.velocity('fadeIn', { duration: duration, delay: duration, display: 'flex' });

        		// Refresh the jsp ui state
        		LJ.chat.refreshChatRowsJsp();

				// Promise resolve at the right time
				LJ.delay( 2 * duration ).then( resolve );

        	});
		},
		emptifyChatRows: function(){

			$('.chat-rows').find('.chat-rows-title').addClass('none');
			$('.chat-rows').append( LJ.chat.renderChatRowEmpty() );

			return LJ.chat.refreshChatRowsJsp();

		},
		deemptifyChatRows: function(){

			$('.chat-rows').find('.chat-rows-title').removeClass('none');
			$('.chat-rows').find('.chat-empty').remove();

			return LJ.chat.refreshChatRowsJsp();

		},	
		renderChatRowEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	 : 'row',
				subtitle : '<span data-lid="chat_empty_subtitle_row"></span>'
			});

		},
		renderChatEmpty: function( opts ){

			var subtitle = opts.subtitle;
			var type 	 = opts.type;

			var title    = opts.title || '<span data-lid="chat_empty_title"></span>';
			var icon 	 = opts.icon  || '<i class="icon icon-telescope"></i>';

			return LJ.ui.render([

				'<div class="chat-empty --'+ type + '">',
					'<div class="chat-empty__icon --round-icon">',
						icon,
					'</div>',
					'<div class="chat-empty__title">',
						title,
					'</div>',
					'<div class="chat-empty__subtitle">',
						subtitle,
					'</div>',
				'</div>'

			].join(''));

		},
		setChatRowPicture: function( channel_item ){

			LJ.log('Setting chat row pictures..');

			var chat_id = channel_item.chat_id;
			var type    = channel_item.type;

			if( type == "chat_all" ){

				var users = channel_item.role == "requested" ?
					LJ.chat.getHosts( chat_id ) :
					LJ.chat.getMembers( chat_id );

			} else {

				var users = LJ.chat.getMembers( chat_id );

			}
			
			var pictures = [];

			// Only allow 2-rosaces maximum. More, rosace appearance is confusing...
			users.slice(0,2).forEach(function( user ){
				pictures.push({
					img_id: user.img_id,
					img_vs: user.img_vs
				});
			});

			// Insert rosace into the markup
			var pictures_html = LJ.pictures.makeRosaceHtml( pictures, 'chat-row' );

			LJ.chat.updateChatRowElements( chat_id, {
				picture: pictures_html
			});

			return;

		},
		setChatRowPreview: function( channel_item ){

			LJ.log('Setting chat row preview..');

			var chat_id = channel_item.chat_id;
			var type    = channel_item.type;

			if( type == "chat_all" ){

				var names = channel_item.role == "requested" ?
					_.map( LJ.chat.getHosts( chat_id ), 'name' ) :
					_.map( LJ.chat.getMembers( chat_id ), 'name' );

				names = LJ.renderMultipleNames( names );

				LJ.chat.updateChatRowElements( chat_id, {
					h1: LJ.text("chat_row_request_all_title"),
					h2: LJ.text("chat_row_request_all_subtitle", names )
				});

			} else {

				var names = _.map( LJ.chat.getMembers( chat_id ), 'name' );

				names = LJ.renderMultipleNames( names, { lastify_user: LJ.user.name });

				LJ.chat.updateChatRowElements( chat_id, {
					h1: LJ.text("chat_row_request_team_title"),
					h2: LJ.text("chat_row_request_team_subtitle", names )
				});

			}


		},
		setChatRowTime: function( channel_item ){

			LJ.log('Setting chat row time...');
			
			var chat_id      = channel_item.chat_id;
			var last_sent_at = channel_item.last_sent_at;

			var s_date = LJ.text( "chatrow_date", moment( last_sent_at ) );
			
			LJ.chat.updateChatRowElements( chat_id, {
				date: s_date
			});

		},
		setChatInviewHeader: function( channel_item ){

			var chat_id = channel_item.chat_id;

			if( channel_item.type == "chat_all" ){

				var before = LJ.before.findById( channel_item.before_id );
				if( !before ){
					return LJ.wlog('Unable to find user before details (not fetched), before_id="' + channel_item.before_id );
				}

				var m              = moment( before.begins_at );
				var place_name     = before.address.place_name;
				var formatted_date = LJ.text("chatinview_date", m );

				LJ.chat.updateChatInviewElements( chat_id, {

					header_h1  : '<span class="--date">'+ formatted_date +'</span>',
					header_h2  : '<span class="--place-name">'+ place_name +'</span>'

				});
			    
			} else {

				var names = _.map( LJ.chat.getMembers( chat_id ), 'name' );
				names     = LJ.renderMultipleNames( names, { lastify_user: LJ.user.name });

				LJ.chat.updateChatInviewElements( chat_id, {
					header_h1: '<span data-lid="chat_groupname_team"></span>',
					header_h2: '<span>' + names + '</span>'
				});

			}

		},
		refreshChatStates: function(){

			LJ.chat.getChatIds().forEach(function( chat_id ){
				LJ.chat.refreshChatState( chat_id );
			});
			
		},
		refreshChatState: function( chat_id ){

			// Refresh the chatrow preview : either with last messages, or with the state. And update the time
			LJ.chat.refreshChatRowPicture( chat_id );
			LJ.chat.refreshChatRowPreview( chat_id );
			LJ.chat.refreshChatRowTime( chat_id );

			// Refresh the bubbles on the row, and inside the chat inview
			LJ.chat.refreshChatRowBubbles( chat_id );
			LJ.chat.refreshChatIconBubble();
			LJ.chat.refreshAppTitle( true );

			// Order rows in the right position before moving the ui, requires access to cached messages to work properly
			LJ.chat.refreshChatRowsOrder();

			// Refresh chat seenby, needs to be first
			LJ.chat.refreshChatSeenBy( chat_id );
			
			// Obsolete (?)
			LJ.chat.newifyChatRows( chat_id );

		},
		refreshChatRowPicture: function( chat_id ){

			var last_message = LJ.chat.getLastMessage( chat_id );

			if( !last_message ){
				return;
			}

			var sender = LJ.chat.getUser( last_message.sender_id );
			var pictures_html = LJ.pictures.makeRosaceHtml([{
				img_id: sender.img_id,
				img_vs: sender.img_vs
			}], 'chat-row' );

			LJ.chat.updateChatRowElements( chat_id, {
				picture: pictures_html
			});

		},
		refreshChatRowPreview: function( chat_id ){

			var last_message = LJ.chat.getLastMessage( chat_id );

			if( !last_message ){
				return;
			}

			var sender = LJ.chat.getUser( last_message.sender_id );

			LJ.chat.updateChatRowElements( chat_id, {
				sender_id: sender.facebook_id,
				h1: sender.name,
				h2: last_message.message
			});

		},
		refreshChatRowTime: function( chat_id ){

			var last_message = LJ.chat.getLastMessage( chat_id );

			if( !last_message ){
				return;
			}

			var s_date = LJ.text("chatrow_date", moment( last_message.sent_at ) );

			LJ.chat.updateChatRowElements( chat_id, {
				date: s_date
			});

		},
		updateChatRowElements: function( chat_id, opts ){

			var $chatrow = LJ.chat.getChatRow( chat_id );

			if( opts.h1 ){
				$chatrow.find('.chat-row-infos__name .--name').text( opts.h1 );
			}

			if( opts.h2 ){
				$chatrow.find('.chat-row-infos__preview').text( opts.h2 );
			}

			if( opts.date ){
				$chatrow.find('.chat-row-time span').text( opts.date );
			}

			if( opts.picture ){
				$chatrow.find('.chat-row-pictures').html( opts.picture );
			}

			if( opts.sender_id ){
				$chatrow.find('.js-user-online').attr('data-facebook-id', opts.sender_id );

				if( LJ.connecter.getUserStatus( opts.sender_id ) == "online" ){
					$chatrow.find('.js-user-online').addClass('--online');
				}
			}

			LJ.lang.translate( $chatrow );

		},
		updateChatInviewElements: function( chat_id, opts ){

			var $chatinview = LJ.chat.getChatInview( chat_id ).closest('.chat-inview');

			if( opts.header_h1 ){	
				$chatinview.find('.chat-inview-title__h1').html( opts.header_h1 );
			}
			if( opts.header_h2 ){
				$chatinview.find('.chat-inview-title__h2').html( opts.header_h2 );
			}

			LJ.lang.translate( $chatinview );

		},
		newifyChatRows: function(){

			var chat_ids = LJ.chat.getChatIds();

			chat_ids.forEach(function( chat_id ){

				var $chatrow     = LJ.chat.getChatRow( chat_id );
				var last_message = LJ.chat.getLastMessage( chat_id );
				var last_seen_by = last_message && last_message.seen_by;
				
				if( !last_seen_by ){

					// Localstorage strategy to determine if a user has seen or not a "new" chatrow. 
					// This isnt store on the serverside, because it only happens when the chat is 
					// empty of any messages. So no need to track each click on that section.

					if( LJ.chat.wasNeverSeen( chat_id ) ){
						$chatrow.addClass('--new');
					} else {
						$chatrow.removeClass('--new');
					}

				} else {

					if( last_seen_by.indexOf( LJ.user.facebook_id ) == -1 ){
						$chatrow.addClass('--new');
					} else {
						$chatrow.removeClass('--new');
					}

				}
			});			
		},
		renderChatRowPictures__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-pictures">',
					LJ.pictures.makeImgHtml( LJ.app_settings.placeholder.img_id, LJ.app_settings.placeholder.img_version, 'chat-row' ),
				'</div>'

			].join(''));


		},
		renderChatRowInfos__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-infos">',
					'<div class="chat-row-infos__name">',
						'<span class="--name"></span>',
						'<span class="js-user-online user-online"></span>',
					'</div>',
					'<div class="chat-row-infos__preview">',
		              '<span></span>',
		            '</div>',
				'</div>'

			].join(''));

		},
		renderChatRowTime__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-time">',
					'<span>00:00</span>',
				'</div>'

			].join(''));

		},
		renderChatRow: function( chat_id ){

			var infos_html = LJ.chat.renderChatRowInfos__Placeholder();
			var time_html  = LJ.chat.renderChatRowTime__Placeholder();
			var pics_html  = LJ.chat.renderChatRowPictures__Placeholder();

			return LJ.ui.render([

				'<div class="chat-row" data-chat-id="'+ chat_id +'">',
					pics_html,
					infos_html,
					time_html,
				'</div>'

			].join(''));


		},
		setChatRowSeenLocal: function( chat_id ){

			var seen_chats = LJ.store.get('seen_chats') || [];
			seen_chats.push( chat_id );
			LJ.store.set( 'seen_chats', _.uniq(seen_chats) );

		},
		getUser: function( facebook_id ){

			if( !/^\d+$/i.test( facebook_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}
			
			return _.find( LJ.chat.fetched_profiles, function( u ){
				return u.facebook_id == facebook_id;
			});

		},
		getUsers: function( facebook_ids ){

			return _.filter( LJ.chat.fetched_profiles, function( u ){
				return facebook_ids.indexOf( u.facebook_id ) != -1;
			});

		},
		getHosts: function( chat_id ){

			if( !/^\w+$/i.test( chat_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}

			var hosts = LJ.chat.getChannelItem( chat_id ).hosts;

			return LJ.chat.getUsers( hosts );

		},
		getMembers: function( chat_id ){

			if( !/^\w+$/i.test( chat_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}

			var members = LJ.chat.getChannelItem( chat_id ).members;

			return LJ.chat.getUsers( members );

		},
		getMainHost: function( chat_id ){

			if( !/^\w+$/i.test( chat_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}

			// The link between hosts & members and chats are stored in channel object
			var main_host = LJ.chat.getChannelItem( chat_id ).main_host;

			return LJ.chat.getUser( main_host );

		},
		getMainMember: function( chat_id ){

			if( !/^\w+$/i.test( chat_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}

			// The link between hosts & members and chats are stored in channel object
			var main_member = LJ.chat.getChannelItem( chat_id ).main_member;

			return LJ.chat.getUser( main_member );

		},
		getChannelItem: function( chat_id ){

			if( !/^\w+$/i.test( chat_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}

			return _.find( LJ.user.channels, function( chan ){
				return chan.chat_id == chat_id;
			});

		},
		getChatRow: function( chat_id ){

			if( !chat_id ){
				return LJ.wlog('Cannot target chat row without chat_id');
			}

			return $('.chat-row[data-chat-id="'+ chat_id +'"]');

		},
		updatePageTitle: function( title ){

			document.title = title;

		},
		refreshAppTitle: function( bubble_page_title ){
	     	
		    var n_unseen_messages = 0;
		    LJ.chat.getChatIds().forEach(function( chat_id ){
		        n_unseen_messages += LJ.chat.getUnseenMessagesCount( chat_id );
		    });
		     
		    if( n_unseen_messages == 0 ){

		    	clearTimeout( LJ.chat.page_title_timer );

		        LJ.ui.updatePageTitle("Des rencontres avant d'aller en soirée");

		       return  LJ.chat.page_title_timer = setTimeout(function(){
		              LJ.chat.refreshAppTitle();
		        }, 3000 );
		    }
		 	
		 	if( bubble_page_title ){

		 		clearTimeout( LJ.chat.page_title_timer );

		        LJ.ui.updatePageTitle("(%n) Des rencontres avant d'aller en soirée".replace('%n',n_unseen_messages));

		        return LJ.chat.page_title_timer = setTimeout(function(){
		              LJ.chat.refreshAppTitle( false );
		        }, 3000 );
		 	}		 	

	    	var sender_id   = LJ.chat.getLastMessageOfAll().sender_id;
	    	var sender_name = LJ.chat.getUser( sender_id ).name;

		    LJ.ui.updatePageTitle("%name vous a envoyé un message".replace('%name', sender_name ));

		    LJ.chat.page_title_timer = setTimeout(function(){
		          LJ.chat.refreshAppTitle( true );
		    }, 3000 );
		    	
		    
     
		}



	});