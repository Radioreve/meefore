	
	window.LJ.before = _.merge( window.LJ.before || {}, {

		initDatepicker: function(){

			LJ.before.date_picker = new Pikaday({ 
                field   : document.getElementsByClassName('be-create-row --date')[0],
                container : document.getElementsByClassName('be-create')[0],
                i18n	: LJ.text_source[ "pikaday" ][ LJ.lang.getAppLang() ],
                format  : 'DD/MM/YY',
                minDate : new Date(),
                bound   : false
            });

            $('.pika-single').insertAfter( $('.be-create') );

            LJ.before.handleDomEvents__DatePicker();

		},
		handleDomEvents__DatePicker: function(){

			  /* Date picker custom handling for better ux */
            LJ.ui.$body.on('mousedown', '.pika-day:not(.pika-prev,.pika-next)', function(e){

                var $self = $(this);
                var date_str =  moment({ 
                    D: $self.attr('data-pika-day'),
                    M: $self.attr('data-pika-month'),
                    Y: $self.attr('data-pika-year') })
                .format('DD/MM/YY');

               $('.be-create-row.--date').find('input').val( date_str );
               LJ.before.date_picker.hide();

            });

            LJ.ui.$body.on('mousedown', '.pika-next', function(e){             
                LJ.before.date_picker.nextMonth();
            });

            LJ.ui.$body.on('mousedown', '.pika-prev', function(e){             
                LJ.before.date_picker.prevMonth();
            });

            LJ.ui.$body.on('mouseenter', '.pika-prev, .pika-next', function(){
                LJ.before.hovering_datepicker_nav = true;
            });

            LJ.ui.$body.on('mouseleave', '.pika-prev, .pika-next', function(){
                LJ.before.hovering_datepicker_nav = false;
            });

            LJ.ui.$body.on('focus', '.be-create-row.--date input', function(){
                LJ.before.date_picker.show();
            });

            LJ.ui.$body.on('focusout', '.be-create-row.--date input', function(){
                if( LJ.before.hovering_datepicker_nav ) return;
                LJ.before.date_picker.hide();
            });


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
				});

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

		},
		renderHourPicker: function( opts ){

		},
		initHourPicker: function( opts ){

            var opts = opts || {};
            var $inp = $( opts.inp );

            if( !$inp ){
                return LJ.wlog('Cant initialize hour picker without input');
            }
            var $hourPicker = $( LJ.before.renderHourPicker( opts ) );

            $hourPicker
            	.insertAfter( $inp )
                    .css({
                        'position' : 'absolute',
                        'top'      : '10px',
                        'left'     : '135px',
                        'z-index'  : '100000'
                   	});

            $('.hp-upndown-left .hp-icon-up').click(function(e){
                LJ.fn.incrHour(e, opts);
            });

            $('.hp-upndown-left .hp-icon-down').click(function(e){
                LJ.fn.decrHour(e, opts);
            });

            $('.hp-upndown-right .hp-icon-up').click(function(e){
                LJ.fn.incrMint(e, opts);
            });

            $('.hp-upndown-right .hp-icon-down').click(function(e){
                LJ.fn.decrMint(e, opts);
            });
            
            $('.hp-main').mousewheel(function(e){

                e.preventDefault();

                if( $(e.target).hasClass('hp-hour')){
                    if( e.deltaY == 1 ){
                        LJ.fn.incrHour(e, opts);
                    }
                    if( e.deltaY == -1 ){
                        LJ.fn.decrHour(e, opts);
                    }
                }
                if( $(e.target).hasClass('hp-min')){
                    if( e.deltaY == 1 ){
                        LJ.fn.incrMint(e, opts);
                    }
                    if( e.deltaY == -1 ){
                        LJ.fn.decrMint(e, opts);
                    }
                }
            });

            $('.row-create-hour').click(function(e){

                if(  $('.hp-main').hasClass('block') ){
                    return;
                }

                $inp.attr('placeholder','');
                $('.hp-main').show();

            });

            LJ.$body.mousedown(function(e){
                if( $(e.target).closest('.row-create-hour').length == 0 && $('.hp-main').css('display') != 'none' ){
                    var hour = $('.hp-hour').text();
                    var min  = $('.hp-min').text();
                    LJ.fn.addHourToInput( hour, min );
                    $('.hp-main').hide();
                }
            });

            $('.hp-main').on('mousedown', function(e){
                
                if( $(e.target).hasClass('hp-icon') ){
                    return;
                }

                $('.hp-main').hide().addClass('block');
                setTimeout(function(){
                    $('.hp-main').removeClass('block');
                }, 300);

                var hour = $('.hp-hour').text();
                var min  = $('.hp-min').text();
                LJ.fn.addHourToInput( hour, min );


            });


        }


	});