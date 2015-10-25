
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

			LJ.event_markers.forEach(function( marker ){
				if( date_to_display.indexOf( moment( marker.data.begins_at ).dayOfYear() ) == -1 && !override ){
					marker.marker.setOpacity(0.1);
				} else {
					marker.marker.setOpacity(1);
				}
			});

			LJ.party_markers.forEach(function( marker ){
				if( date_to_display.indexOf( moment( marker.data.begins_at ).dayOfYear() ) == -1 && !override ){
					marker.marker.setOpacity(0.1);
				} else {
					marker.marker.setOpacity(1);
				}
			});

		}

	});