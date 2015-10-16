
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Landing: function(){

			$('#facebook_connect, .landing-map-button').click(function(e){

				e.preventDefault();

				// First ask Facebook server for a valid token in exchange for user credentials
				// If user has permission ok in his Fb profile, then the app gets access granted automatically
				// Then, ask for /me for facebook profile, append token to the query and the received profile, and request for
				// a app token  on route /auth/facebook. Once the app token has been given, then call all meefore routes
				// with this token;

				FB.login(function( res ){

					delog('Client facebook status is : ' + res.status ) ;

					if( res.status == 'not_authorized' ){
						LJ.state.loggingIn = false;
						delog('User didnt let Facebook access informations');
						return;
					}

					if( res.status == 'connected' ){

						$('.curtain').velocity('transition.fadeIn', {
							duration: 800
						});

					   var loader_tag = LJ.$main_loader_curtain.clone().prop('outerHTML');
						/* Message during login */
					   var tpl = ['<div class="auto-login-msg super-centered none">',
					   				'<span>' + LJ.text_source["lp_loading_party"][ LJ.app_language ] + '</span>',
					   				loader_tag,
					   				'</div>',
					   			 ].join('');

		               $( tpl )
		                    .appendTo('.curtain')
		                    .velocity('transition.fadeIn', {
		                        duration: 1000,
		                        delay: 1000
		                });

		                $('.progress_bar--landing').css({ width: '20%' });

						LJ.state.loggingIn = true;
						var access_token = res.authResponse.accessToken;
						delog('short lived access token : ' + access_token );

						FB.api('/me', function( facebookProfile ){

							facebookProfile.access_token = access_token;
					  		LJ.fn.loginWithFacebook( facebookProfile );
					  		$('.progress_bar--landing').css({ width: '40%' });
				  		});

					}

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

	        $('.landing-kenburns').Kenburns({
	        	images: ['img/kb/bg1-min.jpg','img/kb/bg2-min.jpg','img/kb/bg3-min.jpg','img/kb/bg4-min.jpg','img/kb/bg5-min.jpg','img/kb/bg6-min.jpg'],
	        	scale: 0.92,
	        	duration: 8000,
	        	fadeSpeed: 1500,
	        	ease3d: 'ease-out',
	        	onSlideComplete: function(){

	        		var city_text = ["Julie Simsons","Célina Helloworld", "Morgane Labelle", "Sylvie Larson", "Christiana", "Marion"];
	        		var slide_index = this.getSlideIndex();
	       			var $img = $('.kb-slide').eq( slide_index );
	       			var text = city_text[ slide_index ];
	       			
	       			$('.landing-places-wrap *:not(.icon)').velocity( LJ.ui.slideRightOutLight, {
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
	       						strings: [text],
	       						write_duration: 3300,
	       						backDelay: 3300,
	       						back_duration: 1000
	       					});

	       				}
	       			})


			    },
			    onLoadingComplete: function(){
			        console.log('image loading complete');

			    }
	        }).append('<div class="kenburns-overlay"></div>');
	        

		},
		autoLogin: function(){

			/* Message during login */
           $('<div class="auto-login-msg super-centered none">' + LJ.text_source["lp_loading_party"][ LJ.app_language ] + '</b></div>')
                .appendTo('.curtain')
                .velocity('transition.fadeIn', {
                    duration: 1000
            });

			setTimeout( function(){

				LJ.fn.GraphAPI('/me', function( facebookProfile ){
					delog( facebookProfile );
			  		LJ.fn.loginWithFacebook( facebookProfile );
	  			});

			}, 400 );
		},
		loginWithFacebook: function( facebookProfile ){

				delog('Logging in meefore with facebook profile...');
				$.ajax({

					method:'POST',
					data: { facebook_id: facebookProfile.id, facebookProfile: facebookProfile },
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

			var ls = window.localStorage;

			if( !ls || !ls.getItem('preferences') ){
				delog('No local data available, initializing lp...');
				return LJ.fn.initLandingPage();
			}

			preferences = JSON.parse( ls.getItem('preferences') );

			tk_valid_until = preferences.tk_valid_until;
			long_lived_tk  = preferences.long_lived_tk;

			if( !tk_valid_until || !long_lived_tk ){
				delog('Missing init preference param, initializing lp...');
				return LJ.fn.initLandingPage();
			}
			
			if( moment( new Date(tk_valid_until) ) < moment() ){
				delog('long lived tk found but has expired');
				return LJ.fn.initLandingPage();
			} 

			var current_tk_valid_until = moment( new Date(tk_valid_until) );
			var now  = moment();
			var diff = current_tk_valid_until.diff( now, 'd' );

			if( diff < 30 ) {
				delog('long lived tk found but will expire soon, refresh is needed');
				return LJ.fn.initLandingPage();
			}

			delog('Init data ok, auto logging in...');
			return LJ.fn.autoLogin();
				
		},
		handleSuccessLogin: function( data ){

			delog('Handling success login with fb');
			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 

			console.log('Token received: ' + data.accessToken );
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