
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsChat: function(){  

            LJ.$body.on('click', '.backtomap', function(){

               LJ.fn.clearActivePreview();
               LJ.fn.clearActiveInview();
               LJ.fn.clearAllActiveMarkers();
               LJ.fn.clearAllActivePaths();
               LJ.fn.clearAllHalfActivePaths();

            });

            LJ.$body.on('click', '.event-accepted-chat-message img', function(){

                var $self       = $(this);
                var $chat_wrap  = $self.parents('.event-accepted-chat-wrap')
                var facebook_id = $self.parents().attr('data-authorid');
                var chat_id     = $chat_wrap.attr('data-chatid');

                // Cant whisper to himself or any other id than user id
                if( facebook_id == LJ.user.facebook_id || !/^\d{1,}$/i.test( facebook_id ) ){
                    LJ.fn.log('Cant whisper to himself');
                    return;
                }

                LJ.fn.stageUserForWhisper( facebook_id, chat_id );
                
            });

            LJ.$body.on('click', '.btn-validate-group', function(){

                var $self = $(this);
                var group_id = $self.parents('.event-accepted-chat-wrap').attr('data-groupid');

                $self.parents('.row-events-accepted-inview')
                    .find('.event-accepted-users-group[data-groupid="' + group_id +'"]')
                    .find('.icon-toggle').click();

            });

            LJ.$body.on('focus', '.event-accepted-chat-typing input', function(){

                if( LJ.user.app_preferences.ux.message_readby == 'no' ) return 

                var $self       = $(this);
                var $event_wrap = $self.parents('.row-events-accepted-inview');
                var $chat_wrap  = $self.parents('.event-accepted-chat-wrap');
                var $readby     = $self.siblings('.readby');

                if( ['accepted', 'hosted'].indexOf( $event_wrap.attr('data-status')) == -1 ){
                    return LJ.fn.log('Not accepted in event, nothing to send');
                }

                if( $chat_wrap.find('.event-accepted-chat-message').last().find('.whisper-text').length != 0 ){
                    return LJ.fn.log('Not sending readby for whispers');
                }
                
                var names =  _.pull( $readby.attr('data-names').split(','), '' );
                if( names.length > 0 && names.indexOf( LJ.user.name ) == -1 ){

                    // check éventuel sur l'option oui ou non montrer qu'on a lu les messages
                    var event_id =  $event_wrap.attr('data-eventid');
                    
                    if( $event_wrap.attr('data-status') == 'hosted' ){
                        group_id = 'hosts';
                    } else {
                        group_id  = LJ.fn.findMyGroupIdFromDom( this ); 
                    }

                    LJ.fn.sendReadBy({
                        name     : LJ.user.name,
                        group_id : group_id,
                        event_id : event_id,
                        chat_id  : $chat_wrap.attr('data-chatid')
                    });
                    return;
                }

                LJ.fn.log('Message already seen, not sending anything');

            });
			
            LJ.$body.on('keypress', '.event-accepted-chat-typing input', function(e){

                var keyCode = e.keyCode || e.which;
                if( keyCode === 13 ){
                    $(this).siblings('button').click();
                }

            });

            LJ.$body.on('click', '.event-accepted-chat-typing button', function(){

                var $self          = $(this);
                var $event_wrap    = $self.parents('.row-events-accepted-inview');
                var $chat_wrap     = $self.parents('.event-accepted-chat-wrap');
                
                var msg       = $self.siblings('input').val();
                var event_id  = $event_wrap.attr('data-eventid');
                var group_id  = null;
                var chat_id   = null;

                if( $event_wrap.attr('data-status') == 'hosted' ){
                    group_id = 'hosts';
                } else {
                    group_id = LJ.fn.findMyGroupIdFromDom( this ); 
                }

                // Find offline users based on display
                var offline_users = [];
                $event_wrap.find('.offline').each(function( i, el ){
                    if( $(el).closest('.event-accepted-users-group').css('display') == 'block' ){
                        offline_users.push( $(el).closest('.event-accepted-user').attr('data-userid') );
                    }
                });

                var chat_id  = $chat_wrap.attr('data-chatid');

                if( ['accepted','hosted'].indexOf( $event_wrap.attr('data-status') ) == -1  )
                    return LJ.fn.toastMsg( LJ.text_source["to_chat_inp_not_in"][ LJ.app_language ], 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg( LJ.text_source["to_chat_inp_empty"][ LJ.app_language ], 'info');

                if( $self.hasClass('active') )
                    return LJ.fn.toastMsg( LJ.text_source["to_chat_inp_too_quick"][ LJ.app_language ], 'info');

                var data = {
                    msg             : msg,
                    event_id        : event_id,
                    group_id        : group_id,
                    chat_id         : chat_id,
                    img_id          : LJ.fn.findMainImage( LJ.user ).img_id,
                    img_vs          : LJ.fn.findMainImage( LJ.user ).img_version,
                    facebook_id     : LJ.user.facebook_id,
                    name            : LJ.user.name,
                    offline_users   : offline_users,
                    sent_at         : new Date()
                };

                if( $self.hasClass('btn-whisper') ){

                    var whisper_to = [];
                    $self.siblings('img').each(function( i, img ){
                        whisper_to.push( $(img).attr('data-authorid') );
                    });

                    data.whisper_to   = whisper_to;
                    LJ.fn.addChatLineWhisper( data );

                } else {
                    LJ.fn.addChatLine( data );
                }

                // Order important cause addChatLine erases .text() property
                $self.siblings('input').val('');
                $self.siblings('.readby').attr('data-names','').append( LJ.$bar_loader.clone().css({ width: '10px' }))

                LJ.fn.api('post', 'chats/' + chat_id, { data: data }, function( err, res ){
                    if( err ){
                        LJ.fn.handleApiError( err );
                    } else {
                        LJ.fn.handleSendChatSuccess( res );
                    }
                });

            });
			 
		},
        handleSendChatSuccess: function( res ){

            // LJ.fn.log('Handling chat success for chat_id : ' + res.chat_id );

            $('.event-accepted-chat-wrap[data-chatid="' + res.chat_id + '"]')
                .find('.event-accepted-chat-typing button').removeClass('active').end()
                .find('.readby').text('Envoyé')
                    .find('img').remove();


        },
		addChatLine: function( options ){
            
            // LJ.fn.log('Adding chatline...');
            
            var chat_id = options.chat_id;

            if( !chat_id )
                return console.error('Cannot add chatline without chat id');

            var chat_msg_html = LJ.fn.renderChatLine( options );
            
            var $wrap = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

            if( $wrap.length == 0 )
                return console.error('Didnt find the container based on id : ' + chat_id );

            $wrap
            .find('.event-accepted-notification-message')
                .remove().end()
            .find('.readby')
                .attr('data-names', options.name ).text('').end()
            .find('.event-accepted-chat-messages .jspPane')
                .append( chat_msg_html )
            .find('.event-accepted-chat-message').last()
                .css({ opacity: 0 })

            LJ.fn.adjustAllChatPanes();
            setTimeout(function(){

                if( typeof options.variations == 'function' ){
                    options.variations( $wrap.find('.event-accepted-chat-message').last() );
                };
                
                var $last_msg_me = $wrap.find('.event-accepted-chat-message.me').last().addClass(  options.class_names && options.class_names.join(' ')  );
                var $last_msg_sd = $wrap.find('.event-accepted-chat-message:not(.me)').last().addClass(  options.class_names && options.class_names.join(' ') );
                
                if( options.facebook_id == LJ.user.facebook_id ){
                    $wrap.find('.event-accepted-chat-message.me').last().addClass('sending');
                    $last_msg_me.velocity({ opacity: [ 0.5, 0 ] }, { duration: 200 });
                } else {
                    $last_msg_sd.velocity({ opacity: [ 1.0, 0 ] }, { duration: 200 });
                }

            }, 50 );


        },
        addChatLineWhisper: function( options ){

            options.variations = LJ.fn.whisperify( options );
            LJ.fn.addChatLine( options );

        },
        whisperify: function( options ){

            return function( $wrap ){

                if( !$wrap )
                    return;
                
                var user_id = options.facebook_id;
                $wrap.find('.event-accepted-chat-text').addClass('whisper-text');

                var base_css = {
                    width      :'20px',
                    height     :'20px',
                    top        :'25px',
                    border     :'1px solid white',
                    padding    :'1px',
                    background :'white', 'box-shadow': '1px 1px 2px #a2a2a2'
                };

                if( user_id != LJ.user.facebook_id ){
                    options.whisper_to.forEach(function( whisperer_id, i ){
                        $wrap.parents('.event-accepted-chat')
                        .siblings('.event-accepted-users')
                        .find('.event-accepted-user[data-userid="' + whisperer_id + '"] img')
                        .clone()
                        .css( base_css )
                        .css({ left: ( 47 - 14 * i ) + 'px' })
                        .css({ 'z-index': (10-i) })
                        .appendTo( $wrap );
                    });
                } else {
                    options.whisper_to.forEach(function( whisperer_id, i ){
                        $wrap.parents('.event-accepted-chat')
                        .siblings('.event-accepted-users')
                        .find('.event-accepted-user[data-userid="' + whisperer_id + '"] img')
                        .clone()
                        .css( base_css )
                        .css({ right: ( 30 - 14 * i ) + 'px' })
                        .css({ 'z-index': (10-i) })
                        .appendTo( $wrap );
                    });
                }
                
                if( options.whisper_to.length > 1 ){
                    $wrap.find('.event-accepted-chat-sent-at').css({'top':'25%'});
                }
            }


        },
        fetchMyChat_Host: function( evt ){

            // LJ.fn.log('Fetching chat as host');

            var event_id = evt._id;
            var $wrap    = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            // Fetch hosts chat
            var options_array = [{
                group_id : "hosts",
                chat_id  : LJ.fn.makeChatId({ event_id: event_id, group_id: "hosts" }) 
            }];

            // Fetch other chats
            evt.groups.forEach(function( group ){

                // Only request if not pending. That way, we dont override the message "Validate" 
                if( group.status == "accepted" ){

                    // User group id to build chatid, but then have to send "hosts" for proper auth
                    var group_id = LJ.fn.makeGroupId( group.members_facebook_id );
                    var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });

                    options_array.push({
                        chat_id  : chat_id,
                        group_id : "hosts"
                    });
                }

            });

            options_array.forEach(function( option ){

                LJ.fn.fetchChatHistoryById( _.merge( option, { event_id: event_id } ) );

            });

        },
        fetchMyChat_Group: function( evt ){

            var event_id = evt._id;
            var $wrap    = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            if( $wrap.attr('data-status') != 'accepted' )
                return LJ.fn.warn('No chat to fetch, still waiting approval');

            var group_id = $wrap.find('.event-accepted-users-group.mygroup').attr('data-groupid');
            var chat_id  = LJ.fn.makeChatId({ event_id: evt._id, group_id: group_id });

            var data = {
                event_id : event_id,
                chat_id  : chat_id,
                group_id : group_id
            };

            LJ.fn.fetchChatHistoryById( data, function( err, res ){
                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleFetchChatHistoryById( res );
                }
            });        

            
        },
        fetchChatHistoryById: function( options ){

            // LJ.fn.log('Fetching messages for chat with id : ' + options.chat_id );

            var data = {
                chat_id          : options.chat_id,
                group_id         : options.group_id,
                event_id         : options.event_id,
                messages_fetched : options.messages_fetched || 0          
            };

            LJ.fn.api('get','chats/' + options.chat_id, { data: data }, function( err, res ){

                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleFetchChatHistoryById( _.merge({

                        event_id        : options.event_id,
                        messages        : res.messages,
                        readby          : res.readby,
                        chat_id         : options.chat_id,
                        prepend         : options.prepend

                    }, { group_id: options.group_id }) );
                }

            });

        },
        handleFetchChatHistoryById: function( options ){
                
            var event_id  = options.event_id;
            var group_id  = options.group_id;
            var chat_id   = options.chat_id;
            var messages  = options.messages;
            var readby    = options.readby;
            var prepend   = options.prepend || false;

                var chats_html = [];
                var $wrap      = $('.event-accepted-chat-wrap[data-chatid="' + options.chat_id + '"]');

                if( !event_id )
                    return console.error('Cannot add chat history without event id');

                if( !messages ){
                    chats_html.push( LJ.fn.renderChatLine_Bot("Cette discussion est vide. Envoyez le premier message!") );
                } else {                   
                    messages.forEach(function( msg ){
                        chats_html.push( LJ.fn.renderChatLine( msg ) );
                    });
                }

                if( chats_html.length != 0 ){

                    var $messagesWrap = $wrap.find('.jspPane');
                    var messages_html = chats_html.length != 0 && chats_html.join('');
                    
                    if( prepend ){
                        
                        var $new_messages = $( messages_html );
                        $new_messages
                            .addClass('none')
                            .insertBefore( $messagesWrap.children().first() )

                        var duration = 400;

                        $wrap.find('.load-chat-history, img.super-centered').velocity('transition.fadeOut', {
                                        duration: duration
                                     });
                        
                        $messagesWrap
                            .children()
                            .velocity({ opacity: [ 0, 0.3] }, {
                                duration: duration,
                                complete: function(){
                                    
                                    $messagesWrap.children().addClass('none');

                                    LJ.fn.adjustChatPaneById({
                                        stick_to_content: true,
                                        event_id: event_id,
                                        group_id: group_id
                                    });

                                     $messagesWrap
                                        .children()
                                        .removeClass('none')
                                        .velocity({ opacity: [ 1, 0] }, {
                                            duration: duration,
                                            complete: function(){
                                                $messagesWrap.parents('.event-accepted-chat-wrap').removeClass('fetching-more');                                                
                                            }
                                        });
                                }
                            });

                    } else {
                        
                        $messagesWrap
                            .html( messages_html ).end()
                            .find('.readby').attr('data-names', readby )

                        LJ.fn.displayReadBy({ event_id: event_id, readby: readby, chat_id: chat_id });
                        
                        LJ.fn.adjustAllChatPanes();
                    }

                    // Prepended or appended, whispery anyway
                    LJ.fn.whisperifyChatMessages( chat_id );

                    // Check if unread messages need to be notified
                    LJ.fn.checkNotification_unreadMessages();


                } else {
                    // Prevent loader from staying eternally
                    $wrap.find('.load-chat-history, img.super-centered').velocity('transition.fadeOut', {
                        duration: 900,
                        complete: function(){

                            $wrap
                                .find('.load-chat-history').text("Tous les messages ont été chargés !")
                                .velocity('transition.fadeIn',{
                                    duration: 900,
                                    complete: function(){

                                         $wrap
                                            .find('.load-chat-history')
                                            .velocity('transition.fadeOut',{
                                                duration: 900,
                                            });

                                        $wrap
                                            .find('.event-accepted-chat-message')
                                            .velocity({ opacity: [ 1, 0.3 ]},{ 
                                                duration: 900 
                                            });

                                    }
                                });
                        }
                     });
                }

        },
        sendReadBy: function( options ){

            var chat_id  = options.chat_id;
            var group_id = options.group_id;
            var event_id = options.event_id;
            var name     = options.name;

            if( !name || !chat_id )
                return console.error('Cant send readyby, missing parameter');

            var data = {
                name     : name,
                group_id : group_id,
                event_id : event_id
            };

            LJ.fn.api('post', 'chats/' + chat_id + '/readby', { data: data }, function( err, res ){
                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.log('Send readby success!');
                }
            });

        },
        displayReadBy: function( options ){

            var readby   = options.readby,
                event_id = options.event_id,
                chat_id  = options.chat_id;

            if( !chat_id ){
                return console.error('Cannot display names without id');
            } 
                
            var $chat_wrap  = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');
            var $event_wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');
            var $hosts      = $event_wrap.find('.event-accepted-users-group[data-status="hosts"]').find('.event-accepted-user');
            var $users      = $event_wrap.find('.event-accepted-users-group[data-status="accepted"]:not(.none)').find('.event-accepted-user');
            var $readby     = $chat_wrap.find('.readby');

            var n = $hosts.length + $users.length;
            var last_sender_name = $chat_wrap.find('.event-accepted-chat-message').last().attr('data-authorname');

            $readby.attr('data-names', readby );
            var names = $readby.attr('data-names').split(',');

            names = _.pull( names, last_sender_name );

            var display = '';
            
            if( names.length == n-1 && name.length > 1 ){
                display = 'Vu par tout le monde';
            }
            if( names.length == 1 && names[0] != '' & display == ''){
                display = 'Vu par ' + names[0];
            }
            if( names.length > 1 ){
                display = 'Vu par ' + names.slice( 0, names.length -1 ).join(', ') + ' et ' + names[ names.length - 1 ];
            }

            $readby.text( display );

        },
        bindFetchMoreHistory: function( chat_id ){

            var do_nothing_condition;
            $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]')

            .bind('jsp-scroll-y', function( e, scroll_position_y, is_at_top, is_at_bottom ){

                var $self = $(this);

                // Capture value out of the closure. setTimeout needs to read the real value, refreshed
                do_nothing_condition = !is_at_top || $self.hasClass('fetching-more');

                if( do_nothing_condition ){
                    // LJ.fn.log('Do nothing first round...');
                    return // Do nothing
                }

                if( $self.hasClass('fetching-confirm') ){
                    return;
                }
                $self.addClass('fetching-confirm');

                if( $self.hasClass('fetching-more') ){
                    return;
                }

                // LJ.fn.log('Fetching once...');
                // Condition seems okay. If still ok in 't' ms, then do it.
                setTimeout(function(){

                    // LJ.fn.log('Triggering twice...');
                    $self.removeClass('fetching-confirm');

                    if( do_nothing_condition ){
                        // LJ.fn.log('NOT Triggering twice!');
                        return;
                    }              
                    var chat_id  = $self.attr('data-chatid');
                    var event_id = chat_id.split('-')[0];
                    var jsp      = LJ.jsp_api[ event_id ].chats[ chat_id ];

                    if( !jsp ){
                        return LJ.fn.warn('Jsp undefined');
                    }
                    
                    LJ.fn.log('Fetching more messages...');
                    $self.addClass('fetching-more');

                    var chat_id  = chat_id;
                    var group_id = chat_id.split('-')[1];
                    var event_id = chat_id.split('-')[0]; 

                    var messages_fetched = $self.find('.event-accepted-chat-message').length;
                    var $last_message    = $self.find('.event-accepted-chat-message').first();

                    if( $last_message.hasClass('jsp-glue') )
                        return;

                    $last_message.addClass('jsp-glue');

                    LJ.fn.showLoadersInChat( $self );

                    LJ.fn.fetchChatHistoryById({
                        chat_id          : chat_id,
                        event_id         : event_id,
                        group_id         : group_id,
                        messages_fetched : messages_fetched,
                        prepend          : true
                    });
                        

                }, 300 );

            });

        },
        showChat: function( event_id, group_id ){

            var evt = _.find( LJ.cache.events, function( evt ){
                return evt._id == event_id;
            });

            if( !evt )
                return LJ.fn.toastMsg( LJ.text_source["app_event_canceled"][ LJ.app_language ], "info" );
            
            // If not on event view, make sure we are first!
            if( !$('#events').hasClass('menu-item-active') ){

                $('#events').click();

                return LJ.fn.timeout( 750, function(){
                    LJ.fn.showChat( event_id, group_id )
                });
            }

            // Show event panel. If one event_id is already shown, call the hideAndShow method
            // Otherwise, call the default show method;
            var active_event_id =  $('.row-events-accepted-inview.active').attr('data-eventid');

            if( active_event_id && active_event_id != event_id ){
                LJ.fn.hideAndShowEventInview( event_id, { group_id: group_id, current_event_id: active_event_id });
            // active_event_id == null because all views are hidden, show it normally
            } else {
                LJ.fn.showEventInview( event_id, { group_id: group_id });
            }


            LJ.fn.activateEventTabview( event_id );
            LJ.fn.showEventPreview( event_id );

        }

	});