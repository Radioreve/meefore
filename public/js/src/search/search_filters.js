	
	window.LJ.search = _.merge( window.LJ.search || {}, {

		$filters_agerange : null,
		filters_agerange  : null,

		initFilters: function(){
			return LJ.promise(function( resolve, reject ){
				LJ.search.initFiltersSlider();
				resolve();
			});

		},
		initFiltersSlider: function(){
			
			LJ.search.$filters_agerange = document.getElementById('search-filters__input');
			
			LJ.search.filters_agerange = noUiSlider.create( LJ.search.$filters_agerange, {
				start: [ LJ.app_settings.app.min_age, LJ.app_settings.app.max_age ], // Handle start position
				step: 1, // Slider moves in increments of '10'
				margin: 3, // Handles must be more than '20' apart
				connect: true, // Display a colored bar between the handles
				//direction: 'rtl', // Put '0' at the bottom of the slider
				orientation: 'horizontal', // Orient the slider vertically
				behaviour: 'tap-drag', // Move handle on tap, bar is draggable
				range: { // Slider can select '0' to '100'
					'min': LJ.app_settings.app.min_age,
					'max': LJ.app_settings.app.max_age
				}
			});

			LJ.search.filters_agerange.on('update', LJ.search.refreshFiltersSliderValues );


		},
		refreshFiltersSliderValues: function( value ){

			$('.search-filters-min-age').html( parseInt(value[0]) );
			$('.search-filters-max-age').html( parseInt(value[1]) );

		}

	});