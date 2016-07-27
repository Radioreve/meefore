
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		parallel_fetches_count: 30,

		state: 'hidden',
		fetched_profiles: {},
		fetched_chats: {},

		init: function(){
			
			LJ.log('Init chat...');
			LJ.chat.handleDomEvents();
			LJ.chat.setupChat();
			
			LJ.chat.setupChatRowsJsp()
				.then(function(){
					LJ.chat.emptifyChatRows();
					return LJ.chat.fetchAndAddChats();
				})
				.then(function(){
					LJ.chat.refreshLocalChats();
				})
			// Non blocking promise, return now
			LJ.log('Done');
			return;

		},
		handleDomEvents: function(){

			$('.app__menu-item.x--chats').on('click', LJ.chat.handleToggleChatWrap );
			$('.app__menu-item.x--notifications').on('click', LJ.chat.hideChatWrap );
			$('.chat__close').on('click', LJ.chat.hideChatWrap );
			$('.chat').on('click', '.chat-row', LJ.chat.handleChatRowClicked );

			LJ.chat.handleDocumentVisibilityChangeEvents();

			LJ.chat.handleDomEvents__Inview();

		},
		handleDocumentVisibilityChangeEvents: function(){

			var hidden, state, visibilityChange; 
			if (typeof document.hidden !== "undefined") {

				hidden = "hidden";
				visibilityChange = "visibilitychange";
				state = "visibilityState";

			} else if (typeof document.mozHidden !== "undefined") {

				hidden = "mozHidden";
				visibilityChange = "mozvisibilitychange";
				state = "mozVisibilityState";

			} else if (typeof document.msHidden !== "undefined") {

				hidden = "msHidden";
				visibilityChange = "msvisibilitychange";
				state = "msVisibilityState";

			} else if (typeof document.webkitHidden !== "undefined") {

				hidden = "webkitHidden";
				visibilityChange = "webkitvisibilitychange";
				state = "webkitVisibilityState";

			}

			// Add a listener that constantly changes the title
			document.addEventListener( visibilityChange, function() {

				var is_tab_active = !/hidden/i.test( state );
				if( is_tab_active ){

					LJ.store.set("chats_tabbed_at", moment().toISOString() );
					LJ.chat.refreshChatStates();
		        	
				} 

			}, false);

		},
		setupChat: function(){

			// Set chat dimensions for jsp compliance
			LJ.ui.adjustWrapperHeight( $('.chat') );
			var height = $( window ).height() - LJ.ui.slide_top;
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
		// Legacy functions, old behavior
		// refreshChatIconBubble_NoNumbers: function(){

		// 	LJ.chat.resetBubbleToChatIcon();
		// 	var display_bubble = false;
			
		// 	LJ.chat.getChatIds().forEach(function( chat_id ){

		// 		if( LJ.chat.getLastMessage( chat_id ) && LJ.chat.getUnseenMessagesCount( chat_id ) > 0 ){
		// 			display_bubble = true;
		// 		} else {
		// 			if( !LJ.chat.getLastMessage( chat_id ) && LJ.chat.wasNeverSeen( chat_id ) ){
		// 				display_bubble = true;
		// 			}
		// 		}

		// 	});

		// 	if( display_bubble ){
		// 		LJ.chat.addBubbleToChatIcon();
		// 	}

		// },
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
		// Remove from the cache the out-dated chat_ids that would stay here permanently otherwise
		refreshLocalChats: function(){

			var seen_chats = Array.isArray( LJ.store.get('seen_chats') ) ? LJ.store.get('seen_chats') : [];

			_.remove( seen_chats, function( seen_chat_id ){
				return LJ.chat.getChatIds().indexOf( seen_chat_id ) == -1;
			});

			LJ.store.set( "seen_chats", seen_chats );

		},
		refreshChatIconBubble: function(){

			var nu_messages = 0;
			LJ.chat.resetBubbleToChatIcon();	
			LJ.chat.getChatIds().forEach(function( chat_id ){

				if( LJ.chat.getLastMessage( chat_id ) && LJ.chat.getUncheckedMessagesCount( chat_id ) > 0 ){
					nu_messages += LJ.chat.getUncheckedMessagesCount( chat_id );
				} else {
					if( !LJ.chat.getLastMessage( chat_id ) && LJ.chat.wasNeverChecked( chat_id ) ){
						nu_messages += 1;
					}
				}

			});

			LJ.chat.addBubbleToChatIcon( nu_messages );

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
		wasNeverSeen: function( chat_id ){

			var seen_chats = Array.isArray( LJ.store.get('seen_chats') ) ? LJ.store.get('seen_chats') : [];

			return seen_chats.indexOf( chat_id ) == -1 ? true : false;

		},
		// In this version, a message is considered to be "checked" if its sent_at is later
		// than the time the user clicked the chat_icon
		getUncheckedMessagesCount: function( chat_id ){

			var i    = 0;
			var chat = LJ.chat.getChat( chat_id );

			chat.messages.forEach(function( m ){

				var chats_checked_at = moment( LJ.store.get('chats_checked_at') );
				var is_unchecked     = !chats_checked_at || chats_checked_at < moment( m.sent_at );

				if( m.seen_by.indexOf( LJ.user.facebook_id ) == -1 && is_unchecked ){
					i++;
				} 

			});

			return i;

		},
		wasNeverChecked: function( chat_id ){

			var channel 	  = LJ.chat.getChannelItem( chat_id );
			var never_checked = false;

			if( LJ.chat.getChat( chat_id ).messages.length > 0 ){
				LJ.wlog('Warning, calling was never checked on a chat that has messages. Use getUncheckedMessagesCount instead');
			}

			// The last_sent_at param is mostly used for fetching chats. Best use the formed_at or
			// requested_at depending of the type of chat to know the date at which a chat was created at
			var last_activated_at = channel.formed_at ? channel.formed_at : channel.requested_at;
			if( moment( LJ.store.get('chats_checked_at') ) < moment( last_activated_at ) ){
				never_checked = true;
			}

			return never_checked;

		},
		// In this version, a message is considered to be "tabbed" if its sent_at is later
		// than the time the user activatd the tab window
		getUntabbedMessagesCount: function( chat_id ){

			var i    = 0;
			var chat = LJ.chat.getChat( chat_id );

			chat.messages.forEach(function( m ){

				var is_untabbed = moment( LJ.store.get('chats_tabbed_at') ) < moment( m.sent_at );
				if( m.seen_by.indexOf( LJ.user.facebook_id ) == -1 && is_untabbed ){
					i++;
				} 
			});

			return i;

		},
		addBubbleToChatIcon: function( n ){

			LJ.ui.setBubble( $('.app__menu-item.x--chats'), n );

		},
		resetBubbleToChatIcon: function(){

			LJ.ui.setBubble( $('.app__menu-item.x--chats'), 0 );

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
		getChatIdByBeforeId: function( before_id ){

			var channel_item = _.find( LJ.user.channels, function( chan ){

				return chan && chan.chat_id && chan.before_id && chan.before_id == before_id;

			});

			if( channel_item && channel_item.chat_id ){
				return channel_item.chat_id;
			} else {
				return null;
			}

		},
		fetchAndAddChats: function(){

			// Keep only the channels that are chat-related (= have a team_id parameter)
			var channels = _.filter( LJ.user.channels, 'team_id' );

			var sorted_channels = channels.sort(function( ch1, ch2 ){
				return moment( ch2.last_sent_at ) - moment( ch1.last_sent_at );
			});

			var last_channels    = sorted_channels.slice( 0, LJ.chat.parallel_fetches_count );
			var all_chat_fetched = [];

			last_channels.forEach(function( channel_item ){

				var chat_fetched = LJ.chat.fetchAndAddOneChat( channel_item, {
					row_insert_mode: "top"
				});

				all_chat_fetched.push( chat_fetched );

			});

			return LJ.Promise.all( all_chat_fetched );

		},
		refetchAndAddChats: function(){

			LJ.log('Refetching more group ids');

			return LJ.chat.fetchMoreChannels()
				.then(function( channels ){

					if( channels.length == 0 ){
						return LJ.chat.allChannelsFetched();
					}

					var all_chat_fetched = [];

					channels.forEach(function( channel_item ){
						var chat_fetched = LJ.chat.fetchAndAddOneChat( channel_item, {
							row_insert_mode: "bottom"
						});

						all_chat_fetched.push( chat_fetched );
					});

					return LJ.Promise.all( all_chat_fetched );

				});
			
		},
		allChannelsFetched: function(){

			LJ.wlog('All channels have been fetched');
			LJ.ui.showToast('All channels have been fetched');

		},
		fetchAndAddOneChat: function( channel_item, opts ){

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
						// This may be an async operation. If the before isnt part of the user location
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

			return LJ.api.fetchMoreChannels( LJ.chat.getChatIds() );

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
								&& !$w.hasClass('x--fetching-history')
								&& !$w.hasClass('x--fetching-done')
								&& !$w.find('.chat-row').length >= LJ.chat.parallel_fetches_count
							){	

								// Find all the group ids that have been fetched so far
								// Server will respond n more ids orderered by most recent activity
								// excluding the ones passed in
								LJ.log('Fetching history... (rows)');
								LJ.chat.refetchAndAddChats();
							}

						}
					}]
				});

		},
		setupChatInviewJsp: function( chat_id ){

			var $w = LJ.chat.getChatInview( chat_id );

			return LJ.ui.turnToJsp('.chat-inview-item[data-chat-id="'+ chat_id +'"] .chat-inview-messages', {
					jsp_id   : chat_id,
					handlers : [{
						'event_name' : 'jsp-scroll-y',
						'callback'   : function( e, scroll_pose_y, is_at_top, is_at_bottom ){

							// To make sure the first time usr loads the chat, no automatic refetch takes place
							if( !$w.hasClass('x--fetch-ready') ){
								return LJ.log('Cant fetch history, the chat is not set as ready');
							}

							// After a fetch history, the 'seen_by' element might be bugged (half hidden)
							// This will that when scroll down, the chat will be like "magneted" down 
							// and properly display the 'seen_by' element
							if( is_at_bottom ){
								return LJ.chat.refreshChatJsp( chat_id );
							}

							if( is_at_top
								&& !$w.hasClass('x--fetching-history')
								&& !$w.hasClass('x--fetching-done') 
								&& $w.find('.chat-inview-message__bubble:not(.x--pending)').length >= LJ.app_settings.app.chat_fetch_count
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
				LJ.chat.addChatRow( html, _.extend( {}, opts, { $wrap: $('.chat-rows-body.x--all') }) ):
				LJ.chat.addChatRow( html, _.extend( {}, opts, { $wrap: $('.chat-rows-body.x--team') }) );

			LJ.chat.refreshChatRowsJsp()
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

			var last_message  = LJ.chat.getChat( chat_id ).messages[ 0 ];

			// If no messages was sent, let's use the fact that each chat has at least a last_sent_at attribute
			// that is equals to requested_at. It is set server-side to help clientside deal with issues when no
			// messages have been sent. 
			if( !last_message ){
				return null;
			} else {
				return last_message;
			}

		},
		getLastMessageOther: function( chat_id ){

			try {
				return _.filter( LJ.chat.getChat( chat_id ).messages, function( msg ){
					return msg.sender_id != LJ.user.facebook_id;
				})[ 0 ];
			} catch( e ){
				return null
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
 
				var last_m1 = LJ.chat.getLastMessage( m1.chat_id ) && LJ.chat.getLastMessage( m1.chat_id ).sent_at || m1.last_sent_at;
				var last_m2 = LJ.chat.getLastMessage( m2.chat_id ) && LJ.chat.getLastMessage( m2.chat_id ).sent_at || m2.last_sent_at;
				
				return moment( last_m2 ) - moment( last_m1 );
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
		removeChatRow: function( chat_id ){
			LJ.chat.getChatRow( chat_id ).remove();

		},
		removeChatChannelItem: function( chat_id ){

			LJ.chat.getChannelItem( chat_id ) = undefined;

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

			LJ.chat.showAndActivateChatInview( chat_id );
			
		},
		showAndActivateChatInview: function( chat_id ){

			if( LJ.chat.getChatIds().indexOf( chat_id ) == -1 ){
				return LJ.wlog('The chat ' + chat_id + ' doesnt exist.');
			}
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
			var $s = $( this );

			LJ.chat.toggleChatWrap();

		},
		toggleChatWrap: function(){

			if( LJ.isMobileMode() && LJ.chat.state == "visible" ){
				return;
			}

			LJ.chat.checkAllChats();

			if( LJ.chat.state == 'hidden' ){
				LJ.chat.showChatWrap();
				LJ.chat.refreshChatStates();

			} else {
				LJ.chat.hideChatWrap();

			}

		},
		showChatWrap: function( opts ){
				
			if( LJ.isMobileMode() ){
				LJ.nav.denavigate();
				LJ.ui.deactivateHtmlScroll();
				LJ.notifications.hideNotificationsPanel();
			}

			opts = opts || {};

			LJ.chat.state = 'visible';
			$('.app__menu-item.x--chats').addClass('x--active');

			LJ.ui.adjustWrapperHeight( $('.chat') );

			// $('.chat').css({ 'display': 'flex', 'opacity': '1' });
			$('.chat').show();
			LJ.chat.refreshChatRowsJsp();
			return;

			var duration  = 300;

			LJ.ui.shradeIn( $('.chat'), duration );
			LJ.chat.refreshChatRowsJsp(); 

			return LJ.delay( duration );

		},
		hideChatWrap: function(){

			LJ.ui.activateHtmlScroll();

			LJ.chat.state = 'hidden';
			$('.app__menu-item.x--chats').removeClass('x--active');

			$('.chat').hide();

			// $('.chat').css({ 'display': 'none', 'opacity': '0' });
			return;

			var duration = 200;
			$('.chat').velocity('shradeOut', {
				duration: duration
			});

			return LJ.delay( duration );

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
			var icon 	 = opts.icon  || '<i class="icon icon-chat-bubble-empty"></i>';

			var img_html = [
				'<div class="chat-empty__icon x--round-icon">',
						icon,
					'</div>',
			].join('');

			if( opts.img_html ){
				img_html = opts.img_html;
			}

			return LJ.ui.render([

				'<div class="chat-empty x--'+ type + '">',
					'<div class="chat-empty__image">',
						img_html,
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

			// Insert rosace into the markup
			var pictures_html = LJ.pictures.makeGroupRosace( users, 2, 'chat-row' );

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

				var members    = channel_item.role == "requested" ? LJ.chat.getHosts( chat_id ) : LJ.chat.getMembers( chat_id ) ;
				var without_me = _.filter( members, function( m ){ return m.facebook_id != LJ.user.facebook_id; });
				var names 	   = _.map( without_me, 'name' );

				LJ.chat.updateChatRowElements( chat_id, {
					h1: LJ.renderMultipleNames( names ),
					h2: LJ.text("chat_row_request_all_subtitle", names )
				});

			} else {

				var members    = LJ.chat.getMembers( chat_id );
				var without_me = _.filter( members, function( m ){ return m.facebook_id != LJ.user.facebook_id; });
				var names 	   = _.map( without_me, 'name' );
				
				LJ.chat.updateChatRowElements( chat_id, {
					h1: LJ.renderMultipleNames( names ),
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

				LJ.before.getBefore( channel_item.before_id )
					.then(function( before ){

					if( !before ){
						return LJ.wlog('Unable to find user before details (event after fetch)');
					}

					var m              = moment( before.begins_at );
					var place_name     = before.address.place_name;
					var formatted_date = LJ.text("chatinview_date", m );

					LJ.chat.updateChatInviewElements( chat_id, {

						header_h1  : '<span class="x--date">'+ formatted_date +'</span>',
						header_h2  : '<span class="x--place-name">'+ place_name +'</span>'

					});
				});	
			    
			} else {

				var names = _.map( LJ.chat.getMembers( chat_id ), 'name' );
				names     = LJ.renderMultipleNames( names, { lastify_user: LJ.user.name });

				LJ.chat.updateChatInviewElements( chat_id, {
					header_h1: '<span>' + names + '</span>',
					header_h2: '<span data-lid="chat_team_h2"></span>',
				});

			}

		},
		refreshChatStates: function(){

			LJ.chat.getChatIds().forEach(function( chat_id ){
				LJ.chat.refreshChatState( chat_id );
			});
			
		},
		clearChatState: function( chat_id ){

			LJ.chat.unsetChat( chat_id );
			LJ.chat.removeChatRow( chat_id );
			LJ.chat.removeChatInview( chat_id );

		},
		clearChatStates: function(){

			LJ.chat.getChatIds().forEach(function( chat_id ){
				LJ.chat.clearChatState( chat_id );
			});

			LJ.chat.emptifyChatRows();

		},
		unsetChat: function( chat_id ){

			delete LJ.chat.fetched_chats[ chat_id ];

		},
		checkAllChats: function(){

			LJ.log('Checking all chats');
			LJ.store.set("chats_checked_at", moment().toISOString() );

		},
		refreshChatState: function( chat_id ){

			// Refresh the chatrow preview : either with last messages, or with the state. And update the time
			LJ.chat.refreshChatRowPicture( chat_id );
			LJ.chat.refreshChatRowPreview( chat_id );
			LJ.chat.refreshChatRowTime( chat_id );

			// Refresh the bubbles on the row, and inside the chat inview
			// Only refresh the state if the panel is hidden
			if( LJ.chat.getChatState() == "visible" ){
				LJ.chat.checkAllChats();
			}

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

			var last_message       = LJ.chat.getLastMessage( chat_id );
			var last_message_other = LJ.chat.getLastMessageOther( chat_id );

			if( !last_message_other ){
				return LJ.log("No message except from user ones, not refreshing the chat row picture");
			}

			var sender = LJ.chat.getUser( last_message_other.sender_id );
			var pictures_html = LJ.pictures.makeRosaceHtml([{
				img_id: sender.img_id,
				img_vs: sender.img_vs
			}], 'chat-row' );

			LJ.chat.updateChatRowElements( chat_id, {
				picture: pictures_html
			});

		},
		refreshChatRowPreview: function( chat_id ){

			var channel_item       = LJ.chat.getChannelItem( chat_id );
			var last_message       = LJ.chat.getLastMessage( chat_id );
			var last_message_other = LJ.chat.getLastMessageOther( chat_id );

			var sender, members, without_me, names, update;

			if( !last_message_other ){
				return LJ.log("No message except from user ones, not refreshing the chat row preview");
			}
			
			sender  = LJ.chat.getUser( last_message_other.sender_id );
			members = ( channel_item.type == "chat_all" && channel_item.role == "requested" ) ?
					  LJ.chat.getHosts( chat_id ) :
					  LJ.chat.getMembers( chat_id );

			// Never display the user's name on the h1
			without_me = _.filter( members, function( m ){
				return m.facebook_id != LJ.user.facebook_id;
			});
				
			update = {
				sender_id: sender.facebook_id,
				h1       : LJ.renderMultipleNames( _.map( without_me, 'name' ) )
			};

			// Little ehancement : when only chatting with one team user, dont double repeat his name 
			// to avoid a weird visual effect
			// if( without_me.length != 1 ){
			// 	update.h2 = sender.name +' : ' + last_message_other.message;
			// } else {
				update.h2 = last_message_other.message;
			// }
			

			LJ.chat.updateChatRowElements( chat_id, update );

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
				$chatrow.find('.chat-row-infos__name .x--name').text( opts.h1 );
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
					$chatrow.find('.js-user-online').addClass('x--online');
				}
			}

			LJ.lang.translate( $chatrow );

		},
		updateChatInviewElements: function( chat_id, opts ){

			var $chatinview = LJ.chat.getChatInview( chat_id );

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
						$chatrow.addClass('x--new');
					} else {
						$chatrow.removeClass('x--new');
					}

				} else {

					if( last_seen_by.indexOf( LJ.user.facebook_id ) == -1 ){
						$chatrow.addClass('x--new');
					} else {
						$chatrow.removeClass('x--new');
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
						'<span class="x--name"></span>',
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

			var seen_chats = Array.isArray( LJ.store.get('seen_chats') ) ? LJ.store.get('seen_chats') : [];
							 
			seen_chats.push( chat_id );
			LJ.store.set( 'seen_chats', _.uniq( seen_chats ) );

		},
		getUser: function( facebook_id ){

			if( !/^\d+$/i.test( facebook_id ) ){
				return LJ.wlog('facebook_id didnt match pattern, facebook_id=' +facebook_id );
			}
			
			return _.find( LJ.chat.fetched_profiles, function( u ){
				return u && u.facebook_id == facebook_id;
			});

		},
		getUsers: function( facebook_ids ){
			
			if( !facebook_ids ){
				LJ.log('Calling getUsers on undefined array of ids');
				return [];
			}
			
			return _.filter( LJ.chat.fetched_profiles, function( u ){
				return u && u.facebook_id && facebook_ids.indexOf( u.facebook_id ) != -1;
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
		isTeamChat: function( chat_id ){

			return LJ.chat.getHosts( chat_id ).length == 0 ? true : false;

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
	     	
		    var n_untabbed_messages = 0;
		    LJ.chat.getChatIds().forEach(function( chat_id ){
		        n_untabbed_messages += LJ.chat.getUntabbedMessagesCount( chat_id );
		    });
		     
		    if( n_untabbed_messages == 0 ){

		    	clearTimeout( LJ.chat.page_title_timer );
		        LJ.ui.updatePageTitle( LJ.text("page_title") );
		        return LJ.log('No untabbed messages to display');

		    }
		 	
		 	if( bubble_page_title ){

		 		clearTimeout( LJ.chat.page_title_timer );

		        LJ.ui.updatePageTitle("(%n) ".replace('%n',n_untabbed_messages) + (LJ.text("page_title") ));

		        return LJ.chat.page_title_timer = setTimeout(function(){
		              LJ.chat.refreshAppTitle( false );
		        }, 2000 );
		 	}		 	

		 	var last_message_of_all =  LJ.chat.getLastMessageOfAll();

		 	if( last_message_of_all ){
		    	var sender_id   = last_message_of_all.sender_id;
		    	var sender_name = LJ.chat.getUser( sender_id ).name;

			    LJ.ui.updatePageTitle("%name vous a envoyé un message".replace('%name', sender_name ));
		 	} else {
		 		LJ.ui.updatePageTitle("Nouveaux messages !");
		 	}

		    LJ.chat.page_title_timer = setTimeout(function(){
		          LJ.chat.refreshAppTitle( true );
		    }, 2000 );
	    			    

		},
		cancelChatWrap: function( chat_id ){

			LJ.chat.removeChatRow( chat_id );
			LJ.chat.refreshChatRowsJsp();
			LJ.chat.hideChatInview();
			LJ.chat.removeChatInview( chat_id );

			if( $('.chat-row').length == 0 ){
				LJ.chat.emptifyChatRows();
			}

		},	
		resyncAllChats: function(){

			var ux_done = LJ.ui.synchronify({
				$wrap        : $('.chat-wrap'),
				message_html : LJ.text("chat_just_canceled")
			});

			ux_done.then(function(){

				var current_active_chat = LJ.chat.getActiveChatId();
				
				LJ.chat.clearChatStates();
				LJ.chat.hideChatInviewWrap();
				
				var refresh_all_chats  = LJ.chat.refetchAndAddChats();

				refresh_all_chats
					.then(function(){

						LJ.chat.showAndActivateChatInview( current_active_chat );
						LJ.ui.desynchronify({ $wrap: $('.chat-wrap') });
						LJ.ui.showToast( LJ.text("chat_sync_done") );

					})
					.catch(function( err ){
						console.log( err );

					});

			});
				
		}


	});