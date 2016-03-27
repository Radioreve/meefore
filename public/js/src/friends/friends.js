
	window.LJ.friends = _.merge( window.LJ.friends || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.friends.handleDomEvents();
				resolve();

			});

		},
		handleDomEvents: function(){

			$('.menu-item.--friends').one('click', LJ.friends.handleFriendsClicked );
			LJ.ui.$body.on('click', '.js-invite-friends', LJ.facebook.showModalSendMessageToFriends );

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

			LJ.friends.fetchFriends();

		},	
		fetchFriends: function(){

			LJ.facebook.fetchFriends()
				.then( LJ.api.fetchMeFriends )
				.then( LJ.friends.handleFetchMeFriendSuccess, LJ.friends.handleFetchMeFriendError );


		},
		handleFetchMeFriendSuccess: function( expose ){

			var friend_ids = expose.friends;

			LJ.friends.setFriends( friend_ids );

		},
		setFriends: function( friend_ids ){

			var html = [];

			LJ.api.fetchUsers( friend_ids )
				.then(function( res ){

					if( res.length == 0 ){

						html.push( LJ.friends.renderFriendItem__Empty() );

					} else {

						res.forEach(function( r ){

							var friend = r.user;
							html.push( LJ.friends.renderFriendItem( friend ) );

						});

						html.push( LJ.friends.renderFriendItem__Last() );

					}

					$('.friends')
						.html( html.join('') )
						.children()
						.velocity('fadeIn', {
							duration: 250,
							display: 'flex'
						});

				});

		},		
		handleFetchMeFriendError: function(){

			LJ.elog('Error fetching friends :/');

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
						'<i class="icon icon-user-add"></i>',
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

				'<div class="friend__item" data-user-id="' + friend.facebook_id + '">',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + friend.name + ', <span class="row-body__age">' + friend.age + '</span></h2>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderFriendItem__Last: function(){

			return LJ.ui.render([

				'<div class="friend__item --invite-friends js-invite-friends" >',
					'<div class="row-pic">',
						'<i class="icon icon-user-add"></i>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2> ' + LJ.text('friends_title_invite') + '</h2>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});