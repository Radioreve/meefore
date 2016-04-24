	
	window.LJ.search = _.merge( window.LJ.search || {}, {

		$filters_agerange : null,
		filters_agerange  : null,

		filters_duration: 300,

		filter_state: {
			age       : [],
			gender    : [],
			countries : []
		},

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
				step: 1, 					// Slider moves in increments of '10'
				margin: 3, 					// Handles must be more than '20' apart
				connect: true, 				// Display a colored bar between the handles
				orientation: 'horizontal',  // Orient the slider vertically
				behaviour: 'tap-drag',  	// Move handle on tap, bar is draggable
				range: { 					// Slider can select '0' to '100'
					'min': LJ.app_settings.app.min_age,
					'max': LJ.app_settings.app.max_age
				}
			});

			LJ.search.filters_agerange.on('update', LJ.search.refreshFiltersSliderValues );
			LJ.search.filters_agerange.on('end', LJ.search.refetchAndShowMoreUsers );

		},
		resetFiltersState: function(){

			LJ.search.filter_state = {
				age       : [],
				gender    : [],
				countries : []
			};

		},
		setFiltersState: function(){

			LJ.search.resetFiltersState();

			$('.search-filters')
				.find('.toggle.--active')
				.each(function( i, toggle ){

					if( $(toggle).closest('.js-filters-male').length > 0 ){
						LJ.search.filter_state.gender.push('male');
					}

					if( $(toggle).closest('.js-filters-female').length > 0 )
						LJ.search.filter_state.gender.push('female');

					if( $(toggle).closest('.js-filters-country').length > 0 ){
						var cc = $(toggle).closest('[data-country-code]').attr('data-country-code');
						LJ.search.filter_state.countries.push( cc );
					}

				});

			var min = $('.search-filters-min-age').html();
			var max = $('.search-filters-max-age').html();
			LJ.search.filter_state.age[0] = min;
			LJ.search.filter_state.age[1] = max;



		},
		setCountriesInFilters: function(){

			LJ.api.fetchDistinctCountries()
				.then(function( country_codes ){
					return LJ.search.renderFilterCountries( _.shuffle( country_codes ) );
				})
				.then(function( countries_html ){
					return LJ.search.addFilterCountries( countries_html );
				})

		},
		renderFilterCountries: function( country_codes ){

			var html = [];
			country_codes.forEach(function( cc ){
				html.push( LJ.search.renderFilterCountry( cc ) );
			});

			return html.join('');

		},
		renderFilterCountry: function( cc ){

			return LJ.ui.render([
				'<div class="search-filters-countries" data-country-code="'+ cc +'">',
					'<div class="search-filters-row js-filters-country">',
	            		'<div class="search-filters-country__flag --round-icon">',
	            			'<i class="flag-icon flag-icon-'+ cc +'"></i>',
	              		'</div>',
		            	'<div class="search-filters-country__label">',
		            		'<label data-lid="country_'+ cc +'"></label>',
		            	'</div>',
		            	'<div class="toggle">',
		                	'<div class="toggle__background"></div>',
		                	'<div class="toggle__button"></div>',
		              	'</div>',
	            	'</div>',
	            '</div>'
				].join(''));
		},
		addFilterCountries: function( countries_html ){

			$('.js-filters-countries').replaceWith( countries_html );

		},
		showFilters: function(){
			
			var $fi    = $('.search-filters__icon');
			var $f     = $('.search-filters');
			var d      = LJ.search.filters_duration;

			$fi.velocity('shradeOut', {
				duration : d,
				display  : 'none'
			});

			LJ.delay( d )
				.then(function(){
					LJ.ui.shradeAndStagger( $f, {
						duration: d
					});
				})

			

		},
		hideFilters: function(){

			var $fi = $('.search-filters__icon');
			var $f  = $('.search-filters');
			var $fc = $f.children();
			var d   = LJ.search.filters_duration;

			$fi.hide().velocity('shradeIn', {
				duration : d,
				display  : 'flex',
				delay    : d
			});

			[ $fc, $f ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				})
			});

		},
		refreshFiltersSliderValues: function( value ){

			$('.search-filters-min-age').html( parseInt(value[0]) );
			$('.search-filters-max-age').html( parseInt(value[1]) );

			LJ.search.setFiltersState();

		}

	});