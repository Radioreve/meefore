	
	/*
		This module is responsible for rendering the first view.
		It detects

	*/


	window.LJ.landing = _.merge( window.LJ.landing || {}, {

		init: function(){



		},
		handleDomEvents_Landing: function(){

			$('.js-signup').click(function(e){

				e.preventDefault();

				// First ask Facebook server for a valid token in exchange for user credentials
				// If user has permission ok in his Fb profile, then the app gets access granted automatically
				// Then, ask for /me for facebook profile, append token to the query and the received profile, and request for
				// a app token  on route /auth/facebook. Once the app token has been given, then call all meefore routes
				// with this token;

				FB.login(function( res ){

					LJ.fn.log('Client facebook status is : ' + res.status, 1 ) ;

					if( res.status == 'not_authorized' ){
						LJ.fn.log('User didnt let Facebook access informations, 1');
						return;
					}

					if( res.status == 'connected' ){

						var curtain_delay = 1000;

						$('.curtain').velocity('transition.fadeIn', {
							duration: 1000,
							delay: curtain_delay,
							complete: function(){
								$('.progress_bar--landing').css({ width: '20%' });

								   var loader_tag = LJ.$main_loader_curtain.clone().prop('outerHTML');
									/* Message during login */
								   var tpl = ['<div class="auto-login-message super-centered none">',
								   				'<span>' + LJ.text_source["lp_loading_party"][ LJ.app_language ] + '</span>',
								   				// loader_tag,
								   				'</div>',
								   			 ].join('');

					               $( tpl )
					                    .appendTo('.curtain')
					                    .velocity('transition.fadeIn', {
					                        duration: 1000
					                });

									var access_token = res.authResponse.accessToken;
									LJ.fn.log('short lived access token : ' + access_token );

									FB.api('/me?fields=id,email,name,link,locale,gender', function( facebookProfile ){

										// Surcharge profile with access_token for server processing;
										facebookProfile.access_token = access_token;

										// Store it for reconnexion purposes
										LJ.facebook_profile = facebookProfile;

								  		LJ.fn.loginWithFacebook( facebookProfile );
								  		$('.progress_bar--landing').css({ width: '40%' });
							  		});

								}
							});
						};

				}, { scope: ['public_profile', 'email', 'user_friends', 'user_photos']} );
			});

			$('#contact').click(function(){

				LJ.fn.displayInModal({
					source   : 'local',
					render_cb: LJ.fn.renderContactForm,
					starting_width: 160
				});

			});

			LJ.$body.on('click', '.landing-contact .btn-validate', function(){

				var $self    = $(this);
				var $contact = $('.landing-contact');

				if( $self.hasClass('btn-validating') ) return;

				$self.addClass('btn-validating');

				$('.contact-error').velocity('transition.fadeOut', {
					duration: 600
				});

				setTimeout(function(){

					var name    = $('#contact-name').val().trim();
					var email   = $('#contact-email').val().trim();
					var message = $('#contact-message').val().trim();

					if( name.length == 0 || email.length == 0 || message.length == 0 ){
						$self.removeClass('btn-validating');
						return $('.contact-error')
									.text( LJ.text_source["lp_contact_error_fields"][ LJ.app_language ] )
									.velocity('transition.fadeIn');
					}

					if( !/\S+@\S+/i.test( email ) ){
						$self.removeClass('btn-validating');
						return $('.contact-error')
									.text( LJ.text_source["lp_contact_error_email"][ LJ.app_language ] )
									.velocity('transition.fadeIn');
					}

					// Everything ok, send contact email
					$.ajax({
						method: 'post',
						url: '/landing/contact',
						data: {
							name    : name,
							email   : email,
							message : message
						},
						success: function( data ){
							$('.landing-contact *').velocity('transition.fadeOut', {
								duration: 600,
								complete: function(){
									var txt = LJ.text_source["lp_contact_send_success"][ LJ.app_language ];
									$('.landing-contact').html('<div class="none super-centered contact-send-success">' + txt + '</div>')
												 .find('div')
												 .velocity('transition.fadeIn', {
												 	duration: 600,
												 	complete: function(){
												 		setTimeout(function(){
												 			$('.modal-curtain').click();
												 		}, 1200 );
												 	}
												 })
								}
							})
						},
						error: function( xhr ){
							$self.removeClass('btn-validating');
							return $('.contact-error')
										.text( LJ.text_source["lp_contact_error_generic"][ LJ.app_language ] )
										.velocity('transition.fadeIn');
						}
					})

				}, 500 );

			});

		},
		initLandingPage: function(){

	        $('.curtain').velocity('transition.fadeOut', {
	        	duration: 1500,
	        	delay: 500
	        });

	        LJ.state.lp_i = 0;
			LJ.city_text = [
					"StayHigh, 00h35",
					"NightLovers, 23h23",
					"SoWhat?, 21h20",
					"NiceToMeetYou, 22h49",
					"OneLastRound, 4h01"
				];
				

	        $('.landing-places').typed({
				strings        : [ LJ.city_text[0] ],
				write_duration : 2700,
				backDelay      : 4300,
				back_duration  : 2000
	       	});

	        $('.bxslider').bxSlider({
			  mode: 'fade',
			  auto: true,
			  pause: 9000,
			  speed: 1100,
			  autoControls: true,
			  onSlideBefore: function(){

			  		if( LJ.state.lp_i == LJ.city_text.length - 1 ){
			  			LJ.state.lp_i = 0;
			  		} else {
			  			LJ.state.lp_i += 1;
			  		}
	       			var text = LJ.city_text[ LJ.state.lp_i ];
	       			
	       			$('.landing-places-wrap *:not(.lp-places-hash)').velocity( LJ.ui.slideRightOutLight, {
	       				duration: 800,
	       				complete: function(){
	       					$(this).remove();
	       					$('<span class="landing-places"></span>')
	       						.appendTo('.landing-places-wrap')
	       						.velocity('transition.slideLeftIn', {
	       							duration: 400
	       						});

	       					// Always make sure that kenburns duration = write_duration + backDelay + back_duration
	       					$('.landing-places').typed({
								strings        : [text],
								write_duration : 2300,
								backDelay      : 4300,
								back_duration  : 2000
	       					});

	       				}
	       			});
			  }
			});

		},
		loginWithFacebook: function( facebookProfile ){

				LJ.fn.log('Logging in meefore with facebook profile...', 1);

				// facebookProfile.email = null;
				
				$.ajax({

					method:'POST',
					data: { 
						facebook_id     : facebookProfile.id,
						facebookProfile : facebookProfile
					},
					dataType:'json',
					url:'/auth/facebook',
					success: function( data ){
						LJ.fn.handleSuccessLogin( data );
						$('.progress_bar--landing').css({ width: '60%' });
					},
					error: function( err ){
						LJ.fn.handleServerError( err )
					}

				});

		},
		initAppBoot: function(){

				
		},
		handleSuccessLogin: function( data ){

			LJ.fn.log('Handling success login with fb', 1);
			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 

			LJ.fn.log('Token received: ' + data.accessToken );
			//document.cookie = 'token='+data.accessToken;

			// Make sure all ajax request are don with proper accessToken
			LJ.fn.initAjaxSetup();

			// Typeahead pluggin 
			LJ.fn.initTypeahead();

			// Init Pusher Connexion via public chan 
			LJ.fn.initPusherConnection( LJ.accessToken );

			LJ.fn.say('auth/app', {}, {
				success: function( data ){

					LJ.fn.handleFetchUserAndConfigurationSuccess( data );
					$('.progress_bar--landing').css({ width: '80%' });
				}
			});

		}

	});