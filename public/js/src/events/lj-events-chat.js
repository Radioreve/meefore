
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsChat: function(){
			
            LJ.$body.on('keypress', '.event-accepted-chat-typing input', function(e){
                var keyCode = e.keyCode || e.which;
                if( keyCode === 13 ){
                    $(this).siblings('button').click();
                }
            });

            LJ.$body.on('click', '.event-accepted-chat-typing button', function(){

                var $self     = $(this);

                var $eRow     = $self.parents('.row-events-accepted-inview');

                var msg       = $self.siblings('input').val();
                var event_id  = $eRow.attr('data-eventid');
                var group_id  = $eRow.find('.event-accepted-user[data-userid="'+LJ.user.facebook_id+'"]')
                                    .parents('.event-accepted-users-group').attr('data-groupid');

                if( ['accepted','hosted'].indexOf( $eRow.attr('data-status') ) == -1  )
                    return LJ.fn.toastMsg("Vous n'avez pas été accepté!", 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg('Le message est vide!', 'info');

                if( $self.hasClass('active') )
                    return LJ.fn.toastMsg('Moins vite!', 'info');

                $self.siblings('input').val('');

                var data = {
                    msg         : msg,
                    id          : event_id,
                    img_id      : LJ.fn.findMainImage( LJ.user ).img_id,
                    img_vs      : LJ.fn.findMainImage( LJ.user ).img_version,
                    facebook_id : LJ.user.facebook_id,
                    name        : LJ.user.name,
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
                .find('.event-accepted-chat-messages .jspPane')
                    .append( chat_msg_html )
                .find('.event-accepted-chat-message').last()
                    .addClass( options.class_names && options.class_names.join(' ') );

                $wrap.find('.event-accepted-chat-message.me').last().addClass('sending');

            LJ.fn.adjustAllChatPanes();

        },
        fetchMyChats: function( evt ){

            delog('Fetching messages for chat with id : ' + evt._id );
            
            var $wrap = $('.row-events-accepted-inview[data-eventid="'+evt._id+'"]');
            var chats_html = [];
            var group_id = $wrap.find('.mygroup').attr('data-groupid')

            console.log(group_id);
            var data = {
                group_id: group_id
            };

            LJ.fn.api('get','chats/'+evt._id, { data: data }, function( err, messages ){

                if( err ){
                    return LJ.fn.handleApiError( err );
                } else {
                    messages.forEach(function( msg ){
                    	console.log( msg );
                        chats_html.push( LJ.fn.renderChatLine( msg ) );
                    });
                    $wrap.find('.event-accepted-chat .jspPane').html( chats_html.join('') );
                    LJ.fn.adjustAllChatPanes();
                }

            });

        }

	});