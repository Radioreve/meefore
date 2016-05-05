
	window.LJ.ui = _.merge( window.LJ.ui || {}, {
		
		formatElem: function( elem ){

			var $elem = null;
			if( elem instanceof jQuery ){
				$elem = elem;
			}
			if( typeof elem == 'string' && $(elem).length == 1 ){
				$elem = $(elem);
			}

			if( !$elem ){
				LJ.wlog('Unable to construct proper elem to setup a bubble');
				return null;
			} else {
				return $elem;
			}

		},
		handleDomEvents: function(){

		},
		bubbleUp: function( elem ){

			var n = parseInt( $(elem).find('.bubble__number').text() );
			LJ.ui.setBubble( elem, n + 1 );

		},
		bubbleDown: function( elem ){

			var n = parseInt( $(elem).find('.bubble__number').text() );
			LJ.ui.setBubble( elem, n - 1 );

		},
		setBubble: function( elem, n, already_added ){

			// Validation happens here because it centralizes all other calls
			var $elem = LJ.ui.formatElem( elem );
			if( !$elem ) return

			var $bubble = $elem.find('.bubble');
			var $bubble_text = $bubble.find('.bubble__number');
			// Bubble element doesnt exist, create it and add one bubble
			if( $bubble_text.length != 1 ){
				if( already_added ){
					return LJ.wlog('Warning: infinite boucle !!');
				}
				LJ.ui.addBubble( elem )
				return LJ.ui.setBubble( elem, 1, true);
			}

			if( n <= 0 ){
				$bubble.hide();
				$bubble_text.text(0);
				return;
				
			} else {
				$bubble.show();

			}

			$bubble_text.text( n );

		},
		addBubble: function( elem ){

			LJ.log('Adding bubble for the first time');
			$( LJ.ui.renderBubble() )
				.appendTo( elem )

		},
		renderBubble: function(){

			return LJ.ui.render([
				'<div class="bubble --round-icon">',
					'<div class="bubble__number"></div>',
				'</div>'
				].join(''));

		}

	});