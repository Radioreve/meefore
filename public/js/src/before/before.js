
	window.LJ.before = _.merge( window.LJ.before || {}, {

		fetched_befores: [],


		init: function(){
			
			LJ.before.handleDomEvents();
			LJ.before.initBrowser();

			return LJ.before.fetchNearestBefores__UserLocation()
					.then(function(){
						return LJ.before.initCreateBefore();
					});

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.map__icon.--create-before', LJ.before.handleShowCreateBefore );
			LJ.ui.$body.on('click', '.be-create__close', LJ.before.handleHideCreateBefore );
			LJ.ui.$body.on('click', '.be-dates__date', LJ.before.activateBrowserDate );
			LJ.ui.$body.on('click', '.be-create.--ready .be-create__button', LJ.before.handleCreateBefore );
			LJ.ui.$body.on('click', '.be-inview .user-row', LJ.before.handleClickOnUserRow );
			LJ.ui.$body.on('click', '.be-actions__action.--share', LJ.before.handleShareBefore );
			LJ.ui.$body.on('click', '.js-cancel-before', LJ.before.handleCancelBefore );
			LJ.ui.$body.on('click', '.slide.--before .js-show-options', LJ.before.showBeforeOptions );
			LJ.ui.$body.on('click', '.js-request', LJ.before.handleRequest );
			LJ.ui.$body.on('click', '.js-request-pending', LJ.before.handleClickOnRequestPending );
			LJ.ui.$body.on('click', '.js-request-accepted', LJ.before.handleClickOnRequestAccepted );


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

			LJ.before.showBrowser();
			LJ.before.hideCreateBefore();

		},
		activateBrowserDate: function(){

			var $s = $(this);

			if( $s.hasClass('--active') ) return;

			$('.be-dates__date').removeClass('--active');
			$s.addClass('--active');

			LJ.map.updateMarkers__byDate();

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
			$('.app-section.--map')
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
		handleClickOnUserRow: function(){

			var facebook_id = $(this).attr('data-facebook-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},
		refreshBrowserDates: function(){

			var iso_dates = _.map( LJ.before.fetched_befores, 'begins_at' );

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

		},
		renderBeforeUserRows: function( hosts, main_host ){

			var be_user_rows = [];
			hosts.forEach(function( h ){

				if( h.facebook_id == main_host ){
					be_user_rows.push( LJ.before.renderUserRow( h, ['main-host'] ) );

				} else {
					be_user_rows.push( LJ.before.renderUserRow( h ) );

				}
			});

			return be_user_rows.join('');

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

        	var before;
        	return LJ.api.fetchBefore( before_id )
        			.then(function( exposed ){
        				before = exposed.before;
        				var host_ids = exposed.before.hosts;
        				return LJ.api.fetchUsers( host_ids );

        			})
        			.then(function( expose ){
        				expose.before = before;
        				return expose;
        			});

        },
        fetchAndShowBeforeInview: function( before_id ){

        	LJ.before.hideBrowser();
        	LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.before.fetchBeforeAndHosts,
				"promise_arg"   : before_id,

				"complete"      : LJ.before.showBrowser

			})
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				return LJ.before.renderBeforeInview( expose.before, host_profiles );

			})
			.then(function( before_html ){
				$container = $('.slide.--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( $content );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				

			});


        },
        showBeforeInview: function( before ){

        	LJ.before.hideBrowser();

        	var host_ids = before.hosts;
			var host_profiles;
			var $container;
			var $content;

        	return LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.api.fetchUsers,
				"promise_arg"   : host_ids,

				"complete"      : LJ.before.showBrowser

			})
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				return LJ.before.renderBeforeInview( before, host_profiles );

			})
			.then(function( before_html ){
				$container = $('.slide.--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( $content );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				

			});

            
        },
        processBeforePreDisplay: function( $content ){

        	// Dynamically render the size of the pictures to fit, with a shade
        	LJ.before.setPicturesSizes( $content );

        	// Make sure the host is always on top of the list
        	$('.user-row.--host').insertBefore( $('.user-row').first() );

        	// Prepend and hide the content, so that jsp compute the right height
			$content.css({ 'opacity': 0 }).show();

			LJ.ui.turnToJsp( $('.be-users'), {
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
                '<div class="map__icon --round-icon --create-before js-create-before">',
                    '<i class="icon icon-plus"></i>',
                '</div>'
                ].join(''));

        },
		renderBeforePictures: function( hosts ){

			var be_pictures = [];
			hosts.forEach(function( h ){

				var img_medium = LJ.pictures.makeImgHtml( h.img_id, h.img_vs, "user-before-md" );
				be_pictures.push([
					'<div class="be-pictures__pic">',
						'<div class="be-pictures__shadolay"></div>',
						img_medium,
					'</div>'
				].join(''));

			});

			return be_pictures.join('');

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

				be_action: '<div class="be-actions__action --settings --round-icon js-show-options"><i class="icon icon-cog"></i></div>',
				be_button: '<button class="--round-icon"><i class="icon icon-chat-bubble-duo"></i></button>'

			});

		},
		renderBeforeInview__UserDefault: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				be_action: '<div class="be-actions__action --share --round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserDefault()

			});

		},
		renderBeforeInview__UserPending: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				be_action: '<div class="be-actions__action --share --round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserPending()

			});

		},
		renderBeforeInview__UserAccepted: function( before, hosts ){

			return LJ.before.renderBeforeInview__Base( before, hosts, {

				be_action: '<div class="be-actions__action --share --round-icon"><i class="icon icon-forward"></i></div>',
				be_button:  LJ.before.renderBeforeInviewBtn__UserAccepted()

			});

		},
		renderBeforeInviewBtn__UserAccepted: function(){
			return '<button class="--round-icon --accepted js-request-accepted"><i class="icon icon-chat-bubble-duo"></i></button>'


		},
		renderBeforeInviewBtn__UserPending: function(){
			return '<button class="--round-icon --pending js-request-pending"><i class="icon icon-pending"></i></button>'


		},
		renderBeforeInviewBtn__UserDefault: function(){
			return '<button class="--round-icon js-request"><i class="icon icon-drinks"></i></button>'


		},
		renderBeforeInview__Base: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}

			var be_pictures = LJ.before.renderBeforePictures( hosts );
			var user_rows   = LJ.before.renderBeforeUserRows( hosts, before.main_host );

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
			          '<div class="be-pictures__overlay --filterlay"></div>',
			          '<div class="be-actions">',
			          	be_action,
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

			].join(''));

		},
		handleCancelBefore: function(){

			var $s = $(this);

			var before_id  = $s.closest('.slide').find('[data-before-id]').attr('data-before-id');
			var new_status = "canceled";

			LJ.ui.showLoader("canceling_before");

			LJ.api.changeBeforeStatus( before_id, new_status )
				.then(function( before ){

					LJ.ui.hideLoader("canceling_before");
					LJ.ui.showToast( LJ.text('to_cancel_before_success') );

					LJ.before.removeOneBefore( before_id );
					LJ.before.refreshBrowserDates();
					
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
		renderUserRow: function( user, options ){

			options = options || [];

			var host      = options.indexOf('main-host') != -1 ? '--host' : '';
			var img_small = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, "user-before-sm" );

			return LJ.ui.render([

				'<div class="user-row '+ host +'" data-facebook-id="'+ user.facebook_id +'">',
		            '<div class="user-row__pic">',
		              img_small,
		              '<div class="user-gender --'+ user.g +' js-user-gender"></div>',
		              '<div class="user-country js-user-country">',
		                '<i class="flag-icon flag-icon-'+ user.cc +'"></i>',
		              '</div>',
		            '</div>',
		            '<div class="user-row__informations">',
		              '<div class="user-row__about">',
		                '<span class="user-name">'+ user.name +'</span>',
		                '<span class="user-comma">,</span>',
		                '<span class="user-age">'+ user.age +'</span>',
		                '<span class="user-online user__status js-user-online"></span>',
		                '<i class="icon icon-star user-host-icon"></i>',
		              '</div>',
		              '<div class="user-row__education">',
		                '<span class="user-row__education-icon --round-icon">',
		                  '<i class="icon icon-education"></i>',
		                '</span>',
		                '<span class="user-row__education-label">'+ user.job +'</span>',
		              '</div>',
		            '</div>',
	          '</div>'

			].join(''));

		},
		renderBeforeOptions: function(){

			return LJ.ui.render([

				'<div class="slide-overlay__actions">',
					'<div class="slide-overlay__action-message">',
						'<span data-lid="slide_overlay_before_message"></span>',
					'</div>',
					'<div class="slide-overlay__action js-cancel-before">',
						'<span data-lid="slide_overlay_before_cancel"></span>',
					'</div>',
					'<div class="slide-overlay__action --back js-close-overlay">',
						'<span data-lid="slide_overlay_back"></span>',
					'</div>',
				'</div>'

				].join(''));

		},
		showBeforeOptions: function(){

			var $wrap = $('.slide.--before');

			if( $wrap.length != 1 ){
				return LJ.wlog('Cannot uniquely identify the wrapper');
			}

			LJ.ui.showSlideOverlay( LJ.before.renderBeforeOptions() );

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
				"footer"		: "<button class='--rounded'><i class='icon icon-check'></i></button>"
			})
			.then(function(){
				return LJ.ui.getModalItemIds();

			})
			.then(function( item_ids ){

				var d = LJ.static.renderStaticImage('search_loader')
				$(d).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
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