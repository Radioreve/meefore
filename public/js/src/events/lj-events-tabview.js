
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
                        LJ.fn.showEventInview( target_event_id, { show_preview: true });

                    // Hide the chat panel first, and then show it ~300ms after for smooth transition
                    } else {

                        var current_event_id = $('.event-accepted-tabview.active').attr('data-eventid');

                        LJ.fn.activateEventTabview( target_event_id );
                        LJ.fn.hideAndShowEventInview( target_event_id, { current_event_id: current_event_id } );

                    }
                }



            });
             
        },
        activateEventTabview: function( target_event_id ){

            $('.event-accepted-tabview').removeClass('active');
            $('.event-accepted-tabview[data-eventid="' + target_event_id + '"]').addClass('active');

        },
        showEventInview: function( target_event_id, opts ){

            var opts = opts || {};

            LJ.fn.log('Calling show with target : ' + target_event_id, 5 );

            var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="'+ target_event_id +'"]');
            var last_group_id       = $inview_wrap_target.find('.last-active').attr('data-groupid');
            var group_id            = opts.group_id;

            if( $inview_wrap_target.length == 0 ){
                return LJ.fn.warn('Cant showEventInview, $inview_wrap_target.length: ' + $inview_wrap_target.length );
            }

            // If already there and active, do nothing
            if( $inview_wrap_target.hasClass('active') ) return;

            if( !last_group_id && !group_id ){
                return LJ.fn.warn('Cant showEventInview, last_group_id: ' + last_group_id + ' and group_id: ' + group_id );
            }

            // Allow override of last group fetching. This way, the function can land on any of the available chats
            // Usefull e.g. for notifications, when we want to open a particular chat that may not be the last one opened
            var target_group_id = group_id || last_group_id;


            // Hide specifics dom that collide with view
            LJ.fn.hideNotificationsPanel();
            
            // Refresh all chat panes for jsPane to refresh itself
            LJ.fn.adjustAllChatPanes();

            // Update the active event state
            $inview_wrap_target.siblings('.active').removeClass('active');

            // Display the proper container and the proper chat 
            // Compute the perfect height 
            var $limit = $('.row-events-filters');
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
            

            LJ.fn.activateChatTabview( target_event_id, target_group_id );
            LJ.fn.showChatInview( target_event_id, target_group_id );
            
            if( opts.show_preview ){
                // LJ.fn.showEventPreview( target_event_id );
            }


        },
        hideEventInview: function( target_event_id ){

            LJ.fn.log('Calling hide with target : ' + target_event_id, 5 );

            var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="' + target_event_id + '"]');

              // Close chatviews
            $inview_wrap_target
                .velocity('transition.slideUpOut', {
                 duration: 400 
                })
                .removeClass('active')

                .find('.event-accepted-chatgroup.active')
                    .removeClass('active')
                    .addClass('last-active');


        },
        // Allow to easily hide event without knowing the event_id
        hideEventInview_Active: function(){

            var target_event_id = $('.row-events-accepted-inview.active').attr('data-eventid');
            LJ.fn.hideEventInview( target_event_id );

        },
        // Chain hide & show with a smooth transition
        hideAndShowEventInview: function( target_event_id, opts ){

            var opts             = opts || {};

            var current_event_id = null
            var group_id         = null;

            if( opts.current_event_id ){
                current_event_id = opts.current_event_id;
            } else {
                if( $('.row-events-accepted-inview.active').length ){
                    current_event_id = $('.row-events-accepted-inview.active').attr('data-eventid');
                }
            }

            LJ.fn.log('Calling hide and show with current : ' + current_event_id + ' and target : ' + target_event_id, 5 );

            if( !current_event_id || !target_event_id )
                return LJ.fn.warn('Cant hide and show, missing either current or target event_id', 1 );

            // LJ.fn.showEventPreview( target_event_id );
            LJ.fn.hideEventInview( current_event_id );

            // Smooth it up!
            setTimeout(function(){
                LJ.fn.showEventInview( target_event_id, opts );
            }, 80 )

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

            if( !options.hide ){
                $('.event-accepted-tabview').last().click();
            }

            /* Adjust all tabviews*/
            LJ.fn.adjustAllTabviews();
	           
        }


	});