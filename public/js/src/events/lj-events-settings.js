
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsSettings: function(){

			LJ.$body.on('click', '.event-inview-settings .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                var $wrap = $(this).parents('.row-events-accepted-inview');

                $(this).addClass('btn-validating');
                LJ.fn.showLoaders();
                var event_id = $wrap.attr('data-eventid');
                var status = $wrap.find('[data-status].active').attr('data-status');
                
                LJ.fn.changeEventStatus({
                    event_id: event_id,
                    status: status
                })

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
            
            LJ.$body.on('click', '.event-inview-settings .btn-cancel', function(){

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
            LJ.fn.toastMsg("Le statut de l'évènement a été modifié", 'info');

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
            LJ.fn.api('patch','events/'+event_id+'/status', { data: data }, function( err, evt ){
                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleChangeStatusSuccess( evt );
                }
            });

        }

	});