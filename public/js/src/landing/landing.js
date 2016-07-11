
	window.LJ.landing = _.merge( window.LJ.landing || {}, {

		activateLanding: function( landing_version ){

			var landing_html = LJ.landing.renderLanding( landing_version );
			$('.multi-landing').html( landing_html );

			LJ.login.init()
                .then( LJ.facebook.fetchFacebookToken )
                .then( LJ.start );

		},
		renderLanding: function( landing_version ){

			// Add the texts that are needed 
			LJ.textAdd( LJ.landing.texts );
			// Render the html
			var landing_object = LJ.landing[ "v" + landing_version ];

			if( !landing_object ){
				return LJ.wlog('This version of the landing page (v'+ landing_version +') doesnt exist');
			}

			return LJ.ui.render( landing_object.html.join('') );

		},
		texts: {

			"landing_browse_title": {
				"fr" :"Trouvez votre before",
				"us": "Find your pregame"
			},
			"landing_browse_subtitle": {
				"fr" :"Repérez les before qui s\'organisent près de chez vous en parcourant la Map.",
				"us": "Spot the pregames around you by browsing the map"
			},
			"landing_cheers_title": {
				"fr" :"Un before vous intéresse ?",
				"us": "Interested in a pregame ?"
			},
			"landing_cheers_subtitle": {
				"fr" :"Envois un Cheers pour montrer ton intérêt",
				"us": "Send a Cheers to show our interest"
			},
			"landing_chat_title": {
				"fr" :"Faites connaissance",
				"us": "Faites connaissance"
			},
			"landing_chat_subtitle": {
				"fr" :"Discutez entre groupes dans le chat",
				"us": "Chat with the other group"
			},
			"landing_privacy": {
				"fr": [
						'En continuant, vous acceptez nos <span class="js-terms landing-bold">Conditions d\'Utilisation</span>',
						'et <span class="js-privacy landing-bold">Politique de Confidentialité.</span>',
						'Nous ne publierons <span class="landing-bold">rien</span> sur Facebook.'
					].join(''),
				"us": [
						'By continuing, you\'re agreeing to our <span class="js-terms landing-bold">Terms</span>',
						'and <span class="js-privacy landing-bold">Confidentiality.</span>',
						'Will will <span class="landing-bold">never</span> publish on Facebook.'
					].join('')
			},
			"landing_connexion_btn": {
				"fr": "Se connecter via <span class=\"landing-bold\">Facebook</span>",
				"us": "Connection with <span class=\"landing-bold\">Facebook</span>"
			},
			"landing_terms": {
				"fr": "Conditions d\'Utilisation",
				"us": "Terms"
			},
			"landing_policy": {
				"fr": "Politique de Confidentialité",
				"us": "Confidentiality"
			},
			"landing_faq": {
				"fr": "FAQ",
				"us": "FAQ"
			},
			"landing_contact" :{
				"fr": "Contact",
				"us": "Contact"
			},
			"landing_facebook_page": {
				"fr": "Page Facebook",
				"us": "Facebook page"
			}

		},
		v0: {
			name: "Blank page",
			desc: "Blank page for test purposes only",
			html: []
		},
		v2: {
			"name": "Landing Light",
			"desc": "Light theme, clear landing with phone in mid screen and almost nothing",

			"html": [
					'<div class="landing">',
					    '<div class="landing-logo --round-icon">',
					      '<span>M</span>',
					    '</div>',
					    '<div class="landing-lang">',
					      '<button class="js-changelang" data-lid="settings_ux_changelang_button"></button>',
					    '</div>',
					    '<div class="landing-body">',
					      '<div class="landing-title">',
					        '<h1 data-lid="landing_browse_title"></h1>',
					      '</div>',
					      '<div class="landing-subtitle">',
					        '<h2 data-lid="landing_browse_subtitle"></h2>',
					      '</div>',
					      '<div class="landing-screenshots">',
					        '<div class="landing__phone">',
					          '<img src="/img/iphone.png" alt=iPhone">',
					        '</div>',
					        '<div class="landing__screenshot">',
					          '<img src="/img/lp.png" alt="Find ur love" width="100%">',
					        '</div>',
					      '</div>',
					      '<div class="landing-bullets">',
					        '<div class="landing__bullet --active"></div>',
					        '<div class="landing__bullet"></div>',
					        '<div class="landing__bullet"></div>',
					        '<div class="landing__bullet"></div>',
					      '</div>',
					      '<div class="landing-privacy">',
					      	'<h3 data-lid="landing_privacy"></h3>',
					      '</div>',
					      '<div class="landing-connexion">',
					        '<button class="js-login" data-lid="landing_connexion_btn"></button>',
					      '</div>',
					    '</div>',
					    '<footer class="landing-footer">',
					      '<div class="landing-footer__item">',
					        '<span data-lid="landing_terms"></span>',
					      '</div>',
					      '<div class="landing-footer__item">',
					        '<span data-lid="landing_policy"></span>',
					      '</div>',
					       '<div class="landing-footer__item">',
					        '<span data-lid="landing_contact"></span>',
					      '</div>',
					       '<div class="landing-footer__item">',
					        '<span data-lid="landing_faq"></span>',
					      '</div>',
					       '<div class="landing-footer__item">',
					        '<span data-lid="landing_facebook_page"></span>',
					      '</div>',
					    '</footer>',
					  '</div>'
					],
				activateScreenshot: function( link ){

				}


		}

	});


