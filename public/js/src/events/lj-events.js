window.LJ = _.merge(window.LJ || {}, {

    params: _.merge(window.LJ.params || {}, {

        map: {
            style: {
                sober: [{
                    "featureType": "administrative.neighborhood",
                    "elementType": "labels",
                    "stylers": [{
                        //"color": "#444444",
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#f2f2f2"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.business",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{
                        "saturation": -100
                    }, {
                        "lightness": 45
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers":  [{
                        "saturation": -100
                    }, {
                        "lightness": 45
                    }]
                },  {
                    "featureType": "road.highway",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#b4d4e1"
                    }, {
                        "visibility": "on"
                    }]
                }],
                lunar: [{
                    "stylers": [{
                        "hue": "#ff1a00"
                    }, {
                        "invert_lightness": true
                    }, {
                        "saturation": -100
                    }, {
                        "lightness": 33
                    }, {
                        "gamma": 0.5
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#2D333C"
                    }]
                }]
            }
        }
    }),

    fn: _.merge(window.LJ.fn || {}, {

        handleDomEvents_Create: function(){
    
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
                        LJ.pikaday = new Pikaday({ 
                            field: document.getElementById('cr-date'),
                            format:'DD/MM/YY',
                            minDate: new Date(),
                            bound: false
                        });
                        $('.pika-single').insertAfter('#cr-date');
                        LJ.fn.handleDomEvents_Pickaday();

                        /* Google Places Autocomplete API */
                        var options = {componentRestrictions: {country: 'fr'}};
                        LJ.google_places_autocomplete = new google.maps.places.Autocomplete( document.getElementById('cr-before-place'), options );
                        LJ.fn.handleDomEvents_GooglePlaces();
    
                    } 
                });
            });

        },
        handleDomEvents_GooglePlaces: function(){

            $('#cr-before-place').val('');
            LJ.google_places_autocomplete.addListener( 'place_changed', function(){
                var place = LJ.google_places_autocomplete.getPlace();
                LJ.fn.addBeforePlaceToInput( place );
            });


        },
        handleDomEvents_Pickaday: function(){

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

            LJ.$body.on('mousedown', '.pika-next', function(e){             
                LJ.pikaday.nextMonth();
            });

            LJ.$body.on('mousedown', '.pika-prev', function(e){             
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

            LJ.$body.on('click', '.before-place', function(){
                LJ.fn.removeBeforePlaceToInput();
            }); 

            LJ.$body.on('click', '.party-place', function(){
                LJ.fn.removePartyPlaceToInput();
            }); 

        },
        initMap: function() {

            var map_style_sober = new google.maps.StyledMapType(LJ.params.map.style.sober, {
                name: 'sober'
            });
            var map_style_lunar = new google.maps.StyledMapType(LJ.params.map.style.lunar, {
                name: 'lunar'
            });

            LJ.map = new google.maps.Map(document.getElementsByClassName('row-events-map')[0], {
                center: {
                    lat: 48.8566140,
                    lng: 2.3522219
                },
                zoom: 13,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: {
                	style: google.maps.ZoomControlStyle.SMALL,
                	position: google.maps.ControlPosition.RIGHT_TOP
                },
                mapTypeControlOptions: {
                    mapTypeIds: ['sober', 'lunar']
                }
            });

            /* Map styling */
            LJ.map.mapTypes.set('sober', map_style_sober);
            LJ.map.mapTypes.set('lunar', map_style_lunar);
            LJ.map.setMapTypeId('sober');

            LJ.map.addListener('center_changed', function(){
                if( LJ.active_marker )
                    return;
            	$('.event-nearest > div').addClass('slow-down-3').css({ opacity: LJ.ui.nearest_event_opacity });
            });

            var duration_speed = 250;
            LJ.map.addListener('click', function(){
            	LJ.fn.removeActiveMarker();
            });


            LJ.map.addListener('dragend', function(){
                if( LJ.active_marker )
                    return;
            	LJ.fn.refreshEventNearest();
            });

        },
        addChatInview: function( evt ){

            $('.row-events-accepted-tabview').append( LJ.fn.renderEventAcceptedTabview( evt ) );
            $('.row-events-accepted-inview' ).after(  LJ.fn.renderEventAcceptedInview( evt )  );

        },
        addChatLine: function( o ){

            var event_id = o.event_id,
                author   = o.author,
                msg      = o.msg;

            var chat_msg_html = LJ.fn.renderChatLine({ author: author, msg: msg  });

            $('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
                .find('.event-accepted-chat-messages .jspPane')
                .append( chat_msg_html );

            //refresh le jScrollPane

        },
        handleRequestParticipationIn_Success: function( data ){

            delog('Handling request participation in success');

            var hosts      = data.hosts,
                requesters = data.requesters,
                evt        = data.evt;


        },
        handleRequestValidated_Success: function(){

            delog('Handling request validated success');

            var hosts      = data.hosts,
                requesters = data.requesters,
                evt        = data.evt;

            //LJ.fn.addChatInview();

        },
        handleFetchEvents: function( err, events ){

            if( err )
                return console.log('Error fetching and sync friends : ' + err );

            console.log('Events successfully fetched ! ( n = ' + events.length + ' )');

            /* Rendu sur la map */
            LJ.fn.displayEventsOnMap( events );
           // LJ.fn.displayMyEvents( events );

            /* Rendu des évènements les plus proches par rapport à la position de départ*/
            setTimeout(function(){
                LJ.fn.refreshEventNearest();
            }, 1000 );

        },
        displayMyEvents: function( events ){

            events.forEach(function( evt ){

                
                
            });

        },
        refreshEventNearest: function( evt ){

            var nearest_event       = evt || LJ.fn.findEventsNearests( 1 )[0];
            var duration            = 450;

            nearest_event_thumbview_html = LJ.fn.renderNearestEvent( nearest_event );

            var $nearest_event = $('.event-nearest');

            if( $nearest_event.attr('data-eventid') == nearest_event._id )
                return $('.event-nearest > div').css({ opacity: 1});

            if( $nearest_event.length == 0 ){
                $('.row-events-nearest').html( nearest_event_thumbview_html );
                //$('.row-events-selected').html( nearest_event_preview_html  );
                $('.event-nearest').velocity('transition.fadeIn',
                { duration: duration });
                return;
            } 

            $('.event-nearest')
                .removeClass('slow-down-3')
                .velocity('transition.slideUpOut', { 
                    duration: duration,
                    complete: function(){
                        $('.row-events-nearest').html( nearest_event_thumbview_html )
                        .children().removeClass('slow-down-3')
                        .velocity('transition.slideUpIn', {
                            duration: duration,
                            complete: function(){
                                $(this).addClass('slow-down-3');
                            }
                        });
                    }
                });

        },
        fetchEvents: function( callback ){

            if( !LJ.user._id )
                return console.error("Can't fetch events, userId not found");

            var start_date = moment().format('DD/MM/YY');
            LJ.fn.api('get','events?start_date='+start_date, callback );

        },
        refreshEventSelected: function( evt ){

            nearest_event_preview_html   = LJ.fn.renderEventPreview( evt );
            $('.event-preview').remove();
            $('.row-events-selected').html( nearest_event_preview_html );
            $('.event-preview').velocity('transition.fadeIn', {
                                duration: duration + 300
                            });

        },
        findEventsNearests: function( max_events ){

            var max_events      = max_events;
            var nearest_events  = [];
            var center          = new google.maps.LatLng( LJ.map.getCenter().G, LJ.map.getCenter().K );

            LJ.cache.events.forEach(function( evt ){

                var evt_latlng     = new google.maps.LatLng( evt.address.lat, evt.address.lng );
                var dist_to_center = google.maps.geometry.spherical.computeDistanceBetween( center, evt_latlng );

                if( nearest_events.length < max_events ){
                    nearest_events.push({ place_id: evt.address.place_id, dist_to_center: dist_to_center });
                } else {                
                    nearest_events.push({ place_id: evt.address.place_id, dist_to_center: dist_to_center });
                    var max = _.max( nearest_events, function(el){ return el.dist_to_center; });
                    _.remove( nearest_events, function(el){ return el == max });                        
                }

            });

            return _.filter( LJ.cache.events, function( evt ){
                return _.pluck( nearest_events, 'place_id' ).indexOf( evt.address.place_id ) != -1 ;
            });

        },
        displayEventsOnMap: function( events ){
                
            setTimeout(function(){
                 events.forEach(function( itm ){
                LJ.fn.displayEventOnMap( itm );
            });         
            }, 3000);
           

        },
        displayEventOnMap: function( evt ){

            var service = new google.maps.places.PlacesService( LJ.map );

                    service.getDetails({ placeId: evt.address.place_id }, function( res ){

                        var lat = res.geometry.location.G;
                        var lng = res.geometry.location.K;
                        var url = LJ.cloudinary.markers[ evt.mixity ].url;
                        url = LJ.cloudinary.markers.white_on_black.url;

                        evt.address.lat = lat;
                        evt.address.lng = lng;
                        LJ.cache.events.push( evt );

                        var event_on_map = new google.maps.Marker({
                            position: { lat: lat, lng: lng },
                            map: LJ.map,
                            icon: url
                        });

                        LJ.markers.push({ marker: event_on_map, evt: evt });

                        event_on_map.addListener('click', function(e){

                            LJ.fn.removeActiveMarker();
                            //LJ.map.panTo( e.latLng );

                            LJ.active_marker = new google.maps.Marker({
                                position: { lat: lat, lng: lng },
                                map: LJ.map,
                                icon: LJ.cloudinary.markers.black_on_white.url
                            });

                            LJ.fn.refreshEventNearest( evt );

                        });

                    });


        },
        removeActiveMarker: function(){

            if( LJ.active_marker == null )
                return;

            $('.event-nearest-selected').removeClass('event-nearest-selected');
            LJ.active_marker.setMap( null );
            LJ.active_marker = null;

        }

    })

});