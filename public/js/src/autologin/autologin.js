	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			return LJ.promise(function( resolve, reject ){

				if( LJ.app_mode == "dev" ){
					var a = document.location.hash;
					if( a == "#me" ){
						return resolve({ 'fb_token' : 'EAAXR2Qo4lc4BAH6wJ4wcpXvaEFrgXjMsKmihajiozbGTUUyDghPEsZB7wqnWiO2CyUhU19NfL5qjPIiYY4On4cYQnTUiefiyZB8l39CZAck8ngPvHsU4yKtF0tLm35qkPv0DPg2DZCnZBRi2qXKB4EQxgwvwqIDAZD' });
					}
					if( a == "#gabriela" ){
						return resolve({ 'fb_token': 'EAAXR2Qo4lc4BADx1dNR5Cz2iSZCduZC05gJ5MsZCkR9uneJBQadFoBI5eXpfmaDVeuiQNSIPQvyP5I9aj7y2Cu6daZCd4EzAJGgZBQCnxlHudEPEpKQHb4yr6f8GkmNMZCiGBgBIMbdGbYDpbZC0uuzeae9MQuGfEnpjgAPAuTxegZDZD' });
					}
					if( a == "#racheel"){
						return resolve({ 'fb_token': 'EAAXR2Qo4lc4BAGfYNotMdxT6iEVy1lURr7RLDw5X5X0ZAsCV6S9GlRw78F3uVrSo4K1AkptOl7ZBhOg31NuSGTtgzOV8Sl0Eg76olbihIZAHPQJe3LxTlzbnScWzt5lG6G0PHw03HAB0ZA5LDw01O9X4QMsoQzsQakHXi2td8QZDZD' });
					}
					if( a == "#davida" ){
						return resolve({ 'fb_token': 'EAAXR2Qo4lc4BAA0I0ZApWf4xmd9KDPDQlgMuXJXfHXct3n02upyYAYd8uzgym7xZB139x0pJHErfkZC83EtH8id3pOVTsU0qCulxSj20PyrB5M6YxJltReAmDyP6ZCPZABj9TSKF8ZCBhnCpaayflhwbUDX0wGe4gZD' });
					}
				}

				if( LJ.app_mode == "staged" ){
					var a = document.location.hash;
					if( a == "#judie" ){
						return resolve({ 'fb_token': 'EAAXR2fF8rkoBAPGHMzOHG5gXdijdcluNphIZAiIZAnvTbjZBSdyzzaV1ybjDZAZCpjlZAjJdn6xR6LL6Kb9gTpVGPOjeKyFkIajfgTumHpoR7QMEVqO83VArGRgugoiZCxQIZCG9jdhXzCpsP5uiZAZAuoUObJsgqMVMDd4bNDFfZA66AZDZD' });
					}
					if( a == "#lin"){
						return resolve({ 'fb_token': 'EAAXR2fF8rkoBAEHZASIFrKxBDXL3wt57yHVoO4hHwm2bAgaQzXEvWdebkSNWPjlAAQI84ZBYJ3ynpn7vx2gl5ZAorxYgUqY7ySJVtS3OorMajWcvrvyXtKNLWI1ZAkixZC7tzID3vnGKUC4hUFDfOkuO1MecKo1wZD' });
					}
					if( a == "#mary" ){
						return resolve({ 'fb_token': 'EAAXR2fF8rkoBAHRj5DKOudMDrCmEwTXLbHCBO4inZABB6klLxu2uqMp26ZCHff8YoikmMc2AZBtCKSVoE8cYdMUCyCm7KXrsxzvv4OYyPQCf6NjaVWFEawyPsVXV48YO58FtuSj14ivBpZAqFPr7rgOvrvD6Us2giRiPqGzFMAZDZD' });
					}
					if( a == '#jenifer' ){
						return resolve({ 'fb_token': 'EAAXR2fF8rkoBAG0J0kmg703N9LhjooHUdUKzOOZCr0bZBZCPO3JjyJ4hNaV2jr1nIG8x7EJzMJbSyKx2rRGeg3V7ZA2cCly5cZBuGzuKyzmpXFKEv1zM0cqxmSyjjziiArZC2hffiwVH03AeJQOmBUHfuWH0tSacnbjC6lIRbu1gZDZD' });
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

				if( LJ.app_mode == "dev" ){
					return reject('Autoreconnexion disabled in dev mode');
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
				var landing_v = 3;
				LJ.log('Starting landing... v' + landing_v );

				$( LJ.static.renderStaticImage('slide_loader') )
					.hide()
					.appendTo('.curtain')
					.velocity('shradeIn', { duration: 800 });

				$('.curtain').find('.slide__loader').velocity('shradeOut', {
					duration: 600,
					complete: function(){
						LJ.ui.hideCurtain({ duration: 800 });
						LJ.landing.activateLanding( landing_v );
									
					}
				})
			});
		}

	});


