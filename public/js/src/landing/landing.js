
	window.LJ.landing = _.merge( window.LJ.landing || {}, {

		activateLanding: function( landing_version ){

			var landing_object = LJ.landing[ "v" + landing_version ];

			if( !landing_object ){
				return LJ.wlog('This version of the landing page (v'+ landing_version +') doesnt exist');
			}

			LJ.textAdd( landing_object.texts );
			$('.multi-landing').html( LJ.ui.render( landing_object.html.join('') ) );
			landing_object.run();

			LJ.login.init()
                .then( LJ.facebook.fetchFacebookToken )
                .then( LJ.start );

		},
		// Common elements that are easily reusable accross different versions 
		// of the landing pages.
		elems: {

			connexion_btn: [

					'<div class="landing-connexion">',
						'<a class="js-no-popup" href="http://www.meefore.com/home"></a>',
					  	'<button class="js-login" data-lid="landing_connexion_btn"></button>',
					'</div>'

				].join('')

			, logo_inverse: [

					'<div class="landing-logo">',
						'<img src="/img/logo/logo_inverse.svg">',
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

					'<div class="landing-facebook-page x--round-icon">',
						'<i class="icon icon-facebook"></i>',
					'</div>'

				].join('')

		}

	});


