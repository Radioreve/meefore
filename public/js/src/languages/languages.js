

	window.LJ.lang = _.merge( window.LJ.lang || {}, {

		'supported_languages': ['fr','en'],

		init: function(){

			LJ.Promise.resolve()
				   .then( LJ.lang.findAppLang )
				   .then( LJ.lang.setAppLang )
				   .then( LJ.lang.translateApp )

		},
		getAppLang: function(){

			return LJ.lang.app_language;
		},
		setAppLang: function( app_language ){
			return LJ.promise(function( resolve, reject ){

				if( !LJ.lang.isLangSupported(app_language) )
					return console.error('This language (' + app_language + ') is not currently supported');
				
				LJ.lang.app_language = app_language;
				return resolve();
			});

		},
		findAppLang: function(){
			return LJ.promise(function( resolve, reject ){

				return resolve('fr');		

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
			
			var $container = container instanceof jQuery ? container : $(container);

			$container.find('[data-lid]').each(function( i, el ){
				
				var $el  = $(el);
				var type = $el.prop('nodeName').toLowerCase();
				var lid  = $el.attr('data-lid');

				var text_object = LJ.text_source[ lid ];
				if( !text_object ){
					return LJ.elog('Cannot find the lang object for lid : ' + lid );
				}

				var translated_text = LJ.text_source[ lid ][ app_language ];

				if( /placeholder/i.test( lid ) ){
					$el.attr('placeholder', translated_text );
					
					if( $('#searchbar').find('input').length > 1 ){
						$('#searchbar').find('input').first().attr('placeholder', null);
					}
					return;
				}

				$el.html( translated_text );

			});

		}

	});

