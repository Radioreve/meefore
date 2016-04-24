
	window.LJ.before = _.merge( window.LJ.before || {}, {

		befores: [],


		init: function(){
			
			LJ.before.handleDomEvents();

			LJ.before.addBrowser();
			LJ.before.showBrowser();
			LJ.before.refreshBrowserLocation();
			LJ.before.refreshBrowserDates( LJ.before.test.iso_dates );

			return;

		},
		handleDomEvents: function(){



		},
		sortIsoDates: function( iso_dates ){

			return iso_dates.sort(function( i1, i2 ){
				return moment( i1 ).dayOfYear() - moment( i2 ).dayOfYear();
			});

		},	
		findDistinctDays: function( iso_dates ){

			var days = [];
			LJ.before.sortIsoDates( iso_dates ).forEach(function( isodate, i ){

				days.push({
					id        : i,
					day_word  : LJ.text('day')[ parseInt(moment( isodate ).format('d')) ],
					day_digit : moment( isodate ).format('DD/MM')
				});

			});

			var distinct_days = [];
			var found = [];

			days.forEach(function( day ){

				if( found.indexOf( day.day_digit ) == -1 ){
					found.push( day.day_digit );
					distinct_days.push( day );
				}

			});

			return distinct_days;

		},
		addBrowser: function(){

			$('.be-browser').remove();

			$('.js-map-wrap')
				.append( LJ.before.renderBrowser() );			

		},
		preRefreshBrowserLocation: function(){

			$('.js-current-location')
				.children()
				.velocity({ opacity: [ 0.5, 1 ]}, {
					duration: 100
				});

		},
		refreshBrowserLocation: function(){

			var center_latlng = LJ.meemap.center;
			LJ.map.findAddressWithLatLng( center_latlng )
				.then(function( address ){

					$('.js-current-location')
						.children()
						.velocity({ opacity: [ 0, 0.5 ]}, {
							duration: 200,
							complete: function(){

								$('.js-current-location').find('.js-closeto').html( address );
								$(this).velocity('fadeIn', {
										duration: 400,
										display: 'flex'
									});

							}
						});
				});

		},
		findActiveDateIndex: function(){

			var i = 0;
			var $bd = $('.be-dates__date.--active');
			if( $bd.length > 0 ){
				$('.be-dates__date').each(function( j, el ){
					if( $(el).hasClass('--active') ){
						i = j;
					}
				});
			}
			return i;

		},
		refreshBrowserDates: function( iso_dates ){

			if( !iso_dates ){
				return LJ.wlog('Cannot render browser without a set of proper iso dates');
			}

			var dates      = LJ.before.findDistinctDays( iso_dates );
			var dates_html = [];

			dates.forEach(function( date, i ){

				var d = date.day_digit;
				var w = date.day_word.slice(0,3);

				var active = ( i == LJ.before.findActiveDateIndex() ) ? '--active' : '';

				dates_html.push([
					'<div class="be-dates__date '+ active +'" data-day="'+ d +'">',
					w + '.<span>'+ d +'</span>',
					'</div>'
					].join(''));
			});

			$('.js-be-dates').html( dates_html.join('') );
			LJ.ui.turnToJsp( $('.js-be-dates'), {
				jsp_id: 'before_dates'
			});

		},
		renderBrowser: function(){

			return LJ.ui.render([

				'<div class="be-browser">',
					'<div class="be-dates js-be-dates">',
					'</div>',
					'<div class="be-address js-current-location">',
						'<i class="icon icon-location"></i>',
						'<span data-lid="be_close_to"></span>',
						'<span class="js-closeto"></span>',
					'</div>',
				'</div>',

			].join(''));

		},
		hideBrowser: function(){

			$('.be-browser').velocity('slideUpOut', {
				duration: 500
			});

		},
		showBrowser: function(){

			$('.be-browser').velocity('slideDownIn', {
				duration: 500,
				display : 'flex'
			});

		}

	});