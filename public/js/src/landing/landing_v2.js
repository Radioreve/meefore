
	window.LJ.landing = _.merge( window.LJ.landing || {}, {

		v2: {

			"name": "Landing Ben",
			"desc": "Landing with background image, flashy colored overlay and big phones",

			"texts": {
				
				"landing_h1": {
					"fr": "Des rencontres avant d'aller en soirée",
					"us": "Hello."
				},
				"landing_h2": {
					"fr": "N’attends plus d'être en soirée pour faire de nouvelles rencontres. Connecte-toi et repère chaque jour les before qui s'organisent près de chez toi.",
					"us": "N’attends plus d'être en soirée pour faire de nouvelles rencontres. Connecte-toi et repère chaque jour les before qui s'organisent près de chez toi."
				}
			},
			"html": [
				'<div class="landing x--v2">',

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
								'<img src="/img/landing/iphone_before.png">',
							'</div>',
							'<div class="landing__screenshot x--2">',
								'<img src="/img/landing/iphone_map.png">',
							'</div>',
							'<div class="landing__screenshot x--3">',
								'<img src="/img/landing/iphone_chat_fr.png">',
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
					window.open("/privacy");
				});

			}


		}

	});