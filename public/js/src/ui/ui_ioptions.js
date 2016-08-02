
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		ioptions_show_duration: 450,
		ioptions_hide_duration: 400,

		showIoptions: function( $wrap, html ){

			$('<div class="ioptions ioptions-overlay"></div>')
				.hide()
				.appendTo( $wrap )
				.velocity('fadeIn', {
					duration : LJ.ui.ioptions_show_duration,
					display  : 'flex'
				});

			$( html )
				.hide()
				.appendTo( $wrap.find('.ioptions') )
				.velocity('shradeIn', {
					duration : LJ.ui.ioptions_show_duration,
					delay    : LJ.ui.ioptions_show_duration/2,
					display  : 'flex'
				});

			$wrap.find('.js-ioptions-close').click( LJ.ui.hideIoptions );

		},
		updateIoptions: function( html ){

			var $iop = $('.ioptions');

			$iop
				.children()
				.velocity('shradeOut', {
					duration : LJ.ui.ioptions_hide_duration
				});

			$( html )
				.hide()
				.appendTo( $iop )
				.velocity('shradeIn', {
					duration : LJ.ui.ioptions_show_duration,
					delay    : LJ.ui.ioptions_hide_duration,
					display  : 'flex'
				});

			$iop.find('.js-ioptions-close').click( LJ.ui.hideIoptions );

		},
		hideIoptions: function(e){

			if(e) e.stopPropagation();
			
			var $w = $(this).closest('.ioptions');

			$w.velocity('fadeOut', {
				duration: LJ.ui.ioptions_hide_duration,
				complete: function(){
					$(this).remove();
				}
			});

		}

	});