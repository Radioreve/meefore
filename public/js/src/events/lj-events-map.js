
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

            var map_style_meefore = new google.maps.StyledMapType( LJ.google.map.style.meemap, {
                name: 'meemap'
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
                    mapTypeIds: ['meemap']
                }
            });

            LJ.map_service = new google.maps.places.PlacesService( LJ.map );

            // Set map styling 
            LJ.map.mapTypes.set('meemap', map_style_meefore );
            LJ.map.setMapTypeId('meemap');

            // Set map listeners
            LJ.fn.setMapListeners();


        },
        setMapListeners: function(){

            LJ.map.addListener('center_changed', function(){
                
            });

            LJ.map.addListener('click', function(e){
                
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
                return LJ.fn.log('Error fetching events : ' + JSON.stringify( err, null, 3 ) );
            }

            LJ.fn.log('Total events successfully fetched, n = ' + events.length);
            LJ.cache.events = events;


        },
        handleFetchParties: function( err, parties ){

            if( err ){
                return LJ.fn.log('Error fetching parties : ' + JSON.stringify( err, null, 3 ) );
            }

            LJ.fn.log('Total parties successfully fetched, n = ' + parties.length);
            LJ.cache.parties = parties;

        },
        handleFetchEventById: function( err, evt, opt ){

            if( err ){
                return LJ.fn.log('Error fetching event by id : ' + JSON.stringify( err, null, 3 ));
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
            return LJ.fn.log('Error fetching and sync friends : ' + err );
          }

            LJ.fn.log('Personnal events successfully fetched, n = ' + events.length);
            
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
            
            events.forEach(function( evt ){
                LJ.fn.displayEventMarker( evt );
            });

          /* Rendu des évènements les plus proches par rapport à la position de départ */
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
                position   : { lat: options.lat, lng: options.lng },
                map        : LJ.map,
                opacity    : options.opacity || 1,
                animation  : options.animation || null,
                icon       : options.url,
                zIndex     : options.zIndex,
                size       :new google.maps.Size(32, 37),
                scaledSize :new google.maps.Size(32, 37)
            });


            // Store references of markers to destroy em and make them disappear from the map ( marker.setMap(null) )
            if( options.singleton ){
                LJ[ options.cache ] && LJ[ options.cache ].setMap( null );
                LJ[ options.cache ] = new_marker;
            } else {
                LJ[ options.cache ] = LJ[ options.cache ] || [];
                LJ[ options.cache ].push({
                        marker    : new_marker,
                        marker_id : options.marker_id,
                        data      : options.data
                    });
                // Fix, if has active in namespace, force refresh to be on top
                setTimeout(function(){
                    if( /active/.test( options.cache ) ){
                        LJ[ options.cache ][ LJ[options.cache ].length -1 ].marker.setZIndex(100);
                    }
                }, 30 )
            }

            // Make sure only display in intro mode
            if( options.intro ) {
                LJ.intro_marker = LJ.intro_marker || [];
                LJ.intro_marker.push( new_marker );
                LJ.fn.log('Intro marker, not activating listeners...', 1);
                return;                
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


            // Find which marker to display
            var my_group = _.find( evt.groups, function( group ){
                return group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1; 
            });

            if( my_group ){
                status = my_group.status;
            } else {
                status = LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id' ) ) ? "hosting" : "base"; 
            }

            open_status = evt.status === "open" ? "open" : "full";

            url = options.url || LJ.cloudinary.markers[ status ][ open_status ].url

            // Update the effective lat/lng, in case 2 markers are displayed at the same address
            var effective_latlng = LJ.fn.findEffectiveLatLng_Event( evt );
            var lat = effective_latlng.lat;
            var lng = effective_latlng.lng;

            // Build the data that will be store with the marker in cache
            var data = _.cloneDeep( options.data ) || {};

            data.type      = "event";
            data.address   = evt.address;
            data.begins_at = evt.begins_at;


            LJ.fn.displayMarker( _.merge({
                lat       : lat,
                lng       : lng,
                url       : url,
                cache     : options.cache || 'event_markers',
                singleton : false,
                marker_id : evt._id,
                data      : data,
                zIndex    : 1,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function(e){

                            if( LJ.fn.isEventMarkerActivated( evt._id ) )
                                return LJ.fn.warn('Marker already activated', 2);
                            

                            // Refresh active marker
                            LJ.fn.clearAllActiveMarkers();
                            LJ.fn.clearAllActivePaths();
                            LJ.fn.clearAllHalfActivePaths();

                            // Event mapview ;-)
                            LJ.fn.addEventMapview( evt );

                            // Partu mapview ;-)
                            LJ.fn.addPartyMapview( evt.party, { begins_at: evt.begins_at } );

                            // Pass in the date of the event, to determine if the party
                            // matches a partner party in case same place_id, or if party occurs
                            // another day in order to display the right preview!
                            // LJ.fn.addPartyPreview( evt.party, { begins_at: evt.begins_at } );

                            // Display active event marker at the very same effective lat/lng locations
                            LJ.fn.displayActiveEventMarker( evt, { lat: effective_latlng.lat, lng: effective_latlng.lng });

                            // Every other display about the party need to fetch in cache the proper effective lat/lng
                            // Which may have been adjusted
                            var c_evt   = _.clone( evt )

                            LJ.party_markers.forEach(function( mrk ){

                                if( mrk.marker_id == evt.party.address.place_id ){
                                    c_evt.party.address.lat = mrk.marker.getPosition().lat();
                                    c_evt.party.address.lng = mrk.marker.getPosition().lng();
                                }

                            });


                            LJ.fn.displayActivePartyMarker_Event( c_evt.party );

                            // Display paths
                            LJ.fn.displayPathToParty({ evt: c_evt });
                            LJ.fn.displayHalfActivePaths( c_evt.party );

                        }

                    }, {
                        event_type : 'mouseover',
                        callback   : function(e){
                            var current_zindex = this.getZIndex();
                            this.setZIndex( current_zindex + 1 );

                            // LJ.fn.log('Hovering : ' + evt._id );
                            $('.event-accepted-tabview[data-eventid="' + evt._id + '"]').addClass('highlight');
                        }
                    }, {
                        event_type : 'mouseout',
                        callback   : function(e){

                            // LJ.event_markers.forEach(function( mrk ){
                            //     if( mrk.marker != this ){
                            //         mrk.marker.setZIndex(1);
                            //     } else {
                            //         mrk.marker.setZIndex(3);
                            //     }
                            // });

                            // LJ.party_markers.forEach(function( mrk ){
                            //     mrk.marker.setZIndex(1);
                            // });

                            $('.event-accepted-tabview[data-eventid="' + evt._id + '"]').removeClass('highlight');
                        }
                    }
                ]
            }, options ));


        },
        displayPartyMarker: function( party, options ){

            var options = options || {};

            var url = LJ.cloudinary.markers.party.url;

            // Only display the marker if no other party at the same location exists
            var party_at_same_address = _.find( LJ.party_markers, function( item ){
                return item.marker_id == party.address.place_id; 
            });

            if( party_at_same_address ){
                return LJ.fn.log('No displaying marker, already there');
            }

             // Update the effective lat/lng, in case 2 markers are displayed at the same address
            var effective_latlng = LJ.fn.findEffectiveLatLng_Party( party );

            var lat = effective_latlng.lat;
            var lng = effective_latlng.lng;

            // LJ.fn.updateEventsPartyLatLng( party.address.place_id, effective_latlng );

            // Data part that will be store in cache with the marker
            var data = _.cloneDeep( options.data ) || {};

                data.type      = "party";
                data.address   = party.address;
                data.begins_at = party.begins_at;

            LJ.fn.displayMarker({
                lat       : lat,
                lng       : lng,
                url       : url,
                cache     : options.cache || 'party_markers',
                singleton : false,
                marker_id : party.address.place_id,
                data      : data,
                zIndex    : 2,
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){

                            LJ.fn.clickOnClosestEvent( party );
                           
                        }
                    }, {
                        event_type: 'mouseover',
                        callback: function( e ){

                            var current_zindex = this.getZIndex();
                            this.setZIndex( current_zindex + 1 );

                        }
                    }
                ]
            });

        },
        displayPartyMarker_Event: function( evt, options ){

            options = options || {};

            options.data = evt;

            LJ.fn.displayPartyMarker( evt.party, options );
            return;

        },
        // Display a party marker that is the one of a "partner party", created by an admin
        // This kind of party is supposed to override other parties
        displayPartyMarker_Party: function( party, options ){
            
            options = options || {};

            options.data = party;

            LJ.fn.displayPartyMarker( party, options );
            return;

        },
        // Propagate the effective latlng in events party address
        // That may have changed in case meefore was created at the same place
        updateEventsPartyLatLng: function( place_id, latlng ){

            var ar = LJ.cache.events || [];

            ar.forEach(function( evt ){

                if( evt.party.address.place_id === place_id ){
                    LJ.fn.log('Propagating new latlng in event', 2 );
                    evt.party.address.lat = latlng.lat;
                    evt.party.address.lng = latlng.lng;
                }

            });

             var ar = LJ.cache.parties || [];

            ar.forEach(function( par ){

                if( par.address.place_id === place_id ){
                    LJ.fn.log('Propagating new latlng in event', 2 );
                    par.address.lat = latlng.lat;
                    par.address.lng = latlng.lng;
                }

            });  

        },
        // Check in the cache all events that have the address that matches
        // the party, and display them with a lightened color. These paths are
        // stored in cache in 'half_active_paths'
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
                return LJ.fn.log('Marker already activated');

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
                marker_id : party.address.place_id,
                cache     : 'active_party_marker',
                singleton : false,
                zIndex    : 10,
                data      : {},
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){
                            LJ.fn.clearMapviews();
                        }
                    }]
            });


        },
        getEffectiveLatLng: function( party ){

            var latlng = {};
            LJ.party_markers.forEach(function( mrk ){

                if( mrk.marker_id == party.address.place_id ){
                    latlng.lat = mrk.marker.getPosition().lat();
                    latlng.lng = mrk.marker.getPosition().lng();
                }

            });

            return latlng;

        },
        displayActivePartyMarker_Party: function( party ){

            if( LJ.fn.isPartyMarkerActivated( party.address.place_id ) ){
                LJ.active_markers[0].marker.setZIndex(1);
                return LJ.fn.log('Marker already activated');
            }

            var latlng = LJ.fn.getEffectiveLatLng( party );

            // if( !latlng || !latlng.lat || !latlng.lng ){
            //     return LJ.fn.warn('Cannot display marker, missing either lat or lng, latlng: ' + latlng + ', latlng.lat: ' + latlng.lat + ', latlng.lng: ' + latlng.lng, 2 );
            // }

            // Display active party
            LJ.fn.displayMarker({
                lat       : latlng.lat,
                lng       : latlng.lng,
                url       : LJ.cloudinary.markers.party_active,
                marker_id : party.address.place_id,
                cache     : 'active_party_marker',
                singleton : false,
                zIndex    : 21,
                data      : {},
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){
                            LJ.fn.clearMapviews();
                        }
                    }]
            });


        },
        findEffectiveLatLng_Event: function( evt ){

            LJ.event_markers = LJ.event_markers || [];
            LJ.party_markers = LJ.party_markers || [];

            return LJ.fn.findEffectiveLatLng({
                lat           : evt.address.lat,
                lng           : evt.address.lng,
                markers_array : LJ.event_markers.concat( LJ.party_markers )
            });

        },
        findEffectiveLatLng_Party: function( party ){

            LJ.event_markers = LJ.event_markers || [];
            LJ.party_markers = LJ.party_markers || [];

            return LJ.fn.findEffectiveLatLng({
                lat           : party.address.lat,
                lng           : party.address.lng,
                markers_array : LJ.event_markers
            });
        },
        findEffectiveLatLng: function( opts ){

            var opts = opts || {};

            if( !opts.lng || !opts.lat  ){
                return LJ.fn.warn('Cant compute effective latlng, missing lat || lng from options', 2);
            }

            if( !opts.markers_array  ){
                return LJ.fn.warn('Cant compute effective latlng, missing markers array from options', 2);
            }

            var effective_lat = opts.lat;
            var effective_lng = opts.lng;

            // Offsetting markers that pin to the exact same place_id for
            var all_markers =  opts.markers_array

            all_markers.forEach(function( mark ){

                var address = mark.data.address

                // Compute the distance between the marker that's about to be appened,
                // and 'all' other markers. That means that offset is also done when 2 events are not on
                // the same place_id, but extremely close from eachother
                var subject_latlng = new google.maps.LatLng( opts.lat, opts.lng);
                var other_latlng   = new google.maps.LatLng( address.lat, address.lng );

                var distance = google.maps.geometry.spherical.computeDistanceBetween( other_latlng, subject_latlng );

                if( distance < 100 ){
                    LJ.fn.log('Offseting required for address: ' + address.place_name );

                    effective_lng = google.maps.geometry.spherical.computeOffset( subject_latlng, 100, LJ.fn.randomInt(0, 180) ).lng();
                    effective_lat = google.maps.geometry.spherical.computeOffset( subject_latlng, 100, LJ.fn.randomInt(0, 180) ).lat();
                }

            });

            return {
                lat: effective_lat,
                lng: effective_lng
            };

        },
        displayActiveEventMarker: function( evt, opts){

            if( !opts ){
                return LJ.fn.warn('Cant display active event marker without effective lat and lng');
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
                marker_id : evt._id,
                cache     : 'active_event_marker',
                singleton : false,
                zIndex    : 10,
                data      : {},
                listeners : [
                    {
                        event_type : 'click',
                        callback   : function( e ){
                            LJ.fn.clearMapviews();
                        }
                    }]
            });

        },
        // Find the closest event for a given party, that match the filters criteria
        findClosestEvent: function( party, opts ){

            var opts = opts || {};

            var filters = opts.filters || false;

            LJ.fn.log('Looking for the closest event', 2);


            // Get all events that go the party
            var filtered_events = [];
            filtered_events = _.filter( LJ.cache.events, function( evt ){
                return evt.party.address.place_id == party.address.place_id;
            });


            if( filters ){

                 // Re order all events by date 
                filtered_events.sort(function( e1, e2 ){
                    return e1.begins_at > e2.begins_at;
                });

                 // Try to find at least one event that matches the date
                var acceptable_dates = [];
                $('.filter-date-item.active').each(function( i, el ){
                    acceptable_dates.push(  $(el).attr('data-dateid') );
                });

                // If filters are on, the filtered_events must be reduces taking into account
                // date filters. After the reduction, its length might be zero
                if( acceptable_dates.length != 0 ){

                    LJ.fn.log('Reducing based on date filters of length: ' + acceptable_dates.length );
                    // Will be true as soon as at least one event match the date
                    var found = false;
                    var temp_events = null;
                    acceptable_dates.forEach(function( date ){

                            var day_of_year = moment( date, 'DD/MM/YYYY' ).dayOfYear();

                            temp_events = _.filter( filtered_events, function( evt ){
                                return moment( evt.begins_at ).dayOfYear() == day_of_year;
                            });

                            if( temp_events && temp_events.length != 0 && !found ){
                                found = true;
                                filtered_events = temp_events;
                            }

                    });

                    if( temp_events.length == 0 ){
                        LJ.fn.log('No event were found in spite of date filters, returning null...', 2);
                        return null;
                    } 
                }

            }

            // filtered_events contains now events for the first date in the filter array
            // All that remains is to find the closest one from the party location
            if( filtered_events.length == 0 ){
                LJ.fn.log('No event were found without any date filter, returning null...', 2);
                return null;
            }


            // Augment each object with the distance to center to be able to filter so we can sort
            filtered_events.forEach(function( evt ){
                evt.distance_to = LJ.fn.distanceBetweenParties( party, evt );
            });

            filtered_events.sort(function( e1, e2 ){
                return e1.distance_to > e2.distance_to;
            }); 

            // Return the first event, which is the closest 
            return filtered_events[0];


        },
        clickOnClosestEvent: function( party ){

            LJ.fn.log('Triggering action on the closest event');

            // First, try to find a closest event with filters [on]
            var closest_event = LJ.fn.findClosestEvent( party, {
                filters: true
            });

            // Controls what happens if the selected party was filtered
            var is_party_filtered = false;

            LJ.party_markers = LJ.party_markers || [];

            LJ.party_markers.forEach(function( mrk ){
                if( mrk.marker_id === party.address.place_id && mrk.marker.getOpacity() != 1 ){
                    is_party_filtered = true;
                }
            });

            // First case : no event to be clicked. This is the case when
            // No meefore has been created to join a specific party
            if( closest_event == null  && !is_party_filtered ){

               LJ.fn.clearMapviews();
               LJ.fn.displayActivePartyMarker_Party( party );
               LJ.fn.addPartyMapview_Empty( party );
                
            } else {  

                if( !closest_event ){
                    LJ.fn.clearMapviews();
                    LJ.fn.displayActivePartyMarker_Party( party );
                    LJ.fn.addPartyMapview_Empty( party );
                    return;
                }

                var closest_event_marker = _.find( LJ.event_markers, function( mrk ){
                    return mrk.marker_id == closest_event._id;
                });

                if( !closest_event_marker ){
                    return LJ.fn.warn('No marker found, cant trigger click', 2);
                }

                google.maps.event.trigger( closest_event_marker.marker, 'click' );

            }

        },
        addDefaultInview: function( party ){

            LJ.fn.clearAllActiveMarkers();
            LJ.fn.clearAllActivePaths();
            LJ.fn.clearAllHalfActivePaths();

            // Display suggestion to be the first to host a meefore
            LJ.fn.log('Adding default suggestion preview', 2);
            LJ.fn.addEventPreview();
            LJ.fn.addPartyPreview( party );
            LJ.fn.displayActivePartyMarker_Party( party );

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

            // LJ.fn.log('Clearing all half active paths');
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
                display: 'none',
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
                    display: 'none',
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
                    return mark.marker_id == given_id;
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
                    return mark.marker_id == given_id;
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

            path.path_id == opts.evt._id;

            LJ[ opts.cache ].push( _.merge(path, { path_id: opts.evt._id }) );

            // Display the path we just stored
           LJ[ opts.cache ][ LJ[ opts.cache ].length - 1 ].setMap( LJ.map );

        },
        fetchPathToParty: function( evt, callback ){

            var origin      = evt.address;
            var destination = evt.party.address;

            var arr = LJ.event_markers.concat( LJ.party_markers );
            arr.forEach(function( mrk ){

                // origin always refer to address, hence, markers are identified by the event id
                if( mrk.marker_id == evt._id ){
                    origin.lat = mrk.marker.getPosition().lat();
                    origin.lng = mrk.marker.getPosition().lng();
                }

                // destinations always refer to party, hence, markers are identified by place_id
                // since all party with the same place_id share the same location on map, we dont
                // have to know which event the marker originated from. Dont care at all.
                if( mrk.marker_id == destination.place_id ){
                    destination.lat = mrk.marker.getPosition().lat();
                    destination.lng = mrk.marker.getPosition().lng();
                }
            });

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
        // Display a path between an event (evt) with an address field
        // and store the computed google path in cache for instant display on later clicks
        displayPathToParty: function( opts ){

            var evt = opts.evt;

            LJ.cache.paths = LJ.cache.paths || {};

            var cached_path = LJ.cache.paths[ evt._id ]

            if(    cached_path 
                && cached_path.path
                // && cached_path.path.length < 5  
                && cached_path.cached_at 
                && ( (new Date()) - cached_path.cached_at < 60 * 1000) )
            {
                // LJ.fn.log('Displaying path from cached value', 5);
                LJ.fn.displayPath( cached_path.path, opts );
                return;
            }


            LJ.fn.fetchPathToParty( evt, function( response, status ){

                if( status === google.maps.DirectionsStatus.OK ){
                    var path = response.routes[0].overview_path;
                    LJ.cache.paths[ evt._id ] = {
                        path      : path,
                        cached_at : new Date(),
                        path_id   : evt._id
                    };
                    LJ.fn.displayPath( path, opts );
                    return;                    
                } 

                if( status == "OVER_QUERY_LIMIT" ){
                    LJ.fn.log('Directions request failed due to ' + status + '. Retrying...');
                    setTimeout(function(){
                        LJ.fn.displayPathToParty( opts );
                    }, 400 );
                }                

            });

        },
        refreshEventStatusOnMap: function( event_id, status ){

            var marker = _.find( LJ.event_markers, function( el ){
                return el.marker_id == event_id; 
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
            
        },
        emulateMarkerClicked: function(){

            LJ.marker_clicked = true;
            LJ.fn.timeout( 30, function(){ LJ.marker_clicked = false });

        }

	});