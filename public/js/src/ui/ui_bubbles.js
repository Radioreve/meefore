
	window.LJ.ui = _.merge( window.LJ.ui || {}, {
		
		max_bubble: 9,

		formatElem: function( elem ){

			var $elem = null;
			if( elem instanceof jQuery ){
				$elem = elem;
			}
			if( typeof elem == 'string' && $( elem ).length == 1 ){
				$elem = $( elem );
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
		showBubble: function( elem ){

			LJ.ui.setBubble( elem, "show" );

		},
		hideBubble: function( elem ){

			LJ.ui.setBubble( elem, "hide" );

		},
		bubbleUp: function( elem ){

			var n = parseInt( $(elem).find('.bubble__number').text().replace('+','') );
			LJ.ui.setBubble( elem, n + 1 );

		},
		bubbleDown: function( elem ){

			var n = parseInt( $(elem).find('.bubble__number').text().replace('+','') );
			LJ.ui.setBubble( elem, n - 1 );

		},
		setBubble: function( elem, n, already_added ){

			// Validation happens here because it centralizes all other calls
			var $elem = LJ.ui.formatElem( elem );
			if( !$elem ) return;

			var $bubble      = $elem.find('.bubble');
			var $bubble_text = $bubble.find('.bubble__number');

			// Bubble element doesnt exist, create it and add n bubbles
			if( $bubble_text.length == 0 ){
				if( already_added ){
					return LJ.wlog('Unable to setup bubble, element probably didnt exist');
				}
				LJ.ui.addBubble( elem );
				if( n != 0 && !n ){
					n = 1;
				}
				return LJ.ui.setBubble( elem, n, true );
			}

			if( n == "show" ){
				return $bubble.show();
			}

			if( n == "hide" ){
				return $bubble.hide();
			}

			if( n <= 0 ){
				$bubble.hide();
				$bubble_text.text(0);
				return;
			}

			if( n >= LJ.ui.max_bubble ){
				$bubble_text.text( LJ.ui.max_bubble + '+');
			} else {
				$bubble_text.text( n );
			}

			$bubble.show();

		},
		addBubble: function( elem ){

			// LJ.log('Adding bubble for the first time');
			$( LJ.ui.renderBubble() )
				.appendTo( elem );

		},
		renderBubble: function(){

			return LJ.ui.render([
				'<div class="bubble x--round-icon">',
					'<div class="bubble__number"></div>',
				'</div>'
				].join(''));

		}

	});