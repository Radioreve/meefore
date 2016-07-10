	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			LJ.login.hideLandingElements();

			return LJ.promise(function( resolve, reject ){

				if( document.location.hash == "#1" ){
					LJ.log('Logging in with test user Victoriale...');
					var tk = "EAAXR2Qo4lc4BAChEDRcMA17PowABdrp711d8Fl03VzjB1ptsqMFaKn2jhB4xOF70HpTfELjUVTtcSkJN1Ju9s0WZA5o1Rrez9uW0mgXsbJsxCMe650gLb3o92MLugROZAuQTKsAC2ZAMNwCSJwxIk1sLTEpv5kZD";
					return resolve( tk );
				}

				if( document.location.hash == "#2" ){
					LJ.log('Logging in with test user Angelah...');
					var tk = "EAAXR2Qo4lc4BAMUbS4HfY6Uvk5sM1HkOpan12pCAd3tCZAZCGrXGPJXJBj8dazV5OMDqx6aCuX09VfZAb8CVqeEOfmGyCUUoSUzSHmng6GX9FWtpuzCdAPpVzWFxHXWE2VPjb4ybUCQ6ZClAggtLlNn232EZASEIZD";
					return resolve( tk );
				}

				if( document.location.hash == "#3" ){
					LJ.log('Logging in with test user Davida...');
					var tk = "EAAXR2Qo4lc4BAOEKyewke6ibcU0zB0BvxJSyKdNsOdJFzTGD52MB1QFA1Ay3HHG1XD9WF747zF88rrBmZCODWXHx46Jp8hEWxi5PTZC3G9zjH4pyaZCcj586ZAZAvBExU0Jt8aKfVC9LR2XAzvjGBq8chED7EGlUZD";
					return resolve( tk );
				}

				// Quick reference to the local store
				var s = LJ.store;

				if( !s.get('facebook_access_token') ){
					return reject('No local data available, initializing lp...');
				}

				var facebook_access_token = s.get('facebook_access_token');

				var token      = facebook_access_token.token;
				var expires_at = facebook_access_token.expires_at;

				if( !token || !expires_at ){
					return reject('Missing init preference param, initializing lp...');
				}

				if( moment( expires_at ) < moment() ){
					return reject('Facebook token found but has expired, initializing lp...');
				} 

				var remaining_days  = moment( expires_at ).diff( moment(), 'd' );
				if( remaining_days < 30 ) {
					return reject('Facebook token found but will expire soon, refresh is needed.');
				}

				// Unexpected error
				if( s.get('reconnecting') && !token ){
					return reject('User trying to reconnect but missing token from local store (unexpected)');
				}

				// Check if the app is trying to reconnect him 
				if( s.get('reconnecting') && token ){
					LJ.log('Reconnecting user from previous loss of connexion...');
					s.remove('reconnecting');
					return resolve( token );
				}

				if( s.get("autologin") == false ){
					return reject("Autologin isnt activated, initializing lp...");
				}

				LJ.log('Init data ok, auto logging in...');
				resolve( token );
							
			});
		},
		startLogin: function( facebook_token ){
			return LJ.promise(function( resolve, reject ){
				LJ.log('Starting login...');
				LJ.start( facebook_token );
			});

		},
		startLanding: function( message ){
			return LJ.promise(function( resolve, reject ){
				LJ.log( message );
				LJ.log('Starting landing...');

				$( LJ.static.renderStaticImage('slide_loader') )
					.hide()
					.appendTo('.curtain')
					.velocity('shradeIn', { duration: 800 });

				$('.curtain').find('.slide__loader').velocity('shradeOut', {
					duration: 600,
					complete: function(){
						LJ.ui.hideCurtain({ duration: 800 });
						LJ.login.showLandingElements();
						
					}
				})
			});
		}

	});


