
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsTabview: function(){


            LJ.$body.on('click', '.event-accepted-tabview', function(){

                var $self               = $(this);
                var event_id            = $self.attr('data-eventid');
                var evt                 = _.find( LJ.cache.events, function(el){ return el._id === event_id });
                var duration            = 900;
                var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

                var opts = { transition_in : LJ.ui.slideUpInLight, transition_out: LJ.ui.slideDownOutLight };

                if( $inview_wrap_target.find('.event-accepted-chatgroup.active').length == 0 ){
                    $inview_wrap_target.find('.event-accepted-chatgroup').first().click();
                }
				
                LJ.fn.adjustAllChatPanes();
                
                if( $self.hasClass('active') ){
                    $inview_wrap_target.velocity('transition.fadeOut', { duration: 700 });
                    $self.removeClass('active');
                    return;
                }
                
                if( $('.event-accepted-tabview.active').length == 0 ){
                    $self.addClass('active');
                    $inview_wrap_target.velocity('transition.slideUpIn', { duration: 600 });
                    LJ.fn.addEventPreview( evt, opts );
                    return;
                }

                var current_event_id = $('.event-accepted-tabview.active').attr('data-eventid');
                var $inview_wrap_current = $('.row-events-accepted-inview[data-eventid="' + current_event_id + '"]');

                $('.event-accepted-tabview').removeClass('active');
                $self.addClass('active');
                

                $('.row-events-accepted-inview[data-eventid="' + current_event_id + '"]')
                .velocity('transition.slideUpOut', {
                    duration: duration
                });

                LJ.fn.addEventPreview( evt, opts );

                

                setTimeout(function(){
                    
                    $inview_wrap_target.velocity('transition.slideUpIn', { duration: duration });
                    LJ.fn.adjustAllChatPanes();
                   
                }, 220 );


            });

			
			 
		},
		addEventInviewAndTabview: function( evt, options ){

            var options = options || {};
            
            var event_id = evt._id ;
            var renderFn =  LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ? 
                            LJ.fn.renderEventInview_Host :
                            LJ.fn.renderEventInview_User ;


            $('.row-main').append( renderFn( evt ) );
            $('.row-events-accepted-tabview').append( LJ.fn.renderEventTabview( evt ) );

            if( !options.hide  ){
                $('.event-accepted-tabview').last().click();
            }

            /* jsp */
            var $inview =  $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $inview.find('.event-accepted-chatgroup').first().addClass('active');
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
	           

        }

	});