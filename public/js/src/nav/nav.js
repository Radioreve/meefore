
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
		getActiveView: function(){

			return $('.app__menu-item.x--active').attr('data-link');

		},
		denavigate: function(){

			var active_view = LJ.nav.getActiveView();

			$('.app__menu-item[data-link="'+ active_view +'"]').removeClass('x--active');
			$('.app-section[data-link="'+ active_view +'"]').hide();

		},
		navigate: function( target_link ){

			if( LJ.isMobileMode() ){
				LJ.chat.hideChatWrap();
				LJ.notifications.hideNotificationsPanel();
			}

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
			$current_menuitem.removeClass('x--active');
			$target_menuitem.addClass('x--active');

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

			if( !$target_menuitem.is( $current_menuitem ) ){
				LJ.ui.hideSlide();
				LJ.before.hideCreateBeforeStraight();
				LJ.before.showBrowser();
				LJ.map.deactivateMarkers();
				LJ.map.refreshMarkers();
			}

			// Specificities

			if( target_link == 'map' ){
				$('.app').removeClass('padded');

				LJ.unoffsetAll();
				LJ.ui.deactivateHtmlScroll();
				// Refresh the map dued to a bug when the window is resized and the map not visible
				// The try catch is to avoid an ugly error in the console during app intitialization
				try {
					LJ.map.refreshMap();
				} catch( e ){

				}


			} else {
				$('.app').addClass('padded');
				LJ.ui.activateHtmlScroll();

				if( LJ.isMobileMode() ){
					LJ.search.fetchAndShowMoreUsers__Once();
				}

			}

			if( target_link != "menu" ){
				LJ.friends.hideInviteFriendsPopup();
			}


		}

	});

