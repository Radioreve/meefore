
	window.LJ.menu = _.merge( window.LJ.menu || {}, {

		$menu: $('.menu'),
		shrink_menu_height_limit: 0,
		menu_slide_duration: 240,

		init: function(){

			LJ.menu.handleDomEvents();
			LJ.menu.activateMenuSection('profile');
			LJ.menu.shrinkMenu();

			return;

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.menu-item', LJ.menu.showMenuItem );
			LJ.ui.$window.on('scroll', _.debounce( LJ.menu.handleMenuApparition, 100 ) );

		},
		showMenuItem: function(){

			var $self = $(this);

			var section_id = $self.attr('data-link');
			LJ.menu.activateMenuSection( section_id );
			LJ.ui.hideSlide();
			LJ.unoffsetRows();

		},
		activateMenuSection: function( section_id ){	

			var current_section_id = $('.menu-item.x--active').attr('data-link');

			var $menu_item_activated    = $('.menu-item[data-link="' + current_section_id + '"]');
			var $menu_item_to_activate  = $('.menu-item[data-link="' + section_id + '"]');

			var $menu_block_activated   = $('.menu-section[data-link="' + current_section_id + '"]');
			var $menu_block_to_activate = $('.menu-section[data-link="' + section_id + '"]');


			if( !current_section_id ){
				$menu_item_to_activate.addClass('x--active');
				return $('.app-section.x--menu').find('[data-link="' + section_id + '"]').css({ 'display': 'flex' });
			}

			if( section_id == current_section_id ){
				
				if( current_section_id == "shared" ){
					return LJ.shared.handleShareClicked();
				}
				if( current_section_id == "cheers" ){
					return LJ.cheers.handleCheersClicked();
				}
				if( current_section_id == "friends" ){
					return LJ.friends.handleFriendsClicked();
				}

				return LJ.log('Section is already activated');
			}

			$menu_item_activated
				.removeClass('x--active')
				.find('.menu-item__bar')
				.velocity('bounceOut', { duration: 450, display: 'none' });

			$menu_item_to_activate
				.addClass('x--active')
				.find('.menu-item__bar')
				.velocity('bounceInQuick', { duration: 450, display: 'block' });

			$menu_block_activated.hide();
			$menu_block_to_activate.css({ display: 'flex' });

			// Specifics
			section_id == "friends" ?
				LJ.friends.displayInviteFriendsPopup():
				LJ.friends.hideInviteFriendsPopup();


		},
		handleMenuApparition: function( e ){
			
			return;

			var current_scrolltop = LJ.ui.$window.scrollTop();

			if( LJ.ui.getScrollDirection() == "down" && LJ.ui.scrolltop > LJ.menu.shrink_menu_height_limit && $('x--resizing').length == 0 ){
				LJ.menu.shrinkMenu();
			}

			if( LJ.ui.getScrollDirection() == "up" && LJ.ui.scrolltop < LJ.menu.shrink_menu_height_limit  && $('x--resizing').length == 0 ){
				LJ.menu.expandMenu();
			}

				
		},
		toggleMenuState: function(){

			var $m = LJ.menu.$menu;

			if( $m.hasClass('x--downsized') ){
				LJ.menu.expandMenu();
			} else {
				LJ.menu.shrinkMenu();
			}

		},
		shrinkMenu: function(){

			var $m = LJ.menu.$menu;

			if( $m.hasClass('x--downsized') || $m.hasClass('x--resizing') ) return;

			$m.addClass('x--resizing');
			$m.velocity('slideUpOut', {
				duration: LJ.menu.menu_slide_duration,
				complete: function(){

					if( LJ.ui.scrolltop < LJ.menu.shrink_menu_height_limit ){
						return $m.velocity('slideDownIn', {
							duration: LJ.menu.menu_slide_duration,
							display: 'flex',
							complete: function(){
								$m.removeClass('x--resizing');
							}
						})
					}

					$m.addClass('x--downsized');
					$m.closest('.app-section').addClass('x--downsized');
					$m.removeClass('x--resizing');
					$m.velocity('slideDownIn', {
						duration: LJ.menu.menu_slide_duration,
						display: 'flex'
					});

				}
			});

		},
		expandMenu: function(){

			var $m = LJ.menu.$menu;

			if( !$m.hasClass('x--downsized') || $m.hasClass('x--resizing') ) return;

			$m.addClass('x--resizing');
			$m.velocity('slideUpOut', {
				duration: LJ.menu.menu_slide_duration,
				complete: function(){

					$m.removeClass('x--resizing');
					$m.removeClass('x--downsized')
					$m.closest('.app-section').removeClass('x--downsized');
					$m.velocity('slideDownIn', {
						duration: LJ.menu.menu_slide_duration,
						display: 'flex'
					});

				}
			});

		}

	});