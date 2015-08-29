
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
                var author    = LJ.user;
                var msg       = $self.siblings('input').val();
                var event_id  = $self.parents('.row-events-accepted-inview').attr('data-eventid');

                if( $self.parents('.validating').length != 0 )
                    return LJ.fn.toastMsg("Vous n'avez pas encore été accepté!", 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg('Le message est vide!', 'info');

                $self.siblings('input').val('');
                LJ.fn.addChatLine({ event_id: event_id, msg: msg, author: author });
                // Send to the server

            });
			 
		},
		addChatLine: function( o ){
            
            delog('Adding chatline...');
            
            var id = o.id,
                author   = o.author,
                msg      = o.msg;

            var chat_msg_html = LJ.fn.renderChatLine({ author: author, msg: msg  });

            var $wrap = $('.row-events-accepted-inview[data-eventid="' + id + '"]');

                if( $wrap.length == 0 )
                    return console.error('Didnt find the container based on id : ' + id );

                $wrap
                .find('.event-accepted-notification-message')
                .remove()
                .end()
                .find('.event-accepted-chat-messages .jspPane')
                .append( chat_msg_html )
                .find('.event-accepted-chat-message').last()
                .addClass( o.class_names && o.class_names.join(' ') );

            LJ.fn.adjustAllChatPanes();

        }

	});