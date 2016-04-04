
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',
			'opening_duration': 1000,
			'prompt_duration': 600,
			'prompt_buttons_duration': 600,
			'completed_steps': 0,

			'data': {},

			init: function(){
				return LJ.promise(function( resolve, reject ){
					LJ.login.bindDomEvents( resolve, reject );
				});
			},
			bindDomEvents: function( resolve, reject ){
				$( LJ.login.$trigger_login ).on('click', resolve );
			},
			enterLoginProcess: function(){

				LJ.ui.showCurtain({
					duration: LJ.login.opening_duration
				});

				LJ.ui.deactivateHtmlScroll();

				return LJ.delay( 1000 )
						 .then(function(){
						 	$( LJ.login.renderLoginProgression() )
								.appendTo( $('.curtain') )
								.hide()
								.velocity('fadeIn', {
									duration: 2000,
									delay: LJ.ui.opening_duration
								});
							return LJ.Promise.resolve();
						 });

			},
			hideLoginSteps: function(){
				return LJ.promise(function( resolve, reject ){

					$('.app').removeClass('nonei');
					$('.landing').remove();

					$('.login').velocity('fadeOut', {
						duration: 400,
						complete: resolve
						
					});

				});
			},
			stepCompleted: function( fill_ratio ){

				if( typeof fill_ratio != "number" ){
					fill_ratio = 25;
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
						'<div class="login__message">',
							'<h1 data-lid="login_loading_msg"></h1>',
						'</div>',
						'<div class="login__progress-bar">',
							'<div class="login__progress-bar-bg"></div>',
						'</div>',
						// '<div class="login-steps">',
						// 	'<div class="login-steps__step">Etape 1</div>',
						// 	'<div class="login-steps__step">Etape 2</div>',
						// 	'<div class="login-steps__step">Etape 3</div>'
						// '</div>',
					'</div>'

				].join(''));

			},
			promptUserLocation: function(){
				return LJ.promise(function( resolve, reject ){
					// the app requires a user's location to boot properly
					// otherwise, use would be invisible in the search section
					if( LJ.user.location && LJ.user.location.place_name && LJ.user.location.place_id ){
						return resolve();
					}

					LJ.log('Requesting the user to provide a location...');

					$( LJ.login.renderLocationPrompt() )
						.hide()
						.appendTo('.curtain')
						.velocity('bounceInQuick', {
							duration: LJ.login.prompt_duration,
							display: 'flex'
						});

					LJ.seek.activatePlacesInFirstLogin();
					LJ.seek.login_places.addListener('place_changed', function(){

						var place = LJ.seek.login_places.getPlace();
						$('.init-location').attr('data-place-id'   , place.place_id )
							  			   .attr('data-place-name' , place.formatted_address );

						LJ.login.showPlayButton();

					});

					// Resolve the promise when the user picked a location
					$('.init-location .action__validate').click(function(){
						var $block = $(this).closest('.init-location');

						if( $block.hasClass('--validating') ) return
						$block.addClass('--validating');

						LJ.login.updateProfileFirstLogin()
							.then(function(){
								$block.removeClass('--validating');
								resolve();
							}, function( err ){
								LJ.wlog('An error occured');
								LJ.log(err);
							});
					});
				});	
			},
			updateProfileFirstLogin: function(){
				return LJ.promise(function( resolve, reject ){

					LJ.log('Updating user location for the first time...');

					var place_id   = $('.init-location').attr('data-place-id');
					var place_name = $('.init-location').attr('data-place-name');

					if( !place_id || !place_name ){
						return LJ.wlog('Unable to find place attributes: place_id=' + place_id +', formatted_address=' + place_name );
					}

					var update = {};
					update.location = {
						place_name : place_name,
						place_id   : place_id
					};

					LJ.api.updateProfile( update )
					  .then(function( exposed ){
					  	LJ.user.location = exposed.user.location;
					  	LJ.profile.setMyInformations();
					  	resolve();
					  }, reject );

				});

			},
			showPlayButton: function(){

				$('.init-location').find('.action__cancel')
							.velocity('bounceOut', {
								duration: LJ.login.prompt_buttons_duration,
								display: 'none'
							});

				$('.init-location').find('.action__validate')
					.velocity('bounceInQuick', {
						duration: LJ.login.prompt_buttons_duration,
						delay: LJ.login.prompt_buttons_duration,
						display: 'flex'
					});

			},
			terminateLoginProcess: function(){
				return LJ.promise(function( resolve, reject ){

					LJ.ui.activateHtmlScroll();
					
					$('.curtain')
							.children()
							.velocity('bounceOut', {
								duration: LJ.login.prompt_duration
							});

					LJ.ui.hideCurtain({
						delay: LJ.login.prompt_duration * 1.3,
						duration: 1000,
						complete: function(){
							LJ.ui.showToast('Bienvenue sur Meefore');
							resolve();
						}
					});


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
							'<div class="action__cancel --round-icon">',
								'<i class="icon icon-pause"></i>',
							'</div>',
						'</div>',
					'</div>'

				].join(''));

			}


	});