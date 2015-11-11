
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsFilters: function(){

			 LJ.$body.on('click', '.filter-date-item', function(){

                var $self = $(this);
              	$self.toggleClass('active');

              	LJ.fn.applyDateFilter();

            });

			
		},
		applyDateFilter: function(){

			var date_to_display = [];
			var override;

			$('.filter-date-item.active').each(function( i, el ){
				date_to_display.push( moment( $(el).attr('data-dateid'), 'DD/MM/YYYY' ).dayOfYear() );
			});

			if( date_to_display.length == 0 ){
				override = true;
			}

			LJ.event_markers = LJ.event_markers || [];
			LJ.event_markers.forEach(function( marker ){
				if( date_to_display.indexOf( moment( marker.data.begins_at ).dayOfYear() ) == -1 && !override ){
					marker.marker.setMap( null );
				} else {
					if( !marker.marker.getMap() ){
						marker.marker.setMap( LJ.map );
					}
				}
			});

			LJ.party_markers = LJ.party_markers || [];
			LJ.party_markers.forEach(function( marker ){
				if( date_to_display.indexOf( moment( marker.data.begins_at ).dayOfYear() ) == -1 && !override ){
					marker.marker.setMap( null );
				} else {
					if( !marker.marker.getMap() ){
						marker.marker.setMap( LJ.map );
					}
				}	
			});

		}

	});