
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

			LJ.realtime.channels.personnal = LJ.realtime.pusher.subscribe( LJ.realtime.getUserChannels("personnal")[0] );
			
			LJ.realtime.channels.personnal.bind('new hello'		 	 , LJ.log ); // Test channel
			LJ.realtime.channels.personnal.bind('new request group'  , LJ.realtime.handleNewRequestGroup );
			LJ.realtime.channels.personnal.bind('new chat whisper'   , LJ.realtime.handleNewChatWhisper );


		},
		handleNewRequestGroup: function( data ){

			LJ.log('Your friend added you in an event');
			LJ.log(data);

		},
		handleNewChatWhisper: function( data ){

			LJ.wlog('This feature is not implemented yet');

		},
		// Subcribe to events about a specific geo area 
		//to get pushed realtime notifications about newly created events
		subscribeToLocationChannel: function(){

			LJ.realtime.channels.location = LJ.realtime.pusher.subscribe( LJ.realtime.getUserChannels("location")[0] );

			LJ.realtime.channels.location.bind('new hello'		   , LJ.log ); // Test channel
			LJ.realtime.channels.location.bind('new before' 	   , LJ.realtime.handleNewBefore );
			LJ.realtime.channels.location.bind('new before status' , LJ.realtime.handleNewBeforeStatus );

		},
		handleNewBefore: function( data ){

			var before = data.before;
			LJ.ui.showToast("Un nouveau before vient d'être créé", 10000 );
			LJ.map.addBeforeMarker( before );

		},
		handleNewBeforeStatus: function( data ){

			var before_id = data.before_id;
			var status 	  = data.status;
			var hosts 	  = hosts;

			if( status == "canceled" ){

				LJ.map.removeBeforeMarker( before_id );LJ.before.removeOneBefore( before_id );
				LJ.map.removeBeforeMarker( before_id );
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

				// If user is host, let him know a friend changed the status!
				if( ( hosts.indexOf( LJ.user.facebook_id ) != -1 ) && status == "canceled" ){

					LJ.ui.showToast( LJ.text('to_friend_canceled_event') );

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

			LJ.realtime.channels[ channel_name ] = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels[ channel_name ].bind('new hello'		  , LJ.log ); // Test channel
			LJ.realtime.channels[ channel_name ].bind('new request host'  , LJ.realtime.handleNewRequestHost );

		},
		handleNewRequestHost: function( data ){

			LJ.log('Someone asked to join your before');
			LJ.log(data);


		},
		// Subscribe to specific chat channels for hosts & requesters.
		// There are 2 chat channels per event.
		subscribeToChatChannels: function( channels ){

			

		},
		subscribeToChatChannel: function( channel_name ){


			
		}

	});