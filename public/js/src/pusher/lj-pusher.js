
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		 joinEventChannel: function( evt ){

            if( !evt )
                return console.error('Cant join channel, event is null');

            if( LJ.subscribed_channels[ evt._id ] )
                delete LJ.subscribed_channels[ evt._id ]; //force refresh for no double bind events

            /* storing ref to channel */
            LJ.subscribed_channels[ evt._id ] = LJ.pusher.subscribe( evt._id );

            /* handlers */
            console.log('Binding pusher events for id : ' + evt._id );
            LJ.subscribed_channels[ evt._id ].bind('new request', LJ.fn.pushNewGroup );
            LJ.subscribed_channels[ evt._id ].bind('new group status', LJ.fn.pushNewGroupStatus );
            LJ.subscribed_channels[ evt._id ].bind('new chat message', LJ.fn.pushNewChatMessage );
            LJ.subscribed_channels[ evt._id ].bind('new chat readby', LJ.fn.pushNewChatReadBy );

            LJ.subscribed_channels[ evt._id ].bind('new test event', function(data){ console.log(data); });
            LJ.subscribed_channels[ evt._id ].bind('new oversize message', function(data){ console.warn('Didnt receive pusher message (oversized)'); })

        },
        pushNewTest: function( data ){
        	console.log('Test succeed!');
        	console.log(data);
        },
		pushNewEvent: function( evt ){

			if( !evt )
				return console.error('No arguments were passed (pushNewEvent)')

			/* Default message */
			var message = evt.hosts[0].name + ' propose un before le ' + moment( evt.begins_at ).format('DD/MM');

			/* Internal */
			LJ.cache.events.push( evt );

			/* External */
            LJ.fn.displayEventMarker( evt );

            /* Did a friend tag me as host ? */
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ){
            	message = 'Un ami vous a ajouté en tant qu\'organisateur de son before!';

            	LJ.fn.addEventInviewAndTabview( evt );
            	LJ.fn.joinEventChannel( evt );
            	LJ.fn.fetchMe();
            }

			/* Notifications bubble */
			LJ.fn.bubbleUp('#events');
			LJ.fn.toastMsg( message, 'info', 5000 );

		},
		pushNewGroup: function( data ){
			
			console.log('Pushing new group in event : ' + data.event_id );

			var group             = data.group;
			var event_id      	  = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id;

			if( !event_id || !group ){
				console.log( event_id ); console.log( group );
				return console.error('Missing group and/or evt, cant add request');
			}

			if( LJ.fn.iHost( hosts_facebook_id ) ){

				LJ.fn.toastMsg("Un groupe s'est rajouté à votre évènement", "info");
				var $group_html = $( LJ.fn.renderUsersGroupWithToggle( group ) );

			} else {

				var $group_html = $( LJ.fn.renderUsersGroup( group ) );

			}

			$group_html.insertAfter( 
				$('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
				.find('.event-accepted-users-group')
				.last()
			);

			LJ.fn.adjustAllChatPanes();

		},
		pushNewEventStatus: function( data ){

			delog('Pushing new event status for event id : ' + data.event_id );

			var status            = data.status;
			var event_id          = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id;

			if( !event_id )
				return console.error('Cant push new status without event!');
			
			// Message pour les autres organisateurs
			if( LJ.fn.iHost( hosts_facebook_id ) ){

				LJ.fn.toastMsg("Un de vos ami a modifié le status d'un de vos évènement", "info");

				$('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
					.find('.event-inview-settings .settings-group-status .active').removeClass('active').end()
					.find('.event-inview-settings [data-status="' + status + '"]').addClass('active');
			}

			// For everyone 
			LJ.fn.refreshEventStatusOnMap( event_id, status );


		},
		pushNewGroupStatus: function( data ){
 			
			var group    = data.group;
			var status   = group.status;
			var event_id = data.event_id;
			var hosts_facebook_id = data.hosts_facebook_id

			delog('Pushing new group status : ' + status + ' for event : ' + event_id );


			// Message pour les membres du groupes
			if( LJ.fn.iGroup( group.members_facebook_id ) ){

				// Update global status of their event
				$('.row-events-accepted-inview[data-eventid="' + event_id + '"]').attr('data-status', status );

				if( status == "accepted" ){
					LJ.fn.toastMsg('Vous avez été accepté dans un before!', 'info', 3500 );
					LJ.fn.addChatLine({
						id          : event_id,
						msg         : "Votre groupe vient d'être accepté dans la discussion!",
						name        : LJ.bot_profile.name,
						img_id      : LJ.bot_profile.img_id,
						facebook_id : LJ.bot_profile.facebook_id,
						sent_at 	: new Date()
					});
					
				}
				if( status == "kicked" ){
					LJ.fn.toastMsg('Votre groupe a été suspendu de la discussion', 'info', 3500 );
					LJ.fn.addChatLine({
						id          : event_id,
						msg         : "Votre groupe vient d'être suspendu de la discussion!",
						name        : LJ.bot_profile.name,
						img_id      : LJ.bot_profile.img_id,
						facebook_id : LJ.bot_profile.facebook_id,
						sent_at 	: new Date()
					});
				}
			}

			// Message pour les autres organisateurs
			if( LJ.fn.iHost( hosts_facebook_id ) ){

				if( status == "accepted" ){

					LJ.fn.toastMsg('Un de vos amis a validé un groupe', 'info', 3500 );
					
				}
				if( status == "kicked" ){

					LJ.fn.toastMsg('Un de vos amis a suspendu un groupe de la discussion', 'info', 3500 );
				}

			}

			// For everyone in the event channel
			LJ.fn.updateGroupStatusUI( event_id, group );

		},	
		pushNewChatMessage: function( data ){

			console.log('Pushing chat line...')

			id = data.id;
			var $wrap = $('.row-events-accepted-inview[data-eventid="'+id+'"]');

			if( data.facebook_id == LJ.user.facebook_id ){
				$wrap.find('.sending').removeClass('sending');
			} else {
				LJ.fn.addChatLine( data );
				/*if( $wrap.find('input').is(':focus') ){
					LJ.fn.sendReadBy({
						name : LJ.user.name,
						id   : id
					});
				}*/
			}

		},
		pushNewChatReadBy: function( data ){

			var $readby = $('.row-events-accepted-inview[data-eventid="' + data.id + '"]').find('.readby'); 
			var readby  = data.readby;

			/* On ajoute le name de la personne à la liste de l'attr data-names */
			var current_names = $readby.attr('data-names');

			if( typeof current_names == 'string' && current_names.length > 0 ){
            	$readby.attr('data-names', readby );
			}

			LJ.fn.displayReadBy( data );
		}

	});