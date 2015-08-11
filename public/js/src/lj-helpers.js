
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		getMaxWidthLabel: function(container){

			var labels = $(container).find('label');
			var widthArray = [];

			labels.each( function( i, el ){
				widthArray.push( $(el).innerWidth() );
			});

			var max = Math.max.apply( null, widthArray );
			console.log('Maximum label width : ' + max );
			return max;
		},
		adjustAllInputsWidth: function(container){

			var $container = $(container);
			var max = LJ.fn.getMaxWidthLabel( container );

			$container.find('label').each( function( i, label ){

				var $label = $(label);
				var $inp = $label.siblings('*:not(.inspire, .etiquette, [type="number"])');

				var label_width = max;
				var label_full_width = $label.outerWidth(true);
				var parent_width = $label.parent().width();

				$label.css({ width: label_width });
				$inp.css({ width: parent_width - label_full_width - 50 }); /* Mega hack, security margin */
				$inp.children('input').css({ width:'100%' });
			});
			
		},
		shortenString: function( options ){ //useless

			var options = options || {};

			if( !options.str && typeof( options.str ) != 'string' )
				return console.log('Invalid input for shorten string fn');

			var str      = options.str,
				end_tpl  = options.end_tpl || '';
				max_char = options.max_char || 5;

			return str.substr( 0, max_char ) + end_tpl;
		},
		addItemToInput: function( options  ){

			var options = options || {};

			if( !options.html || typeof( options.html ) != 'string' )
				return console.log('Invalid html for prepend item fn');

			var $input = $(options.inp);
			var $html = $(options.html);

			$html.hide().insertBefore( $input );

			var item_id = $html.attr('data-id');
			if( $('.rem-click[data-id="'+item_id+'"]').length > 1 ){
				return $html.remove();
			}

			if( $html.siblings('.rem-click').length > options.max - 1){
				return $html.remove();
			}

			$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
			$html.show();

			/* If there are images to render, little smooth ux */
			if( $html.find('img').length != 0 ){
				$html.waitForImages(function(){
					$html.find('.host-img').show()
					.end().find('.host-loader').remove();
				});
			}

			/* Pour que les suggestions ne se décallent pas vers la droite */
			if( options.suggestions ){
				var $sug = $( options.suggestions );
				var current_offset = parseInt( $sug.css('left').split('px')[0] );
				$sug.css({ left: current_offset - $html.outerWidth(true) });
			}
		},
		addBeforePlaceToInput: function( place ){

			var $input = $('#cr-before-place'),
				place = place;

			$input.val('');
			$input.hide();

			if( $('.before-place').length != 0 )
				LJ.fn.removeBeforePlaceToInput();

			var $html = $( LJ.fn.renderBeforePlaceInCreate( place ) );			
				$html.hide().insertBefore( $input );
				$html.show();

		},
		removeBeforePlaceToInput: function( str ){

			var $input = $('#cr-before-place'),
				$place  = $('.before-place');

			$('.before-place').remove();
			$input.show();

		},
		addPartyPlaceToInput: function( place ){

			var $input = $('#cr-party-place'),
				place = place;

			$input.val('');
			$input.hide();

			if( $('.party-place').length != 0 )
				LJ.fn.removePartyPlaceToInput();

			var $html = $( LJ.fn.renderPartyPlaceInCreate( place ) );			
				$html.hide().insertBefore( $input );
				$html.show();

		},
		removePartyPlaceToInput: function( str ){

			var $input = $('#cr-party-place'),
				$place  = $('.party-place');

			$('.party-place').remove();
			$input.val('').show();

		},
		addDateToInput: function( date_str ){

			var $input = $('#cr-date'),
				date = moment( date_str, 'DD/MM/YY' );
			
			$input.val('');
			
			if( $('.date').length != 0 ) 
				LJ.fn.removeDateToInput();

			var msg = date.day() == moment().day() ? "Aujourd'hui !" : "Une belle journée ";
			$input.attr('placeholder', msg );
			
			var $html = $( LJ.fn.renderDateInCreate( date_str ) );
				$html.hide().insertBefore( $input );
				$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
				$html.show();

			LJ.pikaday.hide();

		},
		removeDateToInput: function( str ){

			var $input = $('#cr-date'),
				$date  = $('.date');

			$input.css({ width: $input.outerWidth() + $date.outerWidth(true) })
			$('.date').remove();
			str && $input.val('').attr('placeholder', str);

		},
		sanitizeCreateInputs: function(){
			$('#createEvent').find('.need-sanitize:not(.no-sanitize)').val('');
		}

	});