	
	window.LJ.before = _.merge( window.LJ.before || {}, {

		initDatepicker: function(){

			var input_id = $('.be-create-row.--date')

			LJ.before.date_picker = new Pikaday({ 
                field: document.getElementsByClassName('be-create-row --date'),
                format:'DD/MM/YY',
                minDate: new Date(),
                bound: false,
                i18n: LJ.text_source[ "i18n" ][ LJ.app_language ]
            });

            $('.pika-single').insertAfter( container_id );

		},
		showCreateBefore: function(){

			var $i = $('.map__icon.--create-before');
			var $w = $('.be-create');
			var d  = LJ.search.filters_duration || 300;

			$i.velocity('shradeOut', {
				duration : d,
				display  : 'none'
			});

			LJ.delay( d )
				.then(function(){
					LJ.ui.shradeAndStagger( $w, {
						duration: d
					});
				})

		},
		hideCreateBefore: function(){

			var $i  = $('.map__icon.--create-before');
			var $w  = $('.be-create');
			var $ch = $w.children();
			var d   = LJ.search.filters_duration;

			$i.hide().velocity('shradeIn', {
				duration : d,
				display  : 'flex',
				delay    : d
			});

			[ $ch, $w ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				})
			});

		}


	});