
	window.LJ.search = _.merge( window.LJ.search || {}, {

		fetched_users 			: [],

		users_count 			: 0,
		fetching_users			: false,
		all_fetched 		  	: false,

		fetch_more_scroll_ratio : 0.95,
		refetch_callstack: [],

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.search.handleDomEvents();
				LJ.search.fetchAndShowMoreUsers();
				LJ.search.setCountriesInFilters();
				LJ.search.addLoader();
				resolve();

			});
		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.search-user__pic', LJ.search.handleClickUser );
			LJ.ui.$body.on('click', '.search-filters__icon', LJ.search.showFilters );
			LJ.ui.$body.on('click', '.search-filters__close', LJ.search.hideFilters );
			LJ.ui.$body.on('click', '.search-filters .toggle', LJ.search.handleToggleFilter );
			LJ.ui.$window.scroll( LJ.search.handleFetchMoreUsers );
			
		},
		addLoader: function(){

			$('.search-users').append( LJ.static.renderStaticImage('search_loader') )

		},
		handleClickUser: function(){

			var facebook_id = $(this).closest('.search-user').attr('data-facebook-id');

			LJ.profile_user.showUserProfile( facebook_id );

		},
		handleToggleFilter: function(){

			var $to = $(this);
			$to.toggleClass('--active');
			LJ.search.setFiltersState();
			LJ.search.refetchAndShowMoreUsers();

		},
		allowedToFetchMore: function(){
			
			var data_to_fetch        = !LJ.search.all_fetched;
			var scroll_almost_bottom = LJ.ui.getScrollRatio() > LJ.search.fetch_more_scroll_ratio;
			var search_panel_active  = $('.app__menu-item.--search').hasClass('--active');
			var user_not_fetching    = !LJ.search.fetching_users;

			if( data_to_fetch && scroll_almost_bottom && search_panel_active && user_not_fetching ){
				return true;
			} else {
				return false;
			}

		},
		handleFetchMoreUsers: function(){

			if( !LJ.search.allowedToFetchMore() ) return;

			LJ.log('Fetching more users...');
			LJ.search.fetchAndShowMoreUsers();

		},
		fetchMoreUsers: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.search.setFiltersState();

				var facebook_ids = _.pluck( LJ.search.fetched_users, 'facebook_id' );
				var filters      = LJ.search.filter_state;

				LJ.api.fetchMoreUsers( facebook_ids, filters )
					.then(function( exposed ){

						var new_users   = exposed.users;
						var users_count = exposed.users_count;

						LJ.search.fetched_users = _.uniq( LJ.search.fetched_users.concat( new_users ) );
						LJ.search.users_count   = users_count;
						resolve( new_users );

					})
					.catch( reject );

			});
		},
		refetchAndShowMoreUsers: function(){

			LJ.log('[Re]Fetching and showing more users...');
			LJ.search.all_fetched = false;

			if( LJ.search.fetching_users ){
				return LJ.wlog('Already fetching users...');
			}

			LJ.search.fetched_users = [];
			LJ.search.hideSearchUsers()
				.then(function(){
					return LJ.search.fetchAndShowMoreUsers();
				})

		},
		fetchAndShowMoreUsers: function(){

			LJ.log('Fetching and showing more users...');
			LJ.search.fetching_users = true;

			var users;
			LJ.search.showSearchLoader()

				.then(function(){
					return LJ.search.fetchMoreUsers();
				})

				.then(function( new_users ){
					if( LJ.search.fetched_users.length == LJ.search.users_count || new_users.length == 0 ){
						LJ.wlog('Everyone has been fetched for this filter.');
						LJ.search.all_fetched = true;
					}
					users = new_users;
					return;
				})

				.then(function(){
					return LJ.search.hideSearchLoader();
				})

				.then(function(){
					return LJ.search.showMoreUsers( users );
				})
				// When users loaded, give it one second of blocking, otherwise if user scrolls
				// It will detect that he can fetch more users. One batch at a time is better :)
				.then(function(){
					setTimeout(function(){
						LJ.search.fetching_users = false;
					}, 1000 );
				});

		},
		showMoreUsers: function( users ){


			_.chunk( users, 3 ).forEach(function( user_group ){

				var $users = $( LJ.search.renderUserRow( user_group ) );

				$users.hide().insertBefore('.search__loader');
				LJ.settings.applyUxPreferences();

				$users.velocity('shradeIn', {
					display  : 'flex',
					delay    : 100
				});

			});

		},
		showSearchLoader: function( duration ){
			return LJ.promise(function( resolve, reject ){
				var $l = $('.search__loader');
				if( $l.length == 0 ) return resolve();
				$('.search__loader').velocity('shradeIn', {
					duration: duration || 300,
					complete: resolve
				})
			});
		},
		hideSearchLoader: function( duration ){
			return LJ.promise(function( resolve, reject ){
				$('.search__loader').velocity('shradeOut', {
					duration: duration || 300,
					complete: resolve
				})
			});
		},
		hideSearchUsers: function(){
			return LJ.promise(function( resolve, reject ){
				$('.search-users-row').velocity('shradeOut', {
					duration : 300,
					complete : function(){
						$(this).remove();
						resolve();
					}
				});
			});

		},
		renderUserRow: function( users ){

			if( !users ){
				return LJ.wlog('No users to render here');
			}

			var html = ['<div class="search-users-row">'];

			for( var i=0; i<3; i++ ){
				if( users[ i ] ){
					html.push( LJ.search.renderUser( users[i] ) );
				} else {
					html.push( LJ.search.renderUserBlank() );
				}
			}

			html.push('</div>');

			return html.join('');

		},
		renderUserBlank: function(){

			return '<div class="search-user --blank"></div>';

		},
		renderUser: function( user ){

			var n = user.name;
			var a = user.age;
			var i = user.facebook_id;
			var c = user.country_code;
			var l = user.location.place_name;
			var p = user.location.place_id;
			var g = user.gender;

			var main_pic = LJ.findMainPic( user );
			var img_html = LJ.pictures.makeImgHtml( main_pic.img_id, main_pic.img_version, 'user-search');


			return LJ.ui.render([

				'<div class="search-user" data-facebook-id="'+ i +'" data-age="' + a + '" data-gender="' + g + '" data-cc="' + c + '">',
		            '<div class="search-user__pic">',
		            img_html,
		               '<div class="search-user__pic-overlay"></div>',
		               '<div class="search-user__name">',
		            	  '<span class="search-user__gender user-gender js-user-gender --'+ g +'"></span>',
		                  '<span class="name">'+ n +'</span>',
		                  '<span class="comma">,</span>',
		                  '<span class="age">'+ a +'</span>',
		                  '<span class="user-online js-user-online"></span>',
		               '</div>',
		            '</div>',
		            '<div class="search-user__location" data-place-id="'+ p +'"><span>'+ l +'</span></div>',
		            '<div class="search-user__country js-user-country"><i class="flag-icon flag-icon-'+ c +'"></i></div>',
		            '<div class="search-user__actions">',
		              '<div class="search-user__action --round-icon --share js-share-profile"><i class="icon icon-forward"></i></div>',
		              '<div class="search-user__splitter"></div>',
		              '<div class="search-user__action --round-icon --meepass js-send-meepass"><i class="icon icon-meepass"></i></div>',
		            '</div>',
	          '</div>'

				].join(''))

		}

	});