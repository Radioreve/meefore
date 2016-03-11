
	window.LJ.analytics = _.merge( window.LJ.analytics || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.analytics.initGoogleAnalytics();
				resolve();

			});

		},
		initGoogleAnalytics: function(){

			// Google Analytics Tracking Landing Page
			$('body').on('ga', function( e, data ){
				LJ.fn.log( data );
				ga('send', data.hit_type, data.url );
			});

			var tracked_elements = [];

			// Elements relative to the Landing Page
			tracked_elements.concat([
			
				{ el : '#landingWrap #facebook_connect', url: '/landingpage/connection-top' },
				{ el : '#landingWrap .landing-map-button', url: '/landingpage/connection-bottom' },
				{ el : '#landingWrap .moving-arrow', url: '/landingpage/movingarrow' },
				{ el : '#landingWrap .pick-lang[data-code="fr"]:not(.active)', url: '/landingpage/changelang/fr' },
				{ el : '#landingWrap .pick-lang[data-code="en"]:not(.active)', url: '/landingpage/changelang/en'},
				{ el : '#landingWrap [href="/legals"', url: '/landingpage/legals' },
				{ el : '#landingWrap #contact', url: '/landingpage/contact' },
				{ el : '#landingWrap .icon-facebook', url: '/landingpage/socials/facebook '},
				{ el : '#landingWrap .icon-twitter', url: '/landingpage/socials/twitter '},
				{ el : '#landingWrap .icon-youtube', url: '/landingpage/socials/youtube '},
				{ el : '#landingWrap .icon-instagram', url: '/landingpage/socials/instagram '}
				
			]);

			// Elements relative to the Main Page
			tracked_elements.concat([

				{ el : '#profile', url: '/mainpage/profile' },
				{ el : '#events', url: '/mainpage/events' },
				{ el : '#settings', url: '/mainpage/settings' }

			]);

			tracked_elements.forEach(function( element ){

				var $el = $( element.el );

				if( $el.length == 0 ){
					return LJ.fn.warn('Cant track element ' + element.el + ', doesnt exist');
				}

				// Send to Google Analytics
				$el.on('click', function(){
					LJ.fn.log('Tracked a click');
					ga('send', 'pageview', element.url );
				});
				
			});

		}

	});