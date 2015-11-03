
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        handleDomEventsMap: function(){

            LJ.$body.on('mousedown', function(e){ 

                if( $(e.target).hasClass('row-preview') ){
                    $('.event-accepted-tabview.active').click(); 
                }

                if( $(e.target).hasClass('row-events-accepted-inview') ){
                    $('.row-events-accepted-inview.active').find('.icon-minus').click();
                }

            });

            Mousetrap.bind('esc', function(e) {
                $('.btn-cancel').each(function(i, el){
                    if( $(el).css('display') != 'none' ){
                        $(el).click();
                    }
                });
            });


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
                return console.log('Error fetching events : ' + JSON.stringify( err, null, 3 ) );
            }

            console.log('Total events successfully fetched, n = ' + events.length);
            LJ.cache.events = events;
                

        },
        handleFetchParties: function( err, parties ){

            if( err ){
                return console.log('Error fetching parties : ' + JSON.stringify( err, null, 3 ) );
            }

            console.log('Total parties successfully fetched, n = ' + parties.length);
            LJ.cache.parties = parties;

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

            console.log('Personnal events successfully fetched, n = ' + events.length);
            
            LJ.$body.on('display:layout:after', function(){

                $('.row-events-accepted-tabview').velocity('transition.slideUpIn');

                events.forEach(function( evt, i ){
                    LJ.fn.handleFetchEventById( null, evt, { hide: true });
                });

            });


        },
        fetchEvents: function( callback ){

            LJ.fn.api('get', 'events', callback );

        },
        fetchParties: function( callback ){

            LJ.fn.api('get', 'parties', callback );

        },
        // For fetch when a friend puts us host or ask event with us 
        fetchEventById: function( event_id, callback ){

            if( !LJ.user.facebook_id )
                return console.error("Can't fetch events, userId not found");

            LJ.fn.api('get','events/' + event_id, callback );

        },
        // During initialisation 
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
                LJ.fn.displayEventMarker( itm );
            });

          /* Rendu des évènements les plus proches par rapport à la position de départ*/
            // setTimeout(function(){
            //     LJ.fn.refreshEventPreview();
            // }, 1000 );        
           

        },
        displayPartyMarkers_Events: function( events ){

            events.forEach(function( evt ){
                LJ.fn.displayPartyMarker_Event( evt );
            });


        },
        displayPartyMarkers_Parties: function( parties ){

            parties.forEach(function( party ){
                LJ.fn.displayPartyMarker_Party( party );
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

            // Make sure only display in intro mode
            if( options.intro ) {
                LJ.intro_marker = LJ.intro_marker || [];
                LJ.intro_marker.push( new_marker );
                return;                
            }

        
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
                        LJ[ options.cache ][ LJ[options.cache ].length -1 ].marker.setZIndex(100);
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

            var options = options || {};

            var url;
            var status;
            var open_status;

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

            if( evt.status == "open" ){
                open_status = "open"
            } else {
                open_status = "full"
            }

            var effective_lat = evt.address.lat;
            var effective_lng = evt.address.lng;

            LJ.event_markers = LJ.event_markers || [];
            LJ.party_markers = LJ.party_markers || [];

            // Offsetting markers that pin to the exact same place_id for
            var concat_markers =  LJ.event_markers.concat( LJ.party_markers );
            concat_markers.forEach(function( mark ){

                var address = mark.data.party ? mark.data.party.address : mark.data.address;
                var evt_latlng   = new google.maps.LatLng( evt.address.lat, evt.address.lng);
                var other_latlng = new google.maps.LatLng( address.lat, address.lng );
                var distance     = google.maps.geometry.spherical.computeDistanceBetween( other_latlng, evt_latlng );

                if( distance < 100 ){
                    effective_lng = google.maps.geometry.spherical.computeOffset( evt_latlng, 100, LJ.fn.randomInt(0, 180) ).lng();
                    effective_lat = google.maps.geometry.spherical.computeOffset( evt_latlng, 100, LJ.fn.randomInt(0, 180) ).lat();
                }

            });


            LJ.fn.displayMarker( _.merge({
                lat       : effective_lat,
                lng       : effective_lng,
                url       : options.url || LJ.cloudinary.markers[ status ][ open_status ].url,
                cache     : options.cache || 'event_markers',
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
                            // Pass in the date of the event, to determine if the party
                            // matches a partner party in case same place_id, or if party occurs
                            // another day in order to display the right preview!
                            LJ.fn.addPartyPreview( evt.party, { begins_at: evt.begins_at } );

                            // Display active pins, paths and half active paths
                            LJ.fn.displayPathToParty({ evt: evt });
                            LJ.fn.displayHalfActivePaths( evt.party );
                            LJ.fn.displayActiveEventMarker( evt, { lat: effective_lat, lng: effective_lng });
                            LJ.fn.displayActivePartyMarker_Event( evt.party );
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
        displayPartyMarker_Event: function( evt, options ){

            var options = options || {};

            var party = evt.party;
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
                cache     : options.cache || 'party_markers',
                singleton : false,
                id        : party.address.place_id,
                data      : evt,
                zIndex    : 2,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){

                            // Select all events in cache that cause to this place
                            // Range them by date according to filters
                            // Select the closest in distance, and trigger click
                           LJ.fn.clickOnClosestEvent( party );
                           
                        }
                    }
                ]
            });

        },
        displayPartyMarker_Party: function( party, options ){
            

            var options = options || {};

            // Display the marker with high z-index, so it overrides other people party's pin
            // who want to do a before at this place_id
            LJ.fn.displayMarker({
                lat       : parseFloat(party.address.lat),
                lng       : parseFloat(party.address.lng),
                url       : LJ.cloudinary.markers.party.url,
                cache     : options.cache || 'party_markers',
                singleton : false,
                id        : party.address.place_id,
                data      : party,
                zIndex    : 20,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){

                            LJ.fn.clickOnClosestEvent( party );
                           
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
                        stroke_opacity : 0.25,
                        cache          : "half_active_paths"
                    });
                }
            });

        },
        displayActivePartyMarker_Event: function( party ){

            if( LJ.fn.isPartyMarkerActivated( party.address.place_id ) ){
                LJ.active_markers[0].marker.setZIndex(1);
                return console.log('Marker already activated');
            }

            // If a party in cache with the same place_id and same date
            // display that one instead.

            // ONLY USEFULL IF DIFFERENT MARKERS FOR PARTY EVENTS

            // var cached_party = false;
            //     cached_party = _.find( LJ.cache.parties, function( cached_party ){
            //         return party.address.place_id == cached_party.address.place_id;
            //             && moment( cached_party.begins_at ).dayOfYear() == moment( ... ).dayOfYear() 
            //     });

            // if( cached_party ){
            //     LJ.fn.displayActivePartyMarker_Party( cached_party );
            //     return;
            // }

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
        displayActivePartyMarker_Party: function( party ){

            if( LJ.fn.isPartyMarkerActivated( party.address.place_id ) ){
                LJ.active_markers[0].marker.setZIndex(1);
                return console.log('Marker already activated');
            }



            // Display active party
            LJ.fn.displayMarker({
                lat       : parseFloat(party.address.lat),
                lng       : parseFloat(party.address.lng),
                url       : LJ.cloudinary.markers.party_active,
                id        : party.address.place_id,
                cache     : 'active_party_marker',
                singleton : false,
                zIndex    : 21,
                data      : {}
            });


        },
        displayActiveEventMarker: function( evt, opts ){

            if(! opts ){
                return console.warn('Cant display active event marker without effective lat and lng');
            }

            var status = null;
            var open_status = null;

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

            if( evt.status == "open" ){
                open_status = "open"
            } else {
                open_status = "full"
            }

            LJ.fn.displayMarker({
                lat       : opts.lat,
                lng       : opts.lng,
                url       : LJ.cloudinary.markers[ marker_type + '_active'][ open_status ],
                id        : evt._id,
                cache     : 'active_event_marker',
                singleton : false,
                zIndex    : 10,
                data      : {}
            });

        },
        clickOnClosestEvent: function( party ){

            console.log('Triggering action on the closest event');

            var filtered_events = []

            // Filter by destination
            filtered_events = _.filter( LJ.cache.events, function( evt ){
                return evt.party.address.place_id == party.address.place_id;
            });

            if( filtered_events.length == 0 ){
                // Clear everything
                LJ.fn.clearAllActiveMarkers();
                LJ.fn.clearAllActivePaths();
                LJ.fn.clearAllHalfActivePaths();

                // Display suggestion to be the first to host a meefore
                console.log('Adding default suggestion preview');
                LJ.fn.addEventPreview();

                // Display preview
                LJ.fn.addPartyPreview( party );

                // Display active pins, paths and half active paths
                LJ.fn.displayHalfActivePaths( party );
                LJ.fn.displayActivePartyMarker_Event( party );

                return;
            }

            // Order by date
            filtered_events.sort(function( e1, e2 ){
                return e1.begins_at > e2.begins_at;
            });

            // Try to find at least one event in filtered dates;
            var acceptable_dates = [];
            $('.filter-date-item.active').each(function( i, el ){
                acceptable_dates.push(  $(el).attr('data-dateid') );
            });

            var found = false;
            var filtered_events_with_filter = [];
            acceptable_dates.forEach(function( date ){

                    var day_of_year = moment( date, 'DD/MM/YYYY' ).dayOfYear();
                    var temp = _.filter( filtered_events, function( evt ){
                        return moment( evt.begins_at ).dayOfYear() == day_of_year;
                    });

                    if( temp && temp.length != 0 && !found ){
                        found = true;
                        filtered_events_with_filter = temp;
                    }

            }); 
            
            // Try to find at least one event without applying filters
            var filtered_events_without_filters = [];
            var day_to_come = moment( filtered_events[0].begins_at ).dayOfYear();
            filtered_events_without_filters = _.filter( filtered_events, function( evt ){
                return moment( evt.begins_at ).dayOfYear() == day_to_come;
            });

            // Check if filter gave successfully match. Otherwise, use 2n array
            if( filtered_events_with_filter.length != 0 ){
                console.log('Found elements according to filter');
                filtered_events = filtered_events_with_filter;
            } else {
                console.log('Found elements according NOT to filter');
                filtered_events = filtered_events_without_filters;
            }

            // Augmente each object with the distance to center
            filtered_events.forEach(function( evt ){
                evt.distance_to = LJ.fn.distanceBetweenParties( party, evt );
            }); 

            // Filter by distance to center
            filtered_events.sort(function( e1, e2 ){
                return e1.distance_to > e2.distance_to;
            }); 

            var closest_event = filtered_events[0];
            console.log(closest_event);

            var closest_event_marker = _.find( LJ.event_markers, function( mrk ){
                return mrk.id == closest_event._id;
            }).marker;

            google.maps.event.trigger( closest_event_marker, 'click' );
        

        },
        distanceBetweenParties: function( party_1, party_2 ){

            var party_1_latlng = new google.maps.LatLng( party_1.address.lat, party_1.address.lng );
            var party_2_latlng = new google.maps.LatLng( party_2.address.lat, party_2.address.lng );
            return google.maps.geometry.spherical.computeDistanceBetween( party_1_latlng, party_2_latlng );

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
                        $row_preview.css({ display: 'none' });                            
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

        },
        refreshEventStatusOnMap: function( event_id, status ){

            var marker = _.find( LJ.event_markers, function( el ){
                return el.id == event_id; 
            }).marker;

            var current_url = marker.getIcon().split('/').slice(-1)[0].split('.png')[0];

            // Playing with url parts. Url need to respect some convention
            if( status == "open" ){
                var current_url   = marker.getIcon();
                var last_part     = current_url.split('/').slice(-1)[0].split('.png')[0];
                var first_part    = current_url.split('marker')[0];
                var new_last_part = last_part.split('_full')[0];
                marker.setIcon( first_part + new_last_part );
            }
            
            if( status == "suspended" ){
                var current_url   = marker.getIcon();
                var last_part     = current_url.split('/').slice(-1)[0].split('.png')[0];
                var first_part    = current_url.split('marker')[0];
                var new_last_part = last_part + '_full';
                marker.setIcon( first_part + new_last_part );
            }

            if( status == "canceled" ){
                LJ.fn.handleCancelEvent( event_id );
                return;
            }
            
        }

	});