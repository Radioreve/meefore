
	window.LJ.before = _.merge( window.LJ.before || {}, {

		addCreateBeforeLoader: function(){
			$( LJ.static.renderStaticImage('be_create_loader') ).hide().appendTo('.be-create');

		},
		initHostsPicker: function(){

			LJ.before.handleDomEvents__HostsPicker();

		},
		initDatePicker: function(){

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
		initHourPicker: function( begin, stop, step ){

			$('.be-create-row.--hour')
				.append( LJ.before.renderHourPicker( begin, stop, step ) );

			LJ.before.hideHourPicker();
			LJ.before.handleDomEvents__HourPicker();

		},
		initPlacePicker: function(){

			LJ.before.handleDomEvents__PlacePicker();

		},
		handleDomEvents__PlacePicker: function(){

			LJ.seek.be_create.addListener('place_changed', function(){

				var place = LJ.seek.be_create.getPlace();

				var place_id    = place.place_id;
				var place_name  = place.formatted_address;
				var lat 		= place.geometry.location.lat();
				var lng 		= place.geometry.location.lng();

				$('.be-create-row.--location')
					.attr('data-place-id', place_id )
					.attr('data-place-name', place_name )
					.attr('data-lat', lat )
					.attr('data-lng', lng );

				$('.be-create-row.--location').removeClass('--unset');
				LJ.before.validateInputs();

			});

		},
		handleDomEvents__HostsPicker: function(){

			LJ.ui.$body.on('click', '.be-create-row.--hosts', function(){

				LJ.ui.showModal({
					"type"      	: "be-create",
					"title"			: LJ.text('modal_be_create_title'),
					"subtitle"		: LJ.text('modal_be_create_subtitle'),
					"body"  		: LJ.friends.renderFriendsInModal(),
					"footer"		: "<button class='--rounded'><i class='icon icon-check'></i></button>",
					"search_input"	: true,
					"max_items"     : (LJ.app_settings.app.max_hosts - 1),
					"jsp_body" 	    : true
				})
				.then(function(){
					return LJ.ui.getModalItemIds()
				})
				.then(function( facebook_ids ){
					$('.be-create-row.--hosts').attr('data-host-ids', facebook_ids.join(',') ).removeClass('--unset');
					LJ.before.validateInputs();
					return LJ.before.addHostsNames( facebook_ids );

				})
				.then(function(){
					return LJ.ui.hideModal();
				})
				.catch(function( e ){
					LJ.wlog(e);
					LJ.wlog('User has stopped selecting people');
				});

			});


		},
		handleDomEvents__HourPicker: function(){

			LJ.ui.$body.on('mousedown', '.be-create .hourpicker__hour', function(){

				var hour = $(this).attr('data-hour');

				$('.be-create-row.--hour input').val( hour );
				$('.be-create-row.--hour')
					.attr('data-hh', hour.split(':')[0])
					.attr('data-mm', hour.split(':')[1]);

				LJ.before.hideHourPicker();
				$('.be-create-row.--hour').removeClass('--unset');
				LJ.before.validateInputs();

			});

			LJ.ui.$body.on('click', '.be-create-row.--hour input', function(){
				LJ.before.showHourPicker();

			});

			LJ.ui.$body.on('mouseleave', '.hourpicker', function(){
				LJ.before.hideHourPicker();              

            });

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

            	$('.be-create-row.--date')
               		.find('input')
               		.val( date_str )
               		.attr('data-DD', date_str.split('/')[0] )
               		.attr('data-MM', date_str.split('/')[1] )
               		.attr('data-YY', date_str.split('/')[2] );

            	LJ.before.date_picker.hide();

            	$('.be-create-row.--date').removeClass('--unset');
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

            LJ.ui.$body.on('focus', '.be-create-row.--date input', function(){
                LJ.before.date_picker.show();
            });


		},
		addHostsNames: function( hosts_facebook_id ){

			var profiles = LJ.friends.getFriendsProfiles( hosts_facebook_id );
			var names    = _.map( profiles, 'name' );
			names = LJ.renderMultipleNames( names );

			$('.be-create-row.--hosts')
				.find('input')
				.val( names );

			return;

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
		validateInputs: function(){

			var $unset = $('.be-create-row.--unset');

			if( $unset.length == 0 ){
				return $('.be-create').addClass('--ready');
			}

		},
		showCreateBefore: function(){

			var $i = $('.map__icon.--create-before');
			var $w = $('.be-create');
			var d  = LJ.search.filters_duration || 300;

			LJ.before.clearCreateBefore();

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
		clearCreateBefore: function(){

			$('.be-create__loader').remove();
			$('.be-create').removeClass('--pending').removeClass('--ready');
			$('.be-create-row.--hosts').addClass('--unset').find('input').val('');
			$('.be-create-row.--date').addClass('--unset').find('input').val('');
			$('.be-create-row.--hour').addClass('--unset').find('input').val('');
			$('.be-create-row.--location').addClass('--unset').find('input').val('');

		},
		readCreateAttributes: function(){

			var req = {};

			req.hosts_facebook_id = $('.be-create-row.--hosts').attr('data-host-ids').split(',');
			req.hosts_facebook_id.push( LJ.user.facebook_id );

			req.begins_at = moment().set({

				h: $('.be-create-row.--hour').attr('data-hh'),
				m: $('.be-create-row.--hour').attr('data-mm'),
				D: $('.be-create-row.--date').attr('data-DD'),
				M: $('.be-create-row.--date').attr('data-MM'),
				Y: $('.be-create-row.--date').attr('data-YY')

			}).toISOString();

			// Important! Timezone is only known by the client and used to uniquely identify his..
			// well, timezone, when updating multiple events every hours on the scheduler
			req.timezone = moment().utcOffset();

			req.address = {

				place_id   : $('.be-create-row.--location').attr('data-place-id'),
				place_name : $('.be-create-row.--location').attr('data-place-name'),
				lat 	   : $('.be-create-row.--location').attr('data-lat'),
				lng 	   : $('.be-create-row.--location').attr('data-lng')

			}

			return req;

		},
		readAndCreateBefore: function(){

			var req = LJ.before.readCreateAttributes();

			if( !(req.hosts_facebook_id && req.begins_at && req.timezone && req.address ) ){
				return LJ.wlog('Missing parameter in the req object : ' + JSON.stringify( req, null, 4 ));
			}

			return LJ.api.createBefore( req );


		},
		startCreateBefore: function(){

			$('.be-create').addClass('--pending');
			$('.be-create').children().velocity('shradeOut', { duration: 300, display: 'none' });
			LJ.before.addCreateBeforeLoader();
			$('.be-create').find('.be-create__loader').velocity({ 'opacity': 1 }, { delay: 300, duration: 300, display: 'block' });
			return;

		},
		cancelCreateBefore: function(){

			$('.be-create').removeClass('--pending');
			$('.be-create').find('.be-create__loader').velocity({ 'opacity': 0 }, { duration: 300, complete: function(){ $(this).remove(); } });
			$('.be-create').children().velocity('shradeIn', { duration: 300, delay: 300, display: 'flex' });
			return;

		},
		endCreateBefore: function( before ){

			LJ.log(before);
			LJ.ui.showToast( LJ.text('to_before_create_success') );
			LJ.before.hideCreateBefore();
			LJ.before.showBrowser();
			LJ.map.addBeforeMarker( before );
			LJ.before.fetched_befores.push( before );
			LJ.before.refreshBrowserDates();

		},	
		handleCreateBefore: function(){

			LJ.log('Handling create before...');

			var ux_done    = LJ.before.startCreateBefore();
			var be_created = LJ.before.readAndCreateBefore();

			LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
				var before = res[0];
				return LJ.before.endCreateBefore( before );

			})
			.catch(function( e ){
				LJ.wlog(e.err);
				LJ.before.handleCreateBeforeError(e.err);

			});

		},
		handleCreateBeforeError: function( err ){

			var err_id = err.err_id;
			var err_msg = '';

			if( err_id == "missing_parameter" ){

				if( err.parameter == "hosts_facebook_id" ){
					err_msg = LJ.text('err_be_create_missing_hosts');

				}
				if( err.parameter == "begins_at" ){
					err_msg = LJ.text('err_be_create_missing_date');

				}
				if( err.parameter == "address" ){
					err_msg = LJ.text('err_be_create_missing_location');

				}
			}

			if( err_id == "already_hosting" ){
				
				var profiles = LJ.friends.getFriendsProfiles( err.host_ids );
				var names    = _.map( profiles, 'name' );
				var formatted_names = LJ.renderMultipleNames( names );

				if( err.host_ids.indexOf( LJ.user.facebook_id ) == -1 ){
					err_msg = LJ.text('err_be_create_already_hosting').replace('%names', formatted_names );

				} else {
					err_msg = LJ.text('err_be_create_already_hosting_me');
				}

			}

			LJ.ui.showToast( err_msg ,'error' );
			LJ.before.cancelCreateBefore();

		}



	});