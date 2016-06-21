
	window.LJ.realtime = _.merge( window.LJ.realtime || {}, {

		state    : null,
		pusher   : {},
		channels : {},

		init: function(){

			LJ.realtime.setupRealtimeService();

			LJ.realtime.subscribeToPrivateChannel();
			LJ.realtime.subscribeToLocationChannel();
			LJ.realtime.subscribeToBeforeChannels();
			LJ.realtime.subscribeToChatChannels();

			return;

		},
		getUserChannels: function( channel_type ){

			var channels = _.filter( LJ.user.channels, function( chan ){
				return chan.type == channel_type;
			});

			return _.map( channels, 'name' );

		},
		setupRealtimeService: function(){

			if( !LJ.app_token ){
				return LJ.wlog('Cannot init realtime services without a valid app_token: ' + LJ.app_token );
			}

			 LJ.realtime.pusher = new Pusher( window.pusher_app_id, {
                encrypted: true,
                // The route to be called everytime the subscrib() method is called
                authEndpoint: '/auth/pusher',
                auth: {
                    headers: {
                        "x-access-token": LJ.app_token
                    } // @48723
                }
            });

            LJ.realtime.state = "idle";
            LJ.realtime.pusher.connection.bind('state_change', function( states ) {

            	var current_state = states.current;
                LJ.ilog('Pusher state is now: ' + current_state );

                // Reconnexion cases 
                if( LJ.realtime.state == 'connected' ){

                	if( current_state == 'connecting' ){
                		LJ.ui.handleReconnection();

                	}
                	if( current_state == 'connected' ){
                		LJ.ui.reconnectUser();

                	}

                } else {
                	LJ.realtime.state = current_state;

                }
                

            });

		},
		getSocketId: function(){
			return LJ.realtime.pusher.connection ? LJ.realtime.pusher.connection.socket_id : null;

		},
		// Subscribe to private events
		// main usage is to keep track of user's online status via a webhook
		subscribeToPrivateChannel: function(){

			LJ.log('Subscribing to personnal channel');
			LJ.realtime.channels.personnal = LJ.realtime.pusher.subscribe( LJ.realtime.getUserChannels("personnal")[0] );
			
			LJ.realtime.channels.personnal.bind('new hello'		 	 	 , LJ.log ); // Test channel
			LJ.realtime.channels.personnal.bind('new before hosts'   	 , LJ.realtime.handleNewMarkedAsHost );
			LJ.realtime.channels.personnal.bind('new request group'  	 , LJ.realtime.handleNewRequestGroup );


		},
		handleNewMarkedAsHost: function( data ){

			LJ.log('Push event received, data : ');
			LJ.log( data );

			var before_item  = data.before_item;
			var channel_name = data.channel_name;
			var before       = data.before;

			// Ui update
			var friend_name = LJ.friends.getFriendsProfiles( before.main_host )[0].name;
			LJ.ui.showToast( LJ.text('to_before_create_success_friends').replace('%name', friend_name ));

			// Update user state and add marker accordingly
			LJ.user.befores.push( before_item );
			LJ.map.addBeforeMarker( before );

			// Update before state and refresh browserdates accordingly
			LJ.before.fetched_befores.push( before );
			LJ.before.refreshBrowserDates();

			// Join the hosts channel 
			LJ.realtime.subscribeToBeforeChannel( channel_name );

		},
		handleNewRequestGroup: function( data ){

			LJ.log('A friend requested to participate in a before with you!');
			
			var before_item  = data.before_item;
			var before       = data.before;
			var channel_item = data.channel_item;
			var notification = data.notification;

			LJ.ui.showToast( LJ.text('to_before_request_success_friend') );
			LJ.user.befores.push( before_item );
			LJ.before.pendifyBeforeInview( before._id );
			LJ.before.pendifyBeforeMarker( before._id );
			LJ.user.channels.push( channel_item );
			LJ.realtime.subscribeToChatChannel( channel_item.channel_all );
			LJ.realtime.subscribeToChatChannel( channel_item.channel_team );
			LJ.chat.addAndFetchOneChat( channel_item, {
				"row_insert_mode": "top"
			});

		},
		// Subcribe to events about a specific geo area 
		//to get pushed realtime notifications about newly created events
		subscribeToLocationChannel: function(){

			LJ.log('Subscribing to location channel');
			LJ.realtime.channels.location = LJ.realtime.pusher.subscribe( LJ.realtime.getUserChannels("location")[0] );

			LJ.realtime.channels.location.bind('new hello'		   , LJ.log ); // Test channel
			LJ.realtime.channels.location.bind('new before' 	   , LJ.realtime.handleNewBefore );
			LJ.realtime.channels.location.bind('new before status' , LJ.realtime.handleNewBeforeStatus );

		},
		handleNewBefore: function( data ){

			var before = data.before;

			// Host are notified via their personnal channel, they need to access different data 
			if( before.hosts.indexOf( LJ.user.facebook_id ) != -1 ){
				return;
			}

			LJ.ui.showToast("Un nouveau before vient d'être créé", 10000 );

			LJ.map.addBeforeMarker( before );
			LJ.before.fetched_befores.push( before );
			LJ.before.refreshBrowserDates();

		},
		handleNewBeforeStatus: function( data ){

			LJ.log('Push event received, data : ');
			LJ.log( data );

			var before_id = data.before_id;
			var status 	  = data.status;
			var hosts 	  = data.hosts;

			if( status == "canceled" ){

				LJ.map.removeBeforeMarker( before_id );
				LJ.before.removeOneBefore( before_id );
				LJ.before.refreshBrowserDates();

				// If the user is viewing the before, take control of his ui and notify before is gone
				var $be = $('.be-inview[data-before-id="'+ before_id +'"]');
				if( $be.length > 0 ){

					LJ.ui.hideModal();
					LJ.ui.showSlideOverlay( LJ.ui.render([
						'<div class="be-inview__deleted-warning">',
							'<span data-lid="before_just_canceled"></span>',
						'</div>'
					].join('')) );

					LJ.delay( 6000).then(function(){
						LJ.ui.hideSlide({ type: 'before' });
					});

				}

				// Do the same pattern for the chatinview
				//var $ch = $('.chat-inview[data-chat-id="'+ chat_id +'"]') 
			}


		},
		// Subscribe to channels for *hosts only*
		// to get pushed anytime a group request a participation
		subscribeToBeforeChannels: function(){

			var before_channels = _.filter( LJ.user.channels, function( chan ){
				return chan.type == "before";
			});

			before_channels.forEach(function( chan ){
				LJ.realtime.subscribeToBeforeChannel( chan.name );
			});

		},
		subscribeToBeforeChannel: function( channel_name ){

			// LJ.log('Subscribing to before channel : ' + channel_name );
			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		  , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new request host'  , LJ.realtime.handleNewRequestHost );
			LJ.realtime.channels[ channel_name ].bind('new before status' , LJ.realtime.handleNewBeforeStatusHosts );

		},
		handleNewRequestHost: function( data ){

			LJ.log( data );
			// LJ.log('Someone requested to participate in your before');
			
			var before       = data.before;
			var channel_item = data.channel_item;
			var notification = data.notification;

			LJ.ui.showToast( LJ.text('to_before_request_success_host') );
			LJ.user.channels.push( channel_item );
			LJ.realtime.subscribeToChatChannel( channel_item.channel_all );
			LJ.realtime.subscribeToChatChannel( channel_item.channel_team );
			LJ.chat.addAndFetchOneChat( channel_item, {
				"row_insert_mode": "top"
			});


		},
		handleNewBeforeStatusHosts: function( data ){

			// LJ.log('Push event received, data : ');
			LJ.log( data );

			var before_id   = data.before_id;
			var hosts 	    = data.hosts;
			var status 	    = data.status;
			var requester   = data.requester;

			var friend_name = LJ.friends.getFriendsProfiles( requester )[0].name;

			if( status == "canceled" ){
				LJ.ui.showToast( LJ.text('to_friend_canceled_event').replace( '%name', friend_name ) );

			}

		},
		// Subscribe to specific chat channels for hosts & requesters.
		// There are 2 chat channels per event.
		subscribeToChatChannels: function( channels ){

			var chat_channels = _.filter( LJ.user.channels, function( chan ){
				return chan.type == "chat";
			});

			chat_channels.forEach(function( chan ){
				LJ.realtime.subscribeToChatChannel( chan.channel_all );
				LJ.realtime.subscribeToChatChannel( chan.channel_team );
			});

		},
		subscribeToChatChannel: function( channel_name ){

			// LJ.log('Subscribing to chat channel : ' + channel_name );
			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		  , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new group status'  , LJ.realtime.handleNewGroupStatus );
			LJ.realtime.channels[ channel_name ].bind('new chat message'  , LJ.realtime.handleNewChatMessage );
			LJ.realtime.channels[ channel_name ].bind('new chat seen by'  , LJ.realtime.handleNewChatSeenBy );
			
		},
		handleNewGroupStatus: function( data ){

			var before_id = data.before_id;
			var chat_id   = data.chat_id;
			var group_id  = data.group_id;
			var status    = data.status; 

			var channel_item = _.find( LJ.user.channels, function( chan ){
				return chan.before_id = before_id;
			});

			var before_item = _.find( LJ.user.befores, function( bfr ){
				return bfr.before_id == before_id;
			});
			// Reset the seen_at property, so that all the 'refresh functions' detect something happen
			// and can newify the chatrow immediately, except for those who have not the view set as active
			if( LJ.chat.getActiveChatId() != chat_id ){
				before_item.seen_at = null;
			} else {
				LJ.chat.updateBeforeSeenAt( before_id );
			}

			if( status == "accepted" ){

				var role = channel_item.role;

				if( role == "hosted" ){
					LJ.chat.devalidateifyChatInview( chat_id );

				} else {
					LJ.chat.acceptifyChatInview( group_id, chat_id );
				}

				LJ.chat.acceptifyChatRow( group_id );
				LJ.chat.addBubbleToChatIcon();
				LJ.chat.addBubbleToChatRow( group_id );
				LJ.chat.newifyChatRows();

			}

		},
		handleNewChatMessage: function( data ){

			// LJ.log('Adding chatline ');

			var call_id   = data.call_id;
			var group_id  = data.group_id;
			var sent_at   = data.sent_at;
			var chat_id   = data.chat_id;
			var message   = data.message;
			var sender_id = data.sender_id;

			var chat = LJ.chat.getChatById( chat_id );

			if( !chat ){

				LJ.wlog('New message received for a chat that wasnt fetched. Fetching first...');
				LJ.wlog('Not implemented yet! Construct the channel item, then fetch chat');
				return LJ.chat.addAndFetchOneChat( channel_item, {
					row_insert_mode: "top"
				})
				.then(function(){
					// Recall itself after the chat has been fetched
					LJ.chat.handleNewChatMessage( data );

				});
			}

			// Update the state. If the chat is active, then message is obviously seen by default
			// otherwise, it's considered unseen. 
			var state = LJ.chat.getActiveChatId() == chat_id ? "seen" : "unseen";
			LJ.chat.cacheChatMessage( chat_id, _.extend( data, {
				state: state
			}));

			// Local variation regarding the inview ui of the chatline
			if( sender_id == LJ.user.facebook_id ){
				LJ.chat.dependifyChatLine( call_id );
			} else {
				LJ.chat.addChatLine( data, call_id );
			}

			// In anycase take actions that are all based on the chat state
			LJ.chat.refreshChatRowPreview( group_id );
			LJ.chat.refreshChatRowTime( group_id );
			LJ.chat.refreshChatRowsOrder();
			LJ.chat.refreshChatInviewBubbles( group_id );
			LJ.chat.refreshChatIconBubble();
			LJ.chat.refreshChatSeenBy( chat_id );
			LJ.chat.newifyChatRows();


		},
		handleNewChatSeenBy: function( data ){

			var chat_id = data.chat_id;
			var seen_by = data.seen_by;

			LJ.log('New message seen by : ' + seen_by );
			LJ.chat.getLastChatMessage( chat_id ).seen_by.push( seen_by );
			LJ.chat.refreshChatSeenBy( chat_id );

		}

	});