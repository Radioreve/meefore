
	window.LJ.map = _.merge( window.LJ.map || {}, {		

        markers: [],

       	// Called as soon as the script finished loading everything
		init: function(){

			LJ.map.setupMap();
            LJ.map.initPlacesServices();
			LJ.map.setMapStyle('creamy');
			LJ.map.setMapIcons();
			LJ.map.setMapOverlay();
			LJ.map.setMapBrowser();
			LJ.map.handleDomEvents();
            LJ.map.setMapListeners();

			return;
			
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
			LJ.wlog('Map has been successfully loaded');

		},
        setUserLocationLatLng: function(){

            var place_id = LJ.user.location.place_id;
            return LJ.map.findLatLngWithPlaceId( place_id )
                    .then(function( latlng ){
                        LJ.user.location.lat =  latlng.lat();
                        LJ.user.location.lng = latlng.lng();
                        return;
                    });

        },
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.map__icon.--geoloc', LJ.map.centerMapAtUserLocation );
			LJ.ui.$body.on('click', '.map__icon.--change-location', LJ.map.toggleMapBrowser );

		},
		setupMap: function(){

			LJ.log('Setting up google map...');

            var latlng = {
                lat: LJ.user.location.lat,
                lng: LJ.user.location.lng
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

			LJ.meemap	   = new google.maps.Map( $wrap, options );
			

            setTimeout(function(){
                LJ.map.refreshMap();
            }, 1000 );

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

        	$('.js-map-wrap')
        		.append( LJ.map.renderChangeLocation() )
        		.append( LJ.map.renderGeoLocation() )
                .append( LJ.map.renderCreateBefore() )
        		.append( LJ.map.renderPinLocation() );


        },
        setMapOverlay: function(){

        	$('.js-map-wrap')
        		.append( LJ.map.renderMapOverlay() );

        },
        setMapBrowser: function(){

        	$('.js-map-wrap')
        		.append( LJ.map.renderMapBrowser() );

        	LJ.seek.activatePlacesInMap();
        	LJ.seek.map_browser_places.addListener('place_changed', function( place ){

        		var place  = LJ.seek.map_browser_places.getPlace();
        		var latlng = place.geometry.location;

        		LJ.meemap.setCenter( latlng );

        	});

        },
        setMapListeners: function(){

            LJ.meemap.addListener('dragstart', function(){
                LJ.before.preRefreshBrowserLocation();
            });

            LJ.meemap.addListener('dragend', function(){
                LJ.before.refreshBrowserLocation();
            });

            LJ.meemap.addListener('click', function(e){
                
            });
            
            LJ.meemap.addListener('center_changed', function(){
                
            });

        },
        refreshMap: function(){
        	return google.maps.event.trigger( LJ.meemap, 'resize' );
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
        getDevicePixelRatio: function(){

            if( window.devicePixelRatio ){
                return window.devicePixelRatio;
            } else {
                return 1;
            }

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
        	if( $mb.hasClass('--active') ){
        		$mb.removeClass('--active');
        		$mb.velocity('shradeOut', { duration: 200, display: 'none' });
        	} else {
        		$mb.addClass('--active');
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
            var rdm =  google.maps.geometry.spherical.computeOffset( a, LJ.randomInt(25,50), LJ.randomInt(0, 180) );

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
        addMarker: function( opts ){

        	if( !LJ.map.validateMarkerOptions( opts ) ) return;        	

            var latlng = LJ.map.offsetLatLng( opts.latlng );

            var icon   = {
                url        : opts.url,
                scaledSize : new google.maps.Size( 28, 28 )
            };

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
        addBeforeMarker: function( evt ){

        	var event_id = evt._id;

            var latlng  = {
                lat: evt.address.lat,
                lng: evt.address.lng
            };

            LJ.map.addMarker({
                marker_id : event_id,
                latlng    : latlng,
                url       : LJ.map.markers_url.base.open,
                type      : 'before',
                data      : evt,
                listeners : [
                    {
                        'event_type': 'click',
                        'callback'  : LJ.map.handleClickOnEventMarker
                    }]

            });

        },
        handleClickOnEventMarker: function( marker, data ){

            LJ.log('Marker is : ' + marker );
            LJ.log('Data associated is : ' + data );

        },
        renderCreateBefore: function(){

            return LJ.ui.render([
                '<div class="map__icon --round-icon --create-before js-create-before">',
                    '<i class="icon icon-plus"></i>',
                '</div>'
                ].join(''));

        },
        renderChangeLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon --round-icon --change-location js-map-change-location">',
        			'<i class="icon icon-search-planet"></i>',
        		'</div>'
        		].join(''));

        },
        renderGeoLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon --round-icon --geoloc js-map-geoloc">',
        			'<i class="icon icon-geoloc"></i>',
        		'</div>'
        		].join(''));
        },
        renderPinLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon --round-icon --location js-map-location">',
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

            var active_day = moment( $('.be-dates__date.--active').attr('data-day'), 'DD/MM' ).dayOfYear();
            LJ.map.markers.forEach(function( mrk ){
                if( mrk.type == "before" ){
                    if( mrk.data && mrk.data.begins_at ){
                        if( moment( mrk.data.begins_at ).dayOfYear() == active_day ){
                            mrk.marker.setOpacity(1);
                        } else {
                            mrk.marker.setOpacity(0.15);
                        }
                    }
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



