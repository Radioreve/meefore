

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		setAppLanguage: function( country_code, container ){

			var container = container || $('body');

			container.find('[data-lid]').each(function( i, el ){

				var $el = $(el);
				var type = $el.prop('nodeName').toLowerCase();
				var lid = $el.attr('data-lid');

				if( /placeholder/i.test( lid ) ){
					$el.attr('placeholder', LJ.text_source[ lid ][ country_code ] );
					return;
				}

				$el.text( LJ.text_source[ lid ][ country_code ] );
				return;

			});

		}

	});

