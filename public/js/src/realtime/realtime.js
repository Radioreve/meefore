
	window.LJ.realtime = _.merge( window.LJ.realtime || {}, {

		state    : null,
		pusher   : {},
		channels : {},

		init: function(){

			LJ.realtime.setupRealtimeService();

			LJ.realtime.subscribeToPrivateChannel();
			LJ.realtime.subscribeToLocationChannel();
			LJ.realtime.subscribeToMultipleBeforeHostChannel();
			LJ.realtime.subscribeToMultipleChatChannel();

			return;

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
                LJ.wlog('Pusher state is now: ' + current_state );

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

			LJ.realtime.channels.me = LJ.realtime.pusher.subscribe( LJ.user.channels["me"] );
			
			// Test channels
			LJ.realtime.channels.me.bind('new hello'		  , LJ.log );
			LJ.realtime.channels.me.bind('new request group'  , LJ.realtime.handleNewRequestGroup );
			LJ.realtime.channels.me.bind('new chat whisper'   , LJ.realtime.handleNewChatWhisper );


		},
		handleNewRequestGroup: function( data ){



		},
		handleNewChatWhisper: function( data ){

			LJ.wlog('This feature is not implemented yet');

		},
		// Subcribe to events about a specific geo area 
		//to get pushed realtime notifications about newly created events
		subscribeToLocationChannel: function(){

			var channel_name = 'place_id=' + LJ.user.location.place_id;
			LJ.realtime.channels.me_location = LJ.realtime.pusher.subscribe( channel_name );

			LJ.realtime.channels.me_location.bind('new before' 	      , LJ.realtime.handleNewBefore );
			LJ.realtime.channels.me_location.bind('new before status' , LJ.realtime.handleNewBeforeStatus );

		},
		handleNewBefore: function( data ){

			var before = data.before;
			LJ.ui.showToast("Un nouveau before vient d'être créé", 10000 );
			LJ.map.addBeforeMarker( before );

		},
		handleNewBeforeStatus: function( data ){


		},
		// Subscribe to channels for *hosts only*
		// to get pushed anytime a group request a participation
		subscribeToMultipleBeforeHostChannel: function(){



		},
		subscribeToBeforeHostChannel: function(){

		},
		// Subscribe to specific chat channels for hosts & requesters.
		// There are 2 chat channels per event.
		subscribeToMultipleChatChannel: function(){



		},
		subscribeToChatChannel: function(){



		}

	});