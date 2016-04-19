
	window.LJ.shared = _.merge( window.LJ.shared || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.shared.handleDomEvents();
				resolve();

			});

		},
		handleDomEvents: function(){

			$('.menu-item.--shared').one('click', LJ.shared.handleShareClicked );
			LJ.ui.$body.on('click', '.js-share-profile', LJ.shared.handleShareProfile );
			LJ.ui.$body.on('keydown', '.modal-search__input input', LJ.ui.filterModalResults );
			LJ.ui.$body.on('click', '.shared__item', LJ.shared.handleSharedItemClicked )

		},
		handleSharedItemClicked: function(){

			var facebook_id = $(this).attr('data-target-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},	
		handleShareClicked: function(){


			var $loader = $( LJ.static.renderStaticImage('menu_loader') );

			$('.shared').html('');

			$loader.addClass('none')
				   .appendTo('.shared')
				   .velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				   });

			LJ.shared.fetchSharedItems();

		},	
		fetchSharedItems: function(){

			LJ.api.fetchMeShared()
				  .then( LJ.shared.handleFetchMeSharedSuccess, LJ.shared.handleFetchMeSharedError );

		},
		handleFetchMeSharedSuccess: function( expose ){

			var shared = expose.shared;

			LJ.shared.setSharedItems( shared );

		},
		setSharedItems: function( shared ){

			var html = '';
			shared.sort();

			var shared_by = _.filter( shared, function( sh ){
				return sh.share_type == "shared_by"; 
			});

			var shared_profiles = _.filter( shared_by, function( sh ){
				return sh.target_type == "user";
			});

			var shared_before = _.filter( shared_by, function( sh ){
				return sh.target_type == "before";
			});

			var facebook_ids = _.pluck( shared_profiles, 'target_id' );

			LJ.api.fetchUsers( facebook_ids )
				.then(function( res ){

					var html = [];
					if( res.length == 0 ){

						html.push( LJ.shared.renderShareItem__Empty() );

					} else {
						res.forEach(function( r ){

							var user = r.user;
							var sh   = _.find( shared_profiles, function( sh ){
								return sh.target_id == user.facebook_id;
							});

							html.push (LJ.shared.renderShareItem__User( sh, user ) );

						});
						
					}

					$('.shared')
						.html( html.join('') )
						.children()
						.velocity('fadeIn', {
							duration: 250,
							display: 'flex'
						});

				});

		},		
		handleFetchMeSharedError: function(){

			LJ.elog('Error fetching shared :/');

		},
		renderShareItem__Empty: function(){

			return LJ.ui.render([

				'<div class="empty">',
					'<div class="empty__icon --round-icon">',
						'<i class="icon icon-telescope"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_shared_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_shared_subtitle"></p>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderShareItem__User: function( shared_object, target ){

			var sh 	   = shared_object;
			var target = target;

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == sh.shared_by;
			});

			var formatted_date = LJ.renderDate( sh.shared_at );
			var img_html       = LJ.pictures.makeImgHtml( target.img_id, target.img_vs, 'menu-row' );


			return LJ.ui.render([

				'<div class="shared__item" data-target-id="' + sh.target_id + '" data-target-type="' + sh.target_type + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						'<div class="row-pic__icon --round-icon"><i class="icon icon-forward"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + target.name + ', <span class="row-body__age">' + target.age + '</span></h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-pricetag"></i></div>',
							'<h4>' + LJ.text('shared_item_subtitle').replace('%name', friend.name ).replace('%type', LJ.text('w_profile') ).capitalize() + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		handleShareProfile: function(){	

			var target_id = $( this ).closest('.search-user').attr('data-facebook-id');

			LJ.ui.showModal({
				"title"			: LJ.text('modal_share_title'),
				"type"      	: "share",
				"search_input"	: true,
				"jsp_body" 	    : true,
				"attributes"	: [{ name: "item-id", val: target_id }],
				"subtitle"		: LJ.text('modal_share_subtitle'),
				"body"  		: LJ.friends.renderFriendsInModal(),
				"footer"		: "<button class='--rounded'><i class='icon icon-check'></i></button>"
			})
			.then(function(){
				return LJ.ui.getModalItemIds();

			})
			.then(function( item_ids ){

				var d = LJ.static.renderStaticImage('search_loader')
				$(d).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
					duration: 400
				});

				return LJ.api.shareWithFriends({
					target_id   : target_id,
					target_type : 'user',
					shared_with : item_ids
				});

			})
			.then(function( exposed ){
				return LJ.ui.hideModal()

			})
			.then(function(){
				LJ.ui.showToast( LJ.text('to_profile_shared_success') );
			})
			.catch(function(e){
				LJ.wlog(e);
				LJ.ui.hideModal()

			});

		}

	});