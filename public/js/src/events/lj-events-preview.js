
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsPreview: function(){

			LJ.$body.on('click', '.btn-jumpto', function(){
				var event_id = $(this).parents('.event-preview').attr('data-eventid');
				var $tab = $('.event-accepted-tabview[data-eventid="' + event_id + '"]');
				
				$tab.click();
			});

			LJ.$body.on('click', '#requestIn .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                $(this).addClass('btn-validating');
                $('#createEvent').find('label').addClass('lighter');
                LJ.fn.showLoaders();
                
                var event_id = $(this).parents('#requestIn').attr('data-eventid');
             
                LJ.fn.requestIn( event_id );

            });

             LJ.$body.on('click','.btn-requestin', function(){

                var event_id = $(this).parents('.event-preview').attr('data-eventid');

                if( !event_id )
                    return console.error('eventid wasnt attached to the dom, cant continue with the request');
                
                LJ.fn.displayInModal({
                    source: 'local',
                    fix_height: 0,
                    starting_width: 550,
                    custom_classes: ['text-left'],
                    render_cb: function(){
                        return LJ.fn.renderEventRequestIn( event_id );
                    },
                    predisplay_cb: function(){

                        $('.row-events-map').hide();
                        LJ.fn.initTypeaheadGroups( LJ.user.friends );

                         /* Adjusting label & input width */
                        LJ.fn.adjustAllInputsWidth('#requestIn');

                        var default_groupname = LJ.user.name + ' & co';
                        LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput( default_groupname ), inp: '#ri-groupname', max: 1 });

                         var default_message = 'Ahoy!';
                        LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput( default_message ), inp: '#ri-groupmessage', max: 1 });

                    }
                })

            });

		},
		requestIn: function( event_id ){

             delog('Requesting in  for event with id : '+ event_id + '...');

            var name, message, members_facebook_id = [];
            var $wrap = $('#requestIn');

            //name & message
            name    = $wrap.find('.row-requestin-group-name .item-name').text().trim();
            message = $wrap.find('.row-requestin-group-message .item-name').text().trim();

            // members
            if( $wrap.find('.friend').length != 0 ){
                members_facebook_id.push( LJ.user.facebook_id );
                $wrap.find('.friend').each(function(i, el){
                        members_facebook_id.push( $(el).attr('data-id') );
                });
            }

            var request = {
                name                : name,
                message             : message,
                members_facebook_id : members_facebook_id
            };

            
            LJ.fn.api('patch', 'events/' + event_id + '/request', { data: request }, function( err, res ){

                LJ.fn.hideLoaders();
                
                $('#requestIn')
                    .find('.lighter').removeClass('lighter').end()
                    .find('.btn-validating').removeClass('btn-validating');

                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleRequestInSuccess( res );
                }

            });


        },
        handleRequestInSuccess: function( data ){

                delog('Request in success');
                
                var event_id = data.event_id;

                LJ.fn.hideModal(function(){

                    LJ.fn.fetchEventById( event_id, LJ.fn.handleFetchEventById );
                    LJ.fn.toastMsg('Votre demande a été envoyée!', 'info');

                     LJ.active_event_marker[0].marker.setIcon( LJ.cloudinary.markers.pending_active );

                    _.find( LJ.event_markers, function( marker ) { return marker.id == event_id; })
                     .marker.setIcon( LJ.cloudinary.markers.pending );


                });

        },
        addEventPreview: function( evt, options ){

            if( !evt || evt === {} )
                return console.error('No event to be added : ' + evt );

            options = options || {};

            if( evt._id == $('.event-preview').attr('data-eventid') )
                return;

            //Default value
            var renderFn = LJ.fn.renderEventPreview_User;

            var hids = _.pluck( evt.hosts, 'facebook_id');
            if( hids.indexOf( LJ.user.facebook_id ) != -1 )
                renderFn = LJ.fn.renderEventPreview_Host;

            evt.groups.forEach(function(group){
                var mids = _.pluck( group.members, 'facebook_id' )
                if( mids.indexOf( LJ.user.facebook_id )!= -1 ){
                    if( group.status == "accepted" ){
                        renderFn = LJ.fn.renderEventPreview_MemberAccepted;
                    }
                    if( group.status == "pending" || group.status == "kicked"  ){
                        renderFn = LJ.fn.renderEventPreview_MemberPending;
                    }

                }
            });


            var event_preview = renderFn( evt );

            var $evt = $('.event-preview');
            var duration = 270;

            if( $evt.length == 0 ){
                delog('Rendering event at first load');
                $('.row-events-preview').html( event_preview );
                $('.event-preview').velocity( LJ.ui.slideDownInLight,
                { duration: duration });
                return;
            } 

            $('.event-preview')
                .removeClass('slow-down-3')
                .velocity( options.transition_out || LJ.ui.slideUpOutVeryLight, { 
                    duration: duration,
                    complete: function(){
                        $('.row-events-preview').html( event_preview )
                        .children().removeClass('slow-down-3')
                        .velocity( options.transition_in || LJ.ui.slideDownInLight, {
                            duration: duration +  300 ,
                            complete: function(){
                                $(this).addClass('slow-down-3');
                            }
                        });
                    }
                });

        },
        addPartyPreview: function( party, options ){

            if( !party || party === {} )
                return console.error('No party to be added : ' + party );

            options = options || {};

            if( party.address.place_id == $('.party-preview').attr('data-placeid') )
                return;

            //Default value
            var renderFn = LJ.fn.renderPartyPreview;

            var party_preview = renderFn( party );

            var $party = $('.party-preview');
            var duration = 270;

            if( $party.length == 0 ){
                delog('Rendering party at first load');
                $('.row-party-preview').html( party_preview );
                $('.party-preview').velocity( LJ.ui.slideDownInLight,
                { duration: duration });
                return;
            } 

            $('.party-preview')
                .removeClass('slow-down-3')
                .velocity( options.transition_out || LJ.ui.slideUpOutVeryLight, { 
                    duration: duration,
                    complete: function(){
                        $('.row-party-preview').html( party_preview )
                        .children().removeClass('slow-down-3')
                        .velocity( options.transition_in || LJ.ui.slideDownInLight, {
                            duration: duration +  300 ,
                            complete: function(){
                                $(this).addClass('slow-down-3');
                            }
                        });
                    }
                });

        },
        refreshEventPreview: function(){

            var evt  = LJ.fn.findEventNearest();

            if( !evt || evt === {} )
                return console.log('No event to be displayed');

            LJ.fn.addEventPreview( evt );

        }

	});