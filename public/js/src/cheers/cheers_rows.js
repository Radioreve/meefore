
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		renderCheersItems__Rows: function( cheers, user_profiles ){

			var html = [];
						
			cheers.forEach(function( ch ){


				if( ch.cheers_type == "received" ){

					var members = _.filter( user_profiles, function( u ){
						return ch.members.indexOf( u.facebook_id ) != -1;
					});
					html.push( LJ.cheers.renderCheersItemReceived__Rows( ch, members, ch.place_name ) );

				}

				return;

				if( ch.cheers_type == "sent" ){

					var main_host_profile = _.find( user_profiles, function( u ){
						return u.facebook_id == ch.main_host;
					})
					var requested_with_profiles = _.filter( user_profiles, function( u ){
						return ch.members.indexOf( u.facebook_id ) != -1 && u.facebook_id != LJ.user.facebook_id;
					});
					html.push( LJ.cheers.renderCheersItemSent__Rows( ch, main_host_profile, requested_with_profiles, ch.place_name ));
				}

			});

			return html.join('');

		},
		renderCheersItemReceivedEmpty__Rows: function(){

			return LJ.ui.render([

				'<div class="empty" data-link="received">',
					'<div class="empty__icon x--round-icon">',
						'<i class="icon icon-meedrink-empty"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_cheers_received_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_cheers_received_subtitle"></p>',
					'</div>',
					'<div class="empty__btn">',
						'<button class="js-create-before" data-lid="cheers_create_before_btn"></button>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderCheersItemSentEmpty__Rows: function(){

			return LJ.ui.render([

				'<div class="empty" data-link="sent">',
					'<div class="empty__icon x--round-icon">',
						'<i class="icon icon-meedrink-empty"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_cheers_sent_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_cheers_sent_subtitle"></p>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderCheersItemIconReceived__Rows: function( status ){

			if( status == "pending" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_pending") +'" class="row-pic__icon x--round-icon x--pending hint--left hint--rounded">',
					'<i class="icon icon-pending"></i>',
				'</div>'].join('');
			}

			if( status == "accepted" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_accepted") +'" class="row-pic__icon x--round-icon x--accepted hint--left hint--rounded">',
					'<i class="icon icon-chat-bubble-duo"></i>',
				'</div>'].join('');
			}

		},
		renderCheersItemReceived__Rows: function( cheers_object, members, address ){

			var ch = cheers_object;

			var formatted_date = LJ.makeFormattedDate( ch.requested_at );
			var img_html       = LJ.pictures.makeGroupRosace( members, 2, 'menu-row' );

			var groupname       = LJ.renderMultipleNames( _.map( members, 'name' ) );
			var groupname_html  = LJ.text('cheers_item_title_received').replace('%groupname', groupname);
			var cheers_tag_html = cheers_object.status == "accepted" ? '<span class="row-body__tag">Match</span>' : '';

			var address  	   = ch.place_name;


			return LJ.ui.render([

				'<div class="cheers__item" data-link="received" data-before-id="'+ ch.before_id +'" data-cheers-id="' + ch.cheers_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image js-filterlay">' + img_html + '</div>',
						LJ.cheers.renderCheersItemIconReceived__Rows( ch.status ),
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + groupname_html +'</h2>',
							cheers_tag_html,
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-location-empty"></i></div>',
							'<h4>' + address + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				]);

		},
		renderCheersItemIconSent__Rows: function( status ){

			if( status == "pending" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_pending") +'" class="row-pic__icon x--round-icon x--pending hint--left hint--rounded">',
					'<i class="icon icon-pending"></i>',
				'</div>'].join('');
			}

			if( status == "accepted" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_accepted") +'" class="row-pic__icon x--round-icon x--accepted hint--left hint--rounded">',
					'<i class="icon icon-chat-bubble-duo"></i>',
				'</div>'].join('');
			}

		},
		renderCheersItemSent__Rows: function( cheers_object, main_host_profile, requested_with_profiles, address ){

			var ch = cheers_object;

			var formatted_date       = LJ.text( "menurow_date", moment(ch.requested_at) );
			var img_html             = LJ.pictures.makeImgHtml( main_host_profile.img_id, main_host_profile.img_vs, 'menu-row' );

			var groupname            = LJ.renderGroupName( main_host_profile.name );
			var groupname_html       = LJ.text('cheers_item_title_sent').replace('%groupname', groupname );

			var requested_with_names = LJ.renderMultipleNames( _.map( requested_with_profiles, 'name' ) );
			var requested_with_html  = LJ.text("cheers_requested_with").replace( '%names', requested_with_names );

			var address              = ch.place_name;

			return LJ.ui.render([

				'<div class="cheers__item" data-link="sent" data-before-id="'+ ch.before_id +'" data-cheers-id="' + ch.cheers_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image js-filterlay">' + img_html + '</div>',
						LJ.cheers.renderCheersItemIconSent__Rows( ch.status ),
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + groupname_html +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-users-empty"></i></div>',
							'<h4>' + requested_with_html + '</h4>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-location-empty"></i></div>',
							'<h4>' + address + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		addCheersItems__Rows: function( cheers_html ){

			var $w = $('.cheers');

			$( cheers_html ).hide().appendTo( $w );

		},
		showCheersItems__Rows: function(){

			// type = type || "received";
 
			var $w = $('.cheers');

			$w.find('.cheers__item').velocity('shradeIn', {
				display  : 'flex',
				duration : 250
			});

		},
		showCheersLoader__Rows: function(){

			LJ.cheers.$loader = $( LJ.static.renderStaticImage('menu_loader') );

			LJ.cheers.$loader.addClass('none').appendTo('.cheers')
				.velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				});		

		},
		hideCheersLoader__Rows: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.cheers.$loader.velocity('shradeOut', {
					duration: 250,
					complete: function(){
						$( this ).remove();
						resolve();
					}
				});

			});
		},
		emptifyCheersItems__Rows: function(){

			$('.cheers-title, .cheers-subtitle').hide();
			$('.cheers').children().hide();
			$('.cheers').append( LJ.cheers.renderCheersItemReceivedEmpty__Rows() );

		},
		defaultifyCheersItem__Rows: function(){

			$('.cheers-title, .cheers-subtitle').show();
			$('.cheers').find('.empty').remove();

		},
		removeAllCheers__Rows: function(){

			$('.cheers').children().remove();

		},
		refreshCheersItemsState__Rows: function(){

			var cheers = _.filter( LJ.cheers.fetched_cheers, function( ch ){
				return ch.cheers_type == "received";
			}); 

			if( cheers.length == 0 ){
				LJ.cheers.emptifyCheersItems__Rows();
			} else {
				LJ.cheers.defaultifyCheersItem__Rows();
			}

		},
		refreshCheersItems__Rows: function(){

			var cheers   = LJ.cheers.fetched_cheers;
			var profiles = LJ.cheers.fetched_profiles;
	
			if( profiles.length == 0 ){
				return LJ.cheers.fetchAndAddCheers();
			}

			LJ.cheers.sortCheers();
			
			var cheers_html = LJ.cheers.renderCheersItems__Rows( cheers, profiles );

			LJ.cheers.removeAllCheers__Rows();
			LJ.cheers.addCheersItems__Rows( cheers_html );
			LJ.cheers.refreshCheersItemsState__Rows();
			LJ.cheers.showCheersItems__Rows();


		},
		handleCheersItemClicked__Rows: function(){

			var $s        = $( this );
			var cheers_id = $s.attr('data-cheers-id');

			var cheers_item = LJ.cheers.getCheersItem( cheers_id );

			if( cheers_item.status == "accepted" ){

				if( LJ.chat.getChatState() == "hidden" ){
					LJ.chat.showChatWrap();
				}

				LJ.chat.hideChatInview();
				LJ.cheers.removeCheersBack();
				LJ.chat.activateChat( cheers_item.chat_id );
				LJ.chat.showChatInview( cheers_item.chat_id );
				LJ.chat.refreshChatJsp( cheers_item.chat_id );

			} else {

			// Cheers is in the pending state
			cheers_item.cheers_type == "sent" ?
				LJ.before.fetchAndShowBeforeInview( cheers_item.before_id ) :
				LJ.cheers.showValidateCheers( cheers_id );

			}

		}
		
	});