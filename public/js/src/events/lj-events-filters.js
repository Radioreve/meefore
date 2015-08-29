
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsFilters: function(){

			  LJ.$body.on('click', '.event-filter', function(){

                var $self = $(this);

                if( $self.hasClass('selected') )
                    return $self.removeClass('selected');

                $('.event-filter').removeClass('selected');
                $self.addClass('selected');

            });

			
		}

	});