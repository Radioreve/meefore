
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		renderCheersItems__Chat: function( cheers, user_profiles ){

			var html = [];
						
			_.filter( cheers, function( ch ){
				return ch.status == "pending"; 

			}).forEach(function( ch ){

				if( ch.cheers_type == "received" ){

					var members = _.filter( user_profiles, function( u ){
						return ch.members.indexOf( u.facebook_id ) != -1;
					});
					html.push( LJ.cheers.renderCheersItemReceived__Chat( ch, members ) );

				}

				return;

				if( ch.cheers_type == "sent" ){

					var main_host_profile = _.find( user_profiles, function( u ){
						return u.facebook_id == ch.main_host;
					})
					var requested_with_profiles = _.filter( user_profiles, function( u ){
						return ch.members.indexOf( u.facebook_id ) != -1 && u.facebook_id != LJ.user.facebook_id;
					});
					html.push( LJ.cheers.renderCheersItemSent__Chat( ch, main_host_profile, requested_with_profiles ));
				}

			});

			return html.join('');

		},
		renderCheersItemReceivedEmpty__Chat: function(){

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
		renderCheersItemSentEmpty__Chat: function(){


		},
		renderCheersItemIconReceived__Chat: function( status ){


		},
		renderCheersItemReceived__Chat: function( cheers_object, members ){

			var ch = cheers_object;

			var formatted_date = LJ.makeFormattedDate( ch.requested_at );
			var img_html       = LJ.pictures.makeGroupRosace( members, 2, 'menu-row' );

			var groupname       = LJ.renderMultipleNames( _.map( members, 'name' ) );
			var groupname_html  = LJ.text('cheers_item_title_received').replace('%groupname', groupname);

			return LJ.ui.render([

				'<div class="chat-row cheers-row" data-link="received" data-chat-id="'+ ch.chat_id +'" data-before-id="'+ ch.before_id +'" data-cheers-id="' + ch.cheers_id + '">',
					'<div class="chat-row-time">',
					 	'<span>' + formatted_date + '</span>',
					 '</div>',
					'<div class="chat-row-pictures">',
						img_html,
					'</div>',
					'<div class="chat-row-infos">',
						'<div class="chat-row-infos__name">',
							'<span class="x--name">' + groupname_html +'</span>',
						'</div>',
						'<div class="chat-row-infos__preview ">',
							'<span data-lid="chat_row_cheers_subtitle"></span>',
						'</div>',
					'</div>',
				'</div>'

				]);

		},
		renderCheersItemIconSent__Chat: function( status ){


		},
		renderCheersItemSent__Chat: function( cheers_object, main_host_profile, requested_with_profiles, address ){


		},
		addCheersItems__Chat: function( cheers_html ){

			var $w = $('.chat-rows-body.x--cheers');

			$( cheers_html ).hide().appendTo( $w );

		},
		showCheersItems__Chat: function(){

			// type = type || "received";
 
			var $w = $('.chat-rows-body.x--cheers');

			$w.find('.cheers-row').velocity('shradeIn', {
				display  : 'flex',
				duration : 250
			});

		},
		showCheersLoader__Chat: function(){

			LJ.cheers.$loader = $( LJ.static.renderStaticImage('menu_loader') );

			LJ.cheers.$loader.addClass('none').addClass('cheers-chat__loader').appendTo('.chat-rows-body.x--cheers')
				.velocity('bounceInQuick', {
				   	delay    : 125,
				   	duration : 500,
				   	display  : 'block'
				});		

		},
		hideCheersLoader__Chat: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.cheers.$loader.velocity('shradeOut', {
					duration : 250,
					complete : function(){
						$( this ).remove();
						resolve();
					}
				});

			});
		},
		emptifyCheersItems__Chat: function(){

			// $('.chat-rows-title.x--cheers').hide();
			// $('.chat-rows-body.x--cheers').hide();

			$( LJ.chat.renderChatRow__CheersEmpty() )
				.css({ display: 'flex' })
				.appendTo( '.chat-rows-body.x--cheers' );

		},
		unemptifyCheersItem__Chat: function(){

			$('.chat-rows-title.x--cheers').css({ display: 'flex' });
			$('.chat-rows-body.x--cheers').css({ display: 'flex' });

		},
		removeAllCheers__Chat: function(){

			$('.chat-rows-body.x--cheers').children().remove();

		},
		refreshCheersItemsState__Chat: function(){

			var n_cheers = _.filter( LJ.cheers.fetched_cheers, function( ch ){
				return ch.cheers_type == "received" && ch.status == "pending";
			}).length;

			n_cheers == 0 ? LJ.cheers.emptifyCheersItems__Chat() : LJ.cheers.unemptifyCheersItem__Chat();

		},
		refreshCheersItems__Chat: function(){

			var cheers   = LJ.cheers.fetched_cheers;
			var profiles = LJ.cheers.fetched_profiles;
	
			if( profiles.length == 0 ){
				return LJ.cheers.fetchAndAddCheers();
			}

			LJ.cheers.sortCheers();
			
			var cheers_html = LJ.cheers.renderCheersItems__Chat( cheers, profiles );

			LJ.cheers.removeAllCheers__Chat();
			LJ.cheers.addCheersItems__Chat( cheers_html );
			LJ.cheers.refreshCheersItemsState__Chat();
			LJ.cheers.showCheersItems__Chat();

		},
		handleCheersItemClicked__Chat: function(){

			var $s        = $( this );
			var cheers_id = $s.attr('data-cheers-id');

			LJ.cheers.showValidateCheers( cheers_id );
			
		}
		
	});