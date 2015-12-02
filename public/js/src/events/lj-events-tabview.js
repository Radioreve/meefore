
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsTabview: function(){


            LJ.$body.on('click', '.event-accepted-tabview', function(){
                
                var $self           = $(this);
                var target_event_id = $self.attr('data-eventid');

                // Hide the chat panel
                if( $self.hasClass('active') ){

                    $self.removeClass('active');
                    LJ.fn.hideEventInview( target_event_id );

                } else {

                    // Show the chat panel
                    if( $('.event-accepted-tabview.active').length == 0 ){

                        LJ.fn.activateEventTabview( target_event_id );
                        LJ.fn.showEventInview( target_event_id );

                    // Hide the chat panel first, and then show it ~300ms after for smooth transition
                    } else {

                        var current_event_id = $('.event-accepted-tabview.active').attr('data-eventid');

                        LJ.fn.activateEventTabview( target_event_id );
                        LJ.fn.hideAndshowEventInview( current_event_id, target_event_id );

                    }
                }



            });
             
        },
        activateEventTabview: function( target_event_id ){

            $('.event-accepted-tabview').removeClass('active');
            $('.event-accepted-tabview[data-eventid="' + target_event_id + '"]').addClass('active');

        },
        showEventInview: function( target_event_id ){

            LJ.fn.log('Calling show with target : ' + target_event_id, 5 );

            var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="'+ target_event_id +'"]');
            var last_group_id       = $inview_wrap_target.find('.last-active').attr('data-groupid');

            // Hide specifics dom that collide with view
            LJ.fn.hideNotificationsPanel();
            
            // If already there and active, do nothing
            if( $inview_wrap_target.hasClass('active') ) return;

            // Refresh all chat panes for jsPane to refresh itself
            LJ.fn.adjustAllChatPanes();

            // Update the active event state
            $inview_wrap_target.siblings('.active').removeClass('active');

            // Display the proper container and the proper chat 
            // Compute the perfect height 
            var $limit = $('.row-events-preview');
            var h = $( window ).outerHeight( true ) - $limit.innerHeight() - parseInt( $limit.css('top').split('px')[0] );

            // Open the two wrappers
            $inview_wrap_target
                .css({ height: h })
                .velocity('transition.slideUpIn', { 
                    duration: 600 
                })
                .addClass('active')
                .find('.event-accepted-inview')
                    .velocity('transition.slideUpIn')
            

            LJ.fn.activateChatTabview( target_event_id, last_group_id );
            LJ.fn.showChatInview( target_event_id, last_group_id );
            

            // Find the proper event from cache, and update the preview
            var evt = _.find( LJ.cache.events, function( el ){
                return el._id === target_event_id 
            });

            LJ.fn.addEventPreview( evt );
            LJ.fn.addPartyPreview( evt.party, {
                begins_at: evt.begins_at
            });




        },
        hideEventInview: function( target_event_id ){

            LJ.fn.log('Calling hide with target : ' + target_event_id, 5 );

            var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="' + target_event_id + '"]');

              // Close chatviews
            $inview_wrap_target
                .velocity('transition.slideDownOut', {
                 duration: 400 
                })
                .removeClass('active')

                .find('.event-accepted-chatgroup.active')
                    .removeClass('active')
                    .addClass('last-active');


        },
        hideEventInview_Active: function(){

            var target_event_id = $('.row-events-accepted-inview.active').attr('data-eventid');
            LJ.fn.hideEventInview( target_event_id );

        },
        hideAndshowEventInview: function( current_event_id, target_event_id ){

            LJ.fn.log('Calling hide and show with current : ' + current_event_id + ' and target : ' + target_event_id, 5 );

            if( !current_event_id || !target_event_id )
                return LJ.fn.warn('Cant hide and show, missing either current or target event_id', 1 );
            
            var $inview_wrap_current = $('.row-events-accepted-inview[data-eventid="' + current_event_id + '"]');
            var $inview_wrap_target  = $('.row-events-accepted-inview[data-eventid="' + target_event_id + '"]');

              // Close chatviews
            $inview_wrap_current
                .velocity('transition.slideDownOut', {
                 duration: 400 
                })
                .removeClass('active')

                .find('.event-accepted-chatgroup.active')
                    .removeClass('active')
                    .addClass('last-active');

                setTimeout(function(){
                    
                    $inview_wrap_target
                        .addClass('active')
                        .find('.event-accepted-inview')
                            .velocity('transition.slideUpIn', {
                                duration: 700
                            }).end()
                            // Usefull part??
                            .velocity('transition.fadeIn', {
                                duration: 700
                            }); 
                        
                    LJ.fn.adjustAllChatPanes();
                   
                }, 330 );


        },
        // Add the HTML for new inview and tabview based on user or host
        // Display it not specified otherwise
        // Display the first chatwrap available (hosts view or waiting-for-approval view)
        // Register the jsp_api
		addEventInviewAndTabview: function( evt, options ){

            var options = options || {};
            
            var event_id = evt._id ;
            var renderFn =  LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ? 
                            LJ.fn.renderEventInview_Host :
                            LJ.fn.renderEventInview_User ;


            $('.row-events-accepted-inview-wrapper').append( renderFn( evt ) );
            $('.row-events-accepted-tabview').append( LJ.fn.renderEventTabview( evt ) );
            LJ.fn.updateTabviewIconStatus();

            if( !options.hide ){
                $('.event-accepted-tabview').last().click();
            }

            // Initialisation values : make sure the first chatgroup element is active, at first render
            var $inview =  $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');
            $inview.find('.event-accepted-chat-wrap').first().removeClass('none').addClass('active');
            $inview.find('.event-accepted-chatgroup').first().addClass('last-active');
            
            var chats_jsp = {};

            // Host special case
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id') )){
                var group_id = "hosts";
                var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });
                var $chat    = $inview.find('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

                chats_jsp[ chat_id ] = $chat.find('.event-accepted-chat-messages').jScrollPane().data('jsp');

                LJ.fn.bindFetchMoreHistory( chat_id );
                
            } // End hosts special case

            evt.groups.forEach(function( group ){

                var group_id = LJ.fn.makeGroupId( group.members_facebook_id );
                var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });
                var $chat    = $inview.find('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

                chats_jsp[ chat_id ] = $chat.find('.event-accepted-chat-messages').jScrollPane().data('jsp');

                // Fetch more chats on scrolltop
                LJ.fn.bindFetchMoreHistory( chat_id );

            });

            LJ.jsp_api[ event_id ] = {
                users: $inview.find('.event-accepted-users').jScrollPane().data('jsp'),
                chats: chats_jsp
            };

            /* Adjust all tabviews*/
            LJ.fn.adjustAllTabviews();
	           
        }


	});