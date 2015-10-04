
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
                // scrollwheel: false,
                disableDefaultUI: true,
                //zoomControl: true,
                zoomControlOptions: {
                    style    : google.maps.ZoomControlStyle.SMALL,
                    position : google.maps.ControlPosition.RIGHT_TOP
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
            LJ.map.setMapTypeId('sober');

            LJ.map.addListener('center_changed', function(){
                
            });

            LJ.map.addListener('click', function(e){
                
            	LJ.fn.clearAllActiveMarkers();
                LJ.fn.clearAllActivePaths();
                LJ.fn.clearAllHalfActivePaths();
                LJ.fn.clearActivePreview();
                LJ.fn.clearActiveInview();

                LJ.fn.refreshMap();

            });


            LJ.map.addListener('dragend', function(){
                //if( LJ.active_marker )
                //    return;
            	//LJ.fn.refreshEventPreview();
            });

        },

        handleFetchEvents: function( err, events ){

            if( err ){
                return console.log('Error fetching and sync friends : ' + JSON.stringify( err, null, 3 ) );
            }

            console.log('Total events successfully fetched, n = ' + events.length + ' )');

            /* Rendu sur la map */

            /* Display Google Map upon which to render event markers */
            LJ.$body.on('display:layout:during', function(){
                LJ.fn.initMap();
                LJ.fn.displayEventsMarkers( events );
                LJ.fn.displayPartyMarkers( events );
            });
                

        },
        handleFetchEventById: function( err, evt, opt ){

            if( err ){
                return console.log('Error fetching event by id : ' + JSON.stringify( err, null, 3 ));
            }
            
            LJ.fn.updateEventCache( evt );
            LJ.fn.joinEventChannel( evt ); 
            LJ.fn.addEventInviewAndTabview( evt, opt );
            
            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ){
                    LJ.fn.fetchMyChat_Host( evt );
            } else {
                    LJ.fn.fetchMyChat_Group( evt );
            }

        },
        handleFetchMyEvents: function( err, events ){

          if( err ){
            return console.log('Error fetching and sync friends : ' + err );
          }

            console.log('Personnal events successfully fetched, n = ' + events.length + ' )');
            
            LJ.$body.on('display:layout:after', function(){

                $('.row-events-accepted-tabview').velocity('transition.slideUpIn');

                events.forEach(function( evt, i ){
                    LJ.fn.handleFetchEventById( null, evt, { hide: true });
                });

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

            events.forEach(function( evt ){
                LJ.fn.displayPartyMarker( evt.party );
            });


        },
        refreshMap: function(){
            google.maps.event.trigger( LJ.map, 'resize');
            //LJ.map.panTo( LJ.google.map_center );
        },
        displayMarker: function( options ){

            if( !options.lat || !options.lng || !options.url )
                return console.error('Missing argument for display marker');

            // Define and display the Marker on the Map
            var new_marker = new google.maps.Marker({
                position  : { lat: options.lat, lng: options.lng },
                map       : LJ.map,
                opacity   : options.opacity || 1,
                animation : options.animation || null,
                icon      : options.url,
                zIndex    : options.zIndex
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
                // Fix, if has active in namespace, force refresh to be on top
                setTimeout(function(){
                    if( /active/.test( options.cache ) ){
                        LJ[ options.cache ][ LJ[options.cache ].length -1 ].marker.setZIndex(10);
                    }
                }, 30 )
            }

            if( Array.isArray( options.listeners )){
                options.listeners.forEach(function( listener ){
                    new_marker.addListener( listener.event_type, listener.callback );
                });
            }

        },
        displayEventMarker: function( evt, options ){

            var url;
            var status;

            var my_group = _.find( evt.groups, function( group ){
                return group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1; 
            });

            if( my_group ){
                status = my_group.status;
            } else if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' )) ){
                status = "hosting";
            } else {
                status = 'base';
            }

            var effective_lat = evt.address.lat;
            var effective_lng = evt.address.lng;

            LJ.event_markers = LJ.event_markers || [];
            LJ.event_markers.forEach(function( mark ){

                var other_evt    = mark.data; // event associated with marker is stored in data attribute
                var evt_latlng   = new google.maps.LatLng( evt.address.lat, evt.address.lng);
                var other_latlng = new google.maps.LatLng( other_evt.address.lat, other_evt.address.lng );
                var distance     = google.maps.geometry.spherical.computeDistanceBetween( other_latlng, evt_latlng );

                if( distance < 100 ){
                    effective_lng = google.maps.geometry.spherical.computeOffset( evt_latlng, 100, LJ.fn.randomInt(0, 180) ).lng()
                    effective_lat = google.maps.geometry.spherical.computeOffset( evt_latlng, 100, LJ.fn.randomInt(0, 180) ).lat();
                }

            });

            LJ.fn.displayMarker( _.merge({
                lat       : effective_lat,
                lng       : effective_lng,
                url       : LJ.cloudinary.markers[ status ].url,
                cache     : 'event_markers',
                singleton : false,
                id        : evt._id,
                data      : evt,
                zIndex    : 1,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function(e){

                            if( LJ.fn.isEventMarkerActivated( evt._id ) ){
                                return console.log('Marker already activated');
                            }

                            // Clear everything
                            LJ.fn.clearAllActiveMarkers();
                            LJ.fn.clearAllActivePaths();
                            LJ.fn.clearAllHalfActivePaths();

                            // Display preview
                            LJ.fn.addEventPreview( evt );
                            LJ.fn.addPartyPreview( evt.party );

                            // Display active pins, paths and half active paths
                            LJ.fn.displayPathToParty({ evt: evt });
                            LJ.fn.displayHalfActivePaths( evt.party );
                            LJ.fn.displayActiveEventMarker( evt, { lat: effective_lat, lng: effective_lng });
                            LJ.fn.displayActivePartyMarker( evt.party );
                        }
                    }, {
                        event_type : 'mouseover',
                        callback   : function(e){
                            this.setZIndex(2);
                            console.log('Hovering : ' + evt._id );
                            $('.event-accepted-tabview[data-eventid="' + evt._id + '"]').addClass('highlight');
                        }
                    }, {
                        event_type : 'mouseout',
                        callback   : function(e){
                            $('.event-accepted-tabview[data-eventid="' + evt._id + '"]').removeClass('highlight');
                        }
                    }
                ]
            }, options ));


        },
        displayPartyMarker: function( party ){

            // Only display the marker if no other party at the same location exists
            if( _.find( LJ.party_markers, function( sche ){
                return sche.id == party.address.place_id; 
            })){
                return console.log('No displaying marker, already there');
            }           

            LJ.fn.displayMarker({
                lat       : party.address.lat,
                lng       : party.address.lng,
                url       : LJ.cloudinary.markers.party.url,
                cache     : 'party_markers',
                singleton : false,
                id        : party.address.place_id,
                data      : party,
                zIndex    : 2,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){

                            // Clear everything
                            LJ.fn.clearAllActiveMarkers();
                            LJ.fn.clearAllActivePaths();
                            LJ.fn.clearAllHalfActivePaths();

                            // Display preview
                            LJ.fn.addPartyPreview( party );

                            // Display active pins, paths and half active paths
                            LJ.fn.displayHalfActivePaths( party );
                            LJ.fn.displayActivePartyMarker( party );

                            // Clear event preview
                            LJ.fn.clearActiveEventPreview();
                           
                        }
                    }
                ]
            });

        },
        displayHalfActivePaths: function( party ){

            // Displays lightened paths
            LJ.cache.events.forEach(function( other_evt ){
                if( other_evt.party.address.place_id == party.address.place_id ){
                    LJ.fn.displayPathToParty({
                        evt            : other_evt,
                        stroke_opacity : 0.15,
                        cache          : "half_active_paths"
                    });
                }
            });

        },
        displayActivePartyMarker: function( party ){

            if( LJ.fn.isPartyMarkerActivated( party.address.place_id ) ){
                LJ.active_markers[0].marker.setZIndex(1);
                return console.log('Marker already activated');
            }

            // Display active party
            LJ.fn.displayMarker({
                lat       : party.address.lat,
                lng       : party.address.lng,
                url       : LJ.cloudinary.markers.party_active,
                id        : party.address.place_id,
                cache     : 'active_party_marker',
                singleton : false,
                zIndex    : 10,
                data      : {}
            });


        },
        displayActiveEventMarker: function( evt, opts ){

            if(! opts ){
                return console.warn('Cant display active event marker without effective lat and lng');
            }

            var status = null;
            evt.groups.forEach(function( group ){
                if( LJ.fn.iGroup( group.members_facebook_id ) ){
                    status = group.status;
                }
            });

            if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id')) ){
                status = "hosting";
            }

            var marker_type = "base";

            if( status == "accepted" ){
                marker_type = "accepted";
            }

            if( status == "hosting" ){
                marker_type = "hosting";
            }

            if( status == "pending" || status == "kicked" ){
                marker_type = "pending";
            }

            LJ.fn.displayMarker({
                lat       : opts.lat,
                lng       : opts.lng,
                url       : LJ.cloudinary.markers[ marker_type + '_active'],
                id        : evt._id,
                cache     : 'active_event_marker',
                singleton : false,
                zIndex    : 10,
                data      : {}
            });

        },
        clearAllActiveMarkers: function(){

            LJ.active_party_marker = LJ.active_party_marker || [];
            LJ.active_party_marker.forEach(function( mark ){
                mark.marker.setMap(null);
            });

           LJ.active_party_marker = [];

            LJ.active_event_marker = LJ.active_event_marker || [];
            LJ.active_event_marker.forEach(function( mark ){
                mark.marker.setMap(null);
            });

            LJ.active_event_marker = [];

        },
        clearAllActivePaths: function(){

            LJ.active_paths = LJ.active_paths || [];
            LJ.active_paths.forEach(function( path ){
                path.setMap(null);
            });

            LJ.active_paths = [];

        },
        clearAllHalfActiveMarkers: function(){

            LJ.half_active_markers = LJ.active_markers || [];
            LJ.half_active_markers.forEach(function( mark ){
                mark.marker.setMap(null);
            });

            LJ.half_active_markers = [];

        },
        clearAllHalfActivePaths: function(){

            // console.log('Clearing all half active paths');
            LJ.half_active_paths = LJ.half_active_paths || [];
            LJ.half_active_paths.forEach(function( path ){
                path.setMap(null);
            });

            LJ.half_active_paths = [];

        },
        clearActivePreview: function(){

            var $row_preview = $('.row-preview');

            if( !$row_preview.children().length ) return;

            $row_preview.velocity( LJ.ui.slideUpOutLight, {
                duration: 270,
                complete: function(){
                    setTimeout(function(){
                        $row_preview.children().remove();
                    }, 200 );
                }
            });



        },
        clearActiveInview: function(){

                $('.event-accepted-tabview.active').click();

        },
        clearActiveEventPreview: function(){

            $('.event-preview').velocity( LJ.ui.slideUpOutLight,{
                    duration: 270, 
                    complete: function(){
                        setTimeout(function(){
                            $('.event-preview').remove();
                        }, 200 );
                    }
            });

        },
        clearActivePartyPreview: function(){

             $('.party-preview').velocity( LJ.ui.slideUpOutLight,{
                    duration: 270, 
                    complete: function(){
                        setTimeout(function(){
                            $('.party-preview').remove();
                        }, 200 );
                    }
            });

        },
        isPartyMarkerActivated: function( given_id ){

            if( _.find( LJ.active_party_marker, function( mark ){

                if( mark.data._id ){
                    return mark.data._id == given_id;
                } else {
                    return mark.id == given_id;
                }

            })){
                return true;
            } else {
                return false;
            }

        },
        isEventMarkerActivated: function( given_id ){

            if( _.find( LJ.active_event_marker, function( mark ){

                if( mark.data._id ){
                    return mark.data._id == given_id;
                } else {
                    return mark.id == given_id;
                }

            })){
                return true;
            } else {
                return false;
            }

        },
        displayPath: function( path, opts ){

            opts = opts || {};
            opts.cache = opts.cache || 'active_paths';
            LJ[ opts.cache ] = LJ[ opts.cache ] || [];


            // Store reference to hide and delete later
            var path = new google.maps.Polyline({
                path          : path,
                geodesic      : true,
                strokeColor   : opts.stroke_color || '#E94F6A',
                strokeOpacity : opts.stroke_opacity || 0.75,
                strokeWeight  : opts.stroke_weight || 5
            });

            path.id == opts.evt._id;

            LJ[ opts.cache ].push( _.merge(path, { id: opts.evt._id }) );

            // Display the path we just stored
           LJ[ opts.cache ][ LJ[ opts.cache ].length - 1 ].setMap( LJ.map );

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
        displayPathToParty: function( opts ){

            var evt = opts.evt;

            LJ.cache.paths = LJ.cache.paths || {};

            var cached_path = LJ.cache.paths[ evt._id ]
            if( cached_path && cached_path.path && cached_path.cached_at && ( (new Date) - cached_path.cached_at < 60*1000) ){
                // console.log('Displaying path from cached value');
                LJ.fn.displayPath( cached_path.path, opts );
                return;
            }

            LJ.fn.fetchPath( evt.address, evt.party.address, function( response, status ){

                if( status === google.maps.DirectionsStatus.OK ){
                    var path = response.routes[0].overview_path;
                    LJ.cache.paths[ evt._id ] = {
                        path      : path,
                        cached_at : new Date(),
                        id        : evt._id
                    };
                    LJ.fn.displayPath( path, opts );
                    return;                    
                } 

                if( status == "OVER_QUERY_LIMIT" ){
                    // console.log('Directions request failed due to ' + status + '. Retrying...');
                    setTimeout(function(){
                        LJ.fn.displayPathToParty( opts );
                    }, 400 );
                }                

            });

        }

	});