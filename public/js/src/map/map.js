
	window.LJ.map = _.merge( window.LJ.map || {}, {		

        markers: [],
        browser_uistate: null,

       	// Called as soon as the script finished loading everything
		init: function(){

			LJ.map.setupMap();
            LJ.map.preloadMarkers();

			LJ.map.handleDomEvents();
            LJ.map.handleMapEvents();
			LJ.map.initPlacesServices();
            LJ.before.displayBeforeMarkers( LJ.before.fetched_befores );

            
            return LJ.before.refreshBrowserLocation();
			
		},
        initGeocoder: function(){
            LJ.meegeo = new google.maps.Geocoder();
            return;

        },
        initPlacesServices: function(){
            LJ.meeservices = new google.maps.places.PlacesService( LJ.meemap );
            return;

        },
		sayHello: function(){
			LJ.log('Map has been successfully loaded');

		},
        preloadMarkers: function(){

            var markers_html = [];
            Object.keys( LJ.map.markers_url ).forEach(function( type ){

                var size = LJ.pictures.getDevicePixelRatio() + "x";
                var url  = LJ.map.markers_url[ type ][ size ];

                markers_html.push('<img src="'+ url +'">');

            });

            $( markers_html.join('') ).hide().appendTo('body');

        },
		handleDomEvents: function(){
            
			LJ.ui.$body.on('click', '.map__icon.x--geoloc', LJ.map.centerMapAtUserLocation );
			LJ.ui.$body.on('click', '.map__icon.x--change-location', LJ.map.toggleMapBrowser );

		},
		setupMap: function(){

			LJ.log('Setting up google map...');

            var latlng = {
                lat: parseFloat( LJ.user.location.lat ),
                lng: parseFloat( LJ.user.location.lng )
            };

			var options = {
				center: latlng,
	            zoom: 13,
	            disableDefaultUI: true,
	            zoomControlOptions: {
	                style    : google.maps.ZoomControlStyle.SMALL,
	                position : google.maps.ControlPosition.RIGHT_TOP
	            },
	            mapTypeControlOptions: {
	                mapTypeIds: ['meemap']
	            }
			}

			var $wrap = document.getElementsByClassName('js-map-wrap')[0];

			LJ.meemap = new google.maps.Map( $wrap, options );
			
            LJ.map.setMapStyle('apple');
            LJ.map.setMapIcons();
            LJ.map.setMapOverlay();
            LJ.map.setMapBrowser();
            LJ.map.setMapZoom();

            setTimeout(function(){
                LJ.map.refreshMap();
            }, 10000 );

			return;

        },
        setMapStyle: function( map_style ){

        	var custom_style = LJ.map.style[ map_style ];
        	if( !custom_style ){
        		return LJ.wlog('Unable to find a custom style for : ' + map_style );
        	}

        	var styled_map = new google.maps.StyledMapType( custom_style, {
                name: 'meemap'
            });
            // Set map styling 
            LJ.meemap.mapTypes.set('meemap', styled_map );
            LJ.meemap.setMapTypeId('meemap');

        },
        setMapIcons: function(){

        	$('.app-section.x--map')
        		.append( LJ.map.renderChangeLocation() )
        		.append( LJ.map.renderGeoLocation() )
                .append( LJ.map.renderCreateBefore() )
                // .append( LJ.map.renderExpandBrowser() )
        		.append( LJ.map.renderPinLocation() );


        },
        setMapOverlay: function(){

        	$('.app-section.x--map')
        		.append( LJ.map.renderMapOverlay() );

        },
        setMapBrowser: function(){

        	$('.app-section.x--map')
        		.append( LJ.map.renderMapBrowser() );

            return LJ.seek.activatePlacesInMap()
                    .then(function(){

                    	LJ.seek.map_browser_places.addListener('place_changed', function( place ){

                    		var place  = LJ.seek.map_browser_places.getPlace();
                    		var latlng = place.geometry.location;

                    		LJ.meemap.setCenter( latlng );
                            $('#map-browser-input').val('');

                    	});
                        
                    });

        },
        handleMapEvents: function(){

            LJ.meemap.addListener('dragstart', function(){
                LJ.before.preRefreshBrowserLocation();
            });

            LJ.meemap.addListener('dragend', function(){
                LJ.before.refreshBrowserLocation();
            });

            LJ.meemap.addListener('click', function(e){
                
            });
            
            LJ.meemap.addListener('center_changed', function(){
                // LJ.before.refreshNearestBefores();
            });

            $('body').on('click', '.js-map-zoom-in', LJ.map.zoomIn );
            $('body').on('click', '.js-map-zoom-out', LJ.map.zoomOut );


        },
        expandBrowser: function(){

            $('.map__icon.x--create-before, .map__icon.x--filter-dates, .be-browser' ).velocity({ 'translateY':'0' }, { duration: 300 });

        },
        shrinkBrowser: function(){

            $('.map__icon.x--create-before, .map__icon.x--filter-dates, .be-browser' ).velocity({ 'translateY':'-54' }, { duration: 300 });

        },
        handleShrinkBrowserDates: function(){

            if( LJ.map.browser_uistate == "shrinked" ){
                LJ.map.activateBrowserState( "expanded" );
            } else {
                LJ.map.activateBrowserState( "shrinked" );
            }

        },
        activateBrowserState: function( state ){

            if( state == "expanded" ){
                LJ.map.expandBrowser();
                LJ.map.browser_uistate = "expanded";
            }

            if( state == "shrinked" ){
                LJ.map.shrinkBrowser();
                LJ.map.browser_uistate = "shrinked";
            }

        },
        renderMapZoom: function(){

            return LJ.ui.render([

                '<div class="map__icon map-zoom">',
                    '<div class="map-zoom__in x--round-icon js-map-zoom-in">',
                        '<i class="icon icon-plus"></i>',
                    '</div>',
                    '<div class="map-zoom__splitter"></div>',
                    '<div class="map-zoom__out x--round-icon js-map-zoom-out">',
                        '<i class="icon icon-line"></i>',
                    '</div>',
                '</div>'


            ].join(''));

        },
        setMapZoom: function(){

            $('.app-section.x--map').append( LJ.map.renderMapZoom() );

        },
        zoomIn: function(){

            LJ.meemap.setZoom( LJ.meemap.getZoom() + 1 );

        },
        zoomOut: function(){

            LJ.meemap.setZoom( LJ.meemap.getZoom() - 1 );

        },
        refreshMap: function(){
        	return google.maps.event.trigger( LJ.meemap, 'resize' );

        },
        deactivateDate: function(){

            var $date_activated = $('.be-dates__date.x--active');

            if( $date_activated.length == 0 ){
                return LJ.log('Already deactivated');
            }

            var m = moment( $date_activated.attr('data-day') , 'DD/MM' );
            LJ.map.activateDate( m );

        },  
        activateDate: function( m ){

            var $date_activated   = $('.be-dates__date.x--active');
            var $date_to_activate = $('.be-dates__date[data-day="'+ m.format('DD/MM') +'"]');

             if( $date_to_activate.length != 1 ){
                return LJ.wlog('Unable to find the date : ' + m.format('DD/MM') );
            }

            if( $date_activated.is( $date_to_activate ) ){

                 $date_activated
                    .removeClass('x--active')
                    .find('.be-dates__bar')
                    .velocity('bounceOut', { duration: 450, display: 'none' });

            } else {

                $date_activated
                    .removeClass('x--active')
                    .find('.be-dates__bar')
                    .velocity('bounceOut', { duration: 450, display: 'none' });

                $date_to_activate
                    .addClass('x--active')
                    .find('.be-dates__bar')
                    .velocity('bounceInQuick', { duration: 450, display: 'block' });

            }

            LJ.map.updateMarkers__byDate();

        },
        findLocationWithLatLng: function( latlng ){
            return LJ.promise(function( resolve, reject ){

                if( !latlng ){
                    return LJ.wlog('Cant find address without latlng');
                }

                LJ.meegeo.geocode({ location: latlng }, function( res, status ){

                    if( status === google.maps.GeocoderStatus.OK && res[0] ){
                        resolve( res[0] );
                    } else {
                        reject( status );
                    }
                });

            });


        },
        findAddressWithLatLng: function( latlng ){
            return LJ.map.findLocationWithLatLng( latlng )

                    .then(function( location ){
                        return location.formatted_address;
                    });

        },
        findLatLngWithAddress: function( address ){
        	return LJ.promise(function( resolve, reject ){

	        	if( !address ){
	        		return LJ.wlog('Cant find LatLng without adress');
	        	}

	        	LJ.meegeo.geocode({ address: address }, function( res, status ){

	        		if( status === google.maps.GeocoderStatus.OK && res[0] ){
	        			resolve( res[0].geometry.location );
	        		} else {
	        			reject( status );
	        		}
	        	});

        	});
        	
        },
        findLatLngWithPlaceId: function( place_id ){
        	return LJ.promise(function( resolve, reject ){

	        	if( !place_id ){
	        		return LJ.wlog('Cant find LatLng without place_id');
	        	}

	        	LJ.meegeo.geocode({ placeId: place_id }, function( res, status ){

	        		if( status === google.maps.GeocoderStatus.OK && res[0] ){
	        			resolve( res[0].geometry.location );
	        		} else {
	        			reject( status );
	        		}
	        	});

        	});
        	
        },
        toggleMapBrowser: function(){

        	var $mb = $('.map-browse');

        	if( $mb.hasClass('x--active') ){

        		$mb.removeClass('x--active');
        		$mb.velocity('shradeOut', { duration: 200, display: 'none' });

        	} else {

        		$mb.addClass('x--active');
        		$mb.velocity('shradeIn', { duration: 200, display: 'flex' });

        	}
        },
        centerMapAtUserLocation: function( pan ){

        	var place_id = LJ.user.location.place_id;
        	return LJ.map.findLatLngWithPlaceId( place_id )
        			.then(function( latlng ){
        				pan ? LJ.meemap.panTo( latlng ) : LJ.meemap.setCenter( latlng );
        			});

        },
        distanceBetweenTwoLatLng: function( latlng1, latlng2 ){

            var a = new google.maps.LatLng( latlng1 );
            var b = new google.maps.LatLng( latlng2 );

            return google.maps.geometry.spherical.computeDistanceBetween( a, b );

        },
        shiftLatLng: function( latlng ){

            var a   = new google.maps.LatLng( latlng );
            var rdm =  google.maps.geometry.spherical.computeOffset( a, LJ.randomInt( 100, 200 ), LJ.randomInt(0, 180) );

            return {
                lng: rdm.lng(),
                lat: rdm.lat()
            };

        },
        findClosestMarkers: function( latlng, distance ){

            var markers = [];
            LJ.map.markers.forEach(function( mrk ){

                if( LJ.map.distanceBetweenTwoLatLng( latlng, mrk.latlng ) < distance ){
                    markers.push( mrk );
                }

            });

            return markers; 

        },
        offsetLatLng: function( latlng ){

            var offsetted = false;
            LJ.map.markers.forEach(function( mrk ){

                if( LJ.map.distanceBetweenTwoLatLng( latlng, mrk.latlng ) < 100 && !offsetted){

                    LJ.wlog('Markers are too close, shifting latlng');
                    offsetted = true;
                    latlng = LJ.map.shiftLatLng( latlng );

                }
                
            });

            return latlng;

        },
        offsetLatLngRecursive: function( latlng, i ){

            // Display the marker in a more intelligent way, to put it randomy close to where its supposed to be
            // But also taking into account where other markers are places :) 

        },
        validateMarkerOptions: function( opts ){

        	var ok = true;

        	if( !opts.url ){
        		ok = false;
        		LJ.wlog('Cannot add marker without url: %s', opts.url );
        	}
        	if( !opts.latlng ){
        		ok = false;
        		LJ.wlog('Cannot add marker without latlng: %s', opts.latlng );
        	}
        	if( !opts.marker_id ){
        		ok = false;
        		LJ.wlog('Cannot add marker without marke_id: %s', opts.marker_id );
        	}
        	if( !opts.type ){
        		ok = false;
        		LJ.wlog('Cannot add marker without type: %s', opts.tpye );
        	}
        	
        	return ok

        },
        markerAlreadyExists: function( marker_id ){

            return _.find( LJ.map.markers, function( mrk ){
                return mrk && ( mrk.marker_id == marker_id );
            });
            
        },
        makeIcon: function( url ){

            var scaledSize;
            var base_width  = 34;
            var base_height = 41;
            var base_width_active  = 50;
            var base_height_active = 60;

            if( !/lg/i.test( url ) ){
                scaledSize = new google.maps.Size( base_width, base_height );
            } else {
                scaledSize = new google.maps.Size( base_width_active, base_height_active );
            }

            return {
                url        : url,
                scaledSize : scaledSize
            };

        },
        addMarker: function( opts ){

        	if( !LJ.map.validateMarkerOptions( opts ) ) return;

            if( LJ.map.markerAlreadyExists( opts.marker_id ) ){
                return LJ.wlog('A marker with id : ' + opts.marker_id + ' is already set on the map');
            }

            var latlng = LJ.map.offsetLatLng( opts.latlng );
            var icon   = LJ.map.makeIcon( opts.url );

        	var marker = new google.maps.Marker({
                map        : LJ.meemap,
                position   : latlng,
                icon       : icon
            });

            var data = opts.data || null;

        	// Store the reference for further usage
        	LJ.map.markers.push({
        		marker_id : opts.marker_id,
        		marker 	  : marker,
        		data      : data,
                type      : opts.type,
                latlng    : latlng
        	});

        	// Attach listenres if there are any
        	if( Array.isArray( opts.listeners )){
                opts.listeners.forEach(function( listener ){
                    marker.addListener( listener.event_type, function(){
                    	listener.callback( marker, data );
                    });
                });

            }

        },
        getBeforeMarkerUrlByType: function( type, active ){

            var px     = LJ.pictures.getDevicePixelRatio() + 'x';
            var suffix = active ? '_active' : '';

            if( type == 'drink' ){
                url = LJ.map.markers_url[ 'drink' + suffix ];
            }

            if( type == 'drinknew' ){
               url = LJ.map.markers_url['drinknew'];
            }

            if( type == 'hosting' ){
                url = LJ.map.markers_url[ 'star' + suffix ];
            }

            if( type == 'pending' ){
                url = LJ.map.markers_url[ 'pending' + suffix ];
            }

            if( type == 'accepted' ){
                url = LJ.map.markers_url[ 'chat' + suffix ];
            }  

            return url[ px ];


        },  
        getBeforeMarkerUrl: function( before, active ){

            var url  = null;

            var my_before = LJ.before.getMyBeforeById( before._id );

            if( !my_before ){

                // Moment.js expresses the difference between 2 dates in ms
                var diff_in_hour = ( moment() - moment( before.created_at ) )/( 3600 * 1000 );

                if( LJ.map.hasSeenMarker( before._id ) || diff_in_hour > 24 ){
                    url = LJ.map.getBeforeMarkerUrlByType("drink", active );

                } else {
                    url = LJ.map.getBeforeMarkerUrlByType("drinknew", active );

                }

            } else {
                url = LJ.map.getBeforeMarkerUrlByType( my_before.status, active );
            }

            if( !url ){
                return LJ.wlog('Cant render marker, unable to find marker type');

            } else {
                return url;
            }

        },
        // Before must be the whole before object and not an itemized version;
        addBeforeMarker: function( before ){

        	var before_id = before._id;

            var latlng  = {
                lat: before.address.lat,
                lng: before.address.lng
            };

            var url  = LJ.map.getBeforeMarkerUrl( before, false );

            LJ.map.addMarker({
                marker_id : before_id,
                latlng    : latlng,
                url       : url,
                type      : 'before',
                data      : before,
                listeners : [
                    {
                        'event_type': 'click',
                        'callback'  : LJ.map.handleClickOnBeforeMarker
                    }]

            });

        },
        removeBeforeMarker: function( before_id ){

            LJ.map.markers.forEach(function( mrk, i){

                if( mrk.marker_id == before_id ){
                    mrk.marker.setMap( null );
                    delete LJ.map.markers[ i ];
                }

            });

        },
        deactivateMarkers: function(){

            LJ.map.markers.forEach(function( mrk ){

                mrk.status = "inactive";
                mrk.marker.setZIndex( 1 );
 
            });

        },
        activateMarker: function( marker_id ){

            LJ.map.markers.forEach(function( mrk ){

                if( mrk.marker_id == marker_id ){
                    mrk.status = "active";
                    mrk.marker.setZIndex( 10 );

                } else {
                    mrk.status = "inactive";
                    mrk.marker.setZIndex( 1 );
                }

            });

        },  
        refreshMarkers: function(){

            LJ.map.markers.forEach(function( mrk ){

                if( mrk.type == "before" ){

                    LJ.before.getBefore( mrk.marker_id )
                    .then(function( bfr ){

                        var url;

                        if( mrk.status == "active" ){
                            url = LJ.map.getBeforeMarkerUrl( bfr, true );
                        } else {
                            url = LJ.map.getBeforeMarkerUrl( bfr, false );
                        }

                        var icon = LJ.map.makeIcon( url );     
                        mrk.marker.setIcon( icon );                   
                        
                    });

                }

            });

        },
        getActiveMarker: function(){

            return _.find( LJ.map.markers, function( mrk ){
                return mrk.status == "active";
            });

        },
        clearSeenMarkers: function(){

            var seen_markers = LJ.store.get('seen_markers') || [];

            seen_markers.forEach(function( mrk_id, i ){

                var target_mrk = _.find( LJ.map.markers, function( m ){
                    return m.marker_id == mrk_id;
                });

                // Marker was not found : means it wasnt fetched by the map,
                // so remove it (obsolete before etc...)
                if( !target_mrk ){
                    delete seen_markers[ i ];
                }

            });

            LJ.store.set('seen_markers', _.uniq( seen_markers.filter( Boolean ) ));

        },
        seenifyMarker: function( marker_id ){

            var seen_markers = LJ.store.get('seen_markers') || [];

            seen_markers.push( marker_id );
            LJ.store.set( 'seen_markers', _.uniq( seen_markers ) );

        },
        hasSeenMarker: function( marker_id ){

            var seen_markers = LJ.store.get('seen_markers') || [];

            return seen_markers.indexOf( marker_id ) != -1;
            

        },
        getMarker: function( marker_id ){
	
			return _.find( LJ.map.markers, function( mrk ){
				return mrk && mrk.marker_id == marker_id;
			});
        		
        },
        handleClickOnBeforeMarker: function( marker, before ){

            LJ.map.seenifyMarker( before._id );
            var mrk = LJ.map.getMarker( before._id );
            
            if( mrk.marker.getOpacity() != 1 ){

                LJ.map.deactivateDate();
                LJ.before.handleCloseBeforeInview();
                LJ.before.hideBeforeInview();
                LJ.profile_user.hideUserProfile();
                return;
            }

            if( !mrk.status || mrk.status == "inactive" ){

                LJ.before.showBeforeInview( before );
                LJ.map.activateMarker( before._id );

            } else {

                LJ.before.handleCloseBeforeInview();
                LJ.before.hideBeforeInview();
                LJ.profile_user.hideUserProfile();

            }

            LJ.map.refreshMarkers();

        },
        renderCreateBefore: function(){

            return LJ.ui.render([
                '<div class="map__icon x--round-icon x--create-before js-create-before">',
                    '<i class="icon icon-create-before"></i>',
                '</div>'
                ].join(''));

        },
        renderExpandBrowser: function(){

            return LJ.ui.render([
                '<div class="map__icon x--round-icon x--filter-dates js-expand-browser">',
                    '<i class="icon icon-filters"></i>',
                '</div>'
                ].join(''));

        },
        renderChangeLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--change-location js-map-change-location">',
        			'<i class="icon icon-search-zoom"></i>',
        		'</div>'
        		].join(''));

        },
        renderGeoLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--geoloc js-map-geoloc">',
        			'<i class="icon icon-geoloc"></i>',
        		'</div>'
        		].join(''));
        },
        renderPinLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--location js-map-location">',
        			'<i class="icon icon-location"></i>',
        		'</div>'
        		].join(''));
        },
        renderMapOverlay: function(){

        	return LJ.ui.render([
        		'<div class="map__overlay"></div>'
        		].join(''));

        },
        renderMapBrowser: function(){

        	return LJ.ui.render([
        		'<div class="map-browse">',
        			'<input id="map-browser-input"/>',
        		'</div>'
        		].join(''));

        },
        updateMarkers__byDate: function(){

            var active_day;
            var $active_day = $('.be-dates__date.x--active');

            if( $active_day.length == 1 ){
                active_day = moment( $active_day.attr('data-day'), 'DD/MM' ).dayOfYear();
                
            } else {
                active_day = null;
            }


            LJ.map.markers.forEach(function( mrk ){

                if( mrk.type == "before" && active_day ){

                    if( mrk.data && mrk.data.begins_at && moment( mrk.data.begins_at ).dayOfYear() == active_day ){
                        mrk.marker.setOpacity( 1 );
                    } else {
                        mrk.marker.setOpacity( 0.2 );
                    }

                } else {
                    mrk.marker.setOpacity( 1 );
                }

            });
        }


	});		

	
	testClearAllMarkers = function(){
		if( LJ.map.marker_test ){

			LJ.map.marker_test.forEach(function(mrk){
				mrk.marker.setMap(null);
			});
		}			
	};	



