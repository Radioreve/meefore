
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsGroups: function(){

			 LJ.$body.on('click', '.icon-toggle', function(){

                var $self = $(this);

                LJ.fn.showLoaders();
                $self.addClass('active');

                var group_status = '';

                var group_id = $self.parents('.event-accepted-users-group').attr('data-groupid');
                var status   = $self.parents('.event-accepted-users-group').attr('data-status');
                var event_id = $self.parents('.row-events-accepted-inview').attr('data-eventid');

                if( status == 'accepted' ) {
                    group_status = 'kicked';
                } else {
                    group_status = 'accepted';
                }

                LJ.fn.updateGroupStatus({
                        group_status : group_status,
                        group_id     : group_id,
                        event_id     : event_id
                });

            });	


            LJ.$body.on('click', '.event-accepted-chatgroup', function(){

                var $self = $(this);

                var event_id = $self.parents('.row-events-accepted-inview').attr('data-eventid');
                var group_id = $self.attr('data-groupid');
                var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });
                
                if( $self.hasClass('active') )
                    return;

                if( !event_id )
                    return LJ.fn.warn('Missing event_id : ' + event_id );

                if( !group_id )
                    return LJ.fn.warn('Missing group_id : ' + group_id );

                
                LJ.fn.showChatInview( event_id, group_id );

                LJ.fn.activateChatTabview( event_id, group_id );
                LJ.fn.showChatUsersview( event_id, group_id );

            });

			 
		},
        activateChatTabview: function( event_id, group_id ){

            $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                .find('.event-accepted-chatgroup')
                    .removeClass('active')
                    .removeClass('last-active')
                .end()
                .find('.event-accepted-chatgroup[data-groupid="' + group_id + '"]')
                    .addClass('active');

            // Remove bubbles, update tabview's
            LJ.fn.updateTabviewBubbles( event_id );

        },
        showChatUsersview: function( event_id, group_id ){

            var duration = 235;

            // Display proper groups
            $('.event-accepted-users-group:not([data-groupid="hosts"])')
                .velocity('transition.fadeOut',{
                    duration: duration * 1.65,
                    complete: function(){

                        LJ.fn.adjustChatPaneById({
                            event_id  : event_id,
                            group_id  : group_id
                        });

                    }
                });

            $('.event-accepted-users-group[data-groupid="' + group_id + '"]:not([data-groupid="hosts"])')
                .velocity('transition.fadeIn', {
                    duration: duration * 1.65
                });

        },
        showChatInview: function( event_id, group_id ){

            var duration = 235;

            if( !group_id ){
                return LJ.fn.warn('Cannot show chat inview, group_id: ' + group_id );
            }

            // Wrapper to target the right chat (otherwise, multiple chat match the criteria)
            var $current_inview = $('.row-events-accepted-inview.active');
            var $target_inview  = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            var $current_chat   = $current_inview.find('.event-accepted-chat-wrap.active');
            var $target_chat    = $target_inview.find('.event-accepted-chat-wrap[data-groupid="' + group_id + '"]');

            if( $current_chat.is( $target_chat ) ) return;

            if( $current_chat.length == 0 || $target_chat.length == 0 ){
                return LJ.fn.warn('Cannot show chat in view, $current_chat.length: ' + $current_chat.length + ', $target_chat.length: ' + $target_chat.length );
            }

            $current_chat

                 .find('.event-accepted-notification-message')
                    .velocity('transition.fadeOut', { 
                        duration: duration * 1.65
                    }).end()

                .find('.event-accepted-chat-message:not(.me)')
                .velocity( LJ.ui.slideRightOutLight, {
                    duration: duration
                }).end()

                .find('.event-accepted-chat-message.me')
                .velocity( LJ.ui.slideLeftOutLight, {
                    duration: duration
                }).end()

                .find('.event-accepted-chat-typing')
                .velocity('transition.fadeOut', {
                    duration: duration,
                    complete: function(){

                        LJ.fn.adjustChatPaneById({
                            event_id : event_id,
                            group_id : group_id
                        });
            
                        $current_chat.addClass('none').removeClass('active')

                        $target_chat
                        
                            .removeClass('none').addClass('active')

                            .find('.event-accepted-notification-message')
                                .addClass('none').end()

                            .find('.event-accepted-chat-message')
                                .addClass('none').end()

                           .find('.event-accepted-chat-message:not(.me)')
                                .css({ opacity: 0 })
                                .removeClass('none')
                                .velocity( LJ.ui.slideRightInLight, {
                                    duration: duration + 100
                                }).end()

                            .find('.event-accepted-chat-message.me')
                                .css({ opacity: 0 })
                                .removeClass('none')
                                .velocity( LJ.ui.slideLeftInLight, {
                                    duration: duration + 100
                                }).end()

                           .find('.event-accepted-notification-message')
                                .css({ opacity: 0 })
                                .removeClass('none')
                                .velocity('transition.fadeIn', { 
                                    duration: duration * 4
                                }).end()

                            .find('.event-accepted-chat-typing')
                                .velocity('transition.fadeIn');

                    }
                });
                

                LJ.fn.adjustAllChatPanes();

        },
		updateGroupStatus: function( options ){

            var group_status = options.group_status,
                event_id     = options.event_id,
                group_id     = options.group_id;

            if( !group_status || !group_status || !event_id )
                return console.error('Missing group_id || group_status || group_id');

            var data = {
                group_status : group_status,
                chat_id      : LJ.fn.makeChatId({ event_id: event_id, group_id: group_id })
            };

            LJ.fn.api('patch', 'events/' + event_id + '/groups/' + group_id + '/status', { data: data }, function( err, res ){

                LJ.fn.hideLoaders();

                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleUpdateGroupStatusSuccess( res );
                }

            });

        },
        handleUpdateGroupStatusSuccess: function( res ){

            LJ.fn.log('Updating group status success', 3);

            var event_id = res.event_id;
            var group    = res.group;

            LJ.fn.updateGroupStatus_UserPanel( event_id, group );
            LJ.fn.updateGroupStatus_ChatPanel( event_id, group );

        },
        updateGroupStatus_ChatPanel: function( event_id, group ){

            var status = group.status;
            var $wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status )

            if( status == 'accepted' ){

                 LJ.fn.addChatLine({
                        chat_id     : LJ.fn.makeChatId({ event_id: event_id, group_id: group.group_id }),
                        msg         : LJ.text_source["to_event_group_accepted"][ LJ.app_language ].replace('%s', group.name ),
                        name        : LJ.bot_profile.name,
                        img_id      : LJ.bot_profile.img_id,
                        facebook_id : LJ.bot_profile.facebook_id,
                        sent_at     : new Date(),
                        class_names : ["bot"]

                });  
            }

            if( status == 'kicked' ){

                LJ.fn.addChatLine({
                        chat_id     : LJ.fn.makeChatId({ event_id: event_id, group_id: group.group_id }),
                        msg         : LJ.text_source["to_event_group_pending"][ LJ.app_language ].replace('%s', group.name ),
                        name        : LJ.bot_profile.name,
                        img_id      : LJ.bot_profile.img_id,
                        facebook_id : LJ.bot_profile.facebook_id,
                        sent_at     : new Date(),
                        class_names : ["bot"]

                    });  
            }   


        },
        updateGroupStatus_UserPanel: function( event_id, group ){

            var status   = group.status;
            var group_id = group.group_id;

            var $wrap    = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status );

            if( status == 'accepted' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-off').addClass('icon-toggle-on').removeClass('active');

            }

            if( status == 'kicked' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-on').addClass('icon-toggle-off').removeClass('active');

            }

        }

	});