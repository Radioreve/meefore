
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Requests: function(){

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


            LJ.$body.on('click', '.btn-jumpto', function(){

                // Go up the dom to find a parent element that has the event_id data
                var event_id = $(this).closest('[data-eventid]').attr('data-eventid');
                var $tab     = $('.event-accepted-tabview[data-eventid="' + event_id + '"]');
                
                $tab.click();

            });

            LJ.$body.on('click','.btn-requestin', function(){

                // Go up the dom to find a parent element that has the event_id data
                var event_id = $(this).closest('[data-eventid]').attr('data-eventid');
                LJ.fn.showRequestInModal( event_id );

            });


		},
		showRequestInModal: function( event_id ){

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
        // Find the event state for a given user
        // Possibilities are : ["default", "pending", "accepted", "host" ];
        extractEventState: function( evt ){

            var state = "default";

            var hids = _.pluck( evt.hosts, 'facebook_id');

                if( hids.indexOf( LJ.user.facebook_id ) != -1 ){
                    state = "host"
                }

                // Check for each group if user facebook_id match group members facebook_id
                evt.groups.forEach(function( group ){

                    var mids = _.pluck( group.members, 'facebook_id' );

                    if( mids.indexOf( LJ.user.facebook_id )!= -1 ){

                        if( group.status == "accepted" ){
                            state = "accepted"
                        }

                        if( group.status == "pending" || group.status == "kicked"  ){
                            state = "pending"
                        }

                    }
                });

            return state;

        }

	});