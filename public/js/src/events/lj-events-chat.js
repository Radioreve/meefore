
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsChat: function(){

            LJ.$body.on('focus', '.event-accepted-chat-typing input', function(){

                var $self   = $(this);
                var $wrap   = $self.parents('.row-events-accepted-inview');
                var $readby = $self.siblings('.readby');

                if( ['accepted', 'hosted'].indexOf( $wrap.attr('data-status')) == -1 ){
                    return console.log('Not accepted in event, nothing to send');
                }

                if( $readby.attr('data-names').split(',').indexOf( LJ.user.name ) == -1 ){

                    // check éventuel sur l'option oui ou non montrer qu'on a lu les messages
                    console.log('Calling readyBy...');
                    LJ.fn.sendReadBy({
                        name     : LJ.user.name,
                        group_id : LJ.fn.findMyGroupId( this ),
                        chat_id  : $wrap.attr('data-eventid')
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

                var $self     = $(this);
                var $wrap     = $self.parents('.row-events-accepted-inview');
                
                var msg       = $self.siblings('input').val();
                var event_id  = $wrap.attr('data-eventid');
                var group_id  = LJ.fn.findMyGroupId( this ); 

                if( ['accepted','hosted'].indexOf( $wrap.attr('data-status') ) == -1  )
                    return LJ.fn.toastMsg("Vous n'avez pas été accepté!", 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg('Le message est vide!', 'info');

                if( $self.hasClass('active') )
                    return LJ.fn.toastMsg('Moins vite!', 'info');

                $self.siblings('input').val('');
                $self.siblings('.readby').attr('data-names','').text('');

                var data = {
                    msg         : msg,
                    id          : event_id,
                    img_id      : LJ.fn.findMainImage( LJ.user ).img_id,
                    img_vs      : LJ.fn.findMainImage( LJ.user ).img_version,
                    facebook_id : LJ.user.facebook_id,
                    name        : LJ.user.name,
                    sent_at     : new Date(),
                    group_id    : group_id
                };

                LJ.fn.addChatLine( data );

                LJ.fn.api('post', 'chats/'+event_id, { data: data }, function( err, res ){
                    if( err ){
                        LJ.fn.handleApiError( err );
                    } else {
                        LJ.fn.handleSendChatSuccess( res );
                    }
                });

            });
			 
		},
        handleSendChatSuccess: function( res ){

            $('.row-events-accepted-inview[data-eventid="'+res.id+'"]')
                .find('.event-accepted-chat-typing button')
                    .removeClass('active');

        },
		addChatLine: function( options ){
            
            delog('Adding chatline...');
            
            var id = options.id;

            if( !id )
                return console.error('Cannot add chatline without chat id');

            var chat_msg_html = LJ.fn.renderChatLine( options );

            var $wrap = $('.row-events-accepted-inview[data-eventid="' + id + '"]');

                if( $wrap.length == 0 )
                    return console.error('Didnt find the container based on id : ' + id );

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
        fetchMyChats: function( evt ){

            delog('Fetching messages for chat with id : ' + evt._id );
            
            var evt = evt;
            var $wrap = $('.row-events-accepted-tabview').siblings('.row-events-accepted-inview[data-eventid="'+evt._id+'"]');
            var group_id = $wrap.find('.mygroup').attr('data-groupid');
            
            var chats_html = [];

            if( ['accepted','hosted'].indexOf( $wrap.attr('data-status') ) == -1 ){
                console.log('No fetching necessary, not accepted');
                return;
            }

            var data = {
                group_id: group_id
            };

            LJ.fn.api('get','chats/'+evt._id, { data: data }, function( err, res ){

                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleFetchChatsSuccess({
                        evt      : evt,
                        messages : res.messages,
                        readby   : res.readby 
                    });
                }

            });

        },
        handleFetchChatsSuccess: function( options ){
                
                var evt  = options.evt,
                messages = options.messages,
                readby   = options.readby;

                var chats_html = [];
                var $wrap      = $('.row-events-accepted-inview[data-eventid="'+evt._id+'"]');

                if( !evt )
                    return console.error('Cannot add chat history without event id');

                messages.forEach(function( msg ){
                        chats_html.push( LJ.fn.renderChatLine( msg ) );
                });

                if( chats_html.length != 0 ){
                    $wrap.find('.event-accepted-chat .jspPane').html( chats_html.length != 0 && chats_html.join('') ).end()
                         .find('.readby').attr('data-names', readby );

                    LJ.fn.displayReadBy({ readby: readby, id: evt._id });

                }
                LJ.fn.adjustAllChatPanes();

        },
        sendReadBy: function( options ){

            var chat_id  = options.chat_id;
            var group_id = options.group_id
            var name     = options.name;

            if( !name || !chat_id )
                return console.error('Cant send readyby, missing parameter');

            var data = {
                name     : name,
                group_id : group_id
            };

            LJ.fn.api('post', 'chats/'+chat_id+'/readby', { data: data }, function( err, res ){
                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    console.log('Send readby success!');
                }
            });

        },
        displayReadBy: function( options ){

            var readby  = options.readby,
                id      = options.id;

            if( !id ){
                return console.error('Cannot display names without id');
            } 
            
            var $wrap   = $('.row-events-accepted-inview[data-eventid="' + id + '"]');
            var $hosts  = $wrap.find('.event-accepted-users-group[data-status="host"]').find('.event-accepted-user');
            var $users  = $wrap.find('.event-accepted-users-group[data-status="accepted"]').find('.event-accepted-user');
            var $readby = $wrap.find('.readby');

            var n = $hosts.length + $users.length;
            var last_sender_name = $wrap.find('.event-accepted-chat-message').last().attr('data-authorname');

            var names = $readby.attr('data-names').split(',');

            names = _.filter( names, function(el){
                return el != last_sender_name;
            });

            if( names.length == n-1 ){
                var display = 'Vu par tout le monde';
            }
            if( names.length == 1 ){
                var display = 'Vu par ' + names[0];
            }
            if( names.length > 1 ){
                var display = 'Vu par ' + names.slice( 0, names.length -1 ).join(', ') + ' et ' + names[ names.length - 1 ];
            }

            /* Debug purposes */
            console.log('There are ' + n + ' people in this event, chatting');
            console.log('Displaying : ' + display );

            $readby.text( display );

        }

	});