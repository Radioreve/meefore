
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		subscribeToChannels: function( user ){
        	
          //registering default channels (me and public);
        	LJ.subscribed_channels = {};
        	_.keys( user.channels ).forEach(function( channel_key ){
        		LJ.subscribed_channels[ channel_key ] = LJ.pusher.subscribe( LJ.user.channels[ channel_key ]);
        	});

	        LJ.subscribed_channels.public_chan.bind('new event created', LJ.fn.pushNewEvent );
	        LJ.subscribed_channels.public_chan.bind('new party created', LJ.fn.pushNewParty );
	        LJ.subscribed_channels.public_chan.bind('new event status' , LJ.fn.pushNewEventStatus );

	        LJ.subscribed_channels.me.bind('new request group', LJ.fn.pushNewGroup_Group );
	        LJ.subscribed_channels.me.bind('new chat whisper', LJ.fn.pushNewChatWhisper );

	        LJ.subscribed_channels.public_chan.bind('new oversize message', function(data){ LJ.fn.warn('Didnt receive pusher message (oversized)'); })
	        LJ.subscribed_channels.public_chan.bind('new test', LJ.fn.pushNewTest );

   		 },
   		 joinChatChannel: function( event_id, chat_id ){

   		 	LJ.subscribed_channels[ event_id ][ chat_id ] = LJ.pusher.subscribe( 'presence-' + chat_id );

   		 	 // Notify @other hosts and target group that his status has changed
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('new group status', LJ.fn.pushNewGroupStatus );
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('new request host', LJ.fn.pushNewGroup_Host );

			// Notify @all chatters that new message/readby notification has arrived
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('new chat message', LJ.fn.pushNewChatMessage );
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('new chat readby' , LJ.fn.pushNewChatReadBy  );

			LJ.subscribed_channels[ event_id ][ chat_id ].bind('pusher:member_added', LJ.fn.pushNewUserConnected );
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('pusher:member_removed', LJ.fn.pushNewUserDisconnected );
			LJ.subscribed_channels[ event_id ][ chat_id ].bind('pusher:subscription_succeeded', LJ.fn.pushMembersConnectionStatus );


   		 },
		 joinEventChannel: function( evt ){

		 	var event_id 	  = evt._id;
		 	var hosts_channel = '';

            if( !evt )
                return console.error('Cant join channel, event is null');

            delete LJ.subscribed_channels[ event_id ];

            /* For everyone */
            LJ.subscribed_channels[ event_id ] = LJ.pusher.subscribe( event_id );

            /* For hosts - subscribe to all channels, including host one */
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id') ) ){

            	hosts_channel = LJ.fn.makeChatId({ event_id: event_id, group_id: "hosts" });

            	var chat_ids = [ hosts_channel ];
            	evt.groups.forEach(function( group ){

            		var group_id = LJ.fn.makeGroupId( group.members_facebook_id );
            		var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });

            		chat_ids.push( chat_id );

            	});

            	chat_ids.forEach(function( chat_id ){
            		LJ.fn.joinChatChannel( event_id, chat_id );
            	});

	           	// Notify @all hosts that someone has requested to join
	            LJ.subscribed_channels[ evt._id ][ hosts_channel ].bind('new request', LJ.fn.pushNewGroup );

            }
            /* For others, subscribe only to one channel */
            else {

            	var group_id = LJ.fn.findMyGroupIdFromEvent( evt );
            	var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });            	
            	
            	LJ.fn.joinChatChannel( event_id, chat_id );
            	
            }

            LJ.subscribed_channels[ event_id ].bind('new test event', function(data){ LJ.fn.log(data); });
            LJ.subscribed_channels[ event_id ].bind('new oversize message', function(data){ LJ.fn.warn('Didnt receive pusher message (oversized)'); })

        },
        pushNewTest: function( data ){
        	LJ.fn.log('Test succeed!');
        	LJ.fn.log(data);
        },
		pushNewEvent: function( data ){

			var evt          = data.evt;
			var notification = data.notification

			if( !evt )
				return console.error('No arguments were passed (pushNewEvent)')

			/* Default message */
			var message = LJ.text_source["to_new_meefore"][ LJ.app_language ].replace('%name', evt.hosts[0].name ).replace('%date', moment( evt.begins_at ).format('DD/MM') );
			/* Internal */
			LJ.fn.updateEventCache( evt );

			/* External */
            LJ.fn.displayEventMarker( evt );
            LJ.fn.displayPartyMarker_Event( evt );

            /* Did a friend tag me as host ? */
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ){
            	message = LJ.text_source["to_new_meefore_host"][ LJ.app_language ];

            	if( !$('#events').hasClass('menu-item-active') ){
            		LJ.fn.addEventInviewAndTabview( evt, { hide: true } );
            	} else {
            		LJ.fn.addEventInviewAndTabview( evt );
            	}
            	
            	LJ.fn.joinEventChannel( evt );
            	LJ.fn.fetchMe();

            	/* Notification */
				LJ.fn.pushNewNotification( notification );

            }

			/* Notifications bubble */
			LJ.fn.toastMsg( message, 'info', 5000 );

		},
		pushNewParty: function( party ){

			LJ.fn.log('Pushing new party ('+party._id+')');

			// Update cache
			LJ.cache.parties.push( party );

			// Display on map
			LJ.fn.displayPartyMarker_Party( party );

		},
		pushNewGroup_Host: function( data ){
			
			LJ.fn.log('Pushing new group [host] in event : ' + data.event_id );

			var group             = data.group;
			var event_id      	  = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id;
			var notification      = data.notification;

			if( !event_id || !group ){
				LJ.fn.log( event_id ); LJ.fn.log( group );
				return console.error('Missing group and/or evt, cant add request');
			}

			/* Event received from "host only" channel */
			LJ.fn.toastMsg( LJ.text_source["to_host_push_new_group"][ LJ.app_language ], "info");

			// Render elements 
			var $chat_wrap_html = $( LJ.fn.renderChatWrap_Host_Group( event_id, group ) );
			var $chatgroup_html = $( LJ.fn.renderChatGroup_Group( group ) );
			var $group_html     = $( LJ.fn.renderUsersGroupWithToggle( group ) );

			var $event_wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

			// Append to dom
			$chat_wrap_html.insertAfter( $event_wrap.find('.event-accepted-chat-wrap').last()   );
			$chatgroup_html.insertAfter( $event_wrap.find('.event-accepted-chatgroup').last()   );
			$group_html.insertAfter(     $event_wrap.find('.event-accepted-users-group').last() );


			// Save chatpanes references
			var group_id = group.group_id;
			var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });
			var $chat    = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

			var jsp = $chat.find('.event-accepted-chat-messages').jScrollPane({ stickToBottom: true });

			LJ.jsp_api[ event_id ].chats[ chat_id ] = jsp.data('jsp');

			// Adjust chatpanes for visuals
			LJ.fn.adjustAllChatPanes();

			// Bubbleup someone wanted to join
			LJ.fn.bubbleUpMessage( chat_id );

			// Finally join channel to listen for further events
			LJ.fn.joinChatChannel( event_id, chat_id );

			/* Notification */
			LJ.fn.pushNewNotification( notification );
			
		},
		pushNewGroup_Group: function( data ){

			LJ.fn.log('Pushing new group [group] in event : ' + data.event_id );

			var group             = data.group;
			var event_id      	  = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id;

			if( !event_id || !group ){
				LJ.fn.log( event_id ); LJ.fn.log( group );
				return console.error('Missing group and/or evt, cant add request');
			}

			/* Event received from *me* channel */
			/* Happens exactly the same as if user had asked himself, fetch event and refresh view */
			LJ.fn.toastMsg( LJ.text_source["to_push_new_request_by_friend"][ LJ.app_language ], "info" );
			LJ.fn.fetchEventById( event_id, LJ.fn.handleFetchEventById );


		},
		pushNewEventStatus: function( data ){

			LJ.fn.log('Pushing new event status for event id : ' + data.event_id );

			var status            = data.status;
			var event_id          = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id;

			if( !event_id ){
				return console.error('Cant push new status without event!');
			}
			
			// Message pour les autres organisateurs
			if( LJ.fn.iHost( hosts_facebook_id ) ){

				LJ.fn.toastMsg( LJ.text_source["to_push_new_status_by_friend"][ LJ.app_language ], "info");

				$('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
					.find('.event-inview-settings .settings-group-status .active').removeClass('active').end()
					.find('.event-inview-settings [data-status="' + status + '"]').addClass('active');
			}

			// For everyone 
			LJ.fn.refreshEventStatusOnMap( event_id, status );


		},
		pushNewGroupStatus: function( data ){
 			
			var group             = data.group;
			var status            = group.status;
			var event_id          = data.event_id;
			var chat_id           = data.chat_id;
			var notification      = data.notification;
			var hosts_facebook_id = data.hosts_facebook_id

			LJ.fn.log('Pushing new group status : ' + status + ' for event : ' + event_id );
			LJ.fn.fetchEventById( event_id, function( err, evt ){
				LJ.fn.updateEventCache( evt );
				LJ.fn.updateTabviewIconStatus();
			}); // Fetch event

			// Message pour les membres du groupes
			if( LJ.fn.iGroup( group.members_facebook_id ) ){

				var is_open = "open";
				if( data.status == "suspended" ){
					is_open = "full";
				};

				// Update global status of their event
				$('.row-events-accepted-inview[data-eventid="' + event_id + '"]').attr('data-status', status );

				if( status == "accepted" ){
					LJ.fn.toastMsg( LJ.text_source["to_push_request_accepted"][ LJ.app_language ], 'info', 3500 );

					_.find( LJ.event_markers, function(el){ 
						return el.id == event_id 
					}).marker.setIcon( LJ.cloudinary.markers.accepted[ is_open ].url );

					LJ.fn.addChatLine({
						chat_id     : chat_id,
						msg         : LJ.text_source["ch_bot_msg_group_accepted"][ LJ.app_language ],
						name        : LJ.bot_profile.name,
						img_id      : LJ.bot_profile.img_id,
						facebook_id : LJ.bot_profile.facebook_id,
						sent_at 	: new Date(),
						class_names : ["bot"]
					});

					/* Notification */
					LJ.fn.pushNewNotification( notification );
					
				}
				if( status == "kicked" ){
					// LJ.fn.toastMsg( LJ.text_source["ch_bot_msg_group_pending"][ LJ.app_language ], 'info', 3500 );

					_.find( LJ.event_markers, 
						function(el){ return el.id == event_id 
					}).marker.setIcon( LJ.cloudinary.markers.pending[ is_open ].url );

					LJ.fn.addChatLine({
						chat_id     : chat_id,
						msg         : LJ.text_source["ch_bot_msg_group_pending"][ LJ.app_language ],
						name        : LJ.bot_profile.name,
						img_id      : LJ.bot_profile.img_id,
						facebook_id : LJ.bot_profile.facebook_id,
						sent_at 	: new Date(),
						class_names : ["bot"]
					});
				}

			}

			// Message pour les autres organisateurs
			if( LJ.fn.iHost( hosts_facebook_id ) ){

				if( status == "accepted" ){

					LJ.fn.toastMsg( LJ.text_source["to_push_group_validated_by_friend"][ LJ.app_language ], 'info', 3500 );

					 LJ.fn.addChatLine({
		                chat_id     : LJ.fn.makeChatId({ event_id: event_id, group_id: group_id }),
		                msg         : LJ.text_source["to_event_group_accepted"][ LJ.app_language ].replace('%s', group.name ),
		                name        : LJ.bot_profile.name,
		                img_id      : LJ.bot_profile.img_id,
		                facebook_id : LJ.bot_profile.facebook_id,
		                sent_at     : new Date(),
		                class_names : ["bot"]

		            });  
					
				}
				if( status == "kicked" ){

					LJ.fn.toastMsg( LJ.text_source["to_push_group_suspended_by_friend"][ LJ.app_language ], 'info', 3500 );

					LJ.fn.addChatLine({
		                chat_id     : LJ.fn.makeChatId({ event_id: event_id, group_id: group_id }),
		                msg         : LJ.text_source["to_event_group_pending"][ LJ.app_language ].replace('%s', group.name ),
		                name        : LJ.bot_profile.name,
		                img_id      : LJ.bot_profile.img_id,
		                facebook_id : LJ.bot_profile.facebook_id,
		                sent_at     : new Date(),
		                class_names : ["bot"]

		            });  
				}

			}

			// For everyone in the event channel
			LJ.fn.updateGroupStatus_UserPanel( event_id, group );
			
		},	
		pushNewChatMessage: function( data ){

			LJ.fn.log('Pushing chat line...')

			chat_id = data.chat_id;
			var $wrap = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

			if( data.facebook_id == LJ.user.facebook_id ){

				var start_opacity = $wrap.find('.sending').css('opacity');
				$wrap.find('.sending')
					.first() // in case multiple messages were sent quickly
					.removeClass('sending')
					.css({ opacity: start_opacity })
					.velocity({ opacity: [ 1, start_opacity ] }, { duration: 200 });
			} else {
				LJ.fn.addChatLine( data );
				/*if( $wrap.find('input').is(':focus') ){
					LJ.fn.sendReadBy({
						name : LJ.user.name,
						id   : id
					});
				}*/
			}

			LJ.fn.bubbleUpMessage( chat_id );

		},
		pushNewChatWhisper: function( data ){

			LJ.fn.log('Pushing chat whisper...')

			chat_id = data.chat_id;
			var $wrap = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

			if( data.facebook_id == LJ.user.facebook_id ){

				var start_opacity = $wrap.find('.sending').css('opacity');
				$wrap.find('.sending')
					.first() // in case multiple messages were sent quickly
					.removeClass('sending')
					.css({ opacity: start_opacity })
					.velocity({ opacity: [ 1, start_opacity ] }, { duration: 200 });
			} else {
				LJ.fn.addChatLineWhisper( data );
				/*if( $wrap.find('input').is(':focus') ){
					LJ.fn.sendReadBy({
						name : LJ.user.name,
						id   : id
					});
				}*/
			}

			LJ.fn.bubbleUpMessage( chat_id );

		},
		pushNewChatReadBy: function( data ){

			var $readby = $('.row-events-accepted-inview[data-eventid="' + data.id + '"]').find('.readby'); 
			var readby  = data.readby;

			/* On ajoute le name de la personne à la liste de l'attr data-names */
			var current_names = $readby.attr('data-names');

			if( typeof current_names == 'string' && current_names.length > 0 ){
            	$readby.attr('data-names', readby );
			}

			LJ.fn.displayReadBy( data );
		},
		pushNewUserConnected: function( user ){

			var facebook_id = user.id;

			LJ.fn.log('User ' + facebook_id + ' has connected to the channel');

			$('.event-accepted-user[data-userid="' + facebook_id + '"]')
				.find('.event-accepted-user-state')
				.removeClass('offline').addClass('online');

		},
		pushNewUserDisconnected: function( user ){

			var facebook_id = user.id;

			LJ.fn.log('User ' + facebook_id + ' has disconnected to the channel');

			$('.event-accepted-user[data-userid="' + facebook_id + '"]')
				.find('.event-accepted-user-state')
				.removeClass('online').addClass('offline');
		},
		pushMembersConnectionStatus: function( members ){

			members.each(function( member ){
				LJ.fn.pushNewUserConnected( member );
			});

		}

	});