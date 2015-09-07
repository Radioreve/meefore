
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsChat: function(){

            LJ.$body.on('focus', '.event-accepted-chat-typing input', function(){

                var $self       = $(this);
                var $event_wrap = $self.parents('.row-events-accepted-inview');
                var $chat_wrap  = $self.parents('.event-accepted-chat-wrap');
                var $readby     = $self.siblings('.readby');

                if( ['accepted', 'hosted'].indexOf( $event_wrap.attr('data-status')) == -1 ){
                    return console.log('Not accepted in event, nothing to send');
                }
                
                var names =  _.pull( $readby.attr('data-names').split(','), '' );
                if( names.length > 0 && names.indexOf( LJ.user.name ) == -1 ){

                    // check éventuel sur l'option oui ou non montrer qu'on a lu les messages
                    console.log('Calling readBy...');

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

                console.log('Message already seen, not sending anything');

            });
			
            LJ.$body.on('keypress', '.event-accepted-chat-typing input', function(e){

                var keyCode = e.keyCode || e.which;
                if( keyCode === 13 ){
                    $(this).siblings('button').click();
                }

            });

            LJ.$body.on('click', '.event-accepted-chat-typing button', function(){

                var $self       = $(this);
                var $event_wrap = $self.parents('.row-events-accepted-inview');
                var $chat_wrap  = $self.parents('.event-accepted-chat-wrap');
                
                var msg       = $self.siblings('input').val();
                var event_id  = $event_wrap.attr('data-eventid');
                var group_id  = null;
                var chat_id   = null;

                if( $event_wrap.attr('data-status') == 'hosted' ){
                    group_id = 'hosts';
                } else {
                    group_id  = LJ.fn.findMyGroupIdFromDom( this ); 
                }

                var chat_id   = $chat_wrap.attr('data-chatid');

                if( ['accepted','hosted'].indexOf( $event_wrap.attr('data-status') ) == -1  )
                    return LJ.fn.toastMsg("Vous n'avez pas été accepté!", 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg('Le message est vide!', 'info');

                if( $self.hasClass('active') )
                    return LJ.fn.toastMsg('Moins vite!', 'info');

                var data = {
                    msg         : msg,
                    event_id    : event_id,
                    group_id    : group_id,
                    chat_id     : chat_id,
                    img_id      : LJ.fn.findMainImage( LJ.user ).img_id,
                    img_vs      : LJ.fn.findMainImage( LJ.user ).img_version,
                    facebook_id : LJ.user.facebook_id,
                    name        : LJ.user.name,
                    sent_at     : new Date()
                };

                // Order important cause addChatLine erases .text() property
                LJ.fn.addChatLine( data );

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

            delog('Handling chat success for chat_id : ' + res.chat_id );

            $('.event-accepted-chat-wrap[data-chatid="' + res.chat_id + '"]')
                .find('.event-accepted-chat-typing button').removeClass('active').end()
                .find('.readby').text('Envoyé')
                    .find('img').remove();


        },
		addChatLine: function( options ){
            
            delog('Adding chatline...');
            
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
                    .addClass( options.class_names && options.class_names.join(' ') );

            if( options.facebook_id == LJ.user.facebook_id ){
                $wrap.find('.event-accepted-chat-message.me').last().addClass('sending');
            }

            LJ.fn.adjustAllChatPanes();

        },
        fetchMyChat_Host: function( evt ){

            console.log('Fetching chat as host');

            var event_id = evt._id;
            var $wrap    = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            // Fetch hosts chat
            var options_array = [{
                group_id : "hosts",
                chat_id  : LJ.fn.makeChatId({ event_id: event_id, group_id: "hosts" }) 
            }];

            // Fetch other chats
            evt.groups.forEach(function( group ){

                // User group id to build chatid, but then have to send "hosts" for proper auth
                var group_id = LJ.fn.makeGroupId( group.members_facebook_id );
                var chat_id  = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });

                options_array.push({
                    chat_id  : chat_id,
                    group_id : "hosts"
                });

            });

            options_array.forEach(function( option ){

                LJ.fn.fetchChatHistoryById( _.merge( option, { event_id: event_id } ), function( err, res ){

                    if( err ){
                        return LJ.fn.handleApiError( err );
                    } else {
                        return LJ.fn.handleFetchChatHistoryById( res );
                    }

                });

            });

        },
        fetchMyChat_Group: function( evt ){

            console.log('Fetching chat as group');

            var event_id = evt._id;
            var $wrap    = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            if( $wrap.attr('data-status') != 'accepted' )
                return console.warn('No chat to fetch, still waiting approval');

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
        fetchChatHistoryById: function( options, callback ){

            delog('Fetching messages for chat with id : ' + options.chat_id );

            var data = {
                chat_id : options.chat_id,
                group_id: options.group_id,
                event_id: options.event_id
            };

            LJ.fn.api('get','chats/' + options.chat_id, { data: data }, function( err, res ){

                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleFetchChatHistoryById({
                        event_id : options.event_id,
                        messages : res.messages,
                        readby   : res.readby,
                        chat_id  : options.chat_id 
                    });
                }

            });

        },
        handleFetchChatHistoryById: function( options ){
                
                var event_id  = options.event_id,
                messages = options.messages,
                readby   = options.readby;
                chat_id  = options.chat_id;

                var chats_html = [];
                var $wrap      = $('.event-accepted-chat-wrap[data-chatid="' + options.chat_id + '"]');

                if( !event_id )
                    return console.error('Cannot add chat history without event id');

                if( !messages )
                        return console.log('Chat is empty, nothing to add');

                messages.forEach(function( msg ){
                    chats_html.push( LJ.fn.renderChatLine( msg ) );
                });

                if( chats_html.length != 0 ){

                    var $messagesWrap = $wrap.find('.jspPane');
                    var messages_html =  chats_html.length != 0 && chats_html.join('');
                    
                    $messagesWrap
                        .html( messages_html ).end()
                        .find('.readby').attr('data-names', readby );

                    LJ.fn.displayReadBy({ event_id: event_id, readby: readby, chat_id: chat_id });

                }
                LJ.fn.adjustAllChatPanes();

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
                    console.log('Send readby success!');
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

            /* Debug purposes */
            console.log('There are ' + n + ' people in this event, chatting');
            console.log('Displaying : ' + display );

            $readby.text( display );

        }

	});