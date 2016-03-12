

	window.LJ.lang = _.merge( window.LJ.lang || {}, {

		'supported_languages': ['fr','en'],

		init: function(){

			Promise.resolve()
				   .then( LJ.lang.findAppLang )
				   .then( LJ.lang.translateTheApp )

		},
		getAppLang: function(){
			return LJ.lang.app_language;
		},
		setAppLang: function( app_language ){

			if( ! LJ.fn.isLangSupported )
				return console.error('This language (' + app_language + ') is not currently supported');
			
			LJ.lang.app_language = app_language;


		},
		findAppLang: function(){

			return LJ.promise(function( resolve, reject ){
				resolve('fr');		
			});

		},
		isLangSupported: function( app_language ){

			return LJ.lang.supported_languages.indexOf( app_language ) == -1 ? false : true;

		},
		translateApp: function(){

			LJ.lang.translate('body');

		},	
		translate: function( container, options ){

			app_language = options.app_language || LJ.lang.getAppLang();

			if( ! LJ.lang.isLangSupported( app_language ) ){
				return console.error('This language (' + app_language + ') is not currently supported');
			}
			
			var $container = $(container) || $('body');

			$container.find('[data-lid]').each(function( i, el ){

				var $el = $(el);
				var type = $el.prop('nodeName').toLowerCase();
				var lid = $el.attr('data-lid');

				var translated_text = LJ.text_source[ lid ][ app_language ];

				if( /placeholder/i.test( lid ) ){
					$el.attr('placeholder', translated_text );
					
					if( $('#searchbar').find('input').length > 1 ){
						$('#searchbar').find('input').first().attr('placeholder', null);
					}
					return;
				}

				$el.html( translated_text );

				return;

			});

		}

	});

