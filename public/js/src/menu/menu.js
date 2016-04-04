
	window.LJ.menu = _.merge( window.LJ.menu || {}, {

		$menu: $('.menu'),
		shrink_menu_height_limit: 100,
		menu_slide_duration: 240,

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.menu.handleDomEvents();
				LJ.menu.activateMenuSection('profile');
				resolve();

			});
		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.menu-item', LJ.menu.showMenuItem );
			LJ.ui.$window.scroll( LJ.menu.handleMenuApparition );

		},
		showMenuItem: function(){

			var $self = $(this);

			var section_id = $self.attr('data-link');
			LJ.menu.activateMenuSection( section_id );

		},
		activateMenuSection: function( section_id ){	

			var current_section_id = $('.menu-item.--active').attr('data-link');

			var $menu_item_activated    = $('.menu-item[data-link="' + current_section_id + '"]');
			var $menu_item_to_activate  = $('.menu-item[data-link="' + section_id + '"]');

			var $menu_block_activated   = $('.menu-section[data-link="' + current_section_id + '"]');
			var $menu_block_to_activate = $('.menu-section[data-link="' + section_id + '"]');


			if( !current_section_id ){
				$menu_item_to_activate.addClass('--active');
				return $('.app-section.--menu').find('[data-link="' + section_id + '"]').css({ 'display': 'flex' });
			}

			if( section_id == current_section_id ){
					if( current_section_id == "shared" ){
						return LJ.shared.handleShareClicked();
					}
					if( current_section_id == "meepass" ){
						return LJ.meepass.handleMeepassClicked();
					}
					if( current_section_id == "friends" ){
						return LJ.friends.handleFriendsClicked();
					}


				return LJ.wlog('Section is already activated');
			}

			$menu_item_activated
				.removeClass('--active')
				.find('.menu-item__bar')
				.velocity('bounceOut', { duration: 450, display: 'none' });

			$menu_item_to_activate
				.addClass('--active')
				.find('.menu-item__bar')
				.velocity('bounceInQuick', { duration: 450, display: 'block' });

			$menu_block_activated.hide();
			$menu_block_to_activate.css({ display: 'flex' });



		},
		handleMenuApparition: function( e ){
			
			if( ! $('.app__menu-item.--menu').hasClass('--active') ){
				return LJ.log('Returning...');
			}
	
			var current_scrolltop = LJ.ui.$window.scrollTop();

			if( LJ.ui.getScrollDirection() == "down" && LJ.ui.scrolltop > LJ.menu.shrink_menu_height_limit && $('--resizing').length == 0 ){
				LJ.menu.shrinkMenu();
			}

			if( LJ.ui.getScrollDirection() == "up" && LJ.ui.scrolltop < LJ.menu.shrink_menu_height_limit  && $('--resizing').length == 0 ){
				LJ.menu.expandMenu();
			}

				
		},
		toggleMenuState: function(){

			var $m = LJ.menu.$menu;

			if( $m.hasClass('--downsized') ){
				LJ.menu.expandMenu();
			} else {
				LJ.menu.shrinkMenu();
			}

		},
		shrinkMenu: function(){

			var $m = LJ.menu.$menu;

			if( $m.hasClass('--downsized') || $m.hasClass('--resizing') ) return;

			$m.addClass('--resizing');
			$m.velocity('slideUpOut', {
				duration: LJ.menu.menu_slide_duration,
				complete: function(){

					if( LJ.ui.scrolltop < LJ.menu.shrink_menu_height_limit ){
						return $m.velocity('slideDownIn', {
							duration: LJ.menu.menu_slide_duration,
							display: 'flex',
							complete: function(){
								$m.removeClass('--resizing');
							}
						})
					}

					$m.addClass('--downsized');
					$m.closest('.app-section').addClass('--downsized');
					$m.removeClass('--resizing');
					$m.velocity('slideDownIn', {
						duration: LJ.menu.menu_slide_duration,
						display: 'flex'
					});

				}
			});

		},
		expandMenu: function(){

			var $m = LJ.menu.$menu;

			if( !$m.hasClass('--downsized') || $m.hasClass('--resizing') ) return;

			$m.addClass('--resizing');
			$m.velocity('slideUpOut', {
				duration: LJ.menu.menu_slide_duration,
				complete: function(){

					$m.removeClass('--resizing');
					$m.removeClass('--downsized')
					$m.closest('.app-section').removeClass('--downsized');
					$m.velocity('slideDownIn', {
						duration: LJ.menu.menu_slide_duration,
						display: 'flex'
					});

				}
			});

		}

	});