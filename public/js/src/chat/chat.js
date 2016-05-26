
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		parallel_fetches_count: 30,

		state: 'hidden',
		fetched_groups: {},
		fetched_chats: {},

		init: function(){
				
			LJ.chat.handleDomEvents();
				
			LJ.chat.setupChat();
			
			// Non blocking promise
			LJ.chat.setupChatRowsJsp()
				.then(function(){
					return LJ.chat.addAndFetchChats();
				})
				.then(function(){
					return LJ.chat.navigate('all');
				})

			return;

		},
		setupChat: function(){

			// Set chat dimensions for jsp compliance
			var height = $(window).height() - LJ.ui.slide_top;

			$('.chat').css({ height: height });
			$('.chat-rows').css({
				height : height - ( $('.chat-header').height() + $('.chat-subheader').height() )
			});

		},
		refreshChatRowsJsp: function(){

			LJ.ui.jsp[ "chat_rows" ].reinitialise();

		},
		handleDomEvents: function(){

			$('.app__menu-item.--chats').on('click', LJ.chat.handleToggleChatWrap );
			$('.chat__close').on('click', LJ.chat.hideChatWrap );
			$('.chat').on('click', '.segment__part', LJ.chat.handleChatNavigate );
			$('.chat').on('click', '.chat-row', LJ.chat.handleShowChatInview );

			LJ.chat.handleDomEvents__Inview();

		},
		// Sort all chat messages by crescent order : messages[0] is the oldest
		sortChatMessages: function( chat_id ){

			LJ.chat.getChatById( chat_id ).messages.sort(function( ch1, ch2 ){
				return moment( ch2.sent_at ) - moment( ch1.sent_at );
			})

		},
		cacheGroupProfiles: function( group_id, data ){

			LJ.chat.fetched_groups[ group_id ] = {
				group_id 			: group_id,
				hosts_profiles      : data.hosts_profiles,
				members_profiles    : data.members_profiles,
				main_host_profile   : data.main_host_profile,
				main_member_profile : data.main_member_profile
			};

		},
		cacheChatMessage: function( chat_id, message_object ){

			if( !message_object.state ){
				LJ.wlog('Cannot cache message object without a local state ("seen","unseen")');

			} else {
				LJ.chat.getChatById( chat_id ).messages.push( message_object );
				LJ.chat.sortChatMessages( chat_id );
			}

		},
		cacheChatMessages: function( chat_id, messages, readby, channel_item ){

			if( !Array.isArray( messages ) ){
				return LJ.wlog('Cannot setup cache for chat without a messages array');
			}

			var chat = LJ.chat.getChatById( chat_id ) 
					 ? LJ.chat.getChatById( chat_id ) 
					 : LJ.chat.setChat( chat_id, readby, channel_item );
			
			// During the setup, check if
			messages.forEach(function( message_object ){

				var sent_at     = moment( message_object.sent_at );
				var last_online = moment().subtract('20000','minutes');

				message_object.state = sent_at > last_online ? "unseen" : "seen";
				LJ.chat.cacheChatMessage( chat_id, message_object );

			});

		},
		getActiveChatId: function(){

			var active_chat_id = null;
				LJ.chat.getChatIds().forEach(function( chat_id ){
				if( LJ.chat.getChatById( chat_id ).ui_status == "active" ){
					active_chat_id = chat_id;
				}
			});
			return active_chat_id;

		},
		viewifyChatInview: function( chat_id ){

			var chat = LJ.chat.getChatById( chat_id );

			if( chat.ui_status == "active" ){
				chat.messages.forEach(function( m ){
					m.state = "seen";
				});
			}

		},
		refreshChatIconBubble: function(){

			LJ.chat.resetBubbleToChatIcon();
			
			_.uniq( _.map( LJ.chat.fetched_chats, 'group_id' ) ).forEach(function( group_id ){
				if( LJ.chat.getUnseenMessagesCount( group_id ) > 0 ){
					LJ.chat.addBubbleToChatIcon();
				}
			});


		},
		refreshChatInviewBubbles: function( group_id ){
			
			var chat_all  = LJ.chat.getChatByGroupId__All( group_id );
			var chat_team = LJ.chat.getChatByGroupId__Team( group_id );
			
			LJ.chat.resetBubbleToChatRow( group_id );
			LJ.chat.resetBubbleToChatSwitchIcon( group_id );
			
			[ chat_all, chat_team ].forEach(function( chat ){
				chat.messages.forEach(function( m ){

					 if( m.state == "unseen" ){

						LJ.chat.addBubbleToChatRow( group_id );
						LJ.chat.addBubbleToChatSwitchIcon( group_id );

					} 
				});
			});


		},
		getUnseenMessagesCount: function( group_id ){

			var i 		   = 0;
			var chat_all   = LJ.chat.getChatByGroupId__All( group_id );
			var chat_team  = LJ.chat.getChatByGroupId__Team( group_id );

			[ chat_all, chat_team ].forEach(function( chat ){
				chat.messages.forEach(function( m ){

					 if( m.state == "unseen" ){
						i++;
					} 
				});
			});

			return i;


		},
		addBubbleToChatIcon: function(){

			LJ.ui.showBubble( $('.app__menu-item.--chats') );

		},
		resetBubbleToChatIcon: function(){

			LJ.ui.hideBubble( $('.app__menu-item.--chats') );

		},
		addBubbleToChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			LJ.ui.bubbleUp( $chatrow );

		},
		resetBubbleToChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			LJ.ui.setBubble( $chatrow, 0 );

		},
		resetBubbleToChatSwitchIcon: function( group_id ){

			var $icon = $('.chat-inview[data-group-id="'+ group_id +'"]')
						.find('.chat-inview__icon.--switch');

			LJ.ui.setBubble( $icon, 0 );

		},
		addBubbleToChatSwitchIcon: function( group_id ){

			var $icon = $('.chat-inview[data-group-id="'+ group_id +'"]')
						.find('.chat-inview__icon.--switch');

			LJ.ui.bubbleUp( $icon );

		},
		getChatIds: function(){

			return _.keys( LJ.chat.fetched_chats );

		},
		setChat: function( chat_id, readby, channel_item ){

			LJ.chat.fetched_chats[ chat_id ] = {};
			
			var chat = LJ.chat.fetched_chats[ chat_id ];

			chat.readby   = readby ? readby : null;
			chat.messages = [];
			// Copy extra properties on chat objects that are chat-related and useful. Functions regarding 
			// the ui will base their behavior on the state that is stored here
			if( channel_item ){
				[ 'before_id', 'group_id', 'requested_at', 'last_sent_at' ].forEach(function( prop ){
					chat[ prop ] = channel_item[ prop ];
				});
			} else {
				LJ.wlog('Setting chat somewhere without channel_item');
			}

			return chat;

		},
		getChatById: function( chat_id ){

			var c = LJ.chat.fetched_chats[ chat_id ];
			if( !c ){
				return null;
			} else {
				return c;
			}

		},
		getGroupIdByChatId: function( chat_id ){
			
			var group_id = null;
			LJ.user.channels.forEach(function( chan ){
					
				if( chan.channel_all == chat_id || chan.channel_team == chat_id ){
					group_id = chan.group_id;
				}

			});
			return group_id;
				
		},
		getChatByGroupId__All: function( group_id ){

			var chat_id = _.find( LJ.user.channels, function( chan ){
				return chan.group_id == group_id;
			}).channel_all;

			return LJ.chat.getChatById( chat_id );

		},
		getChatByGroupId__Team: function( group_id ){

			var chat_id = _.find( LJ.user.channels, function( chan ){
				return chan.group_id == group_id;
			}).channel_team;

			return LJ.chat.getChatById( chat_id );

		},
		updateChatMessagesState: function( chat_id, state ){

			LJ.chat.getChatById( chat_id ).messages.forEach(function( message ){
				message.state = state;
			});

		},
		addAndFetchChats: function(){

			// Keep only the channels that are chat-related
			var channels = _.filter( LJ.user.channels, 'channel_all' );

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

			// Promise is needed because for the init, the navigate must be called after its all done
			// otherwise, not needed, cause each chat reupdates the whole state when its done, so no
			// concurrency issues can ever happen
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

			var group_id     = channel_item.group_id;
			var chat_id_all  = channel_item.channel_all;
			var chat_id_team = channel_item.channel_team;
			var hosts 		 = channel_item.hosts;
			var members 	 = channel_item.members;
			var main_host    = channel_item.main_host;
			var main_member  = channel_item.main_member;
			var status 		 = channel_item.status;
			var role 		 = channel_item.role;
			var requested_at = channel_item.requested_at;
			var last_sent_at = channel_item.last_sent_at;

			LJ.log('Initializing one chat...');

			return LJ.Promise.resolve()
					// Render static HTML that will be dynamically filled (sync)
					.then(function(){
						return LJ.chat.setupChatRow( channel_item, opts );

					})
					// Render static HTML that will be dynamically filled (sync)
					.then(function(){
						return LJ.chat.setupChatInview( channel_item );
						
					})
					.then(function(){
						LJ.chat.loaderifyChatInview( chat_id_all );
						LJ.chat.loaderifyChatInview( chat_id_team );
						return;
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

						var main_member_profile = _.find( members_profiles, function(m){ return m.facebook_id == main_member });
						var main_host_profile   = _.find( hosts_profiles, function(h){ return h.facebook_id == main_host });

						LJ.chat.cacheGroupProfiles( group_id, {
							hosts_profiles      : hosts_profiles,
							members_profiles    : members_profiles,
							main_host_profile   : main_host_profile,
							main_member_profile : main_member_profile
						});

						return LJ.chat.updateChatRowPicture( channel_item );
						
					})
					// Fetch the last chat messages (async)
					.then(function(){

						var chat_messages_all  = LJ.api.fetchChatHistory( chat_id_all );
						var chat_messages_team = LJ.api.fetchChatHistory( chat_id_team );

						return LJ.Promise.all([ chat_messages_all, chat_messages_team ])

					})
					// Add them to the DOM (sync)
					.then(function( res ){

						// Add messages to the all chat
						LJ.chat.cacheChatMessages( chat_id_all,  res[0].messages, res[0].readby, _.cloneDeep(channel_item) );
						LJ.chat.cacheChatMessages( chat_id_team, res[1].messages, res[1].readby, _.cloneDeep(channel_item) );
						// Order rows in the right position before moving the ui
						// Requires access to cached messages to work properly
						LJ.chat.sortChatRowsBySentAt();

						// Set all chats internal ui_status to "inactive";
						LJ.chat.deactivateChats();

						LJ.chat.addChatMessages({
							channel_item     : channel_item,
							chat_messages    : res[0].messages,
							chat_readby 	 : res[0].readby,
							chat_type	  	 : "all"
						});

						// Add messages to the team chat
						LJ.chat.addChatMessages({
							channel_item     : channel_item,
							chat_messages    : res[1].messages,
							chat_readby 	 : res[1].readby,
							chat_type	  	 : "team"
						});

						if( channel_item.role == "hosted" && channel_item.status == "pending" ){
							LJ.chat.validateifyChatInview( group_id, chat_id_all );
						}

						LJ.chat.setupChatInviewJsp( chat_id_all );
						LJ.chat.setupChatInviewJsp( chat_id_team );

						LJ.chat.deloaderifyChatRow( group_id );
						LJ.chat.deloaderifyChatInview( chat_id_all );
						LJ.chat.deloaderifyChatInview( chat_id_team );

						LJ.chat.updateChatRowFirstTime( group_id, role, status );

						return;

					})

					.catch(function( e ){
						LJ.wlog(e);

					});


		},
		updateChatRowFirstTime: function( group_id, role, status ){

			if( status == "pending" ){

				if( role == "hosted" ){
					LJ.chat.updateChatRow__Request( group_id );
				} else {
					LJ.chat.updateChatRow__Pending( group_id );
				}

			} else {
				LJ.chat.updateChatRow__Accepted( group_id );

			}

			LJ.chat.updateChatRowPreview__AuthorLast( group_id );
			LJ.chat.updateChatRowTime( group_id );
			LJ.chat.newifyChatRow( group_id );
			LJ.chat.refreshChatInviewBubbles( group_id );
			LJ.chat.refreshChatIconBubble();

		},
		fetchMoreChannels: function(){

			var fetched_group_ids = _.uniq( _.map( LJ.chat.fetched_chats, 'group_id' ) );
			return LJ.api.fetchMoreChannels( fetched_group_ids );

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
								return LJ.log('Cant fetch history, the chat is not set as ready');
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
			
			var group_id     = channel_item.group_id;
			var status       = channel_item.status;
			var role 		 = channel_item.role;
			var before_id    = channel_item.before_id;
			var requested_at = channel_item.requested_at
			var last_sent_at = channel_item.last_sent_at;
			var before       = LJ.before.findById( before_id );

			if( !before ){
				return LJ.wlog('Unable to find user before details (not fetched), before_id="' + before_id );
			}
			
			var html;
			if( status == "pending" ){

				if( role == "hosted" ){
					html = LJ.chat.renderChatRow__Hosting( group_id, requested_at );
				} else {
					html = LJ.chat.renderChatRow__Pending( group_id, requested_at );
				}

			} else {
				html = LJ.chat.renderChatRow__Accepted( group_id, requested_at );

			}

			LJ.chat.addChatRow( html, opts );
			// All chat empty are dynamically rendered and added each time there is a nav
			// between toggles so we can safely remove them when they need to.
			LJ.chat.clearChatRowEmpty();		
			LJ.chat.refreshChatRowsJsp();
			LJ.chat.loaderifyChatRow( group_id );
			LJ.chat.showChatRow( group_id );

		},
		setupChatInview: function( channel_item ){

			var group_id     = channel_item.group_id;
			var before_id    = channel_item.before_id;
			var status       = channel_item.status;

			// Use Pusher channels as frontend ids to target each chat when new message arrives
			var chat_id_all  = channel_item.channel_all;
			var chat_id_team = channel_item.channel_team;
				
			// Extract the data we need
			var before = LJ.before.findById( before_id );

			if( !before ){
				return LJ.wlog('Unable to find user before details (not fetched), before_id="' + before_id );
			}

			var place_name = before.address.place_name;
			var begins_at  = before.begins_at;

			var opts = {
				group_id     : group_id,
				before_id 	 : before_id,
				chat_id_all  : chat_id_all, 
				chat_id_team : chat_id_team,
				place_name   : place_name,
				begins_at    : begins_at

			};

			var html = LJ.chat.renderChatInview( opts );

			LJ.chat.addChatInview( html );
			LJ.chat.adjustChatInviewDimensions( group_id );


		},
		adjustChatInviewDimensions: function( group_id ){

			var $chat               = $('.chat');
			var $chat_inview        = $('.chat-inview[data-group-id="'+ group_id +'"]');
			
			var $chat_inview_header = $chat_inview.find('.chat-inview-header');
			var $chat_inview_footer = $chat_inview.find('.chat-inview-footer');

			$chat_inview.find('.chat-inview-messages').css({
				height: $chat.height() - ( $chat_inview_header.height() + $chat_inview_footer.height() )
			});


		},
		loaderifyChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			var $loader  = LJ.static.renderStaticImage("chat_loader");

			$chatrow.children().hide();
			$chatrow.append( $loader );

		},
		deloaderifyChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			var $loader  = $chatrow.find('.chat__loader');

			$chatrow.children().show();
			$loader.remove();

		},
		addChatInview: function( html ){

			$( html )
				.hide()
				.appendTo('.chat-inview-wrap');

		},
		sortChatRowsBySentAt: function(){

			var ordered_groups = [];

			var group_ids = _.uniq( _.map( LJ.chat.fetched_chats, 'group_id' ) );

			group_ids.forEach(function( group_id ){
				ordered_groups.push( LJ.chat.getLastUnseenMessageByGroupId( group_id ) );
			});

			// Clear the array
			ordered_groups.filter( Boolean );

			// Lowest order are displayed the highest, so sort by desc
			ordered_groups.sort(function( m1, m2 ){
				return moment( m2.sent_at ) - moment( m1.sent_at );
			});

			ordered_groups.forEach(function( m, i ){
				$('.chat-row[data-group-id="'+ m.group_id +'"]').css({ 'order': i });
			});

		},
		getLastUnseenMessageByGroupId: function( group_id ){

			var last_message_all  = LJ.chat.getChatByGroupId__All( group_id ).messages[0];
			var last_message_team = LJ.chat.getChatByGroupId__Team( group_id ).messages[0];

			if( !last_message_all && !last_message_team ){
				return {
					group_id : group_id,
					sent_at  : LJ.chat.getChatByGroupId__All( group_id ).last_sent_at
				};
			}

			if( last_message_all && !last_message_team ){
				return last_message_all;
			}

			if( last_message_team && !last_message_all ){
				return last_message_team;
			}

			// UI choice : messages that are not seen can go down messages that are seen
			// to allow users to have some kind of 'filter' behavior, if they dont want to
			// click on a message for some reason ^^

			if( last_message_all.state == "unseen" && last_message_team.state == "seen" ){
				// return last_message_all;
			}

			if( last_message_all.state == "seen" && last_message_team.state == "unseen" ){
				// return last_message_team;
			}

			// Both message have the same state, either "seen" or "unseen"
			if( moment( last_message_all.sent_at ) > moment( last_message_team.sent_at ) ){
				return last_message_all;
			} else {
				return last_message_team;
			}


		},
		addChatRow: function( html, opts ){
			
			var $h = $( html );
			$h.css({ opacity: 0 }); // jsp compliance

			if( opts.row_insert_mode == "bottom" ){
				$h.css({ 'order': $('.chat-rows').length + 1 }).appendTo('.chat-rows .jspPane');
			} else {
				$h.css({ 'order': '-1' }).prependTo('.chat-rows .jspPane');
			}

		},
		clearChatRowEmpty: function(){

			$('.chat-rows').find('.chat-empty').remove();

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
		showChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			$chatrow.css({ display: 'flex', opacity: 1 });

		},
		updateChatRowPicture: function( channel_item ){

			LJ.log('Updating chat row pictures..');

			var group_id     = channel_item.group_id;
			var group_object = LJ.chat.fetched_groups[ group_id ];

			var users        = channel_item.status == "hosting" ? group_object.members_profiles : group_object.hosts_profiles;
			
			// Render rosace
			var pictures = [];
			users.forEach(function( usr ){
				pictures.push({
					img_id: usr.img_id,
					img_vs: usr.img_vs
				});
			});

			// Insert rosace into the markup
			var pictures_html = LJ.pictures.makeRosaceHtml( pictures, 'chat-row' );
			$('.chat-row[data-group-id="'+ group_id +'"]')
				.find('.chat-row-pictures')
				.html( pictures_html );

			return;

		},
		addChatMessages: function( opts ){

			LJ.log('Adding chat messages...');

			var chat_type     = opts.chat_type;
			var chat_messages = opts.chat_messages;
			var chat_readby   = opts.chat_readby;
			var group_id 	  = opts.channel_item.group_id;
			var status        = opts.channel_item.status;
			var role 		  = opts.channel_item.role;

			var chat_id = (chat_type == "all") ? opts.channel_item.channel_all : opts.channel_item.channel_team;

			var main_member_profile = LJ.chat.fetched_groups[ group_id ].main_member_profile;
			var main_host_profile   = LJ.chat.fetched_groups[ group_id ].main_host_profile;

			var $wrap = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]').find('.chat-inview-messages');
			var html;

			// No chat messages to append, render the proper empty view based on status
			if( chat_messages.length == 0 ){

				if( chat_type == "team" ){

					var group_name = LJ.renderGroupName( LJ.user.name );
					html = LJ.chat.renderChatInview__TeamEmpty( group_name );

				} else {

					if( role == "hosted" ){

						var group_name = LJ.renderGroupName( main_member_profile.name );
						html = LJ.chat.renderChatInview__AcceptedEmpty( group_name );

					} else {

						if( status == "pending" ){

							$wrap.closest('.chat-inview-item').addClass('--pending');
							html = LJ.chat.renderChatInview__PendingEmpty();

						}
						if( status == "accepted" ){

							var group_name = LJ.renderGroupName( main_host_profile.name );
							html = LJ.chat.renderChatInview__AcceptedEmpty( group_name );

						}
					}
				}

				return $wrap.html( html );

			} else {

				chat_messages.forEach(function( message_object ){
					// Message_object contains chat_id, message, sender_id, sent_at and group_id
					// Generate a local call_id to allow merge, horodate fn etc to properly work
					LJ.chat.addChatLine( message_object, LJ.generateId(), { insert_mode: "prepend" });

				});


			}


		},
		handleShowChatInview: function(){

			var $s       = $(this);
			var group_id = $s.attr('data-group-id');

			LJ.chat.showChatInview( group_id );
			LJ.chat.deNewifyChatRow( group_id );
			LJ.chat.sortChatRowsBySentAt();

		},
		handleToggleChatWrap: function( e ){

			e.preventDefault();
			var $s = $(this);

			$s.toggleClass('--active');
			LJ.chat.toggleChatWrap();

		},
		toggleChatWrap: function(){

			if( LJ.chat.state == 'hidden' ){
				LJ.chat.showChatWrap();

			} else {
				LJ.chat.hideChatWrap();

			}

		},
		showChatWrap: function(){
			
			LJ.chat.state = 'visible';

			var $c = $('.chat');
			var d  = LJ.search.filters_duration;

			LJ.ui.shradeAndStagger( $c, {
				duration: d
			});

			LJ.chat.refreshChatRowsJsp();
			

		},
		hideChatWrap: function(){

			LJ.chat.state = 'hidden';
			$('.app__menu-item.--chats').removeClass('--active');

			var $c  = $('.chat');
			var $cc = $c.children();
			var d   = LJ.search.filters_duration;

			[ $cc, $c ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				});
			});

		},
		handleChatNavigate: function(){
			
			var $s     = $(this);
			var target = $s.attr('data-link');

			LJ.chat.navigate( target );

		},
		navigate: function( target ){

			if( ['all','hosted','requested'].indexOf( target ) == -1 ){
				return LJ.wlog('Cannot navigate to other chat, invalid target : ' + target );
			}

			var $tar = $('.chat').find('.segment__part[data-link="'+ target +'"]');
			var $cur = $('.chat').find('.segment__part.--active');

			if( $tar.is( $cur ) ){
				return;
			}

			$cur.removeClass('--active');
			$tar.addClass('--active');

			var $targets_to_show;
			if( target == "all" ){
				$targets_to_show = $('.chat-row');

			} else {
				$targets_to_show = $('.chat-row[data-link="'+ target +'"]');

			}

			var $targets_to_hide = $('.chat-row').not( $targets_to_show );
			$targets_to_hide.hide();
			$('.chat-rows').find('.chat-empty').remove();

			if( $targets_to_show.length == 0 ){
				LJ.chat.addChatRowEmptyViews();

			} else {
				$targets_to_show.css({ display: 'flex' });

			}

			LJ.chat.refreshChatRowsJsp();

		},
		addChatRowEmptyViews: function(){

			var target = $('.chat').find('.segment__part.--active').attr('data-link');

			if( target == "all" ){
				$('.chat-rows').find('.jspPane').append( LJ.chat.renderChatRow__AllEmpty() );
			}

			if( target == "hosted" ){
				$('.chat-rows').find('.jspPane').append( LJ.chat.renderChatRow__HostedEmpty() );
			}

			if( target == "requested" ){
				$('.chat-rows').find('.jspPane').append( LJ.chat.renderChatRow__RequestedEmpty() );
			}

			return LJ.chat.refreshChatRowsJsp();


		},	
		renderChatRow__AllEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	 : 'all',
				subtitle : '<span data-lid="chat_empty_subtitle_all"></span>'
			});

		},
		renderChatRow__HostedEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	 : 'hosted',
				subtitle : '<span data-lid="chat_empty_subtitle_hosted"></span>'
			});
			
		},
		renderChatRow__RequestedEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type     : 'requested',
				subtitle : '<span data-lid="chat_empty_subtitle_requested"></span>'
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
		updateChatRowPreview__AuthorLast: function( group_id ){

			var $w = $('.chat-inview[data-group-id="'+ group_id +'"]');

			var last_message_all  = LJ.chat.getChatByGroupId__All( group_id ).messages[0];
			var last_message_team = LJ.chat.getChatByGroupId__Team( group_id ).messages[0];

			if( !last_message_all && !last_message_team ){
				return LJ.log('No chat messages fetched, not updating the chat row');
			}

			var sent_at_all  = last_message_all && moment( last_message_all.sent_at );
			var sent_at_team = last_message_team && moment( last_message_team.sent_at );

			if( !sent_at_team || sent_at_all > sent_at_team ){
				var sender_id = last_message_all.sender_id;
				var message   = last_message_all.message;

			} else {
				var sender_id = last_message_team.sender_id;
				var message   = last_message_team.message;
			}

			var sender  = LJ.chat.findChatSender( group_id, sender_id );

			LJ.chat.updateChatRowPreview( group_id, {
				h1: sender.name,
				h2: message
			});

		},
		updateChatRowPreview__Author: function( opts ){

			var message     = opts.message;
			var sender      = opts.sender;
			var group_id    = opts.group_id;

			LJ.chat.updateChatRowPreview( group_id, {
				h1: sender.name,
				h2: message
			});

		},
		updateChatRowPreview: function( group_id, opts ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');

			$chatrow.find('.chat-row-infos__name .--name').text( opts.h1 );
			$chatrow.find('.chat-row-infos__preview').text( opts.h2 );

		},
		updateChatRowTime: function( group_id ){

			var $w = $('.chat-row[data-group-id="'+ group_id +'"]');

			var last_message_all  = LJ.chat.getChatByGroupId__All( group_id ).messages[0];
			var last_message_team = LJ.chat.getChatByGroupId__Team( group_id ).messages[0];

			if( !last_message_all && !last_message_team  ){
				return LJ.log('No chat messages fetched, not updating the chat row');
			}

			var sent_at_all  = last_message_all && moment( last_message_all.sent_at );
			var sent_at_team = last_message_team && moment( last_message_team.sent_at );

			if( !sent_at_team || sent_at_all > sent_at_team ){
				var sent_at = last_message_all.sent_at;
			} else {
				var sent_at = last_message_team.sent_at;
			}

			var s_date = LJ.text("chatrow_date", moment( sent_at ) );
			$w.find('.chat-row-time span').text( s_date );

		},
		newifyChatRow: function( group_id){

			var $r = $('.chat-row[data-group-id="'+ group_id +'"]');
			$r.addClass('--new');				

		},
		deNewifyChatRow: function( group_id ){

			var $r = $('.chat-row[data-group-id="'+ group_id +'"]');
			$r.removeClass('--new');

		},
		updateChatRow__Pending: function( group_id ){

			LJ.chat.updateChatRowPreview( group_id, {
				h1: LJ.text("chat_row_request_pending_title"),
				h2: LJ.text("chat_row_request_pending_subtitle")
			});

		},
		updateChatRow__Accepted: function( group_id ){

			LJ.chat.updateChatRowPreview( group_id, {
				h1: LJ.text("chat_row_request_accepted_title"),
				h2: LJ.text("chat_row_request_accepted_subtitle")
			});

		},
		updateChatRow__Request: function( group_id ){

			var name         = LJ.chat.fetched_groups[ group_id ].main_member_profile.name;
			var group_name   = LJ.renderGroupName( name );

			LJ.chat.updateChatRowPreview( group_id, {
				h1: LJ.text("chat_row_request_participation_title"),
				h2: LJ.text("chat_row_request_participation_subtitle", group_name )
			});

		},
		renderChatRowStatus__Hosting: function(){

			return LJ.chat.renderChatRowStatus({
				icon_html: '<i class="icon icon-drinks"></i>'
			});
		},
		renderChatRowStatus__Pending: function(){

			return LJ.chat.renderChatRowStatus({
				icon_html: '<i class="icon icon-pending"></i>'
			});
		},
		renderChatRowStatus__Accepted: function(){

			return LJ.chat.renderChatRowStatus({
				icon_html: '<i class="icon icon-chat-bubble-duo"></i>'
			});
		},
		renderChatRowStatus: function( opts ){

			return LJ.ui.render([

				'<div class="chat-row__status --round-icon">',
					opts.icon_html,
				'</div>'

			].join(''));

		},
		// Legacy function! (18/05/16)
		renderChatRowDate: function( date, opts ){

			var m  = moment( date );
			var DD = m.format('DD');
			var MM = LJ.text("month")[ m.month() ].slice(0,3);
			var HH = m.format('HH:mm');

			return LJ.ui.render([

				'<div class="chat-row-date">',
		            '<div class="chat-row-date__status">',
		              opts.icon_html,
		            '</div>',
		            '<div class="chat-row-date__day">',
		              '<span class="--day">'+ DD +'</span> <span class="--month">'+ MM +'</span>',
		            '</div>',
		            '<div class="chat-row-date__splitter"></div>',
		            '<div class="chat-row-date__hour">',
		              '<span class="--hour">'+ HH +'</span>',
		            '</div>',
		         '</div>'

			].join(''));

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
		renderChatRowTime__Placeholder: function( requested_at ){

			var m = LJ.text("chatrow_date", moment( requested_at ) );

			return LJ.ui.render([

				'<div class="chat-row-time">',
					'<span>'+ m +'</span>',
				'</div>'

			].join(''));

		},
		renderChatRow__Hosting: function( group_id, requested_at ){

			return LJ.chat.renderChatRow( group_id, {
				status_html  : LJ.chat.renderChatRowStatus__Hosting(),
				link_html    : 'data-link="hosted"',
				requested_at : requested_at
			});

		},
		renderChatRow__Pending: function( group_id, requested_at ){

			return LJ.chat.renderChatRow( group_id, {
				status       : "pending",
				status_html  : LJ.chat.renderChatRowStatus__Pending(),
				link_html    : 'data-link="requested"',
				requested_at : requested_at
			});

		},
		renderChatRow__Accepted: function( group_id, requested_at ){

			return LJ.chat.renderChatRow( group_id, {
				status_html  : LJ.chat.renderChatRowStatus__Accepted(),
				link_html    : 'data-link="requested"',
				requested_at : requested_at
			});

		},
		renderChatRow: function( group_id, opts ){

			opts = opts || {};

			var data_link    = opts.link_html;
			var status_html  = opts.status_html;
			var requested_at = opts.requested_at; 
			var status 		 = opts.status ? '--' + opts.status : '';
			var newified     = moment( requested_at ) > moment().subtract(1,'hour') ? '--new' : '';

			var infos_html = LJ.chat.renderChatRowInfos__Placeholder();
			var time_html  = LJ.chat.renderChatRowTime__Placeholder( requested_at );
			var pics_html  = LJ.chat.renderChatRowPictures__Placeholder();



			return LJ.ui.render([

				'<div class="chat-row'+' '+ status +' '+ newified +'"'+ data_link +' data-group-id="'+ group_id +'">',
					status_html,
					pics_html,
					infos_html,
					time_html,
				'</div>'

			].join(''));


		},
		acceptifyChatRow: function( group_id ){

			var $g = $('.chat-row[data-group-id="'+ group_id +'"]');
			var new_icon_html = LJ.chat.renderChatRowStatus__Accepted();

			$g.removeClass('--pending');
			$g.find('.chat-row__status').replaceWith( new_icon_html );
			LJ.chat.updateChatRow__Accepted( group_id );

		}



	});