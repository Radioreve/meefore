

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		setAppLanguage: function( country_code, container ){

			var supported_languages = ['fr','en'];

			if( supported_languages.indexOf( country_code ) == -1 ){
				return console.error('This language (' + country_code + ') is not currently supported');
			}

			LJ.app_language = country_code;
			
			var container = container || $('body');

			container.find('[data-lid]').each(function( i, el ){

				var $el = $(el);
				var type = $el.prop('nodeName').toLowerCase();
				var lid = $el.attr('data-lid');

				var translated_text = LJ.text_source[ lid ][ country_code ];

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

