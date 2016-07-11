
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',
			'$trigger_logout': '.js-logout',
			'$modal_logout'  : '.modal.--logout',
			'opening_duration': 1000,
			'prompt_duration': 600,
			'prompt_buttons_duration': 900,
			'completed_steps': 0,
			'break_duration': 400,

			'data': {},

			init: function(){

				return LJ.promise(function( resolve, reject ){
					LJ.ui.$body.on('click', '.js-login', resolve );
				});


			},
			showLandingElements: function(){

				var duration = 600;

				$('.landing').find('.landing-logo')
					.velocity('slideLeftIn', {
						duration: duration,
						display : 'flex'
					});

				$('.landing').find('.landing-lang')
					.velocity('slideRightIn', {
						duration: duration,
						display : 'flex'
					});

				$('.landing').find('.landing-body')
					.velocity('shradeIn', {
						duration: duration*2,
						display : 'flex'
					});

				$('.landing').find('.landing-footer')
					.velocity('slideUpIn', {
						duration: duration,
						display : 'flex'
					});


			},
			hideLandingElements: function(){

				$('.landing')
					.children()
					.velocity('shradeOut', {
						duration : 800,
						display  : 'none'
					});

			},
			showLoginProgressBar: function(){

				$('.login__message').velocity('shradeIn', {
			 		duration: 1600, delay: LJ.login.opening_duration/2
			 	});

			},
			addLoginProgression: function(){

				$( LJ.login.renderLoginProgression() ).hide().appendTo( $('.curtain') )

			},
			showLoginProgression: function(){

				$('.login').velocity('shradeIn', {
					duration: 1000
				});

			},
			showLoginProgressMessage: function(){

				$('.login__message').velocity('shradeIn', {
					duration: 1000
				});

			},
			hideLoginProgressBar: function(){

				$('.login__progress-bar').velocity('shradeIn', {
			 		duration: 1000
			 	});

			},
			enterLoginProcess: function(){

				LJ.login.hideLandingElements();
				LJ.ui.deactivateHtmlScroll();

				return LJ.delay( 1000 )
						 .then(function(){

						 	LJ.ui.showCurtain({ duration: 600, theme: "light", sticky: true });
						 	LJ.login.addLoginProgression();
						 	LJ.login.showLoginProgression();
						 	// LJ.login.showLoginProgressMessage();
						 	// LJ.login.showLoginProgressBar();

						 });

			},
			hideLoginSteps: function(){
				return LJ.promise(function( resolve, reject ){

					$('.app').removeClass('nonei');
					$('.landing').remove();

					$('.login__message, .login__progress-bar, .login__loader').velocity('shradeOut', {
						duration: 400,
						complete: resolve
						
					});

				});
			},
			firstSetup: function(){
				// the app requires a user's location to boot properly
				// - to be visible in the search section
				// - to allow for geo requests to fetch the right befores
				// - to allow the map to load in the right city
				var L = LJ.user.location;
				if( L && L.place_id && L.place_name && L.lat && L.lng ){
					return;
				}

				if( LJ.user.access.indexOf('bot') == -1 ){
					LJ.pictures.uploadFacebookPicture_Intro();
				}
				
	            return LJ.login.break()
	            		.then(function(){
	            			return LJ.login.promptUserLocation();

	            		})
	            		.then(function(){
	            			return LJ.login.debreak();

	            		});

			},
			break: function(){
				return LJ.ui.shradeOut( $('.login'), LJ.login.break_duration );

			},
			debreak: function(){
				return LJ.ui.shradeIn( $('.login'), LJ.login.break_duration );

			},
			stepCompleted: function( fill_ratio ){

				if( typeof fill_ratio != "number" ){
					fill_ratio = 33.33;
				}

				LJ.login.completed_steps += 1;
				LJ.login.fillProgressBar( fill_ratio );
			},
			fillProgressBar: function( fill_ratio ){

				var max_width = $('.login__progress-bar').width();
				var add_width = max_width * fill_ratio/100;
				var cur_width = (LJ.login.completed_steps) * add_width;
				var new_width = cur_width + add_width;

				$('.login__progress-bar-bg')
					.css({ 'width':  new_width });

			},
			renderLoginProgression: function(){

				return LJ.ui.render([

					'<div class="login">',
						'<div class="login__loader">',
							LJ.static.renderStaticImage('slide_loader'),
						'</div>',
						'<div class="login__message">',
							'<h1 data-lid="login_loading_msg"></h1>',
						'</div>',
						'<div class="login__progress-bar">',
							'<div class="login__progress-bar-bg"></div>',
						'</div>',
					'</div>'

				].join(''));

			},
			promptUserLocation: function(){
				return LJ.promise(function( resolve, reject ){

					LJ.log('Requesting the user to provide a location...');

					$( LJ.login.renderLocationPrompt() )
						.hide()
						.appendTo('.curtain')
						.velocity('shradeIn', {
							duration: LJ.login.prompt_duration,
							display: 'flex'
						});

					LJ.seek.activatePlacesInFirstLogin();
					LJ.seek.login_places.addListener('place_changed', function(){

						var place = LJ.seek.login_places.getPlace();
						$('.init-location').attr('data-place-id'   , place.place_id )
							  			   .attr('data-place-name' , place.formatted_address )
							  			   .attr('data-place-lat'  , place.geometry.location.lat() )
							  			   .attr('data-place-lng'  , place.geometry.location.lng() );

						LJ.login.showPlayButton();

					});

					// Resolve the promise when the user picked a location
					$('.init-location .action__validate').click(function(){
						var $block = $( this ).closest('.init-location');

						if( $block.hasClass('--validating') ) return
						$block.addClass('--validating');

						LJ.login.updateProfileFirstLogin()
							.then(function(){

								$block
									.removeClass('--validating')
									.velocity('bounceOut', {
										duration : LJ.login.prompt_duration,
										complete : resolve
									});
								

							}, function( err ){
								LJ.wlog('An error occured');
								LJ.log(err);

							});
					});
				});	
			},
			updateProfileFirstLogin: function(){

				LJ.log('Updating user location for the first time...');

				var place_id   = $('.init-location').attr('data-place-id');
				var place_name = $('.init-location').attr('data-place-name');
				var lat        = $('.init-location').attr('data-place-lat');
				var lng        = $('.init-location').attr('data-place-lng');

				if( !( place_id && place_name && lat && lng) ){
					return LJ.wlog('Missing place attributes on the dom, cannot contine with login');
				}

				var update = {};
				update.location = {
					place_name : place_name,
					place_id   : place_id,
					lat 	   : lat,
					lng 	   : lng
				};

				return LJ.api.updateProfile( update )
						  .then(function( exposed ){
							  	LJ.profile.setMyInformations();
							  	return;
						});

			},
			showPlayButton: function(){

				var $elm = $('.init-location').find('.init-location-action');

				if( $elm.css('opacity') != "0" ) return;

				$elm.velocity('bounceInQuick', {
					duration : LJ.login.prompt_buttons_duration,
					display  : 'flex',
					delay    : 500,
					complete : function(){
						$( this ).addClass('pound-light');
					}
				});

			},
			// Do a bunch of functions right before the login happens
			terminateLoginProcess: function(){

				LJ.ui.activateHtmlScroll();

				$('.curtain')
						.children('.login')
						.velocity('bounceOut', {
							duration: LJ.login.prompt_duration
						});

				$('.curtain')
					.children('.login__bg')
					.velocity({ 'opacity': [ 0, 0.09 ]}, {
						duration: LJ.login.prompt_duration/2,
						complete: function(){
							$(this).remove();
						}
					});

				return LJ.ui.hideCurtain({
					delay: LJ.login.prompt_duration * 1.3,
					duration: 1000

				}).then(function(){

					LJ.before.showBrowser();
					LJ.delay( 250 ).then( LJ.before.showCreateBeforeBtn );
					LJ.before.refreshBrowserDates();
					LJ.map.updateMarkers__byDate();
					LJ.ui.$body.on('click', '.js-logout', LJ.login.handleLogout );
					LJ.ui.$body.on('click', '.modal.--logout .modal-footer button', LJ.login.logUserOut );
					
					return
				});	

			},
			renderLocationPrompt: function(){

				return LJ.ui.render([

					'<div class="init-location">',
						'<div class="init-location__title">',
							'<h2 data-lid="init_location_title"></h2>',
						'</div>',
						'<div class="init-location__subtitle">',
							'<input id="init-location__input" type="text" data-lid="init_location_subtitle_placeholder">',
						'</div>',
						'<div class="init-location__splitter"></div>',
						'<div class="init-location__explanation">',
							'<p data-lid="init_location_explanation"></p>',
						'</div>',
						'<div class="init-location__geoloc">',
							'<button data-lid="init_location_geoloc"></button>',
						'</div>',
						'<div class="init-location-action">',
							'<div class="action__validate --round-icon">',
								'<i class="icon icon-play"></i>',
							'</div>',
						'</div>',
					'</div>'

				].join(''));

			},
			handleLogout: function(){

				LJ.ui.showModal({
					"title"	   : LJ.text("logout_title"),
					"subtitle" : LJ.text("logout_subtitle"),
					"type"     : "logout",
					"footer"   : "<button class='--rounded'><i class='icon icon-power'></i></button>"
				});

			},
			logUserOut: function(){

				var p1 = LJ.ui.shadeModal();
				var p2 = LJ.api.updateUser({
					"app_preferences": {
						ux: {
							auto_login: false
						}
					}
				});

				LJ.Promise.all([ p1, p2 ]).then(function(){
					LJ.store.remove('facebook_access_token');
					location.reload();
				});

			}


	});