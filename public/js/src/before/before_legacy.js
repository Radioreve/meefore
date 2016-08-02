
	window.LJ.before = _.merge( window.LJ.before || {}, {

		legacy: {

			init: function(){

				LJ.before.initDatePicker();
			 	LJ.before.initHourPicker( 17, 2, 30 );


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

	            	$('.be-create-row.x--date')
	               		.attr('data-dd', date_str.split('/')[0] )
	               		.attr('data-mm', date_str.split('/')[1] )
	               		.attr('data-yy', date_str.split('/')[2] )
	               		.find('input')
	               		.val( date_str );

	            	LJ.before.date_picker.hide();

	            	$('.be-create-row.x--date').removeClass('x--unset');
					LJ.before.validateInputs();

	            });

	            LJ.ui.$body.on('mousedown', '.pika-next', function(e){             
	                LJ.before.date_picker.nextMonth();
	            });

	            LJ.ui.$body.on('mousedown', '.pika-prev', function(e){             
	                LJ.before.date_picker.prevMonth();
	            });


	            LJ.ui.$body.on('mouseleave', '.pika-single', function(){
	                LJ.before.hovering_datepicker_nav = false;
	                LJ.before.date_picker.hide();
	            });

	            LJ.ui.$body.on('focus', '.be-create-row.x--date input', function(){
	                LJ.before.date_picker.show();
	            });


			},
			handleDomEvents__HourPicker: function(){

				LJ.ui.$body.on('mousedown', '.be-create .hourpicker__hour', function(){

					var hour = $(this).attr('data-hour');

					$('.be-create-row.x--hour input').val( hour );
					$('.be-create-row.x--hour')
						.attr('data-hh', hour.split(':')[0])
						.attr('data-mm', hour.split(':')[1]);

					LJ.before.hideHourPicker();
					$('.be-create-row.x--hour').removeClass('x--unset');
					LJ.before.validateInputs();

				});

				LJ.ui.$body.on('click', '.be-create-row.x--hour input', function(){
					LJ.before.showHourPicker();

				});

				LJ.ui.$body.on('mouseleave', '.hourpicker', function(){
					LJ.before.hideHourPicker();              

	            });

			},
			generateHourRange: function( begin, stop, step ){

				if( !begin || !stop || !step ){
					return LJ.wlog('Cannot generate hour range without begin, stop and step params');
				}

				var html = [];
				var start_date = moment({ hour: begin });
				var stop_date  = moment({ hour: stop });

				if( stop_date < start_date ){
					stop_date.add( 1, 'day' );
				}

				while( start_date <= stop_date ){
					var s = start_date.format('HH:mm');
					html.push( s );
					start_date.add( step, 'minute' );
				}

				return html;

			},
			renderHourPicker: function( begin, stop, step ){

				var html_hours = LJ.before.generateHourRange( begin, stop, step );
				var html = [];

				html_hours.forEach(function( hs, i ){
					if( i == 0 ){
						html.push('<div class="hourpicker-col">');
						html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
					} else if ( i%4 == 0 ){
						html.push('</div><div class="hourpicker-col">');
						html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
					} else {
						html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
					}
				});
				html.push('</div>');

				return LJ.ui.render([

					'<div class="hourpicker">',
						html.join(''),
					'</div>'

					].join(''));

			},
			showHourPicker: function(){
				$('.hourpicker').show();

			},
			hideHourPicker: function(){
				$('.hourpicker').hide();

			},
			initDatePicker: function(){

				LJ.before.date_picker = new Pikaday({ 

	                field   : document.getElementsByClassName('be-create-row x--date')[0],
	                container : document.getElementsByClassName('be-create')[0],
	                i18n	: LJ.text_source[ "pikaday" ][ LJ.lang.getAppLang() ],
	                format  : 'DD/MM/YY',
	                minDate : new Date(),
	                bound   : false

	            });

	            $('.pika-single').insertAfter( $('.be-create') );
	            LJ.before.handleDomEvents__DatePicker();

			},
			initHourPicker: function( begin, stop, step ){

				$('.be-create-row.x--hour')
					.append( LJ.before.renderHourPicker( begin, stop, step ) );

				LJ.before.hideHourPicker();
				LJ.before.handleDomEvents__HourPicker();

			}
		},
		handleShareBefore: function(){	

			var target_id = $( this ).closest('[data-before-id]').attr('data-before-id');

			LJ.ui.showModal({
				"title"			: LJ.text('modal_share_title_before'),
				"type"      	: "share",
				"search_input"	: true,
				"jsp_body" 	    : true,
				"attributes"	: [{ name: "item-id", val: target_id }],
				"subtitle"		: LJ.text('modal_share_subtitle_before'),
				"body"  		: LJ.friends.renderFriendsInModal(),
				"footer"		: "<button class='x--rounded'><i class='icon icon-check'></i></button>"
			})
			.then(function(){
				return LJ.ui.getModalItemIds();

			})
			.then(function( item_ids ){

				var d = LJ.static.renderStaticImage('search_loader');
				$( d ).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
					duration: 400
				});

				return LJ.api.shareWithFriends({
					target_id   : target_id,
					target_type : 'before',
					shared_with : item_ids
				});

			})
			.then(function( exposed ){
				return LJ.ui.hideModal();

			})
			.then(function(){
				LJ.ui.showToast( LJ.text('to_before_shared_success') );
				
			})
			.catch(function(e){
				LJ.wlog(e);
				LJ.ui.hideModal();

			});

		}

	});