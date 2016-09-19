
	window.LJ.lang = _.merge( window.LJ.lang || {}, {

		'supported_languages': ['fr','us'],

		init: function(){

			LJ.Promise.resolve()
				   .then( LJ.lang.findAppLang )
				   .then( LJ.lang.setAppLang )
				   .then( LJ.lang.translateApp )
				   .then( LJ.lang.handleDomEvents )

		},
		handleDomEvents: function(){

			$('body').on('click', '.js-changelang', LJ.lang.changeAppLang );

		},
		sayCheers: function(){

			// return "Cheers";

			return _.shuffle([

				'Santé',
				'Saluti',
				'Cheers',
				'Skål',
				'Na zdrowie',
				'Noroc',
				'Salud',
				'Chok dee',
				'Kanpai',
				'Prost',
				'Kippis'

			])[ 0 ] + ' !';

		},
		getAppLang: function(){

			return LJ.lang.app_language;

		},
		setAppLang: function( app_language ){
			return LJ.promise(function( resolve, reject ){

				if( !LJ.lang.isLangSupported( app_language ) ){
					return console.error('This language (' + app_language + ') is not currently supported');
				}
					

				// Internal state variable
				LJ.lang.app_language = app_language;

				// Dom update
				$('.app-lang').find('i').removeClass('x--active');
				$('.app-lang').find('[data-cc="' + app_language + '"]').addClass('x--active');

				// Local storage update
				LJ.store.set('app_language', app_language )
				

				return resolve();
			});

		},
		findAppLang: function(){
			return LJ.promise(function( resolve, reject ){

				var app_language;

				if( LJ.store.get("app_language") ){
					app_language = LJ.store.get('app_language');
				} else {
					app_language = "fr";
				}

				return resolve( app_language );		

			});

		},
		isLangSupported: function( app_language ){

			return LJ.lang.supported_languages.indexOf( app_language ) == -1 ? false : true;

		},
		translateApp: function(){

			LJ.lang.translate('body');

		},	
		translate: function( container, options ){

			options = options || {};
			
			app_language = options.app_language || LJ.lang.getAppLang();

			if( ! LJ.lang.isLangSupported( app_language ) ){
				return LJ.elog('This language (' + app_language + ') is not currently supported');
			}
			
			var $container = container instanceof jQuery ? container : $( container );


			$container.find('[data-lid]').each(function( i, el ){
				
				var $el  = $(el);
				var type = $el.prop('nodeName').toLowerCase();
				var lid  = $el.attr('data-lid');
				var lpm  = $el.attr('data-lpm') && $el.attr('data-lpm');
				var lpmt = $el.attr('data-lpmt') && $el.attr('data-lpmt');


				if( /img/i.test( lid ) ){
					var src     = $el.attr('src');
					var rg      = new RegExp( LJ.lang.supported_languages.join('|') );
					var new_src = src.replace( rg, app_language );
					$( el ).attr('src', new_src );
					return;
				}

				var text_object = LJ.text_source[ lid ];
				if( !text_object ){
					return LJ.elog('Cannot find the lang object for lid : ' + lid );
				}

				var translated_text = LJ.text_source[ lid ][ app_language ];

				if( typeof translated_text == "function" ){
					if( lpmt == "array" ){
						lpm = lpm.split(',');
					}
					translated_text = translated_text( lpm );

				}

				if( /placeholder/i.test( lid ) ){
					$el.attr('placeholder', translated_text );
					
					if( $('#searchbar').find('input').length > 1 ){
						$('#searchbar').find('input').first().attr('placeholder', null);
					}
					return;
				}

				$el.html( translated_text );

			});

		},
		changeAppLang: function(){

			LJ.ui.showModalAndFetch({

			"type"			: "changelang",
			"title"			: LJ.text("mod_change_lang_title"),
			"subtitle"		: LJ.text("mod_change_lang_subtitle"),
			"no_footer"     : true,

			"fetchPromise"	: LJ.lang.fetchSupportedLanguages

		})
		.then( LJ.lang.displayChangeLangInModal )

		},
		fetchSupportedLanguages: function(){

			return LJ.delay( 300 ).then(function(){
				return ["fr","us"];
			});

		},
		displayChangeLangInModal: function( result ){

			var html = LJ.lang.renderChangeAppLang( result );

			$( html ).hide().appendTo( $('.modal-body') );

			$('.modal-body')
				.find('.modal__loader')
				.velocity('bounceOut', { duration: 500, delay: 100,
					complete: function(){

						$('.change-lang')
						   .velocity('shradeIn', {
						   		display: 'flex',
						   		duration: 500
						   })
						   .find('[data-cc="' + LJ.lang.getAppLang() + '"]').addClass('x--active');

						$('.change-lang__choice:not(.x--unavailable)').click(function(){

							var new_language = $( this ).attr('data-cc');

							LJ.lang.setAppLang( new_language );
							LJ.lang.translateApp();

							$('.modal__close').click();

							LJ.delay( 500 ).then(function(){
								// LJ.ui.showToast( LJ.text('t_language_changed') );
							});

						});	


					}
				});


		},
		changeAppLang2: function(){

			var duration = 550;
			LJ.ui.showModal({
				duration: duration,


			})
			.then(function( $curtain ){
				return LJ.promise(function( resolve, reject ){

					$curtain
						.html( LJ.lang.renderChangeAppLang() )
						.find('[data-cc="' + LJ.lang.getAppLang() + '"]').addClass('x--active');

					$curtain
						.children()
						.velocity('fadeIn', {
							duration: duration,
							display: 'flex',
							complete: resolve
						});
				});
			})
			.then(function(){
				return LJ.promise(function( resolve, reject ){

					$('.change-lang__choice:not(.x--unavailable)').click(function(){

						var new_language = $(this).attr('data-cc');
						if( ! LJ.lang.isLangSupported( new_language ) ){
							return reject('This language (' + new_language + ') is not currently supported');
						}
						resolve( new_language );

					});	
				});
			})
			.then(function( app_language ){

				$('.change-lang').velocity('bounceOut', {
					duration: duration
				});

				LJ.delay( duration/1.5 ).then(function(){

					LJ.lang.setAppLang( app_language );
					LJ.lang.translateApp();
					LJ.ui.showToast( LJ.text('t_language_changed') );

				});
				
				LJ.ui.hideCurtain({
					duration: duration, delay: duration/2,
				}).then(function(){
				});


			}, function( err ){

				LJ.wlog( err );
				LJ.ui.hideCurtain({ duration: duration });

			});

		},
		renderChangeAppLang: function( languages ){

			var choices = [];
			languages.forEach(function( cc ){
				choices.push([

						'<div class="change-lang__choice" data-cc="'+ cc +'">',
							'<i class="flag-icon flag-icon-'+ cc +'"></i>',
						'</div>'

					].join(''));
			});

			return LJ.ui.render([

				'<div class="change-lang">',
					'<div class="change-lang-available">',
						choices.join(''),
						'<div class="change-lang__choice x--unavailable" data-cc="es">',
							'<i class="flag-icon flag-icon-es"></i>',
							'<div class="soon" data-lid="w_soon">Prochaînement</div>',
						'</div>',
						'<div class="modal__close nonei"></div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});

