
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		pushNewEvent: function( evt ){

			if( !evt )
				return console.error('No arguments were passed (pushNewEvent)')

			/* Default message */
			var message = evt.hosts[0].name + ' propose un before le ' + moment( evt.begins_at ).format('DD/MM');

			/* Internal */
			LJ.cache.events.push(evt);

			/* External */
            LJ.fn.displayEventMarker( evt );

            /* Did a friend tag me as host ? */
            if( _.pluck( evt.hosts, 'facebook_id').indexOf( LJ.user.facebook_id ) != -1 ){
            	message = evt.hosts[0].name + ' vous a ajouté en tant qu\'organisateur de son before!';

            	LJ.fn.addEventInviewAndTabview( evt, { host: true });
            	LJ.fn.joinEventChannel( evt );
            	LJ.fn.fetchMe();
            }

			/* Notifications bubble */
			LJ.fn.bubbleUp('#events');
			LJ.fn.toastMsg( message, 'info', 5000 );

		},
		pushNewGroup: function( data ){

			var event_id = data.event_id,
				group 	 = data.group;

			if( !event_id || !group )
				return console.error('Missing group and/or event_id, cant add request');

			LJ.fn.toastMsg( group.name + 's\'est rajouté à un before où vous êtes', 'info' );

			if( _.pluck( LJ.user.events, '_id' ).indexOf( event_id ) != -1 ){
				var $group_html = $( LJ.fn.renderUsersGroupWithToggle( group ) );
			} else {
				var $group_html = $( LJ.fn.renderUsersGroup( group ) );
			}

			$group_html.insertAfter( $('.event-accepted-users-group').last() );
			LJ.fn.adjustAllChatPanes();


		},
		pushNewChatMessage: function( data ){

			console.log(data);
		}

	});