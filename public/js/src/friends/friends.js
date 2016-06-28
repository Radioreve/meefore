
	window.LJ.friends = _.merge( window.LJ.friends || {}, {

		friends_profiles: null,
		show_friends_duration: 600,
		init: function(){

			LJ.friends.handleDomEvents();
			return LJ.friends.fetchAndAddFacebookFriends();

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.js-invite-friends', LJ.facebook.showModalSendMessageToFriends );
			LJ.ui.$body.on('click', '.js-show-friend', LJ.friends.handleFriendProfileClicked );

		},
		handleFriendsClicked: function(){

			var $loader = $( LJ.static.renderStaticImage('menu_loader') );

			$('.friends').html('');

			$loader.addClass('none')
				   .appendTo('.friends')
				   .velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				   });

			LJ.friends.fetchAndAddFacebookFriends();

		},	
		handleFriendProfileClicked: function(){

			var $s = $(this);
			var facebook_id = $s.attr('data-facebook-id');

			LJ.profile_user.showUserProfile( facebook_id );

		},
		fetchAndAddFacebookFriends: function(){

			var friend_ids = LJ.user.friends;
			return LJ.api.fetchUsers( friend_ids )

				.then(function( friends_profiles ){
					friends_profiles = _.map( friends_profiles, 'user' );
					return LJ.friends.setFriendsProfiles( friends_profiles );

				})
				.then(function( friends_profiles ){
					return LJ.friends.renderFriends( friends_profiles );

				})
				.then(function( friends_html ){
					return LJ.friends.displayFriends( friends_html );

				})
				.catch(function( e ){
					LJ.wlog(e);
				});


		},
		getFriendsProfiles: function( facebook_ids ){

			if( facebook_ids ){
				return _.filter( LJ.friends.friends_profiles, function( f ){
					return ( facebook_ids.indexOf( f.facebook_id ) != -1 );
				});

			} else {
				return LJ.friends.friends_profiles;

			}

		},
		fetchFriendsProfiles: function(){

			LJ.api.fetchMeFriends()
				.then(function( friend_ids ){
					return LJ.api.fetchUsers( friend_ids )
				})
				.then(function( friends_profiles ){
					friends_profiles = _.map( friends_profiles, 'user' );
					return LJ.friends.setFriendsProfiles( friends_profiles );
				});


		},
		setFriendsProfiles: function( friends_profiles ){

			LJ.friends.friends_profiles = friends_profiles;
			return LJ.Promise.resolve( friends_profiles );

		},
		renderFriends: function( friends_profiles ){

			var html = [];

			if( friends_profiles.length == 0 ){
				html.push( LJ.friends.renderFriendItem__Empty() );

			} else {
				friends_profiles.forEach(function( friend ){
					html.push( LJ.friends.renderFriendItem( friend ) );

				});

				html.push( LJ.friends.renderFriendItem__Last() );

			}

			return html.join('');

		},
		displayFriends: function( html ){

			var $base;
			if( $('.friends').children().length == 0 ){
				$( html )
					.hide()
					.appendTo('.friends')
					.velocity('shradeIn', {
						duration : LJ.friends.show_friends_duration,
						display  : 'flex',
						stagger  : (LJ.friends.show_friends_duration / 4)
					});

			} else {
				$('.friends')
					.children()
					.velocity('shradeOut', {
						duration : LJ.friends.show_friends_duration / 2,
						display  : 'none',
						complete : function(){
							$( html )
								.hide()
								.appendTo('.friends')
								.velocity('shradeIn', {
									duration : LJ.friends.show_friends_duration,
									display  : 'flex',
									stagger  : (LJ.friends.show_friends_duration / 4)
								});

						}
					});

			}

		},
		renderFriendItem__Empty: function(){

			return LJ.ui.render([

				'<div class="empty">',
					'<div class="empty__icon --round-icon">',
						'<i class="icon icon-telescope"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_friends_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_friends_subtitle"></p>',
					'</div>',
					'<div class="empty__subicon --round-icon js-invite-friends">',
						'<i class="icon icon-gift"></i>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendItem: function( friend ){

			if( !friend ){
				LJ.wlog('Trying to render undefined friend');
				return ''
			}

			var img_html = LJ.pictures.makeImgHtml( friend.img_id, friend.img_vs, 'menu-row' );

			return LJ.ui.render([

				'<div class="friend__item js-show-friend" data-facebook-id="' + friend.facebook_id + '">',
					'<div class="row-pic js-filterlay">',
						'<div class="row-pic__image">' + img_html + '</div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + friend.name + ', <span class="row-body__age">' + friend.age + '</span></h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__subtitle-icon --round-icon">',
								'<i class="icon icon-education"></i>',
							'</div>',
							'<span>' + friend.job + '</span>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendItem__Last: function(){

			return LJ.ui.render([

				'<div class="friend__item --invite-friends js-invite-friends" >',
					'<div class="row-pic">',
						'<i class="icon icon-gift"></i>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2> ' + LJ.text('friends_title_invite') + '</h2>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendsInModal: function(){

			var friends = LJ.friends.friends_profiles;
 
			if( friends.length == 0 ){

				return LJ.friends.renderFriendsInModal__Empty();

			} else {

				var html = [];

				friends.forEach(function( f ){
					html.push( LJ.friends.renderFriendInModal( f ) );
				});


				return html.join('');
			}

		},
		renderFriendsInModal__Empty: function(){

			return LJ.ui.render([

				'<div class="no-friends">',
					'<span data-lid="modal_no_friends_text"></span>',
					'<button class="js-invite-friends" data-lid="modal_no_friends_btn"></button>',
				'</div>'

			].join(''));

		},
		renderFriendInModal: function( f ){

			var img_html = LJ.pictures.makeImgHtml( f.img_id, f.img_vs, 'user-modal' );

			return LJ.ui.render([

				'<div class="modal-item friend-modal" data-name="' + f.name.toLowerCase() + '" data-item-id="' + f.facebook_id + '">',
					'<div class="friend-modal__pic">',
						img_html,
						'<div class="friend-modal__icon --round-icon">',
							'<i class="icon icon-check"></i>',
						'</div>',
					'</div>',
					'<div class="friend-modal__name">',
						'<span>' + f.name + '</span>',
					'</div>',
				'</div>'

				].join(''));

		}

	});