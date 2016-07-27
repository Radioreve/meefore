	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			return LJ.promise(function( resolve, reject ){

				if( LJ.app_mode == "dev" ){
					
					var a = document.location.hash;
					if( a == "#0" ){
						return resolve({ 'fb_token' : 'EAAXR2Qo4lc4BAH6wJ4wcpXvaEFrgXjMsKmihajiozbGTUUyDghPEsZB7wqnWiO2CyUhU19NfL5qjPIiYY4On4cYQnTUiefiyZB8l39CZAck8ngPvHsU4yKtF0tLm35qkPv0DPg2DZCnZBRi2qXKB4EQxgwvwqIDAZD' });
					}
					if( a == "#1" ){
						return resolve({ 'fb_token': 'EAAXR2Qo4lc4BADx1dNR5Cz2iSZCduZC05gJ5MsZCkR9uneJBQadFoBI5eXpfmaDVeuiQNSIPQvyP5I9aj7y2Cu6daZCd4EzAJGgZBQCnxlHudEPEpKQHb4yr6f8GkmNMZCiGBgBIMbdGbYDpbZC0uuzeae9MQuGfEnpjgAPAuTxegZDZD' });
					}

				}

				var code;
				try {
					code  = document.location.href.split('code=')[ 1 ].split(/&|#/i)[ 0 ];
				} catch( e ){ }

				var token;
				try {
					token = document.location.href.split('access_token=')[ 1 ].split(/&|#/i)[ 0 ];
				} catch( e ){ }


				if( history && history.pushState ){
					history.pushState( {}, document.title, window.location.pathname );
				}

				if( code ){
					return resolve({ fb_code: code });
				}

				if( token ){
					return resolve({ fb_token: token });
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
					return resolve({ fb_token: token });
				}

				if( s.get("autologin") == false ){
					return reject("Autologin isnt activated, initializing lp...");
				}

				LJ.log('Init data ok, auto logging in...');
				resolve({ fb_token: token });
							
			});
		},
		startLogin: function( login_params ){
			return LJ.promise(function( resolve, reject ){
				LJ.log('Starting login...');
				LJ.start( login_params );
			});

		},
		startLanding: function( message ){
			return LJ.promise(function( resolve, reject ){
				LJ.log( message );
				LJ.log('Starting landing... v' + 1 );

				$( LJ.static.renderStaticImage('slide_loader') )
					.hide()
					.appendTo('.curtain')
					.velocity('shradeIn', { duration: 800 });

				$('.curtain').find('.slide__loader').velocity('shradeOut', {
					duration: 600,
					complete: function(){
						LJ.ui.hideCurtain({ duration: 800 });
						LJ.landing.activateLanding( 2 );
									
					}
				})
			});
		}

	});


