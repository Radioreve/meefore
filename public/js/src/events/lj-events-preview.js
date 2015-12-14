
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsPreview: function(){

			LJ.$body.on('click', '.btn-jumpto', function(){
				var event_id = $(this).parents('.event-preview').attr('data-eventid');
				var $tab = $('.event-accepted-tabview[data-eventid="' + event_id + '"]');
				
				$tab.click();
			});

            LJ.$body.on('keydown', 'input', function(e){

                var $self = $(this);
                var keyCode = e.keyCode || e.which;

                /* Ajout du group name */
                if( (keyCode == 9 || keyCode == 13) && $self.parents('.row-requestin-group-name').length != 0 && $self.val().length != 0 ){
                    e.preventDefault();
                    var str = $self.val().trim();
                    LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput_GroupName( str ), inp: this, max: 1 });
                    $(this).val('');
                }
                 /* Ajout du group name */
                if( (keyCode == 9 || keyCode == 13) && $self.parents('.row-requestin-group-message').length != 0 && $self.val().length != 0 ){
                    e.preventDefault();
                    var str = $self.val().trim();
                    LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput_GroupMessage( str ), inp: this, max: 1 });
                    $(this).val('');
                }

            });

            LJ.$body.on('focusout', '#requestIn input', function(){

                LJ.fn.formatRequestInInputs();

            });

            LJ.$body.on('mouseenter', '#requestIn .btn-validate', function(){

                LJ.fn.formatRequestInInputs();

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

                LJ.fn.showRequestInModal();

            });

		},
        showRequestInModal: function(){

             var event_id = $('.event-preview').attr('data-eventid');

                if( !event_id ){
                    return console.error('eventid wasnt attached to the dom, cant continue with the request');
                }
                
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
                        LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput_GroupName( default_groupname ), inp: '#ri-groupname', max: 1 });

                         var default_message = 'Ahoy!';
                        LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput_GroupMessage( default_message ), inp: '#ri-groupmessage', max: 1 });

                    }
                });

        },
		requestIn: function( event_id ){

            LJ.fn.log('Requesting in  for event with id : '+ event_id + '...', 3);

            var name, message, members_facebook_id = [];
            var $wrap = $('#requestIn');

            var $itemname = $wrap.find('.row-requestin-group-name .item-name');
            var $itemmsge = $wrap.find('.row-requestin-group-message .item-name');

            //name & message
            name    = $itemname.text().trim();
            message = $itemmsge.text().trim();

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

                LJ.fn.log('Request in success', 2);
                
                var event_id = data.event_id;

                LJ.fn.hideModal(function(){

                    LJ.fn.fetchEventById( event_id, LJ.fn.handleFetchEventById );
                    LJ.fn.toastMsg( LJ.text_source["to_request_sent"][ LJ.app_language ], 'info');

                    // If user is still on that marker, switch marker icon
                    if( LJ.active_event_marker[0] ){
                        LJ.active_event_marker[0].marker.setIcon( LJ.cloudinary.markers.pending_active.open.url );
                    }   

                    // In anycase, update the default marker.
                    _.find( LJ.event_markers, function( marker ) {
                        return marker.marker_id == event_id; 
                    }).marker.setIcon( LJ.cloudinary.markers.pending.open.url );


                });

        },
        addEventPreview: function( evt, options ){

            var renderFn;

            if( !evt || evt === {} ){
                LJ.fn.log('No event to be added. Adding suggestion...', 3);
                renderFn = LJ.fn.renderEventPreview_Default;
            } else {

                renderFn = LJ.fn.renderEventPreview_User;
                options = options || {};

                var hids = _.pluck( evt.hosts, 'facebook_id');

                if( hids.indexOf( LJ.user.facebook_id ) != -1 ){
                    renderFn = LJ.fn.renderEventPreview_Host;
                }

                evt.groups.forEach(function( group ){

                    var mids = _.pluck( group.members, 'facebook_id' );
                    if( mids.indexOf( LJ.user.facebook_id )!= -1 ){
                        if( group.status == "accepted" ){
                            renderFn = LJ.fn.renderEventPreview_MemberAccepted;
                        }
                        if( group.status == "pending" || group.status == "kicked"  ){
                            renderFn = LJ.fn.renderEventPreview_MemberPending;
                        }

                    }
                });
            }

            var event_preview = renderFn( evt );

            // Displaying Logic
            var $evt = $('.event-preview');
            var duration = 240;

            // No preview is there
            if( $evt.length == 0 ){

                // LJ.fn.log('First render');

                $( event_preview ).hide().appendTo('.row-events-preview');

                $('.row-events-preview')
                    .css({ display: 'block', opacity: 0 })
                    .velocity( LJ.ui.slideUpInLight, {
                    duration: duration,
                    display: 'flex',
                    complete: function(){
                        $('.event-preview').css({ opacity: 0 }).show();
                        $('.event-preview').velocity( LJ.ui.slideDownInVeryLight,{ 
                            duration: duration
                        });
                    }
                })

                return;
            } 

            // LJ.fn.log('Re-render');
            if( $('.row-events-preview').css('opacity') != '1' ){
                return setTimeout(function(){
                    LJ.fn.addEventPreview( evt, options );
                }, 100 );
            }

            $('.event-preview')
                .velocity( LJ.ui.slideUpOutVeryLight, { 
                    duration: duration,
                    display: 'flex',
                    complete: function(){
                        $('.row-events-preview').html( event_preview )
                        .children()
                        .velocity( LJ.ui.slideDownInLight, {
                            duration: duration +  220 ,
                            complete: function(){
                            }
                        });
                    }
                });

        },
        addPartyPreview: function( party, options ){
            
            if( !party || party === {} ){
                return console.error('No party to be added : ' + party );
            }

            options = options || {};    

            var cached_party;
            var event_begins_at = options.begins_at;
            var filter_date     = moment( $('.filter-date-item.active').attr('data-dateid') , 'DD/MM/YYYY' );
            var party_preview   = null;

            // If user party has same place_id and date than a known partner party,
            // display the partner party template with full info.
            // Otherwise, display normal template. Just never refresh it.
            cached_party = _.filter( LJ.cache.parties, function( i_cached_party ){
                return party.address.place_id == i_cached_party.address.place_id && moment( i_cached_party.begins_at ).dayOfYear() == filter_date.dayOfYear()
            });

            if( cached_party.length == 0 ){

                LJ.fn.log('No cached party was found for this place_id', 5);
                party_preview = LJ.fn.renderPartyPreview_Event( party );   

            } else {

                cached_party.forEach(function( i_cached_party ){

                    var party_day  = moment( i_cached_party.begins_at ).dayOfYear();

                    // User explicitly provided event date : if there is a party in cache that matches
                    // The date, render it instead of rendering default view;
                    if( event_begins_at ){

                        var event_day  = moment( event_begins_at ).dayOfYear();

                        if( party_day == event_day ){
                            LJ.fn.log('Cached party found for this address, and dates match, rendering the partner party', 5);
                            party_preview =  LJ.fn.renderPartyPreview_Party( i_cached_party );
                        }

                        if( party_day != event_day ){
                            LJ.fn.log('Cached party found for this address, but dates do NOT match, rendering the regular party', 5);
                            party_preview =  LJ.fn.renderPartyPreview_Event( party );
                        }
                    // User didnt provide the date, meaning he wants to render the partner party version explicitly
                    } else {

                        LJ.fn.log('Cached party found for this address, but check wasnt required (begins_at not provided)', 5);
                        party_preview =  LJ.fn.renderPartyPreview_Party( i_cached_party );

                    }

                });

            }

            // Override for intro only
            if( options.intro ){
                party_preview = LJ.fn.renderPartyPreview_Party( party );
            }


            var $party = $('.party-preview');
            var duration = 240;

            if( $party.length == 0 ){

                 LJ.fn.log('First render party', 5);

                $( party_preview ).hide().appendTo('.row-party-preview');

                $('.row-party-preview')
                    .css({ display: 'block', opacity: 0 })
                    .velocity( LJ.ui.slideUpInLight, {
                    duration: duration,
                    display: 'flex',
                    complete: function(){
                        $('.party-preview').css({ opacity: 0 }).show()
                        $('.party-preview').velocity( LJ.ui.slideDownInVeryLight,{ 
                            duration: duration 
                        });
                    }
                })

                return;

            }

            LJ.fn.log('Re-render party', 5);
            if( $('.row-party-preview').css('opacity') != '1' ){
                LJ.fn.log('Re-render 100ms later...', 2);
                return setTimeout(function(){
                    LJ.fn.addPartyPreview( party, options );
                }, 100 );
            }
            
            // If same place, same hour, and no partner party was found.
            // To know if its the same DOM element, we compare based on the text of the party preview place name which is unique
            var comparison_class = '.party-preview-place-name';
            if( $party.length && $('.row-party-preview').find( comparison_class ).text() == $( party_preview ).find( comparison_class ).text() ){
                return;
            }
            


            $party
                .removeClass('slow-down-3')
                .velocity( options.transition_out || LJ.ui.slideUpOutVeryLight, { 
                    duration: duration,
                    complete: function(){
                        $('.row-party-preview').html( party_preview )
                        .children().removeClass('slow-down-3')
                        .velocity( options.transition_in || LJ.ui.slideDownInLight, {
                            duration: duration +  220 ,
                            display: 'flex',
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
                return LJ.fn.log('No event to be displayed');

            // LJ.fn.addEventPreview( evt );

        },
        showEventPreview: function( evt ){

            // case the caller only had event_id 
            if( typeof evt == "string" ){
                // Find the proper event from cache, and update the preview
                evt = _.find( LJ.cache.events, function( el ){
                    return el._id === evt ;
                });
            }

            if( !evt ){
                return LJ.fn.warn('Cant add previews with evt: ' + evt );
            } 

            LJ.fn.addEventPreview( evt );

            LJ.fn.addPartyPreview( evt.party, {
                begins_at: evt.begins_at
            });
        }

	});