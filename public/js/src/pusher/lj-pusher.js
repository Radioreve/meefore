
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		 joinEventChannel: function( evt ){

            if( !evt )
                return console.error('Cant join channel, event is null');

            if( LJ.subscribed_channels[ evt._id ] )
                delete LJ.subscribed_channels[ evt._id ]; //force refresh for no double bind events

            /* storing ref to channel */
            LJ.subscribed_channels[ evt._id ] = LJ.pusher.subscribe( evt._id );

            /* handlers */
            LJ.subscribed_channels[ evt._id ].bind('new request', LJ.fn.pushNewGroup );
            LJ.subscribed_channels[ evt._id ].bind('new group status', LJ.fn.pushNewGroupStatus );
            LJ.subscribed_channels[ evt._id ].bind('new chat message', LJ.fn.pushNewChatMessage );

        },
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
            if( LJ.fn.iHost( evt ) ){
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
			
			console.log('Pushing new group in event : ' + data.evt._id );

			var evt 	 = data.evt,
				group 	 = data.group;

			if( !evt || !group ){
				console.log(evt); console.log(group);
				return console.error('Missing group and/or evt, cant add request');
			}
				

			if( LJ.fn.iHost( evt ) ){
				var $group_html = $( LJ.fn.renderUsersGroupWithToggle( group ) );
				LJ.fn.toastMsg("Un groupe s'est rajouté à votre évènement", "info");
			} else {
				var $group_html = $( LJ.fn.renderUsersGroup( group ) );
			}

			$group_html.insertAfter( 
				$('.row-events-accepted-inview[data-eventid="'+evt._id+'"]')
				.find('.event-accepted-users-group')
				.last()
			);

			LJ.fn.adjustAllChatPanes();

		},
		pushNewEventStatus: function( evt ){

			delog('Pushing new event status for event id : ' + evt._id );

			if( !evt )
				return console.error('Cant push new status without event!');
			
			// Message pour les autres organisateurs
			if( LJ.fn.iHost( evt ) ){

				LJ.fn.toastMsg("Un de vos ami a modifié le status d'un de vos évènement", "info");
				$('.row-events-accepted-inview[data-eventid="'+evt._id+'"]')
				.find('.event-inview-settings .settings-group-status .active')
				.removeClass('active')
				.end()
				.find('.event-inview-settings [data-status="'+evt.status+'"]').addClass('active');
			}

			// For everyone 
			LJ.fn.refreshEventStatusOnMap( evt );


		},
		pushNewGroupStatus: function( data ){
 			
			var group = data.group,
				evt   = data.evt;

			delog('Pushing new group status : ' + group.status + ' for event : ' + evt._id );

			var status   = group.status;
			var event_id = evt._id; 

			// Message pour les membres du groupes
			if( LJ.fn.iGroup(group) ){
				if( status == "accepted" ){
					LJ.fn.toastMsg('Vous avez été accepté dans un before!', 'info', 4000);
					// Fetch last messages based on accepted date
				}
				if( status == "kicked" ){
					LJ.fn.toastMsg('Votre groupe a été suspendu de la discussion', 'info', 4000);
				}
			}

			// Message pour les autres organisateurs
			if( LJ.fn.iHost(evt) ){
				if( status == "accepted" ){
					LJ.fn.toastMsg('Un de vos amis a validé un groupe', 'info', 4000);
					// Fetch last messages based on accepted date
				}
				if( status == "kicked" ){
					LJ.fn.toastMsg('Un de vos amis a suspendu un groupe de la discussion', 'info', 4000);
				}
			}

			// For everyone in the event channel
			LJ.fn.updateGroupStatusUI( evt, group );
			$('.row-events-accepted-inview[data-eventid="'+evt._id+'"]').attr('data-status', status );


		},	
		pushNewChatMessage: function( data ){

			console.log(data);
		}

	});