	
	// Google map must be loaded before using any method
	// The init wrapper is necessary because of the async loading of the google map
	var MarkerFactory = (function(){

		return {

			init: function( base_opts ){

				base_opts = base_opts || {};

				if( !base_opts.map ){
					throw "Cannot initiate the marker factory without a map to use as a default map"
				}

				function CustomMarker( opts ){
					
					this.map       = opts.map || base_opts.map;
					this.latlng    = opts.latlng;
					this.html      = opts.html || base_opts.html;
					this.marker_id = opts.marker_id;
					this.display   = opts.display || base_opts.display || 'block';

					if( !this.map ){
						throw "Cannot create a marker without a map";
					}

					if( !this.latlng ){
						throw "Cannot create a marker without a latlng object";
					}

					if( !this.html ){
						throw "Cannot create a marker without a html string";
					}

					if( !this.marker_id ){
						throw "Cannot create a marker without a marker_id";
					}

					this.setMap( this.map );	

				}

				CustomMarker.prototype = new google.maps.OverlayView();

				CustomMarker.prototype.onAdd = function() {
					
					var self = this;
					var div  = this.div;
					
					if( !div ){
					
						div = this.div = document.createElement('div');
						
						var panes = this.getPanes();
						panes.overlayImage.appendChild( div );

						div.innerHTML      = this.html;
						div.dataset["id"]  = this.marker_id;
						div.className      = "mrk";
						div.style.position = 'absolute';
						div.style.cursor   = 'pointer';
						div.style.display  = this.display;
						
					}

					this.$elem = $( div );
					
				};
			

				CustomMarker.prototype.draw = function(){
						
					var div   = this.div;
					var $div  = $( div ).children();
					var point = this.getProjection().fromLatLngToDivPixel( this.latlng );
					
					if( point ){
						div.style.left = ( point.x - $div.width()/2 ) + 'px';
						div.style.top  = ( point.y - $div.height() )  + 'px';
					}

				};

				CustomMarker.prototype.remove = function() {

					if ( this.div ){
						this.div.parentNode.removeChild( this.div );
						this.div = null;
					}	

				};

				CustomMarker.prototype.getPosition = function() {
					return this.latlng;	
				};

				return {

					create: function( opts ){
						try {
							return new CustomMarker( opts );
						} catch( e ){
							console.warn( e );
						}
					}

				}

			}
		}
	

	})();

