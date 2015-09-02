
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        handleDomEventsMap: function(){

        },
		addEvent: function( evt ){

            LJ.fn.displayEventMarker( evt );
            LJ.fn.addEventInviewAndTabview( evt );

        },
        initMap: function() {

            var map_style_sober = new google.maps.StyledMapType( LJ.google.map.style.sober, {
                name: 'sober'
            });

            var map_style_lunar = new google.maps.StyledMapType( LJ.google.map.style.lunar, {
                name: 'lunar'
            });

            var map_style_pinkey = new google.maps.StyledMapType( LJ.google.map.style.pinkey, {
                name: 'pinkey'
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
            LJ.map.mapTypes.set('pinkey', map_style_pinkey );
            LJ.map.setMapTypeId('pinkey');

            LJ.map.addListener('center_changed', function(){
                
            });

            LJ.map.addListener('click', function(e){
            	LJ.fn.refreshActiveMarker();
                $('.event-accepted-tabview.active').click();
                LJ.path_to_party && LJ.path_to_party.setMap( null );
                LJ.party_markers && LJ.party_markers.setMap( null );
                LJ.fn.refreshMap();
            });


            LJ.map.addListener('dragend', function(){
                //if( LJ.active_marker )
                //    return;
            	//LJ.fn.refreshEventPreview();
            });

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

            events.forEach(function( evt ){
                LJ.fn.joinEventChannel( evt );
                LJ.fn.fetchMyChats( evt );
            });

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
        refreshMap: function(){
            google.maps.event.trigger( LJ.map, 'resize');
        },
        displayMarker: function( options ){

            if( !options.lat || !options.lng || !options.url )
                return console.error('Missing argument for display marker');

            var new_marker = new google.maps.Marker({
                position: { lat: options.lat, lng: options.lng },
                map: LJ.map,
                animation: options.animation || null,
                icon: options.url,
                zIndex: options.zIndex || 0
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
        displayEventMarker: function( evt, options ){

            LJ.fn.displayMarker(_.merge({
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
            }, options));


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
                strokeColor: '#E94F6A',
                strokeOpacity: 0.7,
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

	});