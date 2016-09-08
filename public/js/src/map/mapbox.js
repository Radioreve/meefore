
	window.LJ.map = _.merge( window.LJ.map || {}, {		

        markers: [],
        fetched_profiles: [],

       	// Called as soon as the script finished loading everything
		init: function(){

            try {
                LJ.map.setupMap();
                LJ.map.handleDomEvents();
                LJ.map.handleMapEvents();
                LJ.map.handleAppEvents();
                LJ.map.refreshMapMode();

            } catch( e ){
                LJ.wlog("Something went wrong initializing the map");
                LJ.wlog( e );
            }

            return;
			
		},
		handleDomEvents: function(){
            
            LJ.ui.$body.on('click', '.js-map-facebook', LJ.facebook.showModalSendMessageToFriends );
			LJ.ui.$body.on('click', '.js-map-change-location', LJ.map.toggleMapBrowser );
            LJ.ui.$body.on('mousedown', '.js-before-marker', LJ.map.handleClickOnBeforeMarker );
            LJ.ui.$body.on('click', '.js-show-own-before', LJ.map.handleClickOnShowOwnBefore );
            LJ.ui.$body.on('click', '.js-map-zoom-in', LJ.map.zoomIn );
            LJ.ui.$body.on('click', '.js-map-zoom-out', LJ.map.zoomOut );

		},
		setupMap: function(){

			LJ.log('Setting up the map...');
			
            mapboxgl.accessToken = 'pk.eyJ1IjoibWVlZm9yZSIsImEiOiJjaXNieWhwNjMwMDE0MnRxZmhvY2twMGN5In0.k-iXWp3tVDVyNK9xYesmjA';

            LJ.meemap = new mapboxgl.Map({
                container       : document.getElementsByClassName('js-map-wrap')[ 0 ], 
                style           : 'mapbox://styles/meefore/cisc01qir001s2ymxsolaa1uz', 
                center          : [ parseFloat( LJ.user.location.lng ), parseFloat( LJ.user.location.lat ) ], 
                zoom            : 11.5,
                doubleClickZoom : false
            });

            LJ.map.setMapIcons();
            LJ.map.setMapBrowser();
            LJ.map.setMapZoom();

            LJ.meemap.on("load", function(){
                LJ.emit("map:ready");
            });


        },
        setMapIcons: function(){

        	$('.app-section.x--map')
        		.append( LJ.map.renderChangeLocation() )
                .append( LJ.map.renderInviteFacebookFriends )
        		// .append( LJ.map.renderGeoLocation() )
                .append( LJ.map.renderCreateBefore() )
        		.append( LJ.map.renderPinLocation() );


        },
        setMapBrowser: function(){

        	$('.app-section.x--map')
        		.append( LJ.map.renderMapBrowser() );

            return LJ.seek.activatePlacesInMap()
                    .then(function(){

                    	LJ.seek.map_browser_places.addListener('place_changed', function( place ){

                    		var place  = LJ.seek.map_browser_places.getPlace();
                    		var latlng = place.geometry.location;

                    		LJ.meemap.flyTo({
                                center : [ latlng.lng(), latlng.lat() ],
                                zoom   : 11
                            });

                            $('#map-browser-input').val('');

                    	});
                        
                    });

        },
        handleAppEvents: function(){

            // LJ.on("login:complete", LJ.map.handleLoginComplete );
            LJ.on("clock", LJ.map.handleClock );
            LJ.on("map:ready", LJ.map.handleMapReady );

        },  
        handleClock: function( data ){

            // Check if the countdown needs to be started or cleared
            if( LJ.app_mode == "prod" && data.hours > 6 && data.hours < 14 ){

                LJ.map.startCountDown();
                LJ.map.setMapMode("closed");

            } else {

                window.clearTimeout( LJ.map.countdown );
                LJ.map.setMapMode("open");

            }

        },
        handleMapEvents: function(){

            LJ.meemap.on('dragstart', function(){
                
            });

            LJ.meemap.on('click', function(e){
                
            });
            
        },
        handleClickOnShowOwnBefore: function(){

            LJ.before.showMyBefore();

        },
        handleMapReady: function(){

            LJ.ilog("Map is fully ready");
            LJ.delay( 50 ).then(function(){

                LJ.map.addBeforeMarkers( LJ.before.fetched_befores );
                LJ.map.clearSeenMarkers();
                LJ.map.refreshMarkers();
                LJ.map.showBeforeMarkers();

            });

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

            LJ.meemap.zoomIn();

        },
        zoomOut: function(){

            LJ.meemap.zoomOut();

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
        distanceBetweenTwoLngLat: function( lnglat1, lnglat2 ){

            var a = new google.maps.LatLng({ lng: lnglat1[ 0 ], lat: lnglat1[ 1 ] });
            var b = new google.maps.LatLng({ lng: lnglat2[ 0 ], lat: lnglat2[ 1 ] });

            return google.maps.geometry.spherical.computeDistanceBetween( a, b );

        },
        shiftLngLat: function( lnglat ){

            var a   = new google.maps.LatLng({ lng: lnglat[ 0 ], lat: lnglat[ 1 ] });
            var rdm = google.maps.geometry.spherical.computeOffset( a, LJ.randomInt( 100, 200 ), LJ.randomInt( 0, 180 ) );

            return [ rdm.lng(), rdm.lat() ];

        },
        findClosestMarkers: function( lnglat, distance ){

            var markers = [];
            LJ.map.markers.forEach(function( mrk ){

                if( LJ.map.distanceBetweenTwoLngLat( lnglat, mrk.lnglat ) < distance ){
                    markers.push( mrk );
                }

            });

            return markers; 

        },
        offsetLngLat: function( lnglat ){

            var offsetted = false;

            LJ.map.markers.forEach(function( mrk ){

                if( LJ.map.distanceBetweenTwoLngLat( lnglat, mrk.lnglat ) < 100 && !offsetted ){

                    LJ.log('Markers are too close, shifting lnglat');
                    offsetted = true;
                    lnglat = LJ.map.shiftLngLat( lnglat );

                }
                
            });

            return lnglat

        },
        offsetLngLatRecursive: function( latlng, i ){

            // Display the marker in a more intelligent way, to put it randomy close to where its supposed to be
            // But also taking into account where other markers are placed :) 

        },
        markerAlreadyExists: function( marker_id ){

            return _.find( LJ.map.markers, function( mrk ){
                return mrk && ( mrk.marker_id == marker_id );
            });
            
        },
        renderMarkerPlaceholder: function( marker_id, type ){

            if( type == "face" ){

                var img_html = LJ.static.renderStaticImage("marker_loader");

                return LJ.ui.render([
                    '<div class="marker x--face js-before-marker" data-marker-id="'+ marker_id +'">',
                        '<div class="mrk__seen"></div>',
                        '<div class="mrk__status"></div>',
                        '<div class="mrk__loader">',
                            img_html,
                        '</div>',
                        '<div class="mrk__img">',
                        '</div>',
                    '</div>'
                ]);

            }

        },
        sayHello: function(){
            LJ.log('Google maps has been successfully loaded');

        },
        addMarker: function( opts ){

            if( LJ.map.markerAlreadyExists( opts.marker_id ) ){
                return LJ.wlog('A marker with id : ' + opts.marker_id + ' is already set on the map');
            }

            var lnglat = LJ.map.offsetLngLat( opts.lnglat );
            var data   = opts.data || null;

            var dom    = $( '<div class="marker-wrapper">' + LJ.map.renderMarkerPlaceholder( opts.marker_id, "face" ) + '</div>' )[ 0 ];
            var marker = new mapboxgl.Marker( dom );
            
            marker.setLngLat( opts.lnglat )
                  .addTo( LJ.meemap );

        	LJ.map.markers.push({
        		marker_id : opts.marker_id,
        		marker 	  : marker,
                type      : opts.type,
                lnglat    : lnglat
        	});


        }, 
        // Before must be the whole before object and not an itemized version
        // in order to access to the address
        addBeforeMarker: function( before ){

            var before_id = before._id;
            var lnglat    = [ before.address.lng, before.address.lat ];

            LJ.map.addMarker({
                marker_id : before_id,
                lnglat    : lnglat,
                type      : 'before',
                data      : before

            });

        },
        addAndShowBeforeMarker: function( before ){

            LJ.map.addBeforeMarker( before );
            LJ.delay( 500 ).then(function(){
                LJ.map.showMarker( before._id );
            });

        },
        removeBeforeMarker: function( before_id ){

            LJ.map.markers.forEach(function( mrk, i){

                if( mrk.marker_id == before_id ){        

                    mrk.marker.remove();
                    delete LJ.map.markers[ i ];
                    LJ.map.markers = LJ.map.markers.filter( Boolean );
                                
                }

            });

        },
        activateMarker: function( marker_id ){

            LJ.map.deactivateMarker();
            LJ.map.getMarkerDom( marker_id )
                .css({ "transform": "scale(1.45)" })
                .parent().css({ "z-index": "10" })
                // .velocity( "grounceIn", {
                //     duration : 600,
                //     display  : 'flex'
                // });

            LJ.map.setActiveMarker( marker_id );

        },
        deactivateMarker: function(){

            var active_marker_id = LJ.map.getActiveMarker();
            var $active_marker   = LJ.map.getMarkerDom( active_marker_id );
            
            if( !active_marker_id ) return;
            
            $active_marker
                .css({ "transform": "none" })
                .parent().css({ "z-index": "1" })

            LJ.map.setActiveMarker( null );

        },
        getMarkerData: function( marker_id, marker_type ){

            if( marker_type == "before" ){
                return LJ.before.getBefore( marker_id );
            }

        },
        refreshMarkers: function(){

            LJ.map.markers.forEach(function( mrk ){

                var marker_id = mrk.marker_id;
                if( mrk.type == "before" ){

                    // Need to access the group status, so whole before is required
                    // before_item is not enough
                    LJ.map.getMarkerData( marker_id, "before" )
                    .then(function( bfr ){
                        LJ.map.refreshBeforeMarker( bfr );
                        
                    });

                }

            });

        },
        refreshBeforeMarker: function( bfr ){   

            var marker_id = bfr._id;
            var n_hosts   = bfr.hosts.length;

            LJ.map.faceifyMarker( marker_id )
                .then(function(){
                    LJ.map.setMarkerPicturesActive( marker_id );
                    LJ.map.numerifyMarker( marker_id, n_hosts );
                    LJ.map.refreshBeforeMarker__Status( marker_id );
                    LJ.map.refreshBeforeMarker__Seen( marker_id );
                    LJ.map.refreshBeforeMarker__Gender( marker_id, bfr.gender );

                });

        },
        refreshBeforeMarker__Seen: function( marker_id ){

            LJ.map.hasSeenMarker( marker_id ) ?
                LJ.map.seenifyMarker( marker_id ) : LJ.map.unseenifyMarker( marker_id );

        },
        getBeforeItem: function( before_id ){

            return _.find( LJ.user.befores, function( bfr ){
                return bfr.before_id == before_id;
            });

        },
        refreshBeforeMarker__Status: function( marker_id ){

            var before = LJ.map.getBeforeItem( marker_id );

            if( !before ){
                return LJ.map.defaultifyMarker( marker_id );
            }

            if( before.status == "hosting" ){

                return LJ.map.hostifyMarker( marker_id );

            } else {

                if( before.status == "pending" ){
                    return LJ.map.pendifyMarker( marker_id );
                }

                if( before.status == "accepted" ){
                    return LJ.map.acceptifyMarker( marker_id );
                }

            }

        },
        refreshBeforeMarker__Gender: function( marker_id, gender ){

            LJ.map.getMarkerDom( marker_id )
                .find('.marker')
                .addClass('x--' + gender);

        },
        addBeforeMarkers: function( befores ){

            befores.forEach(function( before ){
                LJ.map.addBeforeMarker( before );
            });
            
        },
        showBeforeMarkers: function(){

            LJ.map.markers.forEach(function( mrk ){
                LJ.map.showMarker( mrk.marker_id );
            }); 

            LJ.delay( 1000 ).then(function(){

                if( $('.marker').first().css('opacity') == 0 ){
                    LJ.map.showBeforeMarkers();
                }

            });


        },
        getMarkerDom: function( marker_id ){

            return $('.marker[data-marker-id="'+ marker_id +'"]');

        },
        updateMarker: function( marker_id, update ){

            update = update || {};

            var $mrk = LJ.map.getMarkerDom( marker_id );

            if( update.add_class ){
                $mrk.addClass( update.add_class );
            }

            if( update.seen ){
                $mrk.find('.mrk__seen').hide();
            }

            if( update.unseen ){
                $mrk.find('.mrk__seen').show();
            }

            if( update.img_html ){
                $mrk.find('.mrk__img').html( update.img_html );
            }

            if( update.status_html ){
                $mrk.find('.mrk__status').replaceWith( update.status_html );
            }

        },
        showMarker__NoTransition: function( marker_id ){

             LJ.map.getMarkerDom( marker_id ).show();

        },
        hideMarker__NoTransition: function( marker_id ){

             LJ.map.getMarkerDom( marker_id ).hide();

        },
        showMarker: function( marker_id ){

            return LJ.map.showMarker__BounceIn( marker_id );

        },
        showMarker__BounceIn: function( marker_id ){


            LJ.map.getMarkerDom( marker_id )
                .css({ 'display': 'block', 'opacity': '1' })
                .children()
                .velocity('bounceInQuick', {
                    duration : 500,
                    display  : 'block'
                });

        },
        showMarker__BounceOut: function( marker_id ){

            LJ.map.getMarkerDom( marker_id )
                .velocity('bounceOut', {
                    duration: 900
                });

        },
        faceifyMarker: function( marker_id ){

            var mrk = LJ.map.getMarker( marker_id );
            var bfr = null;
            
            return LJ.map.getMarkerData( marker_id, "before" )
                .then(function( before ){
                    bfr = before;
                    return LJ.api.fetchUsers( before.hosts )

                })
                .then(function( res ){

                    var users = _.map( res, 'user' );

                    var imgs = [ '<div class="img-wrap js-filterlay">' ];
                    users.forEach(function( user, i ){

                        if( user.facebook_id != bfr.main_host ) return;

                        var img_html = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, "user-map" );
                        imgs.push( '<div class="img-item">' + img_html + '</div>' );

                    });
                    imgs.push('</div>');

                    return LJ.map.updateMarker( marker_id, {
                        img_html: LJ.ui.render( imgs.join('') )
                    });

                });

        },
        activateMarkerPicturesAutoswap: function(){

            LJ.map.autoswap_pictures = true;
            LJ.map.autoswapMarkerPictures();

        },
        deactivateMarkerPicturesAutoswap: function(){

            LJ.map.autoswap_pictures = false;

        },
        autoswapMarkerPictures: function(){

            if( LJ.map.autoswap_pictures == false ){
                return LJ.log("Autoswaping pictures has been stopped");
            }

            return LJ.delay( 4000 )
            .then(function(){

                var before_markers = _.filter( LJ.map.markers, function( mrk ){
                    return mrk.type == "before" || mrk.type == "test";
                });

                before_markers.forEach(function( mrk ){

                    if( LJ.randomInt( 0, 1 ) == 0 ){
                        LJ.map.swapMarkerPictures( mrk.marker_id );

                    }

                });

            })
            .then(function(){
                return LJ.map.autoswapMarkerPictures();

            })
            .catch(function( e ){
                LJ.wlog( e );
            });

        },
        setMarkerPicturesActive: function( marker_id ){

            var $mrk  = LJ.map.getMarkerDom( marker_id );
            var $imgs = $mrk.find('.img-item');

            var j = LJ.randomInt( 0, $imgs.length - 1 );
            $imgs.each(function( i, img ){

                if( i == j ){
                    $( img ).addClass('js-active').css({ "opacity": "1" });
                } else {
                    $( img ).css({ "opacity": "0" });
                }

            });

        },
        swapMarkerPictures: function( marker_id ){

            var $mrk  = LJ.map.getMarkerDom( marker_id );
            var $imgs = $mrk.find('.img-item');

            if( $imgs.length == 1 ){
                return LJ.log("Unique img element, doing nothing");
            }

            var current_active_idx = parseInt( $mrk.find('.js-active').attr('data-link') );
            var target_active_idx  = _.shuffle( _.difference( _.range( 0, $imgs.length - 1 ), [ current_active_idx ] ) )[ 0 ];

            $mrk.find('.img-item[data-link="'+ current_active_idx +'"]')
                .removeClass('js-active')
                .css({ "opacity": "0" });

            $mrk.find('.img-item[data-link="'+ target_active_idx +'"]')
                .addClass('js-active')
                .css({ "opacity": "1" });


        },
        unseenifyMarker: function( marker_id ){

            LJ.map.updateMarker( marker_id, {
                unseen: true
            });

        },
        seenifyMarker: function( marker_id ){

            LJ.map.updateMarker( marker_id, {
                seen: true
            });

        },
        defaultifyMarker: function( marker_id ){
    
            LJ.map.updateMarker( marker_id, {
                //status_html: '<div class="mrk__status x--default"></div>'
            });

        },
        pendifyMarker: function( marker_id ){

            LJ.map.updateMarker( marker_id, {
                add_class   : 'x--pending',
                status_html: '<div class="mrk__status x--round-icon"><i class="icon icon-pending"></i></div>'
            });

        },
        acceptifyMarker: function( marker_id ){

            LJ.map.updateMarker( marker_id, {
                add_class   : 'x--accepted',
                status_html : '<div class="mrk__status x--round-icon"><i class="icon icon-thunder-right"></i></div>'
            });

        },
        numerifyMarker: function( marker_id, n ){

            LJ.map.updateMarker( marker_id, {
                status_html : '<div class="mrk__status x--'+ n +' x--number x--round-icon"><span>'+ n +'</span></div>'
            })

        },
        hostifyMarker: function( marker_id ){

            LJ.map.updateMarker( marker_id, {
                add_class   : 'x--host',
                status_html : '<div class="mrk__status x--round-icon"><i class="icon icon-star"></i></div>'
            });

        },
        setActiveMarker: function( marker_id ){

            LJ.map.active_marker = marker_id;

        },
        getActiveMarker: function(){

            return LJ.map.active_marker;

        },
        clearSeenMarkers: function(){

            var seen_markers = Array.isArray( LJ.store.get('seen_markers') ) ? LJ.store.get('seen_markers') : [];

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
        setMarkerAsSeen: function( marker_id ){

            var seen_markers = Array.isArray( LJ.store.get('seen_markers') ) ? LJ.store.get('seen_markers') : [];

            seen_markers.push( marker_id );
            LJ.store.set( 'seen_markers', _.uniq( seen_markers ) );

        },
        hasSeenMarker: function( marker_id ){

            var seen_markers = Array.isArray( LJ.store.get('seen_markers') ) ? LJ.store.get('seen_markers') : [];

            return seen_markers.indexOf( marker_id ) != -1;

        },
        getMarker: function( marker_id ){
	
			return _.find( LJ.map.markers, function( mrk ){
				return mrk && mrk.marker_id == marker_id;
			});
        		
        },
        handleClickOnBeforeMarker: function( e ){

            var $self     = $( this );
            var marker_id = $self.attr('data-marker-id');
			var mrk       = LJ.map.getMarker( marker_id );
            var $mrk      = LJ.map.getMarkerDom( marker_id );

            LJ.map.getMarkerData( marker_id, "before" )
            .then(function( before ){

                var before_id = before._id;

                if( LJ.map.getActiveMarker() == before_id ){

                    LJ.map.deactivateMarker( before_id );
                    LJ.before.hideBeforeInview();
                    LJ.profile_user.hideUserProfile();
                    return;

                } else {

                    LJ.map.activateMarker( before_id );
                    LJ.before.showBeforeInview( before );
                    LJ.map.setMarkerAsSeen( before_id );

                }

                LJ.map.refreshMarkers();

            })
            .catch(function( e ){

                LJ.map.handleClickOnBeforeMarkerError( e );

            });

        },
        handleClickOnBeforeMarkerError: function( err ){

            if( err.err_id == "ghost_before"){

                LJ.ui.showSlide({ type: "before" })
                .then(function(){
                    LJ.before.ghostifyBeforeInview();
                });
                
            }

        },
        renderCreateBefore: function(){

            return LJ.ui.render([
                '<div class="map__icon x--meedient x--round-icon x--create-before js-create-before">',
                    '<i class="icon icon-meedrink"></i>',
                    '<i class="icon icon-star"></i>',
                    '<div class="x--plus x--round-icon">',
                        '<i class="icon icon-plus-fat">',
                    '</div>',
                '</div>'
                ]);

        },
        renderChangeLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--change-location js-map-change-location">',
        			'<i class="icon icon-search-zoom"></i>',
        		'</div>'
        		]);

        },
        renderInviteFacebookFriends: function(){

            return LJ.ui.render([
                '<div class="map__icon x--round-icon x--facebook js-map-facebook">',
                    '<i class="icon icon-gift"></i>',
                    '<i class="icon icon-heart x--1"></i>',
                    '<i class="icon icon-heart x--2"></i>',
                    '<i class="icon icon-heart x--3"></i>',
                '</div>'
                ]);

        },
        renderGeoLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--geoloc js-map-geoloc">',
        			'<i class="icon icon-geoloc"></i>',
        		'</div>'
        		]);

        },
        renderPinLocation: function(){

        	return LJ.ui.render([
        		'<div class="map__icon x--round-icon x--location js-map-location">',
        			'<i class="icon icon-location"></i>',
        		'</div>'
        		]);

        },
        renderMapBrowser: function(){

        	return LJ.ui.render([
        		'<div class="map-browse">',
        			'<input data-lid="map_browser_input_placeholder"id="map-browser-input"/>',
        		'</div>'
        		]);

        },
        refreshMapMode: function(){

            var hour = moment().get('hour');

            hour > LJ.app_settings.closed_map_hours[ 0 ] && hour < LJ.app_settings.closed_map_hours[ 1 ] ?
                LJ.map.setMapMode("closed") :
                LJ.map.setMapMode("open");

            
        },
        setMapMode: function( mode ){

            if( LJ.map.active_mode == mode ) return;

            if( mode == "open" ){
                LJ.map.active_mode = "open";
                LJ.map.openMeemap();
                $('.map__icon.x--facebook').removeClass('x--hearted');
            }

            if( mode == "closed" ){
                LJ.map.active_mode = "closed";
                LJ.map.closeMeemap();
                $('.map__icon.x--facebook').addClass('x--hearted');
            }

        },
        getMeemapMode: function(){

            return LJ.map.active_mode;
            
        },
        openMeemap: function(){

            LJ.map.hideOverlay();
            LJ.map.hideMeemapClosed();

        },
        showOverlay: function(){

            $('<div class="map__overlay"></div>')
                .hide()
                .appendTo('.app-section.x--map')
                .velocity('fadeIn', { duration: 500 });

        },
        hideOverlay: function(){

            $('.map__overlay').remove();

        },
        closeMeemap: function(){

            LJ.map.showOverlay();
            LJ.map.showMeemapClosed();

        }, 
        showMeemapClosed: function(){

            $( LJ.map.renderMeemapClosed() )
                .hide()
                .appendTo('.app-section.x--map')
                .show();

        },
        hideMeemapClosed: function(){

            $('.meemap-closed').remove();

        },
        renderMeemapClosed: function(){

            return LJ.ui.render([

                '<div class="meemap-closed">',
                    '<div class="meemap-closed__h1">',
                        '<h1 data-lid="meemap_closed_h1"></h1>',
                    '</div>',
                    '<div class="meemap-closed__h2">',
                        '<h2 data-lid="meemap_closed_h2"></h2>',
                    '</div>',
                    '<div class="meemap-closed__h3">',
                        '<h3 data-lid="meemap_closed_h3"></h3>',
                    '</div>',
                    '<div class="meemap-closed__icon x--round-icon">',
                        '<img src="/img/empty/people.svg">',
                    '</div>',
                    '<div class="meemap-igloo">',
                        '<div class="meemap-countdown">',
                        '</div>',
                    '</div>',
                '</div>'

            ]);
        },
        startCountDown: function(){

            var target_time = new Date( moment().set({
                milliseconds: 0,
                seconds: 0,
                minutes: 0,
                hours: 14
            }).toISOString() );

            LJ.map.countdown = countdown( LJ.map.updateCountdown, target_time );

        },
        updateCountdown: function( data ){

            $('.meemap-countdown').html([

                LJ.paddWithZero( data.hours ),
                LJ.paddWithZero( data.minutes ),
                LJ.paddWithZero( data.seconds )

            ].join(':'));

        },
        refreshCreateBtnState: function(){

            var my_before = _.find( LJ.user.befores, function( bfr ){
                return bfr.status == "hosting";
            });

            my_before ? LJ.map.hostifyCreateBtn() : LJ.map.unhostifyCreateBtn();

        },
        hostifyCreateBtn: function(){

            var $s = $('.map__icon.x--create-before');
            
            $s.removeClass('js-create-before')
                .addClass('js-show-own-before')
                .addClass('x--hosting');

            $s.find('.x--plus').hide();
            $s.find('.icon-meedrink').hide();
            $s.find('.icon-star').show();


        },
        unhostifyCreateBtn: function(){

            var $s = $('.map__icon.x--create-before');
            
            $s.addClass('js-create-before')
                .removeClass('js-show-own-before')
                .removeClass('x--hosting');

            $s.find('.x--plus').css({ 'display': 'flex' });
            $s.find('.icon-meedrink').show();
            $s.find('.icon-star').hide();

        }


	});		


