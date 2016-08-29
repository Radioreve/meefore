
window.LJ.landing = _.merge( window.LJ.landing || {}, {

	v3: {

		"name": "Landing Ben",
		"desc": "Landing with background image, flashy colored overlay and big phones",

		"texts": {
			
			"landing_h1": {
				"fr": "Des rencontres <span class='landing-avant'>avant</span> d'aller en soirée",
				"us": "Hello."
			},
			"landing_h2": {
				"fr": "N’attends plus d'être en soirée pour faire de nouvelles rencontres.<br>Connecte-toi et repère chaque jour les before qui s'organisent près de chez toi.",
				"us": "N’attends plus d'être en soirée pour faire de nouvelles rencontres.<br>Connecte-toi et repère chaque jour les before qui s'organisent près de chez toi."
			}
		},
		"html": [
			'<div class="landing x--v3">',

				'<div class="landing-layer landing-background"></div>',
				'<div class="landing-layer landing-overlay"></div>',
				'<div class="landing-layer landing-content">',

					LJ.landing.elems.logo_naked,
					LJ.landing.elems.facebook_page,
					LJ.landing.elems.change_lang,

					'<div class="landing-hero">',
						LJ.landing.elems.h1,
						LJ.landing.elems.h2,
						LJ.landing.elems.connexion_btn,
						// LJ.landing.elems.privacy,
						LJ.landing.elems.publish,
					'</div>',

					'<div class="landing-screenshots">',
						'<div class="landing__screenshot x--1">',
							'<img data-lid="img_landing_iphone_before" src="/img/landing/iphone_before_tp_'+ LJ.lang.getAppLang() +'.png">',
						'</div>',
						'<div class="landing__screenshot x--2">',
							'<img data-lid="img_landing_iphone_map" src="/img/landing/iphone_chat_tp_'+ LJ.lang.getAppLang() +'.png">',
						'</div>',
						'<div class="landing__screenshot x--3">',
							'<img data-lid="img_landing_iphone_chat" src="/img/landing/iphone_map_tp_'+ LJ.lang.getAppLang() +'.png">',
						'</div>',
					'</div>',

					LJ.landing.elems.footer_flat,
					'<div class="landing-footerlay"></div>',

				'</div>',

			'</div>'
			],
		run: function(){

			if( LJ.isMobileMode() ){
				$('.landing-connexion').addClass('x--fire');
			} else {
				$('.landing-connexion').addClass('x--bald');
			}
			
			LJ.ui.deactivateHtmlScroll();

			$('body').on('click', '.js-landing-facebook', function(){
				window.open("https://www.facebook.com/meefore");
			});

			$('body').on('click', '.js-landing-contact', function(){

			});

			$('body').on('click', '.js-landing-faq', function(){

			});

			$('body').on('click', '.js-landing-privacy', function(){
				window.open("/legals");
			});

			LJ.delay( 2000 )
				.then(function(){

					$('.landing-avant').append(
						[

							'<svg width="186px" height="22px" viewBox="-4 0 186 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
								'<path d="M0,4.8768025 C8.69922932,4.8768025 121.382104,2 168.792189,2 C216.202275,2 26.3856446,8.23981271 16.7336426,15.4152269 C9.77598573,19.2017481 98.4125824,15.4152269 139.865845,15.4152269" transform="rotate(1)"></path>',
							'</svg>'

						].join(''));

					$('.landing-avant').addClass('start-anim');
				});

		}


	}

});