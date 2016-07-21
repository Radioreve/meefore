
	window.LJ.friends = _.merge( window.LJ.friends || {}, {

		fetched_friends: null,
		show_friends_duration: 600,
		init: function(){

			LJ.friends.handleDomEvents();
			return LJ.friends.fetchAndAddFacebookFriends();

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.js-invite-friends', LJ.facebook.showModalSendMessageToFriends );
			LJ.ui.$body.on('click', '.js-show-friend', LJ.friends.handleFriendProfileClicked );
			LJ.ui.$body.on('click', '.js-close-friends-popup', LJ.friends.hideInviteFriendsPopup );

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
			return LJ.api.fetchUsersFull( friend_ids )

				.then(function( fetched_friends ){
					fetched_friends = _.map( fetched_friends, 'user' );
					LJ.friends.setFriendsProfiles( fetched_friends );
					LJ.friends.sortFriends();
					return;

				})
				.then(function(){
					return LJ.friends.renderFriends( LJ.friends.fetched_friends );

				})
				.then(function( friends_html ){
					return LJ.friends.displayFriends( friends_html );

				})
				.catch(function( e ){
					LJ.wlog(e);
				});


		}, 
		getFriendProfile: function( facebook_id ){

			return _.find( LJ.friends.getFriendsProfiles(), function( f ){
				return f.facebook_id == facebook_id;
			});

		},
		getFriendsProfiles: function( facebook_ids ){

			LJ.friends.fetched_friends = LJ.friends.fetched_friends.filter( Boolean );

			if( facebook_ids ){
				return _.filter( LJ.friends.fetched_friends, function( f ){
					return ( facebook_ids.indexOf( f.facebook_id ) != -1 );
				});

			} else {
				return LJ.friends.fetched_friends;

			}

		},
		setFriendsProfiles: function( fetched_friends ){

			LJ.friends.fetched_friends = fetched_friends;

		},
		sortFriends: function(){

			LJ.friends.fetched_friends.sort(function( fa, fb ){

				if( fa.name[ 0 ].toLowerCase() < fb.name[ 0 ].toLowerCase() ){
					return -1;
				}

				if( fa.name[ 0 ].toLowerCase() > fb.name[ 0 ].toLowerCase() ){
					return 1;
				}

				return 0;

			});

		},
		renderFriends: function( fetched_friends ){

			var html = [];

			if( fetched_friends.length == 0 ){
				html.push( LJ.friends.renderFriendItem__Empty() );

			} else {
				fetched_friends.forEach(function( friend ){
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
					'<div class="empty__icon x--round-icon">',
						'<i class="icon icon-users"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_friends_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_friends_subtitle"></p>',
					'</div>',
					'<div class="empty__subicon x--round-icon js-invite-friends">',
						'<i class="icon icon-gift"></i>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendItem: function( friend ){

			var filterlay = 'js-filterlay';
			var nonei 	  = '';

			if( !friend ){
				LJ.wlog('Trying to render undefined friend, rendering ghost user instead');
				friend = LJ.getGhostUser();
				filterlay = '';
				nonei 	  = 'nonei';
			}

			var formatted_date = LJ.text("w_member_since") + " " + moment( friend.signed_up_at ).format('DD/MM/YY');

			var main_img = LJ.findMainPic( friend );
			var img_html = LJ.pictures.makeImgHtml( main_img.img_id, main_img.img_version, 'menu-row' );

			return LJ.ui.render([

				'<div class="friend__item js-show-friend '+ nonei +'" data-facebook-id="' + friend.facebook_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image '+ filterlay +'">' + img_html + '</div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + friend.name + ', <span class="row-body__age">' + friend.age + '</span></h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon">',
								'<i class="icon icon-education-empty"></i>',
							'</div>',
							'<span>' + friend.job + '</span>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon">',
								'<i class="icon icon-location-empty"></i>',
							'</div>',
							'<span>' + friend.location.place_name + '</span>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendItem__Last: function(){

			return '';

			return LJ.ui.render([

				'<div class="friend__item x--invite-friends js-invite-friends" >',
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

			var friends = LJ.friends.getFriendsProfiles();
 
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

			if( !f ){
				f = LJ.getGhostUser();
			}
			
			var main_img = LJ.findMainPic( f );
			var img_html = LJ.pictures.makeImgHtml( main_img.img_id, main_img.img_version, 'user-modal' );

			return LJ.ui.render([

				'<div class="modal-item friend-modal" data-name="' + f.name.toLowerCase() + '" data-item-id="' + f.facebook_id + '">',
					'<div class="friend-modal__pic">',
						img_html,
						'<div class="friend-modal__icon x--round-icon">',
							'<i class="icon icon-check"></i>',
						'</div>',
					'</div>',
					'<div class="friend-modal__name">',
						'<span>' + f.name + '</span>',
					'</div>',
				'</div>'

				].join(''));

		},
		displayInviteFriendsPopup: function(){

			LJ.friends.invite_popup_timer = setTimeout(function(){

				$( LJ.friends.renderInviteFriendsPopup() )
					.hide()
					.appendTo('body')
					.velocity('shradeIn', {
						duration: 400,
						display : 'flex'
					});

			}, 2500 );

		},
		hideInviteFriendsPopup: function(){

			clearTimeout( LJ.friends.invite_popup_timer );
			$('.invite-friends-popup').remove();

		},
		renderInviteFriendsPopup: function(){

			return LJ.ui.render([

				'<div class="invite-friends-popup">',
					'<div class="invite-friends-popup__close js-close-friends-popup x--round-icon">',
						'<i class="icon icon-cross-fat"></i>',
					'</div>',
					'<div class="invite-friends-popup__icon x--round-icon">',
						'<i class="icon icon-heart"></i>',
					'</div>',
					'<div class="invite-friends-popup-message">',
						'<div class="invite-friends-popup__h1">',
							'<span data-lid="invite_friends_popup_h1"></span>',
						'</div>',
						'<div class="invite-friends-popup__h2">',
							'<span data-lid="invite_friends_popup_h2"></span>',
						'</div>',
					'</div>',
					'<div class="invite-friends-popup__btn js-invite-friends">',
						'<button data-lid="invite_friends_popup_btn"></button>',
					'</div>',
				'</div>'

			].join(''));

		}

	});