
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        handleDomEventsMap: function(){

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
                center: LJ.google.map_center,
                zoom: 13,
                scrollwheel: false,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: {
                	style: google.maps.ZoomControlStyle.SMALL,
                	position: google.maps.ControlPosition.RIGHT_TOP
                },
                mapTypeControlOptions: {
                    mapTypeIds: ['sober']
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
                
            	LJ.fn.clearAllActiveMarkers();
                $('.event-accepted-tabview.active').click();

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
            LJ.fn.displayPartyMarkers( events );


        },
        handleFetchEventById: function( err, evt, opt ){

            if( err )
                return console.log('Error fetching event by id : ' + err );
            
            
            LJ.fn.joinEventChannel( evt ); 
            LJ.fn.addEventInviewAndTabview( evt, opt );
            
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ){
                    LJ.fn.fetchMyChat_Host( evt );
            } else {
                    LJ.fn.fetchMyChat_Group( evt );
            }

        },
        handleFetchMyEvents: function( err, events ){

          if( err )
            return console.log('Error fetching and sync friends : ' + err );

            console.log('Personnal events successfully fetched, n = ' + events.length + ' )');
            
            events.forEach(function( evt ){

                LJ.fn.handleFetchEventById( null, evt, { hide: true });
                
            });

        },
        fetchEvents: function( callback ){

            LJ.fn.api('get','events', callback );

        },
        /* For fetch when a friend puts us host or ask event with us */
        fetchEventById: function( event_id, callback ){

            if( !LJ.user.facebook_id )
                return console.error("Can't fetch events, userId not found");

            LJ.fn.api('get','events/' + event_id, callback );

        },
        /* During initialisation */
        fetchMyEvents: function( callback ){

            if( !LJ.user.facebook_id )
                return console.error("Can't fetch events, userId not found");

            LJ.fn.api('get','me/events', callback );

        },
        findEventNearest: function(){

            return LJ.fn.findEventsNearests(1)[0];

        },
        findEventsNearests: function( max_events ){

            var max_events      = max_events;
            var nearest_events  = [];
            var center          = new google.maps.LatLng( LJ.map.getCenter().lat(), LJ.map.getCenter().lng() );

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
        displayPartyMarkers: function( events ){

            events.forEach(function( itm ){
                LJ.fn.displayPartyMarker( itm );
            });


        },
        refreshMap: function(){
            google.maps.event.trigger( LJ.map, 'resize');
            LJ.map.panTo( LJ.google.map_center );
        },
        displayMarker: function( options ){

            if( !options.lat || !options.lng || !options.url )
                return console.error('Missing argument for display marker');

            // Define and display the Marker on the Map
            var new_marker = new google.maps.Marker({
                position  : { lat: options.lat, lng: options.lng },
                map       : LJ.map,
                animation : options.animation || null,
                icon      : options.url,
                zIndex    : options.zIndex || 0
            });

            // Store references of markers to destroy em and make them disappear from the map ( marker.setMap(null) )
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

            if( Array.isArray( options.listeners )){
                options.listeners.forEach(function( listener ){
                    new_marker.addListener( listener.event_type, listener.callback );
                });
            }

        },
        displayEventMarker: function( evt, options ){

            var url;
            var my_group = _.find( evt.groups, function( group ){
                return group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1; 
            });

            var status = my_group && my_group.status || 'base';

            console.log('Current status for this event : ' + status );

            LJ.fn.displayMarker(_.merge({
                lat       : evt.address.lat,
                lng       : evt.address.lng,
                url       : LJ.cloudinary.markers[ status ].url,
                cache     : 'event_markers',
                singleton : false,
                id        : evt._id,
                data      : evt,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function(e){

                            LJ.fn.clearAllActiveMarkers();
                            
                            LJ.fn.displayMarker({
                                lat       : evt.address.lat,
                                lng       : evt.address.lng,
                                url       : LJ.cloudinary.markers.base_active,
                                id        : evt.address.place_id,
                                cache     : 'active_markers',
                                singleton : false,
                                zIndex    : 10,
                                data      : {}
                            });

                            LJ.fn.displayMarker({
                                lat       : evt.scheduled.address.lat,
                                lng       : evt.scheduled.address.lng,
                                url       : LJ.cloudinary.markers.party_active,
                                id        : evt.scheduled.address.place_id,
                                cache     : 'active_markers',
                                singleton : false,
                                zIndex    : 10,
                                data      : {}
                            });

                            LJ.fn.addEventPreview( evt );
                            LJ.fn.displayPathToParty( evt );
                        }
                    }
                ]
            }, options));


        },
        clearAllActiveMarkers: function(){

            LJ.active_markers = LJ.active_markers || [];
            LJ.active_paths   = LJ.active_paths || [];

            LJ.active_markers.forEach(function( mark ){
                mark.marker.setMap(null);
            });

            LJ.active_paths.forEach(function( path ){
                path.setMap(null);
            });

            delete LJ.active_markers;
            delete LJ.active_paths;

        },  
        displayPartyMarker: function( evt ){

             LJ.fn.displayMarker({
                lat       : evt.scheduled.address.lat,
                lng       : evt.scheduled.address.lng,
                url       : LJ.cloudinary.markers.party.url,
                cache     : 'scheduled',
                singleton : false,
                id        : evt.scheduled.address.place_id,
                data      : evt.scheduled,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){
                           
                            LJ.fn.clearAllActiveMarkers();
                            
                            LJ.fn.displayMarker({
                                lat       : evt.address.lat,
                                lng       : evt.address.lng,
                                url       : LJ.cloudinary.markers.base_active,
                                id        : evt.address.place_id,
                                cache     : 'active_markers',
                                singleton : false,
                                data      : {}
                            });

                            LJ.fn.displayMarker({
                                lat       : evt.scheduled.address.lat,
                                lng       : evt.scheduled.address.lng,
                                url       : LJ.cloudinary.markers.party_active,
                                id        : evt.scheduled.address.place_id,
                                cache     : 'active_markers',
                                singleton : false,
                                data      : {}
                            });

                            LJ.fn.addEventPreview( evt );
                            LJ.fn.displayPathToParty( evt );

                        }
                    }
                ]
            });

        },
        displayPath: function( path ){

            LJ.active_paths = LJ.active_paths || [];
            // Store reference to hide and delete later
            var path = new google.maps.Polyline({
                path          : path,
                geodesic      : true,
                strokeColor   : '#E94F6A',
                strokeOpacity : 0.69,
                strokeWeight  : 5
            });

            LJ.active_paths.push( path );

            // Display the path we just stored
            LJ.active_paths[ LJ.active_paths.length - 1 ].setMap( LJ.map );

        },
        fetchPath: function( origin, destination, callback ){

            var directions_service = new google.maps.DirectionsService;
            var directions_display = new google.maps.DirectionsRenderer;

            directions_display.setMap( LJ.map );

            var origin      = new google.maps.LatLng( origin.lat, origin.lng );
            var destination = new google.maps.LatLng( destination.lat, destination.lng );

            directions_service.route({

                origin      : origin,
                destination : destination,
                travelMode  : 'WALKING'

            }, callback );
               
        },
        displayPathToParty: function( evt ){

            LJ.fn.fetchPath( evt.address, evt.scheduled.address, function( response, status ){

                 if( status === google.maps.DirectionsStatus.OK ){
                    var path = response.routes[0].overview_path;
                    LJ.fn.displayPath( path );
                    return;                    
                } 

                console.log('Directions request failed due to ' + status);

            });

        }

	});