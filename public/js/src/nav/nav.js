
	window.LJ.nav = _.merge( window.LJ.nav || {}, {

		$nav: $('.app-nav'),
		current_link: null,

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.nav.handleDomEvents();
				LJ.nav.navigate('map');
				resolve();

			});
		},
		handleDomEvents: function(){

			LJ.nav.$nav.on('click', 'li[data-link]', LJ.nav.handleNavigate );

		},
		handleNavigate: function(e){

			e.preventDefault();
			var $li = $(this);
			var lk  = $li.attr('data-link');
			LJ.nav.navigate( lk );

		},
		navigate: function( target_link ){

			var current_link = LJ.nav.current_link;

			var $target_section  = $('.app-section[data-link="' + target_link + '"]');
			var $current_section = $('.app-section[data-link="' + current_link + '"]') || $target_section; // For the first activation

			var $target_menuitem = $('.app__menu-item[data-link="' + target_link + '"]');
			var $current_menuitem = $('.app__menu-item[data-link="' + current_link + '"]') || $target_menuitem

			var $target_headertitle  = $('.app-header__title[data-link="' + target_link + '"]');
			var $current_headertitle = $('.app-header__title[data-link="' + current_link + '"]') || $target_headertitle;

			if( $target_section.length + $target_menuitem.length + $target_headertitle.length != 3 ){
				return LJ.wlog('Ghost target for link : ' + link );
			}

			// Set the internal state
			LJ.nav.current_link = target_link

			// Update the Header ui
			$current_menuitem.removeClass('--active');
			$target_menuitem.addClass('--active');

			// Update the header title
			/*var duration = 220;
			LJ.ui.shradeOut( $current_headertitle, duration )
				.then(function(){
					LJ.ui.shradeIn( $target_headertitle, duration );
				});
			*/
			
			// Display the view
			$current_section.hide();
			$target_section.css({ display: 'flex' });

			// Specificities
			var duration = 220;
			var hasMeepassRibbon = $('.meepass-ribbon').length > 0;
			if( target_link == 'search' && hasMeepassRibbon ) {
				LJ.ui.shradeIn( $('.meepass-ribbon'), duration )
			} 
			if( target_link != 'search' && hasMeepassRibbon ){
				LJ.ui.shradeOut( $('.meepass-ribbon'), duration )
			}
			if( target_link == 'map' ){
				$('.app').removeClass('padded');
			} else {
				$('.app').addClass('padded');
			}

		}

	});

