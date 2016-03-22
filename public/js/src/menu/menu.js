
	window.LJ.menu = _.merge( window.LJ.menu || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.menu.handleDomEvents();
				LJ.menu.activateMenuSection('profile');
				resolve();

			});
		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.menu-item', LJ.menu.showMenuItem );

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
			$menu_block_to_activate.css({ display: 'flex' })



		}

	});