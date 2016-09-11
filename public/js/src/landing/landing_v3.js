
window.LJ.landing = _.merge( window.LJ.landing || {}, {

	v3: {

		"name": "Landing Ben",
		"desc": "Landing with background image, flashy colored overlay and big phones",

		"texts": {
			
			"landing_h1": {
				"fr": "Des rencontres <span class='landing-avant'>avant</span> d'aller en soirée",
				"us": "Meet people <span class='landing-avant'>before</span> partying"
			},
			"landing_h2": {
				"fr": "N’attends plus d'être en soirée pour faire de nouvelles rencontres.<br>Connecte-toi et repère chaque jour les before qui s'organisent près de chez toi.",
				"us": "No longer wait to be at a party to meet new people.<br>Sign up and take part to predrinks organized around you."
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

					'<div class="landing-oneshot">',
						'<img data-lid="img_landing_iphone_before" src="/img/landing/iphone_before_tp_' + LJ.lang.getAppLang() +'.png">',
						LJ.landing.elems.connexion_btn,
					'</div>',

					LJ.landing.elems.footer_flat,
					'<div class="landing-footerlay"></div>',

				'</div>',

			'</div>'
			],
		run: function(){

			if( LJ.isMobileMode( 700 ) ){
				$('.landing-connexion').addClass('x--fire');
			} else {
				$('.landing-connexion').addClass('x--bald');
			}
			
			LJ.ui.deactivateHtmlScroll();

			$('body').on('click', '.js-landing-facebook', function(){
				window.open("https://www.facebook.com/meefore");
			});

			$('body').on('click', '.js-landing-contact', function(){
				window.location.href = "mailto:team@meefore.com";
			});

			$('body').on('click', '.js-landing-faq', function(){
				LJ.ui.showModal({
					"type"      	: "landing-faq",
					"title"			: LJ.text('landing_faq_title'),
					"subtitle"		: LJ.text('landing_faq_subtitle'),
					"body"  		: LJ.landing.renderFaq(),
					"jsp_body" 	    : true
				});
			});

			$('body').on('click', '.js-landing-privacy', function(){
				window.open("/legals");
			});

			// Make sure the header is always at the "right" position
			(function adjustPose(){
				LJ.delay( 100 ).then(function(){
					$('.landing__h1').css({ 'top': $('.landing-oneshot').offset().top - 50 });
				});
			})();


			// Display the "underline"
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