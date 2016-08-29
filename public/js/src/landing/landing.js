
	window.LJ.landing = _.merge( window.LJ.landing || {}, {

		activateLanding: function( landing_version ){

			$('<link rel="stylesheet" href="/css/src/landing/landing_v'+ landing_version +'.css">').appendTo('head');
			$.getScript('js/src/landing/landing_v'+ landing_version +'.js', function(){
			
				var landing_object = LJ.landing[ "v" + landing_version ];

				if( !landing_object ){
					return LJ.wlog('This version of the landing page (v'+ landing_version +') doesnt exist');
				}

				LJ.textAdd( _.merge( {}, LJ.landing.texts, landing_object.texts  ));
				$('.multi-landing').html( LJ.ui.render( landing_object.html ) );
				landing_object.run();

				LJ.login.init()
	                .then( LJ.facebook.fetchFacebookToken )
	                .then( LJ.start );
	                
			});

		},
		texts: {

			"landing_h1": {
				"fr": "Blank",
				"us": "Blank"
			},
			"landing_h2": {
				"fr": "blank",
				"us": "blank"
			},
			"landing_change_lang": {
				"fr": "Langue",
				"us": "Language"
			},
			"landing_privacy": {
				"fr": [
						'En continuant, tu acceptes nos <span class="js-terms landing-bold">Conditions d\'Utilisation</span>',
						' et <span class="js-privacy landing-link">Politique de Confidentialité.</span>'
					].join(''),
				"us": [
						'By continuing, you\'re agreeing to our <span class="js-terms landing-bold">Terms</span>',
						'and <span class="js-privacy landing-link">Confidentiality.</span>'
					].join('')
			},
			"landing_connexion_btn": {
				"fr": "Connexion via <span class=\"landing-link\">Facebook</span>",
				"us": "Connection with <span class=\"landing-link\">Facebook</span>"
			},
			"landing_publish": {
				"fr": 'Nous ne publierons <span class="landing-bold">rien</span> sur Facebook.',
				"us": 'We will <span class="landing-bold">never</span> publish on Facebook.'
			},
			"landing_footer_faq": {
				"fr": "FAQ",
				"us": "FAQ"
			},
			"landing_footer_privacy": {
				"fr": "Conditions d'utilisation",
				"us": "Terms of use"
			},
			"landing_footer_facebook": {
				"fr": "Page Facebook",
				"us": "Facebook page"
			},
			"landing_footer_contact": {
				"fr": "Contact",
				"us": "Contact"
			}

		},
		// Common elements that are easily reusable accross different versions 
		// of the landing pages.
		elems: {

			publish: [

					'<div class="landing-publish">',
						'<span data-lid="landing_publish"></span>',
					'</div>'

				].join('')

			, connexion_btn: [

					'<div class="landing-connexion">',
						'<a class="js-no-popup" href="http://www.meefore.com/home"></a>',
					  	'<button class="js-login">',
					  		'<div data-lid="landing_connexion_btn"></div>',
					  		'<i class="icon icon-facebook"></i>',
					  	'</button>',
					'</div>'

				].join('')

			, logo: [

					'<div class="landing-logo">',
						'<img src="/img/logo/logo.svg">',
					'</div>'

				].join('')

			, logo_inverse: [

					'<div class="landing-logo x--inverse">',
						'<img src="/img/logo/logo_inverse.svg">',
					'</div>'

				].join('')

			, logo_naked: [

					'<div class="landing-logo x--naked">',
						'<img src="/img/logo/logo_naked.svg">',
					'</div>'

				].join('')

			, logo_brand: [

					'<div class="landing-logo x--brand">',
						'<img src="/img/logo/logo_brand.svg">',
					'</div>'

				].join('')

			, logo_rounded: [

					'<div class="landing-logo x--rounded">',
						'<img src="/img/logo/logo_rounded.svg">',
					'</div>'

				].join('')


			, change_lang: [

					'<div class="landing-lang">',
						'<button class="js-changelang" data-lid="landing_change_lang"></button>',
					'</div>'

				].join('')

			, privacy: [

					'<div class="landing-privacy">',
						'<h3 data-lid="landing_privacy"></h3>',
					'</div>'

				].join('')

			, facebook_page: [

					'<div class="landing-facebook-page x--round-icon js-landing-facebook">',
						'<i class="icon icon-facebook"></i>',
					'</div>'

				].join('')

			, h1: [

					'<div class="landing__h1">',
						'<h1 data-lid="landing_h1"></h1>',
					'</div>'

			].join('')

			, h2: [

					'<div class="landing__h2">',
						'<h2 data-lid="landing_h2"></h2>',
					'</div>'

			].join('')

			, footer_flat: [

					'<div class="landing-footer">',
						'<div class="landing-footer__item js-landing-faq">',
							'<span data-lid="landing_footer_faq"></span>',
						'</div>',
						'<div class="landing-footer__item js-landing-contact">',
							'<span data-lid="landing_footer_contact"></span>',
						'</div>',
						'<div class="landing-footer__item js-landing-privacy">',
							'<span data-lid="landing_footer_privacy"></span>',
						'</div>',
						// '<div class="landing-footer__item js-landing-facebook">',
						// 	'<span data-lid="landing_footer_facebook"></span>',
						// '</div>',
					'</div>'

				].join('')

		}

	});


