
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsTabview: function(){


            LJ.$body.on('click', '.event-accepted-tabview', function(){
                
                var $self                = $(this);

                var event_id             = $self.attr('data-eventid');
                var current_event_id     = $('.event-accepted-tabview.active').attr('data-eventid');

                var $inview_wrap_target  = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');
                var $inview_wrap_current = $('.row-events-accepted-inview[data-eventid="' + current_event_id + '"]');

                var evt                  = _.find( LJ.cache.events, function( el ){ return el._id === event_id });
                var duration             = 700;


                // Adjust dynamically the height so it perfectly fills the screen from filter div to footerdiv
                var adjusted_height = $( window ).outerHeight( true )  
                                      - $('.row-events-preview').innerHeight()
                                      - parseInt( $('.row-events-preview').css('top').split('px')[0] );

                $inview_wrap_target.css({ height: adjusted_height });

                // if( $inview_wrap_target.find('.event-accepted-chatgroup.active').length == 0 ){
                //     $inview_wrap_target.find('.event-accepted-chatgroup').first().click();
                // }
                
                $inview_wrap_target.find('.event-accepted-chatgroup.last-active').click();

                // Close chatviews
                if( $self.hasClass('active') ){
                    $inview_wrap_target.velocity('transition.slideDownOut', { duration: 400 }).removeClass('active');
                    $inview_wrap_target.find('.event-accepted-chatgroup.active').removeClass('active').addClass('last-active');
                    $self.removeClass('active');
                    return;
                }
                    

                // First opening 
                if( $('.event-accepted-tabview.active').length == 0 ){
                    LJ.fn.adjustAllChatPanes();
                    $self.addClass('active');

                    $inview_wrap_target
                        .siblings('.active').removeClass('active').end()
                        .velocity('transition.slideUpIn', { duration: 600 }).addClass('active')
                        .find('.event-accepted-inview').velocity('transition.slideUpIn')
                        .find('.event-accepted-chatgroup.last-active').addClass('active');

                    LJ.fn.addEventPreview( evt );
                    LJ.fn.addPartyPreview( evt.party );
                    return;
                }

                // Switch tab

                // Update tabview 
                $('.event-accepted-tabview').removeClass('active');

                // Update chatgroup view (to prevent host bubbleup not working on last opened chat)
                $('.event-accepted-chatgroup.active').removeClass('active').addClass('last-active');
                $inview_wrap_target.find('.event-accepted-chatgroup.last-active').addClass('active');
                $self.addClass('active');
                                
                // Update preview
                LJ.fn.addEventPreview( evt );
                LJ.fn.addPartyPreview( evt.party );

                // Update inview 
                $inview_wrap_current
                    .removeClass('active')
                    .find('.event-accepted-inview, .event-inview-settings')
                    .velocity('transition.slideUpOut', {
                        duration: duration
                    }).end()
                    .velocity('transition.fadeOut', {
                        duration: duration
                    });


                setTimeout(function(){
                    
                    $inview_wrap_target
                        .addClass('active')
                        .find('.event-accepted-inview')
                        .velocity('transition.slideUpIn', {
                            duration: duration 
                        }).end()
                        .velocity('transition.fadeIn', {
                            duration: duration
                        });
                        
                    LJ.fn.adjustAllChatPanes();
                   
                }, 330 );

                // $inview_wrap_current
                //     .removeClass('active')
                //     .velocity('transition.slideUpOut', {
                //         duration: duration
                //     })

                // setTimeout(function(){

                //     $inview_wrap_target
                //         .addClass('active')
                //         .velocity('transition.slideUpIn', {
                //             duration: duration
                //         });

                //       LJ.fn.adjustAllChatPanes();

                // }, 350 );


            });

			
			 
		},
		addEventInviewAndTabview: function( evt, options ){

            var options = options || {};
            
            var event_id = evt._id ;
            var renderFn =  LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ? 
                            LJ.fn.renderEventInview_Host :
                            LJ.fn.renderEventInview_User ;


            $('.row-events-accepted').append( renderFn( evt ) );
            $('.row-events-accepted-tabview').append( LJ.fn.renderEventTabview( evt ) );
            LJ.fn.updateTabviewIconStatus();

            if( !options.hide ){
                $('.event-accepted-tabview').last().click();
            }

            /* jsp */
            var $inview =  $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $inview.find('.event-accepted-chatgroup').first().addClass('last-active');
            $inview.find('.event-accepted-chat-wrap').first().removeClass('none');
            
            var chats_jsp = {};

            /* Host special case */
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id') )){
                var group_id = "hosts";
                var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });
                var $chat    = $inview.find('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

                chats_jsp[ chat_id ] = $chat.find('.event-accepted-chat-messages').jScrollPane().data('jsp');

                LJ.fn.bindFetchMoreHistory( chat_id );
                
            }
            /* End hosts special case */

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