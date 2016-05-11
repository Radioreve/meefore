
	window.LJ.map = _.merge( window.LJ.map || {}, {		

        markers: [],

       	// Called as soon as the script finished loading everything
		init: function(){

			LJ.map.setupMap();
            LJ.map.initPlacesServices();

			LJ.map.handleDomEvents();
            LJ.map.handleMapEvents();
			LJ.map.initPlacesServices()

            LJ.before.displayBeforeMarkers( LJ.before.fetched_befores )
            
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
			LJ.ilog('Map has been successfully loaded');

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.map__icon.--geoloc', LJ.map.centerMapAtUserLocation );
			LJ.ui.$body.on('click', '.map__icon.--change-location', LJ.map.toggleMapBrowser );

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
			
            LJ.map.setMapStyle('creamy');
            LJ.map.setMapIcons();
            LJ.map.setMapOverlay();
            LJ.map.setMapBrowser();

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

        	$('.app-section.--map')
        		.append( LJ.map.renderChangeLocation() )
        		.append( LJ.map.renderGeoLocation() )
                .append( LJ.map.renderCreateBefore() )
        		.append( LJ.map.renderPinLocation() );


        },
        setMapOverlay: function(){

        	$('.app-section.--map')
        		.append( LJ.map.renderMapOverlay() );

        },
        setMapBrowser: function(){

        	$('.app-section.--map')
        		.append( LJ.map.renderMapBrowser() );

            return LJ.seek.activatePlacesInMap()
                    .then(function(){

                    	LJ.seek.map_browser_places.addListener('place_changed', function( place ){

                    		var place  = LJ.seek.map_browser_places.getPlace();
                    		var latlng = place.geometry.location;

                    		LJ.meemap.setCenter( latlng );

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
        markerAlreadyExists: function( marker_id ){

            return _.find( LJ.map.markers, function( mrk ){
                return mrk && (mrk.marker_id == marker_id );
            });
            
        },
        makeIcon: function( url ){
            return {
                url        : url,
                scaledSize : new google.maps.Size( 28, 28 )
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
        getBeforeMarkerUrlByType: function( type ){

            var px  = LJ.map.getDevicePixelRatio() + 'x';

            if( type == 'drink' ){
                url = LJ.map.markers_url['drink'];
            }

            if( type == 'drinknew' ){
                url = LJ.map.markers_url['drinknew'];
            }

            if( type == 'hosting' ){
                url = LJ.map.markers_url['star'];
            }

            if( type == 'pending' ){
                url = LJ.map.markers_url['pending'];
            }

            if( type == 'accepted' ){
                url = LJ.map.markers_url['chat'];
            }

            return url[ px ];


        },  
        getBeforeMarkerUrl: function( before ){

            var url  = null;

            var my_before = _.find( LJ.user.befores, function( bfr ){
                return bfr.before_id == before._id;
            });

            if( !my_before ){
                // Moment.js expresses the difference between 2 dates in ms
                var diff_in_hour = (moment() - moment( before.created_at ))/(3600*1000);
                if( diff_in_hour > 24 ){
                    url = LJ.map.getBeforeMarkerUrlByType("drink");

                } else {
                    url = LJ.map.getBeforeMarkerUrlByType("drinknew");

                }

            } else {
                url = LJ.map.getBeforeMarkerUrlByType( my_before.status );
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

           var url = LJ.map.getBeforeMarkerUrl( before );

            LJ.map.addMarker({
                marker_id : before_id,
                latlng    : latlng,
                url       : url,
                type      : 'before',
                data      : before,
                listeners : [
                    {
                        'event_type': 'click',
                        'callback'  : LJ.map.handleClickOnEventMarker
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
        handleClickOnEventMarker: function( marker, before ){

            LJ.log(marker);

            LJ.before.showBeforeInview( before );


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



