
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

			LJ.log('Push event received, data : ');
			LJ.log( data );

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

					LJ.delay(6000).then(function(){
						LJ.ui.hideSlide({ type: 'before' });
					});

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

			LJ.log('Subscribing to before channel : ' + channel_name );
			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		  , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new request host'  , LJ.realtime.handleNewRequestHost );
			LJ.realtime.channels[ channel_name ].bind('new before status' , LJ.realtime.handleNewBeforeStatusHosts );

		},
		handleNewRequestHost: function( data ){

			LJ.log('Push event received, data : ');
			LJ.log( data );


		},
		handleNewBeforeStatusHosts: function( data ){

			LJ.log('Push event received, data : ');
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

			

		},
		subscribeToChatChannel: function( channel_name ){


			
		}

	});