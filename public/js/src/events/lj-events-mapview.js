	
	window.LJ.param = _.merge( window.LJ.param || {

		mapview_fadein: 350,
		mapview_fadeout: 320

	});

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		testMapview: function(i){

			LJ.fn.addEventMapview( LJ.cache.events[i] );

		},
		testMapviewTemplate_Event: function( i ){

			i = i || 0;
			if( !LJ.cache.events[i] ) return LJ.fn.warn('Cant test template without element', 5);
			LJ.fn.testTemplate('renderEventMapview_User', LJ.cache.events[i], 'mapview-wrap' );

		},
		testMapviewTemplate_Party_Event: function( i ){

			i = i || 0;
			if( !LJ.cache.events[i] ) return LJ.fn.warn('Cant test template without element', 5);
			LJ.fn.testTemplate('renderPartyMapview_Event', LJ.cache.events[i].party, 'mapview-wrap' );

		},
		testMapviewTemplate_Party_Party: function( i ){

			i = i || 0;
			if( !LJ.cache.parties[i] ) return LJ.fn.warn('Cant test template without element', 5);
			LJ.fn.testTemplate('renderPartyMapview_Party', LJ.cache.parties[i], 'mapview-wrap' );

		},
		testMapviewTemplate_Party_Empty: function( i ){

			i = i || 0;
			if( !LJ.cache.events[i] ) return LJ.fn.warn('Cant test template without element', 5);
			LJ.fn.testTemplate('renderPartyMapview_Empty', LJ.cache.events[i].party, 'mapview-wrap' );

		},
		handleDomEvents_Mapviews: function(){

			LJ.$body.click(function(e){

				var $t = $(e.target);

				// Detect a click on the raw map
				if( $t.hasClass('.mapview__close') ){
					LJ.fn.clearMapviews();
				}

			});

		},
		findEventMarker: function( evt ){

			var marker = null;

			LJ.event_markers.forEach(function( mrk ){
				if( mrk.marker_id == evt._id ){
					marker = mrk.marker;
				}
			});
			
			return marker;

		},
		findPartyMarker: function( party ){

			var marker = null;

			LJ.party_markers.forEach(function( mrk ){
				if( mrk.marker_id == party.address.place_id ){
					marker = mrk.marker;
				}
			});
			
			return marker;

		},
		addEventMapview: function( evt ){

			if( !evt )
				return LJ.fn.warn('Cannot add mapview without event, evt: ' + evt , 3 );

			var marker = LJ.fn.findEventMarker( evt );
			if( !marker )
				return LJ.fn.warn('Cannot add mapview without marker, mrk: ' + marker, 3 );


			// Only one active mapview max is allowed in memory.
			// Important to make it 'null' before calling it again
			if( LJ.active_event_mapview ){

				LJ.fn.removeEventMapview();
				LJ.active_event_mapview = null;
				
				return LJ.fn.addEventMapview( evt );

			}

			var renderFn = null;
			var state = LJ.fn.extractEventState( evt );

            if( state == "default" )
                renderFn = LJ.fn.renderEventMapview_User;

            if( state == "pending" )
                renderFn = LJ.fn.renderEventMapview_MemberPending;

            if( state == "accepted" )
                renderFn = LJ.fn.renderEventMapview_MemberAccepted;

            if( state == "host" )
                renderFn = LJ.fn.renderEventMapview_Host;

            // renderFn = LJ.fn.renderEventMapview_User // test

			LJ.active_event_mapview = new LJ.Mapview({
				content: renderFn( evt )
			});


			LJ.active_event_mapview.open( LJ.map, marker );

			LJ.active_event_mapview.container.css({
				'margin-top': '10px'
			}).velocity({
				opacity: [1,0],
				'margin-top': '0px'
			}, {
				delay: 100,
				duration: LJ.param.mapview_fadein
			});


		},
		addPartyMapview: function( party, opts ){


			if( !party )
				return LJ.fn.warn('Cannot add mapview without party: ' + party , 3 );

			var marker = LJ.fn.findPartyMarker( party );
			if( !marker )
				return LJ.fn.warn('Cannot add mapview without marker, mrk: ' + marker, 3 );


			// Only one active mapview max is allowed in memory.
			// Important to make it 'null' before calling it again
			if( LJ.active_party_mapview ){

				LJ.fn.removePartyMapview();
				LJ.active_party_mapview = null;
				
				return LJ.fn.addPartyMapview( party, opts );

			}

			var renderFn = null;
			var state = opts.state || "default";

			if( state == "default" )
				renderFn = LJ.fn.renderPartyMapview_Event;

            if( state == "partner" )
                renderFn = LJ.fn.renderPartyMapview_Party;

            if( state == "empty" )
            	renderFn = LJ.fn.renderPartyMapview_Empty;

			LJ.active_party_mapview = new LJ.Mapview({
				content: renderFn( party )
			});

			LJ.active_party_mapview.open( LJ.map, marker );

			LJ.active_party_mapview.container.css({
				'margin-top': '10px'
			}).velocity({
				opacity: [1,0],
				'margin-top': '0px'
			}, {
				delay: 100,
				duration: LJ.param.mapview_fadein
			});


		},
		addPartyMapview_Empty: function( party ){

			LJ.fn.addPartyMapview( party, {
				state: "empty"
			});

		},
		addPartyMapview_Party: function( party ){

			LJ.fn.addPartyMapview( party, {
				state: "party"
			});

		},
		removeEventMapview: function(){

			if( !LJ.active_event_mapview )
				return LJ.fn.warn('Cannot fade mapview without active_event_mapview: ' + LJ.active_event_mapview, 3 );

			var elem = LJ.active_event_mapview;

			var current_opacity = elem.container.css('opacity');

			elem.container
				.velocity({
					'opacity': [ 0, current_opacity ],
					'margin-top': '10px'
				}, { 
					duration: LJ.param.mapview_fadeout,
					complete: function(){
						elem.setMap( null );
					}
			});

		},
		removePartyMapview: function(){

			if( !LJ.active_party_mapview )
				return LJ.fn.warn('Cannot fade mapview without active_event_mapview: ' + LJ.active_party_mapview, 3 );

			var elem = LJ.active_party_mapview;

			var current_opacity = elem.container.css('opacity');

			elem.container
				.velocity({
					'opacity': [ 0, current_opacity ],
					'margin-top': '-7px'
				}, { 
					duration: 220,
					complete: function(){
						elem.setMap( null );
					}
			});

		},
		clearMapviews: function(){

				LJ.fn.clearAllActiveMarkers();
				LJ.fn.clearAllActivePaths();
				LJ.fn.clearAllHalfActivePaths();
				LJ.fn.removeEventMapview();
				LJ.fn.removePartyMapview();

		},
		initMapview: function(){

			LJ.Mapview = GenCustomWindow();

			/**
			 * Create a custom overlay for our window marker display, extending google.maps.OverlayView.
			 * This is somewhat complicated by needing to async load the google.maps api first - thus, we
			 * wrap CustomWindow into a closure, and when instantiating CustomWindow, we first execute the closure
			 * (to create our CustomWindow function, now properly extending the newly loaded google.maps.OverlayView),
			 * and then instantiate said function.
			 * @type {Function}
			 */
			 function GenCustomWindow(){
			    var CustomWindow = function( opts ){

			        this.container = $('<div class="mapview-wrap"></div>');
			        this.layer = null;
			        this.marker = null;
			        this.position = null;

			        if( opts.content ){
			       		this.container.html( opts.content );
			        }

			        if( opts.custom_position ){
			        	this.custom_position = opts.custom_position;
			        } else {
			        	this.custom_position = 'top';
			        }
			    };
			    /**
			     * Inherit from OverlayView
			     * @type {google.maps.OverlayView}
			     */
			    CustomWindow.prototype = new google.maps.OverlayView();
			    /**
			     * Called when this overlay is set to a map via this.setMap. Get the appropriate map pane
			     * to add the window to, append the container, bind to close element.
			     * @see CustomWindow.open
			     */
			    CustomWindow.prototype.onAdd = function(){
			        this.layer = $(this.getPanes().floatPane);
			        this.layer.append(this.container);
			        this.container.find('.mapview__close').on('click', _.bind(function(){
			            // Close info window on click
			            LJ.fn.clearMapviews();
			        }, this));
			    };
			    /**
			     * Called after onAdd, and every time the map is moved, zoomed, or anything else that
			     * would effect positions, to redraw this overlay.
			     */
			    CustomWindow.prototype.draw = function(){
			        
			        if( this.custom_position == "top" ){
			        	this.drawAbove();
			        }

			        if( this.custom_position == "bottom" ){
			        	this.drawBelow();
			        }

			    };

			    CustomWindow.prototype.drawAbove = function(){

		    		var markerIcon = this.marker.getIcon(),
			            cHeight = this.container.outerHeight() + this.marker.scaledSize.height + 10,
			            cWidth = this.container.width() / 2 + this.marker.scaledSize.width / 2;
			        this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
			        this.container.css({
			            'top':this.position.y - cHeight,
			            'left':this.position.x - cWidth
			        });

			    }

			    CustomWindow.prototype.drawBelow = function(){

			    	var markerIcon = this.marker.getIcon(),
			            cHeight = - (this.container.outerHeight() + this.marker.scaledSize.height + 10 ),
			            cWidth = this.container.width() / 2 + this.marker.scaledSize.width / 2;
			        this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
			        this.container.css({
			            'top':this.position.y - cHeight,
			            'left':this.position.x - cWidth
			        });

			    }
			    /**
			     * Called when this overlay has its map set to null.
			     * @see CustomWindow.close
			     */
			    CustomWindow.prototype.onRemove = function(){
			        this.container.remove();
			    };
			    /**
			     * Sets the contents of this overlay.
			     * @param {string} html
			     */
			    CustomWindow.prototype.setContent = function(html){
			        this.container.html(html);
			    };
			    /**
			     * Sets the map and relevant marker for this overlay.
			     * @param {google.maps.Map} map
			     * @param {google.maps.Marker} marker
			     */
			    CustomWindow.prototype.open = function(map, marker){
			        this.marker = marker;
			        this.setMap(map);
			    };
			    /**
			     * Close this overlay by setting its map to null.
			     */
			    CustomWindow.prototype.close = function(){
			        this.setMap(null);
			    };
			    return CustomWindow;
			}
		}

	});