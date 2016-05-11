
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		ioptions_show_duration: 450,
		ioptions_hide_duration: 400,

		showIoptions: function( $wrap, html ){

			$('<div class="ioptions ioptions-overlay"></div>')
				.hide()
				.appendTo( $wrap )
				.velocity('fadeIn', {
					duration: LJ.ui.ioptions_show_duration,
					display : 'flex'
				});

			$( html )
				.hide()
				.appendTo('.ioptions')
				.velocity('shradeIn', {
					duration: LJ.ui.ioptions_show_duration,
					display : 'flex',
					delay   : LJ.ui.ioptions_show_duration/2
				});

			$wrap.find('.js-ioptions-close').click( LJ.ui.hideIoptions );

		},
		hideIoptions: function(e){

			e.stopPropagation();
			var $w = $(this).closest('.ioptions');

			$w.velocity('fadeOut', {
				duration: LJ.ui.ioptions_hide_duration,
				complete: function(){
					$(this).remove();
				}
			});

		}

	});