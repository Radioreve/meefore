
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsSettings: function(){

			LJ.$body.on('click', '.settings-group-buttons .btn-validate', function(){

                var $self = $(this);

                if( $self.hasClass('btn-validating') ) return;

                var $wrap = $self.parents('.row-events-accepted-inview');
                var event_id = $wrap.attr('data-eventid');
                var status   = $wrap.find('.settings-group-status .active').attr('data-status');

                // Special case for cancel : need ask user confirmation
                if( status == "canceled" ){
                    $wrap.find('.settings-group-status').children().velocity('transition.slideRightOut', {
                        duration: 300,
                        complete: function(){
                            $wrap.find('.settings-group-status')
                                 .append(['<div class="confirm-cancel none">',
                                    '<span class="event-settings-group-name">Êtes-vous sûr ?</span>',
                                    '<button class="theme-btn btn-validate" data-confirm="yes">Oui</button>',
                                    '<button data-confirm="no" class="theme-btn btn-cancel">Non</button></div>'
                                    ].join(''))
                                 .find('.confirm-cancel').velocity('transition.slideLeftIn', {
                                    duration : 300,
                                    display  : 'inline-block'
                                 });
                            $wrap.find('.settings-group-buttons').find('button').addClass('btn-validating');
                        }
                    })
                    return;
                }

                $self.addClass('btn-validating');
                LJ.fn.showLoaders();
                
                LJ.fn.changeEventStatus({
                    event_id : event_id,
                    status   : status
                });

            }); 

    
            LJ.$body.on('click', '.confirm-cancel button', function(){

                var $self    = $(this);
                var $wrap = $self.parents('.row-events-accepted-inview');
                var event_id = $wrap.attr('data-eventid');
                var confirm  = $self.attr('data-confirm');

                if( confirm == "yes" ){

                    $self.addClass('btn-validating');
                    LJ.fn.showLoaders();
                    
                    LJ.fn.changeEventStatus({
                        event_id : event_id,
                        status   : "canceled"
                    });

                } else {

                    $('.confirm-cancel').velocity('transition.slideRightOut', {
                        duration: 300,
                        complete: function(){
                            var $wrap = $self.closest('.row-events-accepted-inview');
                            $wrap.find('.settings-group-status *').velocity('transition.slideLeftIn',{
                                duration : 300,
                                display  : 'inline-block'
                            });
                            $wrap.find('.settings-group-buttons').find('button').removeClass('btn-validating');
                            $(this).remove();

                        }
                    })                   

                }

            }); 

            LJ.$body.on('click', '.icon-event-settings', function(){
               
                var $self = $(this);

                var $eventSettings = $self.parents('.row-events-accepted-inview')
                                          .find('.event-inview-settings');

                if( $self.hasClass('active') ){
                    $self.removeClass('active');
                    $eventSettings.velocity( LJ.ui.slideRightOutLight, {display:'none'} );
                    return;
                }

                $self.addClass('active');
                $eventSettings.velocity( LJ.ui.slideLeftInLight, {display:'block'} );
                
            });
            
            LJ.$body.on('click', '.settings-group-buttons .btn-cancel', function(){

                if( $(this).hasClass('btn-validating') ) return;
                $(this).parents('.row-events-accepted-inview').find('.icon-event-settings').click();

            });

            LJ.$body.on('click', '.event-settings-group-action', function(){

                $(this).siblings('.event-settings-group-action').removeClass('active');
                $(this).addClass('active');     
                
            });
			
			
			 
		},
		handleChangeStatusSuccess: function( data ){

            var event_id = data.event_id;
            var status   = data.status;

            LJ.fn.hideLoaders();
            LJ.fn.refreshEventStatusOnMap( event_id, status );
            LJ.fn.toastMsg( LJ.text_source["to_request_event_status_modified"][ LJ.app_language ] , 'info');

            // close the setting panel (of every event, in fact)
            $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                .find('.icon-event-settings').removeClass('active').end()
                .find('.event-inview-settings').velocity( LJ.ui.slideRightOutLight, { display:'none' })
                .find('.btn-validating').removeClass('btn-validating');

            if( status == "canceled" ){
                LJ.fn.handleCancelEvent( event_id );
            }


        },
        removeMarker: function( opts ){

            var cache_src = opts.cache_src;
            var match_id  = opts.match_id;
            var done      = opts.done;

            LJ[ cache_src ].forEach(function( mrk, i ){
                if( mrk.id == match_id ){
                    if( mrk.marker && mrk.marker.setMap ){
                        mrk.marker.setMap( null );
                    } else {
                        mrk.setMap( null );
                    }
                    LJ[ cache_src ].splice( i, 1 );
                    if( done ){
                        done();
                    }
                }
            });

        },
        handleCancelEvent: function( event_id ){

            var evt = LJ.fn.getEvent( event_id );

            if( !evt ) return;

            // Clear event marker
            LJ.fn.removeMarker({
                cache_src : 'event_markers',
                match_id  : event_id
            });

            // Clear active event marker
            LJ.fn.removeMarker({
                cache_src : 'active_event_marker',
                match_id  : event_id,
                done      : LJ.fn.clearAllActivePaths
            });
            
            // Clear cache paths so its not displayed when loaded from cache
            // with no events in its extremities
            LJ.fn.removeMarker({
                cache_src : 'half_active_paths',
                match_id  : event_id
            })
            delete LJ.cache.paths[ event_id ];

            // Clear party marker if no other meefore was going there either
            var place_id = _.find( LJ.cache.events, function( el ){
                return el._id == event_id; 
            }).party.address.place_id;

            var k = 0;
            LJ.cache.events.forEach(function( evt ){
                if( evt.party.address.place_id === place_id ){
                    k++;
                }
            });

            if( k == 1 ){
            // There was only 1 meefore going there, remove party marker too
                LJ.fn.removeMarker({
                    cache_src : 'party_markers',
                    match_id  : place_id
                });
               LJ.fn.removeMarker({
                    cache_src : 'active_party_marker',
                    match_id  : place_id
                });
            }

            // Clear event cache
            LJ.cache.events.forEach(function( evt, i ){
                if( evt._id == event_id ){
                    LJ.cache.events.splice( i, 1 );
                }
            });


            var $els =  $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                    .add('.event-accepted-tabview[data-eventid="' + event_id + '"]')
                    .add('.row-preview');


            $els.velocity('transition.slideDownOut', {
                duration: 500,
                complete: function(){
                    $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                    .add('.event-accepted-tabview[data-eventid="' + event_id + '"]')
                }
            });


        },
        changeEventStatus: function( options ){

            var event_id = options.event_id,
                status   = options.status;

            if( !event_id || !status ){
                return console.error('Cant update status without options');
            }

            var data = {
                status: status
            };

            LJ.fn.showLoaders();
            LJ.fn.api('patch','events/' + event_id + '/status', { data: data }, function( err, evt ){
                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleChangeStatusSuccess( evt );
                }
            });

        }

	});