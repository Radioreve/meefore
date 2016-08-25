
window.LJ.landing = _.merge( window.LJ.landing || {}, {

	v1: {

		"name": "Landing Light",
		"desc": "Light theme, clear landing with phone in mid screen and almost nothing",

		"texts": {
			"landing_browse_title": {
				"fr" :"On part en soirée ?",
				"us": "Are we going out tonight ?"
			},
			"landing_browse_subtitle": {
				"fr" :"Participez à des before près de chez vous",
				"us": "Spot the pregames around you by browsing the map"
			},
			"landing_cheers_title": {
				"fr" :"Un before t'intéresse ?",
				"us": "Interested in a pregame ?"
			},
			"landing_cheers_subtitle": {
				"fr" :"Envoi un Cheers pour montrer ton intérêt",
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
		"html": [
			'<div class="landing x--v1">',
			    LJ.landing.elems.logo_brand,
			    LJ.landing.elems.change_lang,
			    LJ.landing.elems.facebook_page,
			      '<div class="landing-title">',
			        '<h1 data-lid="landing_browse_title"></h1>',
			      '</div>',
			      '<div class="landing-subtitle">',
			        '<h2 data-lid="landing_browse_subtitle"></h2>',
			      '</div>',
		          '<div class="landing__phone">',
			          '<img src="/img/iphone4.png" alt=iPhone">',
				      LJ.landing.elems.connexion_btn,
		          '</div>',
			      '<div class="landing-bullets">',
			        '<div class="landing__bullet x--active"></div>',
			        '<div class="landing__bullet"></div>',
			        '<div class="landing__bullet"></div>',
			        '<div class="landing__bullet"></div>',
			      '</div>',
			    	LJ.landing.elems.privacy,
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
		run: function(){

			LJ.ui.deactivateHtmlScroll();

		}


	}

});