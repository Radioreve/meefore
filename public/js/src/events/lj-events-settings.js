
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsSettings: function(){

			LJ.$body.on('click', '.settings-group-buttons .btn-validate', function(){

                var $self = $(this);

                if( $self.hasClass('btn-validating') ) return;

                var $wrap = $self.parents('.row-events-accepted-inview');
                var event_id = $wrap.attr('data-eventid');
                var status   = $wrap.find('[data-status].active').attr('data-status');

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

                var $self   = $(this);
                var confirm = $self.attr('data-confirm');

                if( confirm == "yes" ){

                    // $self.addClass('btn-validating');
                    // LJ.fn.showLoaders();
                    
                    // LJ.fn.changeEventStatus({
                    //     event_id : event_id,
                    //     status   : status
                    // });

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

            // close them all, whatever
            $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                .find('.icon-event-settings').removeClass('active').end()
                .find('.event-inview-settings').velocity( LJ.ui.slideRightOutLight, {display:'none'} )
                .find('.btn-validating').removeClass('btn-validating')

        },
        changeEventStatus: function( options ){

            var event_id = options.event_id,
                status   = options.status;

            if( !event_id || ! status ){
                console.log(options);
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