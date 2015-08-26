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

            LJ.fn.handleDomEvents_EventInview();
            LJ.fn.handleDomEvents_EventFilters();

                LJ.$body.on('mouseover', '#createEvent', function(){
                LJ.fn.sanitizeCreateInputs();
            });
            LJ.$body.on('mouseenter', '#createEvent input', function(){
                $(this).addClass('no-sanitize');
            });
            LJ.$body.on('mouseleave', '#createEvent', function(){
                $(this).removeClass('no-sanitize');
            });

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
            LJ.$body.bind('typeahead:autocomplete typeahead:select', function(ev, suggestion) {

                
                var $input = $('.row-create-friends input');
                if( $input.is( ev.target ) ){
                    $input.parents('.twitter-typeahead').addClass('autocompleted');
                    LJ.fn.addItemToInput({ max: LJ.settings.app.max_hosts, inp: '.autocompleted', html: LJ.fn.renderFriendInInput( suggestion ), suggestions: '.search-results-friends' });
                }

                var $input = $('.row-requestin-group-members input');
                if( $input.is( ev.target ) ){
                    $input.parents('.twitter-typeahead').addClass('autocompleted');
                    LJ.fn.addItemToInput({ max: LJ.settings.app.max_hosts, inp: '.autocompleted', html: LJ.fn.renderFriendInInput( suggestion ), suggestions: '.search-results-friends' });
                }

                var $input = $('.row-create-party-place input');
                if( $input.is( ev.target ) ){
                    $input.parents('.twitter-typeahead').addClass('autocompleted');
                    LJ.fn.addItemToInput({ max: 1, inp: '.autocompleted', html: LJ.fn.renderPartyPlaceInCreate( suggestion ), suggestions: '.search-results-party-places' });
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


            LJ.$body.on('click','.btn-requestin', function(){

                LJ.fn.displayInModal({
                    source: 'local',
                    fix_height: 0,
                    starting_width: 550,
                    custom_classes: ['text-left'],
                    render_cb: function(){
                        return LJ.fn.renderEventRequestIn();
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
                handleDomEvents_EventInview: function(){

            LJ.$body.on('keypress', '.event-accepted-chat-typing input', function(e){
                var keyCode = e.keyCode || e.which;
                if( keyCode === 13 ){
                    $(this).siblings('button').click();
                }
            });

            LJ.$body.on('click', '.event-accepted-chat-typing button', function(){

                var $self     = $(this);
                var author    = LJ.user;
                var msg       = $self.siblings('input').val();
                var event_id  = $self.parents('.row-events-accepted-inview').attr('data-eventid');

                if( $self.parents('.validating').length != 0 )
                    return LJ.fn.toastMsg("Vous n'avez pas encore été accepté!", 'info');

                if( msg.trim().length == 0 )
                    return LJ.fn.toastMsg('Le message est vide!', 'info');

                $self.siblings('input').val('');
                LJ.fn.addChatLine({ event_id: event_id, msg: msg, author: author });
                // Send to the server

            });

        },
        handleDomEvents_EventFilters: function(){

            LJ.$body.on('click', '.event-filter', function(){

                var $self = $(this);

                if( $self.hasClass('selected') )
                    return $self.removeClass('selected');

                $('.event-filter').removeClass('selected');
                $self.addClass('selected');

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


        },
        createEvent: function( evt ){

            delog('Creating event...');

            var hosts_facebook_id  = [], ambiance = [],
                begins_at = '', agerange = '', mixity = '',
                address = {}, scheduled_party = {};

            var $wrap = $('#createEvent');

            // hosts
            hosts_facebook_id.push( LJ.user.facebook_id );
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
            address.lat        = parseFloat( $wrap.find('.before-place').attr('data-place-lat') );
            address.lng        = parseFloat( $wrap.find('.before-place').attr('data-place-lng') );
            address.place_id   = $wrap.find('.before-place').attr('data-placeid');
            address.place_name = $wrap.find('.before-place-name span').eq(0).text().trim();
            address.city_name  = $wrap.find('.before-place-name span').eq(1).text().trim();

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

            delog( new_event );
            
            LJ.fn.api('post', 'events', { data: new_event }, function( err, res ){

                 LJ.fn.hideLoaders();
                $('#createEvent')
                    .find('.lighter').removeClass('lighter')
                    .end()
                    .find('.btn-validating').removeClass('btn-validating');

                if( err ){
                    LJ.fn.handleCreateEventError( err );
                } else {
                    LJ.fn.handleCreateEventSuccess( res );
                }

            });

        },
        handleCreateEventSuccess: function( evt ){

            delog('Event successfully created');

            LJ.fn.displayCurtain({ 
                behindTheScene: function(){
                    LJ.fn.hideModal();
                    LJ.fn.addEvent(evt);
                    LJ.fn.displayRouteToParty( evt );
                    LJ.map.panTo({ lat: evt.address.lat, lng: evt.address.lng });
                    LJ.map.setZoom(15);

                },
                afterTheScene: function(){
                    LJ.fn.toastMsg('Votre évènement a été créé avec succès!', 'info');
                    LJ.fn.toastMsg('Que la fête commence...', 'info');
                    LJ.fn.addEventPreview(evt);

                }   
            });

        },
        handleCreateEventError: function( err ){

            delog('Error, event couldnt be created');

            var err_msg = JSON.parse( err.responseText ).msg || "Vous n'êtes pas autorisé à créer d'évènements";

            LJ.fn.toastMsg( err_msg, 'error' );
            console.log( err );


        },
        addEvent: function( evt ){

            LJ.fn.bubbleUp('#events');
            LJ.fn.displayEventMarker( evt );
            LJ.fn.addEventInviewAndTabview( evt );

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
                scrollwheel: false,
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

            LJ.map_service = new google.maps.places.PlacesService( LJ.map );

            /* Map styling */
            LJ.map.mapTypes.set('sober', map_style_sober);
            LJ.map.mapTypes.set('lunar', map_style_lunar);
            LJ.map.setMapTypeId('sober');

            LJ.map.addListener('center_changed', function(){
                
            });

            LJ.map.addListener('click', function(e){
            	LJ.fn.refreshActiveMarker();
                $('.event-accepted-tabview.active').click();
                LJ.path_to_party && LJ.path_to_party.setMap( null );
                LJ.party_markers && LJ.party_markers.setMap( null )
            });


            LJ.map.addListener('dragend', function(){
                if( LJ.active_marker )
                    return;
            	LJ.fn.refreshEventPreview();
            });

        },
        addEventInviewAndTabview: function( evt ){

            var renderFn =  _.pluck( evt.hosts, 'facebook_id').indexOf( LJ.user.facebook_id ) != -1 ? 
                            LJ.fn.renderEventInview_Host :
                            LJ.fn.renderEventInview_User ;

            $('.row-events').append(  renderFn( evt )  );
            $('.row-events-accepted-tabview').append( LJ.fn.renderEventTabview( evt ) );

            /* jsp */
            var $inview =  $('.row-events').children().last();
            LJ.jsp_api[ evt._id ] = {
                users: $inview.find('.event-accepted-users').jScrollPane().data('jsp'),
                chats: $inview.find('.event-accepted-chat-messages').jScrollPane({ stickToBottom: true }).data('jsp')
            };

        },
        addChatLine: function( o ){

            var id = o.id,
                author   = o.author,
                msg      = o.msg;

            var chat_msg_html = LJ.fn.renderChatLine({ author: author, msg: msg  });

            $('.row-events-accepted-inview[data-eventid="' + id + '"]')
                .find('.event-accepted-notification-message')
                .remove()
                .end()
                .find('.event-accepted-chat-messages .jspPane')
                .append( chat_msg_html );

            LJ.fn.adjustAllChatPanes();

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

            //LJ.fn.addEventInviewAndTabview();

        },
        handleFetchEvents: function( err, events ){

            if( err )
                return console.log('Error fetching and sync friends : ' + err );

            console.log('Total events successfully fetched, n = ' + events.length + ' )');

            /* Rendu sur la map */
            LJ.fn.displayEventsMarkers( events );


        },
        handleFetchMyEvents: function( err, events ){

          if( err )
            return console.log('Error fetching and sync friends : ' + err );

            console.log('Personnal events successfully fetched, n = ' + events.length + ' )');
            LJ.fn.displayEventsInviewsAndTabviews( events );

        },
        displayEventsInviewsAndTabviews: function( events ){

            events.forEach(function( evt ){
                LJ.fn.addEventInviewAndTabview( evt );
            });

        },
        addEventPreview: function( evt, options ){

            if( !evt || evt === {} )
                return console.error('No event to be added : ' + evt );

            options = options || {};

            //Default value
            var renderFn = LJ.fn.renderEventPreview_User;

            var hids = _.pluck( evt.hosts, 'facebook_id');
            if( hids.indexOf( LJ.user.facebook_id ) != -1 )
                renderFn = LJ.fn.renderEventPreview_Host;

            evt.groups.forEach(function(group){
                var mids = _.pluck( group.members, 'facebook_id' )
                if( mids.indexOf( LJ.user.facebook_id )!= -1 )
                    renderFn = LJ.fn.renderEventPreview_Member;
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
        refreshEventPreview: function(){

            var evt  = LJ.fn.findEventNearest();

            if( !evt || evt === {} )
                return console.log('No event to be displayed');

            LJ.fn.addEventPreview( evt );

        },
        fetchEvents: function( callback ){

            LJ.fn.api('get','events', callback );

        },
        fetchMyEvents: function( callback ){

            if( !LJ.user.facebook_id )
                return console.error("Can't fetch events, userId not found");

            LJ.fn.api('get','users/' + LJ.user.facebook_id + '/events', callback );

        },
        findEventNearest: function(){

            return LJ.fn.findEventsNearests(1)[0];

        },
        findEventsNearests: function( max_events ){

            var max_events      = max_events;
            var nearest_events  = [];
            var center          = new google.maps.LatLng( LJ.map.getCenter().G, LJ.map.getCenter().K );

            LJ.cache.events.forEach(function( evt ){

                var evt_latlng     = new google.maps.LatLng( evt.address.lat, evt.address.lng);
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
                var nearest_events_id = _.pluck( nearest_events, 'place_id' );
                return nearest_events_id.indexOf( evt.address.place_id ) != -1 ;
            });

        },
        displayEventsMarkers: function( events ){
                
            events.forEach(function( itm ){
                LJ.cache.events.push( itm );
                LJ.fn.displayEventMarker( itm );
            });

         /* Rendu des évènements les plus proches par rapport à la position de départ*/
            setTimeout(function(){
                LJ.fn.refreshEventPreview();
            }, 1000 );        
           

        },
        displayMarker: function( options ){

            if( !options.lat || !options.lng || !options.url )
                return console.error('Missing argument for display marker');

            var new_marker = new google.maps.Marker({
                position: { lat: options.lat, lng: options.lng },
                map: LJ.map,
                icon: options.url
            });

            if( options.singleton ){
                LJ[ options.cache ] && LJ[ options.cache ].setMap( null );
                LJ[ options.cache ] = new_marker;
            } else {
                LJ[ options.cache ] = LJ[ options.cache ] || [];
                LJ[ options.cache ].push({
                        marker : new_marker,
                        id     : options.id,
                        data   : options.data
                    });
            }

            options.listeners.forEach(function( listener ){
                new_marker.addListener( listener.event_type, listener.callback );
            });

        },
        displayEventMarker: function( evt ){

            LJ.fn.displayMarker({
                lat: evt.address.lat,
                lng: evt.address.lng,
                url: LJ.cloudinary.markers.white_on_black.url,
                cache: 'event_markers',
                singleton: false,
                id: evt._id,
                data: evt,
                listeners: [
                    {
                        event_type : 'click',
                        callback   : function(e){
                            LJ.fn.refreshActiveMarker( evt.address.lat, evt.address.lng );
                            LJ.fn.addEventPreview( evt );
                            LJ.fn.displayRouteToParty( evt );
                        }
                    }
                ]
            });


        },
        displayPartyMarker: function( coord, scheduled_party ){

             LJ.fn.displayMarker({
                lat: coord.G,
                lng: coord.K,
                url: LJ.cloudinary.markers[ scheduled_party.type ].url,
                cache: 'party_markers',
                singleton: true,
                id: scheduled_party._id,
                data: scheduled_party,
                listeners: [
                    {
                        event_type : 'click',
                        callback   : function(e){
                           console.log('Its gonna be a good gig, trust me!');
                        }
                    }
                ]
            });

        },
        displayPath: function( path ){

            LJ.path_to_party && LJ.path_to_party.setMap( null );

            LJ.path_to_party = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#4F4FA7',
                strokeOpacity: 0.3,
                strokeWeight: 5
            });

            LJ.path_to_party.setMap( LJ.map );

        },
        displayRouteToParty: function( evt ){

            var directions_service = new google.maps.DirectionsService;
            var directions_display = new google.maps.DirectionsRenderer;

            directions_display.setMap( LJ.map );

            var origin      = new google.maps.LatLng( evt.address.lat, evt.address.lng );
            var destination = evt.scheduled_party.address;

            directions_service.route({

                origin      : origin,
                destination : destination,
                travelMode  : 'WALKING'

              }, function( response, status ) {
                console.log(response);
                if (status === google.maps.DirectionsStatus.OK ){
                    var path = response.routes[0].overview_path;
                    LJ.fn.displayPath( path );
                    LJ.fn.displayPartyMarker( path[ path.length-1 ], evt.scheduled_party );
                    return;                    
                } 

                  console.log('Directions request failed due to ' + status);

            });            

        },
        refreshActiveMarker: function( lat, lng ){

            if( LJ.active_marker == null )
                return;

            $('.event-preview-selected').removeClass('event-preview-selected');
            LJ.active_marker.setMap( null );
            LJ.active_marker = null;

            LJ.active_marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: LJ.map,
                icon: LJ.cloudinary.markers.black_on_white.url
             });


        }

    })

});