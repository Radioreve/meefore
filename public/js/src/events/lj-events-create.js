
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsCreate: function(){

			 LJ.$body.on('click', '.rem-click', function(){

			 	var $self   = $(this);
                if( $self.parents('.row-create-before-place').length != 0 ){
                    LJ.fn.removeBeforePlaceToInput();
                    return;
                }
                LJ.fn.removeItemToInput(this);
            });


			LJ.$body.on('keydown', 'input', function(e){

                var $self = $(this);
                var keyCode = e.keyCode || e.which;

                /* Remove des hashtag event  */
                if( keyCode == 8  && $self.val().length == 0 ){
                    $self.parents('.row-input').find('.rem-click').last().click();
                }

                /* Ajout des hashtag */
                if( (keyCode == 9 || keyCode == 13) && $self.parents('.row-create-ambiance').length != 0 && $self.val().length != 0 ){
                    e.preventDefault();
                    var str = LJ.fn.hashtagify( $self.val() );
                    LJ.fn.addItemToInput({ html: LJ.fn.renderAmbianceInCreate( str ), inp: this, max: LJ.settings.app.max_ambiance });
                    $(this).val('');
                }

                /* Ajout du group name */
                if( (keyCode == 9 || keyCode == 13) && $self.parents('.row-requestin-group-name, .row-requestin-group-message').length != 0 && $self.val().length != 0 ){
                    e.preventDefault();
                    var str = $self.val().trim();
                    LJ.fn.addItemToInput({ html: LJ.fn.renderItemInInput( str ), inp: this, max: 1 });
                    $(this).val('');
                }

                LJ.$body.on('click', '.before-place', function(){
                    LJ.fn.removeBeforePlaceToInput();
                }); 
            });

			/* Ajout des hosts / partyplace via la touche tab && click */
            LJ.$body.bind('typeahead:autocomplete typeahead:select', function( ev, suggestion ) {

                var $input = $('.row-create-friends input');
                if( $input.is( ev.target ) ){
                    LJ.fn.addItemToInput({
                       typeahead   : true,
                       inp         : ev.target,
                       max         : LJ.settings.app.max_hosts,
                       html        : LJ.fn.renderFriendInInput( suggestion ),
                       suggestions : '.search-results-friends' 
                    });
                }

                var $input = $('.row-requestin-group-members input');
                if( $input.is( ev.target ) ){
                    LJ.fn.addItemToInput({
                        typeahead   : true,
                        max         : LJ.settings.app.max_hosts,
                        inp         : ev.target,
                        html        : LJ.fn.renderFriendInInput( suggestion ),
                        suggestions : '.search-results-friends'
                    });
                }

                var $input = $('.row-create-party-place input');
                if( $input.is( ev.target ) ){
                    LJ.fn.addItemToInput({
                        typeahead   : true,
                        max         : 1,
                        inp         : ev.target,
                        html        : LJ.fn.renderPartyPlaceInCreate( suggestion ),
                        suggestions : '.search-results-party-places'
                    });
                }
            });


            /* Make sure always empty when closed */
            LJ.$body.bind('typeahead:autocomplete typeahead:select typeahead:change', function( ev, suggestion ){

            
                var $input = $('.row-create-friends input');
                    if( $input.is( ev.target ) ){
                        $input.typeahead('val','');
                    }

                var $input = $('.row-create-party-place input');
                    if( $input.is( ev.target ) ){
                        $input.typeahead('val','');
                    }

                var $input = $('.row-requestin-group-members input');
                    if( $input.is( ev.target ) ){
                        $input.typeahead('val','');
                    }

            });

            LJ.$body.on('click', '#createEvent .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                $(this).addClass('btn-validating');
                $('#createEvent').find('label').addClass('lighter');
                LJ.fn.showLoaders();
                LJ.fn.createEvent();

            });

             LJ.$body.on('click', '.mixity', function(){

                var $self = $(this);
                $('.mixity').removeClass('selected');
                $self.addClass('selected');

            });

            LJ.$body.on('click', '.agerange', function(){

                var $self = $(this);
                $('.agerange').removeClass('selected');
                $self.addClass('selected');

            });


            LJ.$body.on('click', '.btn-create-event', function(){

                LJ.fn.displayInModal({ 
                    source:'local',
                    fix_height: -30,
                    starting_width: 550,
                    custom_classes: ['text-left'],
                    render_cb: function(){
                        return LJ.fn.renderCreateEvent({ 
                            agerange: LJ.settings.app.agerange,
                            mixity: LJ.settings.app.mixity
                        });
                    },
                    predisplay_cb: function(){

                        $('.row-events-map').hide();
                        /* Typehead on hosts and places */
                        LJ.fn.initTypeaheadPlaces();
                        LJ.fn.initTypeaheadHosts( LJ.user.friends );

                        /* Adjusting label & input width */
                        LJ.fn.adjustAllInputsWidth('#createEvent');

                        /* Date picker */ 
                        LJ.fn.initPickaday();

                        /* Google Places Autocomplete API */
                        LJ.fn.initGooglePlaces();
                        
                        /* Default views */
                        LJ.fn.addItemToInput({
                           typeahead   : true,
                           inp         : '#cr-friends',
                           max         : LJ.settings.app.max_hosts,
                           html        : LJ.fn.renderMeInInput(),
                           suggestions : '.search-results-friends' 
                        })

                    } 
                });
            });

			
		},
		initGooglePlaces: function(){

			$('#cr-before-place').val('');
            var options = {componentRestrictions: {country: 'fr'}};

            LJ.google_places_autocomplete = new google.maps.places.Autocomplete( 
            	document.getElementById('cr-before-place'), options 
            );
            
            LJ.google_places_autocomplete.addListener( 'place_changed', function(){
                var place = LJ.google_places_autocomplete.getPlace();
                LJ.fn.addBeforePlaceToInput( place );
            });

		},
		initPickaday: function(){

			LJ.pikaday = new Pikaday({ 
                            field: document.getElementById('cr-date'),
                            format:'DD/MM/YY',
                            minDate: new Date(),
                            bound: false
                        });

            $('.pika-single').insertAfter('#cr-date');
            
            /* Date picker custom handling for better ux */
            LJ.$body.on('mousedown', '.pika-day:not(.pika-prev,.pika-next)', function(e){

                var $self = $(this);
                var date_str =  moment({ 
                    D: $self.attr('data-pika-day'),
                    M: $self.attr('data-pika-month'),
                    Y: $self.attr('data-pika-year') })
                .format('DD/MM/YY');

                var msg = 'Good choice to party';
                LJ.fn.addDateToInput( date_str, msg );

            });

            $('#createEvent').on('mousedown', '.pika-next', function(e){             
                LJ.pikaday.nextMonth();
            });

            $('#createEvent').on('mousedown', '.pika-prev', function(e){             
                LJ.pikaday.prevMonth();
            });

            LJ.$body.on('mouseenter', '.pika-prev, .pika-next', function(){
                LJ.state.show_picker = true;
            });

            LJ.$body.on('mouseleave', '.pika-prev, .pika-next', function(){
                LJ.state.show_picker = false;
            });

            LJ.$body.on('focus', '#cr-date', function(){
                LJ.pikaday.show();
            });

            LJ.$body.on('focusout', '#cr-date', function(){
                if( LJ.state.show_picker ) return;
                LJ.pikaday.hide();
            });

            LJ.$body.on('click', '.date', function(){
                var msg = 'Ou vient quand?';
                LJ.fn.removeDateToInput( msg );
            }); 

		},
		 createEvent: function( evt ){

            delog('Creating event...');

            var hosts_facebook_id  = [], ambiance = [],
                begins_at = '', agerange = '', mixity = '',
                address = {}, scheduled_party = {};

            var $wrap = $('#createEvent');

            // hosts
            $wrap.find('.friend').each(function(i, el){
                    hosts_facebook_id.push( $(el).attr('data-id') );
            });

            // ambiance
            $wrap.find('.ambiance-name').each(function(i, el){
                ambiance.push( $(el).text() );
            });

            // begins,agerange,mixity
            begins_at = $wrap.find('.date-name').text().trim();
            agerange  = $wrap.find('.agerange.selected').attr('data-selectid').trim();
            mixity    = $wrap.find('.mixity.selected').attr('data-selectid').trim();

            // address
            if( $wrap.find('.before-place-name').length != 0 ){
                address.lat        = parseFloat( $wrap.find('.before-place').attr('data-place-lat') );
                address.lng        = parseFloat( $wrap.find('.before-place').attr('data-place-lng') );
                address.place_id   = $wrap.find('.before-place').attr('data-placeid');
                address.place_name = $wrap.find('.before-place-name span').eq(0).text().trim();
                address.city_name  = $wrap.find('.before-place-name span').eq(1).text().trim();
            }

            // scheduled_party
            scheduled_party._id = $wrap.find('.party-place').attr('data-placeid');

            var new_event = {
                hosts_facebook_id: hosts_facebook_id,
                ambiance: ambiance,
                begins_at: begins_at,
                agerange: agerange,
                mixity: mixity,
                address: address,
                scheduled_party: scheduled_party
            };
            
            LJ.fn.api('post', 'events', { data: new_event }, function( err, res ){

                LJ.fn.hideLoaders();
                $('#createEvent')
                    .find('.lighter').removeClass('lighter')
                    .end()
                    .find('.btn-validating').removeClass('btn-validating');

                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleCreateEventSuccess( res );
                }

            });

        },
        handleCreateEventSuccess: function( evt ){

            delog('Event successfully created');
            LJ.cache.events.push( evt );

            LJ.fn.displayCurtain({ 
                behindTheScene: function(){
                    LJ.fn.hideModal();
                    LJ.fn.displayEventMarker( evt );
                    LJ.fn.addEventInviewAndTabview( evt );
                    LJ.fn.displayRouteToParty( evt );
                    LJ.map.panTo({ lat: evt.address.lat, lng: evt.address.lng });
                    LJ.map.setZoom( 15 );

                    /* the model is the single source of truth... */
                    LJ.fn.fetchMe();
                },
                delay: 1000,
                afterTheScene: function(){
                    LJ.fn.toastMsg('Votre évènement a été créé avec succès!', 'info');
                    LJ.fn.toastMsg('Que la fête commence...', 'info');
                    LJ.fn.addEventPreview( evt );
                    LJ.fn.joinEventChannel( evt );
                    $('.event-accepted-tabview').last().click();

                }   
            });

        }


	});