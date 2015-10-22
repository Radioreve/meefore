
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsFilters: function(){

			 LJ.$body.on('click', '.filter-date-item', function(){

                var $self = $(this);

              	$self.toggleClass('active');

            });


			
		},
		applyDateFilter: function(){

			var date_array = [];
			$('.filter-date-item.active').each(function( i, el ){
				date_array.push( $(el).attr('data-dateid') );
			});

			

		}

	});