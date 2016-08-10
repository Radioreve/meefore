
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		spotlight: function( $elem ){

			var w = $elem.css("width");
			var h = $elem.css("height");
			var l = ( $elem.offset().left + parseInt( $elem.width()/2 ) ) + "px";
			var t = ( $elem.offset().top + parseInt( $elem.height()/2 ) ) + "px";

			$('<div class="spotlight"></div>')
				.hide()
				.css({
					"position": "absolute",
					"width": w,
					"height": h,
					"left": l,
					"top": t,
					"padding": "30px",
					"border": "2000px solid rgba(0, 0, 0, 0.70)",
					"z-index": "10000",
					"border-radius": "10000px",
					"transform": "translate(-50%,-50%)"
				})
				.appendTo( 'body' )
				.velocity('fadeIn', {
					duration: 600
				});

		}	

	});