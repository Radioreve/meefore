
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsTabview: function(){

			
			 
		},
		addEventInviewAndTabview: function( evt, options ){
            
            var options = options || {};
            
            var renderFn =  _.pluck( evt.hosts, 'facebook_id').indexOf( LJ.user.facebook_id ) != -1 ? 
                            LJ.fn.renderEventInview_Host :
                            LJ.fn.renderEventInview_User ;


            $('.row-events').append(  renderFn( evt )  );
            $('.row-events-accepted-tabview').append( LJ.fn.renderEventTabview( evt ) );

            /* jsp */
            var $inview =  $('.row-events').children().last();
            
            LJ.jsp_api[ evt._id ] = {
                users: $inview.find('.event-accepted-users').jScrollPane().data('jsp'),
                chats: $inview.find('.event-accepted-chat-messages').jScrollPane({ stickToBottom: true }).data('jsp')
            };

        },
        displayEventsInviewsAndTabviews: function( events ){

            events.forEach(function( evt ){
                LJ.fn.addEventInviewAndTabview( evt );
            });

        }

	});