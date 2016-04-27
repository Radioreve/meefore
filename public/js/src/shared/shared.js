
	window.LJ.shared = _.merge( window.LJ.shared || {}, {

		shared_item_duration: 600,

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
				   	delay    : 125,
				   	duration : 500,
				   	display  : 'block'
				  });

			LJ.shared.fetchSharedItems();

		},	
		fetchSharedItems: function(){

			/*
				- Fetch user's share_objects, and format it
				- Fetch the befores and users data to render. Hopefully, from cache.
				- Determine which template to render (many cases)
				- Display to the screen
			*/
			var shared, facebook_ids, users, befores;

			// Fetch user's share_objects, and format it
			LJ.api.fetchMeShared()
				.then(function( expose ){
					shared = expose.shared.sort(function( s1, s2 ){
						return moment( s2.shared_at ) - moment( s1.shared_at );
					});

				})
				// Fetch the befores and users data to render
				.then(function(){
					var event_ids = _.map( _.filter( shared, function( sh ){
						return sh.target_type == "before";
					}), 'target_id' );
					return LJ.api.fetchBefores( event_ids )

				})
				.then(function( res ){
					befores = _.map( res, 'before' );

				})
				.then(function(){

					var hosts_facebook_ids = _.map( befores, 'hosts' );
					var users_facebook_ids = _.map( _.filter( shared, function( sh ){
						return sh.target_type == "user";
					}), 'target_id' );

					facebook_ids = _.uniq( _.merge( hosts_facebook_ids, users_facebook_ids ) );
					return;

				})
				.then(function(){
					return LJ.api.fetchUsers( facebook_ids );

				})	
				.then(function( res ){
					users = _.map( res, 'user' );
					return;

				})
				// Determine which template to render (many cases)
				.then(function(){
					return LJ.shared.renderSharedItems( shared, users, befores );

				})
				// Display to the screen
				.then(function( html ){
					return LJ.shared.displaySharedItems( html );

				})
				.catch(function( e ){
					LJ.wlog(e);

				});

		},
		renderSharedItems: function( shared, users, befores ){

			var html = [];
			shared.forEach(function( sho ){

				html.push( LJ.shared.renderSharedItem( sho, {
						users   : users,
						befores : befores
					})
				);

			});

			if( html.length == 0 ){
				return [ LJ.shared.renderSharedItem__Empty() ];

			} else {
				return html;

			}

		},
		renderSharedItem: function( sho, opts ){

			var users   = opts.users;
			var befores = opts.befores;

			if( sho.target_type == "user" ){

				var target_profile = _.find( users, function( usr ){
					return usr.facebook_id == sho.target_id;
				});

				if( sho.share_type == "shared_by" ){
					return LJ.shared.renderSharedByItem__User( sho, target_profile );
				}

				if( sho.share_type == "shared_with" ){
					return LJ.shared.renderSharedWithItem__User( sho, target_profile );
				}		

			}

			if( sho.target_type == "before" ){

				var before = _.find( befores, function( bfr ){
					return bfr._id == sho.target_id;
				});

				var targets_profiles = [];
				users.forEach(function( user ){
					if(  before.hosts.indexOf( user.facebook_id ) ){
						targets_profiles.push( user );
					}
				});

				if( sho.share_type == "shared_by" ){
					return LJ.shared.renderSharedByItem__User( sho, targets_profiles );
				}	

				if( sho.share_type == "shared_with" ){
					LJ.shared.renderSharedByItem__User( sho, targets_profiles );
				}							
			}

		},
		displaySharedItems: function( html ){

			$('.shared')
				.children()
				.velocity('shradeOut', {
					duration : LJ.shared.shared_item_duration,
					display  : 'none',
					complete : function(){
						$( html.join('') )
							.hide()
							.appendTo('.shared')
							.velocity('shradeIn', {
								duration : LJ.shared.shared_item_duration,
								display  : 'flex',
								stagger  : (LJ.shared.shared_item_duration / 4)
							});

					}
				});


		},	
		renderSharedItem__Empty: function(){

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
		renderSharedItem__User: function( sh, target, subtitle ){

			var target 		   = target;
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
							subtitle,
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderSharedByItem__User: function( sho, target ){

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == sho.shared_by;
			});

			var subtitle = [
				'<div class="row-body__icon --round-icon">',
					'<i class="icon icon-pricetag"></i>',
				'</div>',
				'<h4>',
					LJ.text('shared_by_item_subtitle')
						.replace('%name', friend.name )
						.replace('%type', LJ.text('w_profile') )
						.capitalize(),
				'</h4>'
			].join('');

			return LJ.shared.renderSharedItem__User( sho, target, subtitle );

		},
		renderSharedWithItem__User: function( sho, target ){

			var friends = [];
			var friends_profiles = LJ.friends.friends_profiles;

			if( !Array.isArray( friends_profiles ) ){
				return LJ.wlog('Unable to render, friends_profiles is not an array');
			}

			sho.shared_with.forEach(function( friend_id ){
				friends.push( _.find( friends_profiles, function( f ){
					return f.facebook_id == friend_id;
				}))
			});

			var names = LJ.renderMultipleNames( _.map( friends, 'name') );

			var subtitle = [
				'<div class="row-body__icon --round-icon">',
					'<i class="icon icon-telescope"></i>',
				'</div>',
				'<h4>',
					LJ.text('shared_with_item_subtitle')
						.replace('%names', names )
						.replace('%type', LJ.text('w_profile') )
						.capitalize(),
				'</h4>'
			].join('');

			return LJ.shared.renderSharedItem__User( sho, target, subtitle );


		},
		renderSharedByItem__Before: function( sho, targets ){

			

		},
		renderSharedWithItem__Before: function( sho, targets ){



		},
		handleShareProfile: function(){	

			var target_id = $( this ).closest('[data-facebook-id]').attr('data-facebook-id');

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