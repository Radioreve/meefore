
	window.LJ.realtime = _.merge( window.LJ.realtime || {}, {

		state    : null,
		pusher   : {},
		channels : {},

		init: function(){

			LJ.realtime.setupRealtimeService();
			LJ.realtime.subscribeToAllChannels();
			return;

		},
		getUserChannels: function( channel_type ){

			var channels = _.filter( LJ.user.channels, function( chan ){
				return chan.type == channel_type;
			});

			return _.map( channels, 'name' );

		},
		hasSubscribed: function( channel_name ){

			return LJ.realtime.channels[ channel_name ];

		},
		addNotification: function( data ){

			if( !data.notification ) return;

			if( data.requester && data.requester == LJ.user.facebook_id ) {

				// ALmost all notifications are not added in user profile of the requester, except a few ones
				//	- 'accepted_in_hosts' -> requester receives it too because everyone likes to see "New match!"
				var n_type = data.notification_type;
				if( [ "accepted_in_hosts" ].indexOf( n_type ) == -1 ){
					return;
				}

			}

			LJ.notifications.cacheNotification( data.notification );
			LJ.notifications.fetchUsersProfiles()
				.then(function( res ){
					var users = _.filter( _.map( res, 'user' ), Boolean );
					LJ.notifications.cacheUsers( users );
					LJ.notifications.refreshNotifications();

				});

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
		subscribeToAllChannels: function(){

			LJ.realtime.subscribeToPrivateChannel();
			LJ.realtime.subscribeToLocationChannel();
			LJ.realtime.subscribeToBeforeChannels();
			LJ.realtime.subscribeToChatChannels();

		},
		getSocketId: function(){
			return LJ.realtime.pusher.connection ? LJ.realtime.pusher.connection.socket_id : null;

		},
		// Subscribe to private events
		// main usage is to keep track of user's online status via a webhook
		subscribeToPrivateChannel: function(){

			var channel_name = LJ.realtime.getUserChannels("personnal")[0];

			if( LJ.realtime.hasSubscribed( "personnal" ) ) return;

			LJ.log('Subscribing to personnal channel');
			LJ.realtime.channels.personnal = LJ.realtime.pusher.subscribe( channel_name );
			
			LJ.realtime.channels.personnal.bind('new hello'		 	 	    , LJ.log ); // Test channel
			LJ.realtime.channels.personnal.bind('new before hosts'   	    , LJ.realtime.handleNewMarkedAsHost );
			LJ.realtime.channels.personnal.bind('new request group'  	    , LJ.realtime.handleNewRequestGroup );
			LJ.realtime.channels.personnal.bind('new before status members' , LJ.realtime.handleNewBeforeStatusMembers );


		},
		handleNewMarkedAsHost: function( data ){

			LJ.log('Push event received, data : ');
			LJ.log( data );

			var before      = data.before;
			var before_item = data.before_item;

			var channel_item_before = data.channel_item_before;
			var channel_item_team   = data.channel_item_team;

			// Update user state and add marker accordingly
			LJ.user.befores.push( before_item );

			// Cache new channels
			LJ.user.channels.push( channel_item_before );
			LJ.user.channels.push( channel_item_team );

			// Refresh all channels subscriptions
			LJ.realtime.subscribeToAllChannels();
			LJ.chat.fetchAndAddOneChat( channel_item_team );

			// Add notification in real time
			LJ.realtime.addNotification( data );

			// Little toast to show for everyone but the main_host
			if( before.main_host != LJ.user.facebook_id ){

				var friend_name = LJ.friends.getFriendsProfiles( before.main_host )[0].name;
				LJ.ui.showToast( LJ.text('to_before_create_success_friends').replace('%name', friend_name ));

			} else {

				LJ.map.refreshMarkers();
				LJ.ui.showToast( LJ.text('to_before_create_success') );

			}

			LJ.map.refreshMarkers();

		},
		handleNewRequestGroup: function( data ){

			LJ.log(data);
			
			if( data.group.main_member != LJ.user.facebook_id ){

				LJ.log('A friend requested to participate in a before with you!');
				LJ.ui.showToast( LJ.text('to_cheers_sent_success_friend') );

			} else {

				LJ.ui.showToast( LJ.text('to_cheers_sent_success') );

			}

			LJ.user.befores.push( data.before_item );
			// LJ.cheers.fetched_cheers.push( data.cheers_item );
			// LJ.cheers.refreshCheersItems();
			LJ.user.channels.push( data.channel_item_team );

			// ---> Replace that with more global refresh functions (refreshMarkers and refreshBeforeInview)
			LJ.before.pendifyBeforeInview( data.before_id );
			LJ.before.pendifyBeforeMarker( data.before_id );

			LJ.realtime.subscribeToAllChannels();

			LJ.chat.fetchAndAddOneChat( data.channel_item_team, {
				"row_insert_mode": "top"
			});

			// Add notification in real time
			// LJ.realtime.addNotification( data );

		},
		handleNewBeforeStatusMembers: function( data ){

			var hosts     = data.hosts;
			var status    = data.status;
			var before_id = data._id;

			// Force a resync of all the chats with updated server values
			LJ.chat.resyncAllChats();

		},
		// Subcribe to events about a specific geo area 
		//to get pushed realtime notifications about newly created events
		subscribeToLocationChannel: function(){

			var channel_name =  LJ.realtime.getUserChannels("location")[0];

			if( LJ.realtime.hasSubscribed( "location" ) ) return;

			LJ.log('Subscribing to location channel');
			LJ.realtime.channels.location = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels.location.bind('new hello'		   , LJ.log ); // Test channel
			LJ.realtime.channels.location.bind('new before' 	   , LJ.realtime.handleNewBefore );
			LJ.realtime.channels.location.bind('new before status' , LJ.realtime.handleNewBeforeStatus );

		},
		handleNewBefore: function( data ){

			var before = data.before;

			LJ.before.fetched_befores.push( before );
			LJ.before.refreshBrowserDates();
			LJ.map.addBeforeMarker( before );
			LJ.map.refreshMarkers();
		
		},
		handleNewBeforeStatus: function( data ){

			LJ.log('Push event received, data : ');
			LJ.log( data );

			var before_id = data.before_id;
			var status 	  = data.status;
			var hosts 	  = data.hosts;

			if( status == "canceled" ){

				LJ.map.removeBeforeMarker( before_id );
				LJ.before.removeFetchedBefore( before_id );
				LJ.before.removeBeforeItem( before_id );
				LJ.before.refreshBrowserDates();

				// If the user is viewing the before, take control of his ui and notify before is gone
				var $be = $('.be-inview[data-before-id="'+ before_id +'"]');
				if( $be.length > 0 ){

					LJ.ui.hideModal();
					LJ.before.cancelifyBeforeInview();

				}

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
			if( LJ.realtime.hasSubscribed( channel_name ) ) return;

			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		  	   , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new request host'  	   , LJ.realtime.handleNewRequestHost );
			LJ.realtime.channels[ channel_name ].bind('new before status host' , LJ.realtime.handleNewBeforeStatusHosts );

		},
		handleNewRequestHost: function( data ){

			LJ.log( data );
			// LJ.log('Someone requested to participate in your before');

			LJ.ui.showToast( LJ.text('to_cheers_received_success') );
			LJ.cheers.fetched_cheers.push( data.cheers_item );
			LJ.cheers.refreshCheersItems();

			// Add notification in real time
			LJ.realtime.addNotification( data );


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

			// Add notification in real time
			LJ.realtime.addNotification( data );

		},
		// Subscribe to specific chat channels for hosts & requesters.
		// There are 2 chat channels per event.
		subscribeToChatChannels: function( channels ){

			var chat_channels = _.filter( LJ.user.channels, function( chan ){
				return /chat/i.test( chan.type );
			});

			chat_channels.forEach(function( chan ){
				LJ.realtime.subscribeToChatChannel( chan.name );
			});

		},
		subscribeToChatChannel: function( channel_name ){

			// LJ.log('Subscribing to chat channel : ' + channel_name );
			if( LJ.realtime.hasSubscribed( channel_name ) ) return;

			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		        , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new group status hosts'  , LJ.realtime.handleNewGroupStatusHosts );
			LJ.realtime.channels[ channel_name ].bind('new group status users'  , LJ.realtime.handleNewGroupStatusUsers );
			LJ.realtime.channels[ channel_name ].bind('new chat message'        , LJ.realtime.handleNewChatMessage );
			LJ.realtime.channels[ channel_name ].bind('new chat seen by'        , LJ.realtime.handleNewChatSeenBy );
			
		},
		handleNewGroupStatusHosts: function( data ){

			LJ.log( data );

			var sender_id    = data.sender_id;
			var before_id    = data.before_id;
			var cheers_id    = data.cheers_id;
			var channel_item = data.channel_item;
			var status 	     = data.status;
			var n_hosts 	 = data.n_hosts;

			if( status != "accepted" ){
				return LJ.wlog('Status != "accepted", not implemented yet');
			}

			// Refresh all channels subscriptions
			LJ.user.channels.push( channel_item );
			LJ.realtime.subscribeToAllChannels();

			// Add the new chat for people to get to know each otha :)
			LJ.chat.fetchAndAddOneChat( channel_item )
				.then(function(){

					LJ.ui.showToast( LJ.text("to_group_accepted_hosts") );

					// Smooth ui transition to terminate the cheers back process
					try {
						LJ.cheers.acceptifyCheersItem( channel_item.chat_id );						
					} catch( e ){}
					

					// Update the cheers
					LJ.cheers.updateCheersItem( cheers_id, { status: status });
					LJ.cheers.acceptifyCheersRow( cheers_id );

					// Add notification in real time
					LJ.realtime.addNotification( data );

				});

		},
		handleNewGroupStatusUsers: function( data ){

			LJ.log( data );

			var sender_id    = data.sender_id;
			var before_id    = data.before_id;
			var cheers_id    = data.cheers_id;
			var channel_item = data.channel_item;
			var status 	     = data.status;
			var n_users 	 = data.n_users;

			if( status != "accepted" ){
				return LJ.wlog('Status != "accepted", not implemented yet');
			}

			// Refresh all channels subscriptions
			LJ.user.channels.push( channel_item );
			LJ.realtime.subscribeToAllChannels();

			// Add the new chat for people to get to know each otha :)
			LJ.chat.fetchAndAddOneChat( channel_item )
				.then(function(){

					LJ.ui.showToast( LJ.text("to_group_accepted_users") );

					// Update the cheer_item
					LJ.cheers.updateCheersItem( cheers_id, { "status": status });
					LJ.before.updateBeforeItem( before_id, { "status": status });
					
					LJ.cheers.acceptifyCheersRow( cheers_id );
					LJ.before.acceptifyBeforeMarker( before_id );
					LJ.chat.acceptifyChatInview( before_id );

					// Add notification in real time
					LJ.realtime.addNotification( data );

				});

		},	
		handleNewChatMessage: function( data ){

			// LJ.log('Adding chatline ');

			var chat_id   = data.chat_id;
			var message   = data.message;
			var sender_id = data.sender_id;
			var call_id   = data.call_id;
			var sent_at   = data.sent_at;
			var seen_by   = data.seen_by;

			var chat = LJ.chat.getChat( chat_id );

			if( !chat ){

				LJ.wlog('New message received for a chat that wasnt fetched. Fetching first...');
				LJ.wlog('Not implemented yet! Construct the channel item, then fetch chat');
				return LJ.chat.fetchAndAddOneChat( channel_item, {
					row_insert_mode: "top"
				})
				.then(function(){
					// Recall itself after the chat has been fetched
					LJ.chat.handleNewChatMessage( data );

				});
			}

			LJ.chat.cacheChatMessage( chat_id, data );

			if( LJ.chat.getActiveChatId() == chat_id ){
				LJ.chat.sendSeenByProxy( chat_id );
				LJ.chat.seenifyChatInview( chat_id, LJ.user.facebook_id );

			}

			// Local variation regarding the inview ui of the chatline
			sender_id == LJ.user.facebook_id ? LJ.chat.dependifyChatLine( call_id ) : LJ.chat.addChatLine( data );

			LJ.chat.refreshChatState( chat_id );

		},
		handleNewChatSeenBy: function( data ){

			var chat_id = data.chat_id;
			var seen_by = data.seen_by;

			LJ.log('New message seen by : ' + seen_by );
			LJ.chat.seenifyChatInview( chat_id, seen_by );
			LJ.chat.refreshChatSeenBy( chat_id );

		}

	});