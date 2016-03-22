
	window.LJ.meepass = _.merge( window.LJ.meepass || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.meepass.handleDomEvents();

			});


		},
		handleDomEvents: function(){

			$('.menu-section.--meepass').on('click', '.segment__part', LJ.meepass.refreshSegmentView );

		},
		refreshSegmentView: function(){

			var $seg = $(this);
			var link = $seg.attr('data-link');

			if( $seg.hasClass('--active') ) return;

			$seg.siblings().removeClass('--active');
			$seg.addClass('--active');

			$('.meepass__item').hide();
			$('.meepass__item[data-link="' + link + '"]').show();

		}
		

	});