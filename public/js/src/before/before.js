
	window.LJ.before = _.merge( window.LJ.before || {}, {

		fetched_befores: [],
		switch_view_duration: 1000,
		render_mode_active : null,
		render_mode_primary: "hive",
		render_mode_secondary: "flat",


		init: function(){
			
			LJ.before.addCreateBefore();
			LJ.before.handleDomEvents();
			LJ.before.initBrowser();

			return LJ.before.fetchNearestBefores__UserLocation()
					.then(function(){
						return LJ.before.initCreateBefore();
					});

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.map__icon.js-create-before', LJ.before.handleShowCreateBefore );
			// LJ.ui.$body.on('click', '.map__icon.js-expand-browser', LJ.map.handleShrinkBrowserDates );
			LJ.ui.$body.on('click', '.be-create__close', LJ.before.handleHideCreateBefore );
			LJ.ui.$body.on('click', '.be-dates__date', LJ.before.activateBrowserDate );
			LJ.ui.$body.on('click', '.be-create.x--ready .be-create__button', LJ.before.handleCreateBefore );
			LJ.ui.$body.on('click', '.be-inview .user-row', LJ.before.handleClickOnUserRow );
			// LJ.ui.$body.on('click', '.be-actions__action.x--share', LJ.before.handleShareBefore );
			LJ.ui.$body.on('click', '.js-cancel-before', LJ.before.handleCancelBefore );
			LJ.ui.$body.on('click', '.slide.x--before .js-show-options', LJ.before.showBeforeOptions );
			LJ.ui.$body.on('click', '.js-request', LJ.before.handleRequest );
			LJ.ui.$body.on('click', '.js-request-pending', LJ.before.handleClickOnRequestPending );
			LJ.ui.$body.on('click', '.js-request-accepted', LJ.before.handleClickOnRequestAccepted );
			LJ.ui.$body.on('click', '.js-show-profile', LJ.before.handleShowUserProfile );
			LJ.ui.$body.on('click', '.js-switch-mode', LJ.before.handleSwitchInviewMode );


		},
		initBrowser: function(){

			LJ.before.addBrowser();

		},
		initCreateBefore: function(){

		 	LJ.before.initHostsPicker();
			LJ.before.initDatePicker();
		 	LJ.before.initHourPicker( 17, 2, 30 );

		 	return LJ.seek.activatePlacesInCreateBefore()
		 			.then(function(){
					 	LJ.before.initPlacePicker();
					 	return;
		 			});

		},
		handleShowCreateBefore: function(){

			LJ.before.hideBrowser();
			LJ.before.showCreateBefore();

		},
		handleHideCreateBefore: function(){

			if( $('.slide').length == 0 ){
				LJ.before.showBrowser();
			}
			LJ.before.hideCreateBefore();

		},
		findById: function( before_id ){

			var bfr = _.find( LJ.before.fetched_befores, function( b ){
				return b._id == before_id;
			});

			return bfr;

		},
		findMyGroup: function( before ){

			var g = _.find( before.groups, function( g ){
				return g.members.indexOf( LJ.user.facebook_id ) != -1;
			});

			return g;

		},
		activateBrowserDate: function(){

			var $s = $( this );

			var date = $s.attr('data-day');
			var m = moment( date, 'DD/MM' );

			LJ.map.activateDate( m );

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
			$('.app-subheader.x--map')
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
								$( this ).velocity('fadeIn', {
										duration: 400,
										display: 'flex'
									});

							}
						});
				});

		},
		findActiveDateIndex: function(){

			var i = 0;
			var $bd = $('.be-dates__date.x--active');
			if( $bd.length > 0 ){
				$('.be-dates__date').each(function( j, el ){
					if( $(el).hasClass('x--active') ){
						i = j;
					}
				});
			}
			return i;

		},
		handleClickOnUserRow: function(){

			var facebook_id = $(this).attr('data-facebook-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},
		refreshBrowserDates: function(){

			var iso_dates  = _.map( LJ.before.fetched_befores, 'begins_at' );
			var dates_html = [];

			if( iso_dates.length == 0 ){

				LJ.wlog('No iso_dates found');
				dates_html.push( LJ.before.renderBrowserDatesEmpty() );

			} else {

				var dates = LJ.before.findDistinctDays( iso_dates );
				dates.forEach(function( date, i ){

					var d = date.day_digit;
					var w = date.day_word.slice( 0, 3 );

					dates_html.push([
						'<div class="be-dates__date" data-day="'+ d +'">',
							'<span class="be-dates__offset">' + w + '.<span>'+ d +'</span></span>',
							'<div class="be-dates__bar"></div>',
						'</div>'
						].join(''));
				});
				
			}


			$('.js-be-dates').html( dates_html.join('') );
			LJ.ui.turnToJsp( $('.js-be-dates'), {
				jsp_id: 'before_dates'
			});

			LJ.before.refreshBrowserCount();

		},
		getBeforeCountByDate: function( date ){

			var m = moment( date, 'DD/MM' );

			return _.filter( LJ.before.fetched_befores, function( bfr ){
				return m.dayOfYear() == moment( bfr.begins_at ).dayOfYear();
			}).length;

		},
		refreshBrowserCount: function(){

			$('.be-dates__date').each(function( i, el ){
				var $el = $( el );

				var day = $el.attr('data-day');
				var cnt = LJ.before.getBeforeCountByDate( day );

				$el.find('.be-dates__count').remove();
				$el.append('<span class="be-dates__count">(' + cnt + ')</span>');

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
		renderBrowserDatesEmpty: function(){

			return LJ.ui.render([
				'<div class="be-browser__empty">',
					'<span data-lid="be_browser_empty"></span>',
				'</div>'
			].join(''));

		},
		hideBrowser: function(){

			if( $('.app-subheader.x--map').css('opacity') != 1 ){
				return;
			}

			$('.app-subheader.x--map').velocity('slideUpOut', {
				duration : 500
			});

		},
		showBrowser: function(){

			var is_browser_visible   = $('.app-subheader.x--map').css('opacity') != 0 && $('.app-subheader.x--map').css('display') != 'none';
			var is_slide_visible     = $('.slide').length > 0 && $('.slide').css('opacity') == '1';
			var is_be_create_visible = $('.be-create').css('opacity') == '1';

			if( is_browser_visible ){
				return;
			}


			$('.app-subheader.x--map').velocity('slideDownIn', {
				duration : 500,
				display  : 'flex'
			});

		},
		showCreateBeforeBtn: function(){

			$('.js-create-before').velocity('bounceInQuick', { duration: 800, display: 'flex' });

		},
		hideCreateBeforeBtn: function(){

			$('.js-create-before').velocity('bounceOut', { duration: 800, display: 'none' });
		},
		fetchBefores: function(){

			LJ.log('Fetching befores...');
			return LJ.api.fetchBefores();

		},
		fetchNearestBefores__UserLocation: function( max_distance ){

			var latlng = LJ.user.location;
			return LJ.before.fetchNearestBefores( latlng, max_distance );


		},
		fetchNearestBefores__MapCenter: function( max_distance ){

			var latlng = {
				lat: LJ.meemap.center.lat(),
				lng: LJ.meemap.center.lng()
			};

			return LJ.before.fetchNearestBefores( latlng, max_distance );


		},
		refreshNearestBefores: function( max_distance ){

			LJ.before.fetchNearestBefores__MapCenter( max_distance )
				.then(function( befores ){
					return LJ.before.displayBeforeMarkers( befores );

				});

		},
		fetchNearestBefores: function( latlng, max_distance ){

			max_distance = max_distance || null;

			return LJ.api.fetchNearestBefores( latlng, max_distance )
					.then(function( befores ){
						LJ.before.fetched_befores = befores;
						return befores;

					});

		},
		displayBeforeMarkers: function( befores ){

			befores.forEach(function( before ){
				LJ.map.addBeforeMarker( before );
			});

			LJ.map.updateMarkers__byDate();
			LJ.map.clearSeenMarkers();

		},
		getMyBeforeById: function( before_id ){

			return _.find( LJ.user.befores, function( bfr ){
                return bfr.before_id == before_id;
            });

		},
		setPicturesSizes: function( $content ){
			
			var $pictures = $content.find('.be-pictures__pic');
			var n_pics 	  = $pictures.length;

			var left_step = Object.create({
				2: 50, 3: 33.333333, 4: 25 }
			)[ n_pics ];

			var shadolay = Object.create({
				 2: { opacity : 0,   right: 0 },
				 3: { opacity : 0.5, right: 33.33333 },
				 4: { opacity : 1,   right: 50 } 
			})[ n_pics ];

			$pictures.each(function( i, pic ){

				var $p = $( pic );

				$p.css({ 'width'  : '50%' })
				  .css({ 'z-index': i + 1 })
				  .css({ 'left'   : (i * left_step)+'%' })

				$p.find('.be-pictures__shadolay')
				  .css({ 'right'  : shadolay.right+'%' })
				  .css({ 'opacity': shadolay.opacity })

			});


        },
        fetchBeforeAndHosts: function( before_id ){

        	var before_ref;
        	return LJ.api.fetchBefore( before_id )
        			.then(function( before ){
        				before_ref = before;
        				var host_ids = before.hosts;
        				return LJ.api.fetchUsers( host_ids );

        			})
        			.then(function( expose ){
        				expose.before = before_ref;
        				return expose;
        			});

        },
        handleCloseBeforeInview: function(){

        	LJ.map.deactivateMarkers();
        	LJ.map.refreshMarkers();

        	LJ.before.showBrowser();

        },
        hideBeforeInview: function(){

        	LJ.ui.hideSlide({ type: 'before' });

        },
        fetchAndShowBeforeInview: function( before_id ){
			
			var before;

        	LJ.before.hideBrowser();
        	return LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.before.fetchBeforeAndHosts,
				"promise_arg"   : before_id,

				"complete"      : LJ.before.handleCloseBeforeInview,
				"errHandler"    : LJ.before.handleShowBeforeInviewError

			})
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				before        = expose.before;
				
				return LJ.before.renderBeforeInview( before, host_profiles );

			})
			.then(function( before_html ){
				$container = $('.slide.x--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( before );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				

			});


        },
        handleShowBeforeInviewError: function( err ){

        	if( err.err_id == "ghost_before" ){
        		LJ.before.ghostifyBeforeInview();
        	}

        },
        ghostifyBeforeInview: function(){

        	var duration      = 400;
        	var $before_ghost = $( LJ.before.renderBeforeGhost() );

        	$('.slide.x--before')
        		.find('.slide__loader')
        		.velocity('shradeOut', {
        			duration: duration,
        			complete: function(){
        				$( this ).remove();
        			}
        		});

        	$before_ghost
        		.hide()
        		.appendTo( $('.slide-body') )
        		.velocity('shradeIn', {
        			duration: duration,
        			delay   : duration,
        			display : 'flex'
        		});

        },
        renderBeforeGhost: function(){

        	return LJ.ui.render([

        		'<div class="slide-ghost">',
        			'<div class="slide-ghost__icon x--round-icon">',
        				'<i class="icon icon-search-light"></i>',
        			'</div>',
        			'<div class="slide-ghost__title">',
        				'<span data-lid="be_ghost_title"></span>',
        			'</div>',
        			'<div class="slide-ghost__subtitle">',
        				'<span data-lid="be_ghost_subtitle"></span>',
        			'</div>',
        			'<div class="slide-ghost__action">',
        				'<button data-lid="be_ghost_btn" class="slide__close"></button>',
        			'</div>',
        		'</div>'

        	].join(''));

        },
        showBeforeInview: function( before ){

        	LJ.before.hideBrowser();

			var host_ids  = before.hosts;

			var host_profiles;
			var $container;
			var $content;

        	return LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.api.fetchUsers,
				"promise_arg"   : host_ids,

				"complete"      : LJ.before.handleCloseBeforeInview,
				"errHandler"    : LJ.before.handleShowBeforeInviewError

			})
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				return LJ.before.renderBeforeInview( before, host_profiles );

			})
			.then(function( before_html ){
				$container = $('.slide.x--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( before );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				

			});

            
        },
        processBeforePreDisplay: function( before ){

			var $w        = $('.be-inview[data-before-id="'+ before._id +'"]');
			var main_host = before.main_host;

        	// Dynamically render the size of the pictures to fit, with a shade
        	LJ.before.setPicturesSizes( $w );

        	// Make sure the host is always on top of the list
        	LJ.mainifyUserRow( $w, main_host );

        	// Set the ux preferences
        	LJ.settings.applyUxPreferences();

        	// Prepend and hide the content, so that jsp compute the right height
			$w.css({ 'opacity': 0 }).show();

			LJ.ui.turnToJsp( $w.find('.be-users'), {
				jsp_id: 'before_inview'
			});

			// Little delay to give Jsp the time to act
			return LJ.delay(100)

        },
        addBefore: function( before_html, $container ){
        	return $container.append( before_html );

        },
        renderCreateBefore: function(){

            return LJ.ui.render([
                '<div class="map__icon x--round-icon x--create-before js-create-before">',
                    '<i class="icon icon-plus"></i>',
                '</div>'
                ].join(''));

        },
		renderBeforePictures: function( hosts ){

			var be_pictures = [];
			hosts.forEach(function( h ){

				var img_medium = LJ.pictures.makeImgHtml( h.img_id, h.img_vs, "user-before" );
				be_pictures.push([
					'<div class="be-pictures__pic js-filterlay">',
						'<div class="be-pictures__shadolay"></div>',
						img_medium,
					'</div>'
				].join(''));

			});

			return LJ.ui.render( be_pictures.join('') );

		},
		renderBeforeDate: function( date ){

			var m = moment( date );
			return LJ.text("before_date", m );

		},
		renderBeforeAddress: function( address ){
			return address.place_name;

		},
		renderBeforeInview: function( before, host_profiles ){

			var html;
			if( before.hosts.indexOf( LJ.user.facebook_id ) != -1 ){
        		html = LJ.before.renderBeforeInview__Host( before, host_profiles );

        	} else {
        		var my_before = _.find( LJ.user.befores, function( bfr ){
        			return bfr.before_id == before._id;
        		});

        		if( !my_before ){
        			html = LJ.before.renderBeforeInview__UserDefault( before, host_profiles );
        			
        		} else {
        			if( my_before.status == "pending" ){
        				html = LJ.before.renderBeforeInview__UserPending( before, host_profiles );

        			} else {
        				html = LJ.before.renderBeforeInview__UserAccepted( before, host_profiles );

        			}
        		}

        	}
        	return html;

		},
		renderBeforeInview__Host: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				be_action: '<div class="be-actions__action x--settings x--round-icon js-show-options"><i class="icon icon-cog-empty"></i></div>',
				be_button: LJ.before.renderBeforeInviewBtn__Host()

			});

		},
		renderBeforeInview__UserDefault: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				// be_action: '<div class="be-actions__action x--share x--round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserDefault()

			});

		},
		renderBeforeInview__UserPending: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				// be_action: '<div class="be-actions__action x--share x--round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserPending()

			});

		},
		renderBeforeInview__UserAccepted: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				// be_action: '<div class="be-actions__action x--share x--round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserAccepted()

			});

		},
		renderBeforeInviewBtn__Host: function(){
			return '<div class="be-ended"><span data-lid="be_hosted"></span></div>';
		},
		renderBeforeInviewBtn__UserAccepted: function(){
			return '<button class="x--round-icon x--accepted js-request-accepted"><i class="icon icon-chat-bubble-duo"></i></button>'

		},
		renderBeforeInviewBtn__UserPending: function(){
			return '<button class="x--round-icon x--pending js-request-pending"><i class="icon icon-pending"></i></button>'

		},
		renderBeforeInviewBtn__UserDefault: function(){
			return '<button class="x--round-icon js-request"><i class="icon icon-meedrink"></i></button>'

		},
		// renderBeforeInview__Base: LJ.before.renderBeforeInviewHive,
		renderBeforeInview__Base: function( before, hosts, options ){
			
			LJ.before.active_before  = before;
			LJ.before.active_hosts   = hosts;
			LJ.before.active_options = options;

			LJ.before.render_mode_active = LJ.before.render_mode_primary;
			var renderFn = LJ.before.getRenderFn( LJ.before.render_mode_primary );

			return renderFn( before, hosts, options );

		},
		getRenderFn: function( mode ){

			var mode = mode || LJ.before.render_mode_active || LJ.before.render_mode_primary;

			if( mode == "hive" ){
				return LJ.before.renderBeforeInviewHive;
			}

			if( mode == "flat" ){
				return LJ.before.renderBeforeInviewFlat;
			}

			if( mode == "rows" ){
				return LJ.before.renderBeforeInviewRows;
			}

		},	
		switchBeforeInview: function( mode ){

			var renderFn = LJ.before.getRenderFn( mode );
		
			$( renderFn( LJ.before.active_before, LJ.before.active_hosts, LJ.before.active_options ) )
				.css({ 'display': 'flex' })
				.replaceAll('.be-inview');


		},
		renderBeforeInviewHive: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}
		
			var usernames   = LJ.text("w_before").capitalize() + " " + LJ.text("w_with") + " " + LJ.renderMultipleNames( _.map( hosts, 'name') );
			var be_addr     = LJ.before.renderBeforeAddress( before.address );
			var be_date     = LJ.before.renderBeforeDate( before.begins_at );

			var be_pictures = LJ.pictures.makeHiveHtml( hosts, "user-before",{
				class_names : [ "js-show-profile" ],
				attach_data : [ "facebook_id" ]
			});

			var be_action   = options.be_action;

			var be_request = '<div class="be-request">' + options.be_button + '</div>';
			if( moment( before.begins_at ).dayOfYear() < moment().dayOfYear() ){
				be_request = LJ.ui.render('<div class="be-ended"><span data-lid="be_ended"></span></div>');
			}

 
			return LJ.ui.render([

				'<div class="be-inview x--hive" data-before-id="'+ before._id +'">',
					'<div class="be-usernames">',
						'<span>'+ usernames +'</span>',
					'</div>',
		            '<div class="be-actions">',
		        	  be_action,
		              '<div class="be-actions__action x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
		            '</div>',
			      	'<div class="be-pictures">',
			           be_pictures,
			        '</div>',
			        '<div class="be-inview-address">',
			          '<div class="be-inview-address__date">',
			          	'<div class="be-inview-address__icon x--round-icon">',
			          		'<i class="icon icon-clock-empty"></i>',
			          	'</div>',
			            '<span>'+ be_date +'</span>',
			          '</div>',
			          '<div class="be-inview-address__address">',
			          	'<div class="be-inview-address__icon x--round-icon">',
			          		'<i class="icon icon-location-empty"></i>',
			          	'</div>',
			            '<span>'+ be_addr +'</span>',
			          '</div>',
			        '</div>',
			        be_request,
		      	'</div>'

			].join(''));

		},
		renderUserFlat: function( user ){

			var n = user.name;
			var a = user.age;
			var i = user.facebook_id;
			var c = user.cc;
			var g = user.g;
			var j = user.job;

			var img_html = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, 'user-flat');

			return LJ.ui.render([

				'<div class="user-flat" data-facebook-id="'+ i +'">',
		            '<div class="flat-user__pic js-show-profile js-filterlay">',
		            	img_html,
		            '</div>',
		           '<div class="flat-user-body">',
		               '<div class="flat-user__h1">',
		            	  '<span class="flat-user__gender user-gender js-user-gender x--'+ g +'"></span>',
		                  '<span class="flat-user__name">'+ n +'</span>',
			              '<span class="flat-user__country js-user-country"><i class="flag-icon flag-icon-'+ c +'"></i></span>',
			              '<span class="user-online js-user-online" data-facebook-id="'+ i +'"></span>',
		               '</div>',
		               '<div class="flat-user__h2">',
		                  '<span class="flat-user__age age">'+ a +'</span>',
	                  	  '<span class="comma">-</span>',
	               		  '<span class="flat-user__job">'+ j +'</span>',
		               '</div>',
		           '</div>',
		            '<div class="flat-user-actions">',
		              // '<div class="flat-user__action x--round-icon js-show-profile"><i class="icon icon-main-picture"></i></div>',
		            '</div>',
	          '</div>'

			]);

		},
		renderBeforeInviewFlat: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}
			
			var flat_users = [ '<div class="flat-users">' ];
			hosts.forEach(function( h ){
				flat_users.push( LJ.before.renderUserFlat( h ) );
			});
			flat_users.push( '</div>' );

			var be_action  = options.be_action;

			var be_request = '<div class="be-request">' + options.be_button + '</div>';
			if( moment( before.begins_at ).dayOfYear() < moment().dayOfYear() ){
				be_request = LJ.ui.render('<div class="be-ended"><span data-lid="be_ended"></span></div>');
			}

 
			return LJ.ui.render([

				'<div class="be-inview x--flat" data-before-id="'+ before._id +'">',
					'<div class="be-actions">',
			          	be_action,
			          	'<div class="be-actions__action x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
			        '</div>',
					flat_users.join(''),
			        be_request,
		      	'</div>'

			]);

		},
		renderBeforeInviewRows: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}

			var be_pictures = LJ.before.renderBeforePictures( hosts );
			var user_rows   = LJ.renderUserRows( hosts );

			var be_action  = options.be_action;
			var be_request = '<div class="be-request">' + options.be_button + '</div>';

			if( moment( before.begins_at ).dayOfYear() < moment().dayOfYear() ){
				be_request = LJ.ui.render('<div class="be-ended"><span data-lid="be_ended"></span></div>');
			}

			var be_date = LJ.before.renderBeforeDate( before.begins_at );
			var be_addr = LJ.before.renderBeforeAddress( before.address );
 
			return LJ.ui.render([

				'<div class="be-inview" data-before-id="'+ before._id +'">',
			      	'<div class="be-pictures">',
			          '<div class="be-actions">',
			          	be_action,
			          	'<div class="be-actions__action x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
			          '</div>',
			          be_pictures,
			        '</div>',
			        '<div class="be-inview-address">',
			          '<div class="be-inview-address__date">',
			            '<span>'+ be_date +'</span>',
			          '</div>',
			          '<div class="be-inview-address__address">',
			            '<span>'+ be_addr +'</span>',
			          '</div>',
			        '</div>',
			        '<div class="be-users">',
			        	user_rows,
			        '</div>',
			        be_request,
		      	'</div>'

			]);

		},
		handleCancelBefore: function(){

			var $s = $( this );

			var before_id  = $s.closest('.slide').find('[data-before-id]').attr('data-before-id');
			var new_status = "canceled";

			LJ.ui.showLoader("canceling_before");

			LJ.api.changeBeforeStatus( before_id, new_status )
				.then(function( before ){

					LJ.ui.hideLoader("canceling_before");
					LJ.ui.showToast( LJ.text('to_cancel_before_success') );

					LJ.before.removeOneBefore( before_id );
					LJ.before.refreshBrowserDates();
					LJ.before.showBrowser();
					
					LJ.map.removeBeforeMarker( before_id );
					LJ.ui.hideSlide({ type: 'before' });

				})
				.catch(function( err ){
					LJ.wlog(err);

				});

		},
		removeOneBefore: function( before_id ){

			_.remove( LJ.before.fetched_befores, function( bfr ){
				return bfr._id == before_id;
			});

		},
		renderBeforeOptions: function(){

			return LJ.ui.render([

				'<div class="ioptions__actions">',
					'<div class="ioptions__action-message">',
						'<span data-lid="slide_overlay_before_message"></span>',
					'</div>',
					'<div class="ioptions__action js-cancel-before">',
						'<span data-lid="slide_overlay_before_cancel"></span>',
					'</div>',
					'<div class="ioptions__action x--back js-ioptions-close">',
						'<span data-lid="slide_overlay_back"></span>',
					'</div>',
				'</div>'

				].join(''));

		},
		showBeforeOptions: function(){

			var $wrap = $('.slide.x--before');

			if( $wrap.length != 1 ){
				return LJ.wlog('Cannot uniquely identify the wrapper');
			}

			LJ.ui.showSlideOverlay( LJ.before.renderBeforeOptions() );

		},
		showChatOptions: function(){

			var duration = LJ.ui.show_slide_duration;

			$('.chat-inview-options').velocity('fadeIn', {
				display : 'flex',
				duration: duration
			});

			$( LJ.chat.renderChatOptions() )
				.hide()
				.appendTo( $('.chat-inview-options') )
				.velocity('shradeIn', {
					duration: duration,
					display: 'flex',
					delay: duration/2,
					complete: function(){
						$(this).find('.js-close-overlay')
							   .on('click', LJ.ui.hideSlideOverlay );
					}
				});

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

		},
		getBefore: function( before_id ){
			return LJ.promise(function( resolve, reject ){

				var before = _.find( LJ.before.fetched_befores, function( bfr ){
					return bfr._id == before_id;
				});

				if( before ){
					resolve( before );
				} else {
					return LJ.api.fetchBefore( before_id )
						.then(function( before ){
							LJ.before.fetched_befores.push( before );
							resolve( before );
						});
				}

			});
		},
		getBeforeItem: function( before_id ){

			return _.find( LJ.user.befores, function( bfr ){
				return bfr.before_id == before_id;
			});

		},
		updateBeforeItem: function( before_id, opts ){

			var before_item = LJ.before.getBeforeItem( before_id );

			_.keys( before_item ).forEach(function( key ){
				if( opts[ key ] && typeof opts[ key ] == typeof before_item[ key ] ){
					before_item[ key ] = opts[ key ];
				}
			});

		},
		getChannelItem( before_id ){

			return _.find( LJ.user.channels, function( chan ){
				return chan.before_id == before_id;
			});
		},
		cancelifyBeforeInview: function(){

			LJ.ui.cancelify({

				"$wrap"        : $('.slide.x--before'),
				"duration"     : 8000,
				"message_html" : "<span>" + LJ.text("before_just_canceled") + "</span>",
				"callback"     : function(){
					LJ.ui.hideSlide({ type: 'before' });
				}

			});

		},
		handleSwitchInviewMode: function(){

			LJ.before.render_mode_active = ( LJ.before.render_mode_active == LJ.before.render_mode_primary ) ?
										     LJ.before.render_mode_secondary : 
										     LJ.before.render_mode_primary;
						
			LJ.before.switchBeforeInview( LJ.before.render_mode_active );

		},
		handleShowUserProfile: function(){

			var $s = $( this );
			var facebook_id = $s.closest('[data-facebook-id]').attr('data-facebook-id');

			LJ.profile_user.showUserProfile( facebook_id );


		}

	});