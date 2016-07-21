
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		cheers_back_duration: 450,

		fetched_cheers     : [],
		fetched_profiles   : [],
		active_cheers_back : null,
		cheers_back_state  : "idle",

		init: function(){

			LJ.cheers.handleDomEvents();
			LJ.cheers.activateCheers("received");
			return;

		},
		handleDomEvents: function(){

			$('.menu-section.x--cheers').on('click', '.segment__part', LJ.cheers.handleSegmentClicked );
			$('.menu-item.x--cheers').one('click', LJ.cheers.handleCheersClicked );
			$('.cheers').on('click', '.cheers__item', LJ.cheers.handleCheersItemClicked );
			$('.chat').on('click', '.js-validate', LJ.cheers.handleValidate );
			$('body').on('click', '.js-close-cheers-back', LJ.cheers.handleCloseCheersBack );

		},
		handleSegmentClicked: function(){

			var $seg = $( this );
			var link = $seg.attr('data-link');

			LJ.cheers.activateCheers( link );

			LJ.ui.hideSlide();
			LJ.unoffsetRows();
			

		},
		handleCloseCheersBack: function(){

			var close_type = LJ.cheers.getCloseType();

			LJ.chat.refreshChatRowsJsp().then(function(){

				LJ.cheers.resetCheersBackState()

				if( close_type == "hide_all" ){
					LJ.chat.hideChatWrap().then(function(){
						$('.cheers-back').remove();
					});
				}

				if( close_type == "hide_cheers_back" ){
					$('.cheers-back').remove();
				}


			});
		},
		activateCheers: function( link ){

			var $seg = $('.menu-section.x--cheers').find('.segment__part[data-link="'+ link +'"]');

			if( $seg.hasClass('x--active') ){
				return LJ.wlog('Already activated');
			}

			$seg.siblings().removeClass('x--active');
			$seg.addClass('x--active');

			LJ.cheers.filterCheersItems( link );

		},
		filterCheersItems: function( link ){

			$('.cheers').children().css({ display: 'none' });
			$('.cheers [data-link="' + link + '"]').css({ display: 'flex' });

		},
		clearAllCheers: function(){

			$('.cheers').html('');

		},
		showCheersLoader: function(){

			LJ.cheers.$loader = $( LJ.static.renderStaticImage('menu_loader') );

			LJ.cheers.$loader.addClass('none').appendTo('.cheers')
				.velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				});		

		},
		hideCheersLoader: function(){
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
		showCheersBackLoader: function(){

			$( LJ.static.renderStaticImage('slide_loader') )
				.addClass('cheers-back__loader')
				.hide()
				.appendTo($('.cheers-back'))
				.show();

		},
		hideCheersBackLoader: function(){

			$('.cheers-back').find('.cheers-back__loader').remove();

		},
		showCheersBackOverlay: function(){

			$('<div class="loader__overlay"></div>')
				.hide()
				.appendTo( $('.cheers-back') )
				.velocity('fadeIn', {
					duration: 500
				});

		},
		hideCheersBackOverlay: function(){

			$('.cheers-back').find('.cheers-back__overlay').remove();

		},
		handleCheersClicked: function(){

			LJ.cheers.showCheersLoader();
			LJ.cheers.clearAllCheers();
			LJ.cheers.fetchAndAddCheers();

		},
		sortCheers: function(){

			LJ.cheers.fetched_cheers.forEach(function( ch ){
				ch.created_at = ch.requested_at || ch.sent_at;
			});

			LJ.cheers.fetched_cheers.sort(function( ch1, ch2 ){

				if( moment( ch1.created_at ) > moment( ch2.created_at ) ){
					return -1;
				}

				if( moment( ch1.created_at ) < moment( ch2.created_at ) ){
					return 1;
				}

				return 0;

			});

		},
		fetchAndAddCheers: function(){

			LJ.log('Fetching and setting cheers items...');

			LJ.cheers.removeAllCheers();
			LJ.cheers.showCheersLoader();

			LJ.api.fetchMeCheers()
				.then(function( res ){
					LJ.cheers.fetched_cheers = res.cheers;

				})
				.then(function(){
					LJ.cheers.sortCheers();

				})
				.then(function(){

					var main_hosts     = _.map( LJ.cheers.fetched_cheers, 'main_host' );
					var members        = _.flatten( _.map( LJ.cheers.fetched_cheers, 'members' ) );

					var facebook_ids = _.uniq( _.concat( main_hosts, members ) );
					return LJ.api.fetchUsers( facebook_ids )

				})
				.then(function( res ){
					LJ.cheers.fetched_profiles = _.filter( _.map( res, 'user' ), Boolean );
					return LJ.cheers.renderCheersItems( LJ.cheers.fetched_cheers, LJ.cheers.fetched_profiles );

				})
				.then(function( cheers_html ){
					return LJ.cheers.addCheersItems( cheers_html );

				})
				.then(function( $cheers ){
					return LJ.cheers.hideCheersLoader();

				})
				.then(function(){
					var type = LJ.cheers.getActiveCheersType();
					return LJ.cheers.showCheersItems( type );

				})
				.catch(function( e ){
					LJ.cheers.hideCheersLoader();
					LJ.wlog(e);

				});

		},
		getCheersItem: function( cheers_id ){

			return _.find( LJ.cheers.fetched_cheers, function( ch ){
				return ch.cheers_id == cheers_id;
			});

		},
		handleCheersItemClicked: function(){

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

		},
		refreshCheersItems: function(){

			var cheers   = LJ.cheers.fetched_cheers;
			var profiles = LJ.cheers.fetched_profiles;

			
			if( profiles.length == 0 ){
				return LJ.cheers.fetchAndAddCheers();
			}

			LJ.cheers.sortCheers();
			
			var type 		= LJ.cheers.getActiveCheersType();
			var cheers_html = LJ.cheers.renderCheersItems( cheers, profiles );

			LJ.cheers.removeAllCheers();
			LJ.cheers.addCheersItems( cheers_html );
			LJ.cheers.showCheersItems( type, 1 );


		},
		removeAllCheers: function(){

			$('.cheers').children().remove();

		},
		getActiveCheersType: function(){

			return $('.menu-section.x--cheers').find('.segment__part.x--active').attr('data-link');

		},
		renderCheersItems: function( cheers, user_profiles ){

			var html = [];
			
			var no_cheers_received = true;
			var no_cheers_sent     = true;
				
			cheers.forEach(function( ch ){


				if( ch.cheers_type == "received" ){

					no_cheers_received = false;
					var main_member_profile = _.find( user_profiles, function( u ){
						return u.facebook_id == ch.main_member;
					});
					html.push( LJ.cheers.renderCheersItem__Received( ch, main_member_profile, ch.place_name ) );

				}

				if( ch.cheers_type == "sent" ){

					no_cheers_sent = false;
					var main_host_profile = _.find( user_profiles, function( u ){
						return u.facebook_id == ch.main_host;
					})
					var requested_with_profiles = _.filter( user_profiles, function( u ){
						return ch.members.indexOf( u.facebook_id ) != -1 && u.facebook_id != LJ.user.facebook_id;
					});
					html.push( LJ.cheers.renderCheersItem__Sent( ch, main_host_profile, requested_with_profiles, ch.place_name ));
				}

			});

			if( no_cheers_sent ){
				html.push( LJ.cheers.renderCheersItem__SentEmpty() );
			}

			if( no_cheers_received ){
				html.push( LJ.cheers.renderCheersItem__ReceivedEmpty() );
			}

			return html.join('');

		},
		addCheersItems: function( cheers_html ){

			var $w = $('.cheers');

			$( cheers_html ).hide().appendTo( $w );

		},
		showCheersItems: function( type, duration ){

			type = type || "sent";

			var $w = $('.cheers');

			$w.find('[data-link="' + type + '"]').velocity('shradeIn', {
				duration : duration || 250,
				display  : 'flex'
			});

		},
		renderCheersItem__ReceivedEmpty: function(){

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
				'</div>'

				].join(''));

		},
		renderCheersItem__SentEmpty: function(){

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
		renderCheersItemIcon__Received: function( status ){

			if( status == "pending" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_pending") +'" class="row-pic__icon x--round-icon x--pending hint--left hint--rounded">',
					'<i class="icon icon-meedrink"></i>',
				'</div>'].join('');
			}

			if( status == "accepted" ){
				return [ '<div data-hint="'+ LJ.text("hint_cheers_accepted") +'" class="row-pic__icon x--round-icon x--accepted hint--left hint--rounded">',
					'<i class="icon icon-chat-bubble-duo"></i>',
				'</div>'].join('');
			}

		},
		renderCheersItem__Received: function( cheers_object, main_requester, address ){

			var ch = cheers_object;

			var formatted_date = LJ.text( "menurow_date", moment(ch.requested_at) );
			var img_html       = LJ.pictures.makeImgHtml( main_requester.img_id, main_requester.img_vs, 'menu-row' );

			var groupname 	   = LJ.renderGroupName( main_requester.name );
			var groupname_html = LJ.text('cheers_item_title_received').replace('%groupname', groupname);

			var address  	   = ch.place_name;

			return LJ.ui.render([

				'<div class="cheers__item" data-link="received" data-before-id="'+ ch.before_id +'" data-cheers-id="' + ch.cheers_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						LJ.cheers.renderCheersItemIcon__Received( ch.status ),
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + groupname_html +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-location-empty"></i></div>',
							'<h4>' + address + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderCheersItemIcon__Sent: function( status ){

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
		renderCheersItem__Sent: function( cheers_object, main_host_profile, requested_with_profiles, address ){

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
						'<div class="row-pic__image">' + img_html + '</div>',
						LJ.cheers.renderCheersItemIcon__Sent( ch.status ),
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
		setCloseType: function( close_type ){

			LJ.cheers.close_type = close_type;

		},
		getCloseType: function(){

			return LJ.cheers.close_type;

		},
		showValidateCheers: function( cheers_id ){

			if( LJ.cheers.getActiveCheersBack() == cheers_id ){
				return 
			}

			LJ.cheers.setActiveCheersBack( cheers_id );
			LJ.cheers.makeCheersBack( cheers_id );

			if( LJ.chat.getChatState() == "hidden" ){
				LJ.cheers.setCloseType("hide_all");
				LJ.chat.showChatWrap();
			} else {
				// Chat was already opened. Only set a cheers_mode if none was set before
				if( !LJ.cheers.getCloseType() ){
					LJ.cheers.setCloseType("hide_cheers_back");
				}
			}
			LJ.cheers.showCheersBack();

		},
		setCheersBackState: function( state ){

			LJ.cheers.cheers_back_state = state;

		},
		getCheersBackState: function(){

			return LJ.cheers.cheers_back_state;

		},
		pendifyCheersItem: function(){

			if( LJ.cheers.getCheersBackState() != "idle" ){
				return LJ.wlog('Cheers back object isnt in an idle state');
			}

			LJ.cheers.setCheersBackState("pending");
			LJ.cheers.showCheersBackLoader();
			LJ.cheers.showCheersBackOverlay();

		},
		dependifyCheersItem: function(){

			if( LJ.cheers.getCheersBackState() != "pending" ){
				return LJ.wlog('Cheers back object isnt in an pending state');
			}

			LJ.cheers.setCheersBackState("idle");
			LJ.cheers.hideCheersBackLoader();
			LJ.cheers.hideCheersBackOverlay();

		},
		makeCheersBack: function( cheers_id ){

			var cheers_item = LJ.cheers.getCheersItem( cheers_id );

			var members_profiles = _.filter( LJ.cheers.fetched_profiles, function(m){
				return cheers_item.members.indexOf( m.facebook_id ) != -1;
			});

			var html = LJ.cheers.renderCheersBack( members_profiles );

			LJ.cheers.addCheersBack( html );
			LJ.mainifyUserRow( $('.cheers-back'), cheers_item.main_member );
			LJ.cheers.setCheersBackHeader( cheers_item )
			return;

		},
		acceptifyCheersItem: function( chat_id ){

			LJ.log('Acceptifying cheers item... !');

			// Prepare the chat in the background
			LJ.chat.hideChatInview();
			LJ.chat.activateChat( chat_id );
			LJ.chat.showChatInview( chat_id );

			LJ.chat.bounceChatHeaderIcons( chat_id, 400 );

			// Fade out the chatback wrapper
			LJ.cheers.hideCheersBack();

		},
		resetCheersBackState: function(){

			LJ.cheers.setCloseType( null );
			LJ.cheers.setActiveCheersBack( null );
			LJ.cheers.setCheersBackState("idle");

		},
		removeCheersBack: function(){

			LJ.cheers.resetCheersBackState();
			$('.cheers-back').remove();

		},	
		hideCheersBack: function(){

			$('.cheers-back').velocity('shradeOut', {
				duration: 500,
				complete: function(){

					$( this ).remove();
					LJ.cheers.resetCheersBackState();
				}
			});

		},
		updateCheersItem: function( cheers_id, opts ){

			var cheers_item = LJ.cheers.getCheersItem( cheers_id );

			_.keys( cheers_item ).forEach(function( key ){
				if( opts[ key ] && typeof opts[ key ] == typeof cheers_item[ key ] ){
					cheers_item[ key ] = opts[ key ];
				}
			});

		},
		getCheersRow: function( cheers_id ){

			return $('.cheers__item[data-cheers-id="'+ cheers_id +'"]');

		},
		acceptifyCheersRow: function( cheers_id ){

			var $row        = LJ.cheers.getCheersRow( cheers_id );
			var cheers_item = LJ.cheers.getCheersItem( cheers_id );
			
			if( $row.length == 0 ){
				return;
			}
			
			var $icon;
			if( cheers_item.cheers_type == "sent" ){
				$icon = LJ.cheers.renderCheersItemIcon__Sent( "accepted" );
			} else {
				$icon = LJ.cheers.renderCheersItemIcon__Received( "accepted" );
			}

			$row.find('.row-pic__icon').replaceWith( $icon );

		},	
		setActiveCheersBack: function( cheers_id ){

			LJ.cheers.active_cheers_back = cheers_id;

		},
		getActiveCheersBack: function(){

			return LJ.cheers.active_cheers_back;

		},
		addCheersBack: function( html ){

			$('.chat').find('.cheers-back').remove();
			$( html ).hide().appendTo( $('.chat') );

		},
		showCheersBack: function(){

			$('.chat, .chat .cheers-back').css({ 'display': 'flex', 'opacity': '0' })
				.find('.cheers-back')
				.css({ 'opacity': '0' });

			LJ.cheers.refreshChatBackUsersJsp()
				// .then(function(){
				// 	return LJ.delay()
				// })
				.then(function(){
					$('.chat, .chat .cheers-back')
						.css({ 'display': 'flex', 'opacity': '1' });

				});

		},
		renderChatHeaderCloseIcon: function(){

			return [
				'<div class="chat-inview__icon x--close js-close-cheers-back x--round-icon">',
					'<i class="icon icon-cross-fat"></div>',
				'</div>'
			].join('');

		},
		setCheersBackHeader: function( cheers_item ){
			
			var $chat_header = $('.cheers-back').find('.chat-inview-header');
			// Replace icons
			$chat_header.find('.chat-inview__icon').remove();
			$chat_header.append( LJ.cheers.renderChatHeaderCloseIcon() );

			var formatted_date = LJ.text('chatinview_date', moment(cheers_item.begins_at) );
			$chat_header.find('.chat-inview-title__h1').html( '<span class="x--date">'+ formatted_date +'</span>' );
			$chat_header.find('.chat-inview-title__h2').html( '<span class="x--place">'+ cheers_item.place_name +'</span>' );

		},
		acceptifyChat: function(){

			
			
		},
		refreshChatBackUsersJsp: function(){
			
			var $w = $('.cheers-back');
			
			return LJ.ui.turnToJsp( $w.find('.cheers-back-users'), {
				jsp_id: 'cheers_back'
			});

		},
		renderCheersBack: function( members_profiles ){

			var pictures = [];
			members_profiles.forEach(function( u ){
				pictures.push({ img_id: u.img_id, img_vs: u.img_vs });
			});
			var pictures  = LJ.pictures.makeRosaceHtml( pictures, 'chat-inview' );
			var user_rows = LJ.renderUserRows( members_profiles );

			var cheers_back_html = LJ.chat.renderChatInviewHeader(); // Borrow it to the chat module

			return LJ.ui.render([

				'<div class="cheers-back">',
					cheers_back_html,
					'<div class="cheers-back-pictures">',
			        	pictures, 
			        '</div>',
					'<div class="cheers-back-groupname">',
						'<div class="cheers-back-groupname__h1">',
							'<span data-lid="cheers_back_groupname"></span>',
						'</div>',
					'</div>',
			        '<div class="cheers-back-users">',
			        	user_rows,
			        '</div>',
			        '<div class="cheers-back-actions">',
			        	'<button class="x--round-icon js-validate">',
			        		'<i class="icon icon-meedrink"></i>',
			        		'<span data-lid="chat_inview_validate"></span>',
			        	'</button>',
			        '</div>',
				'</div>'

			].join(''));

		},
        handleValidate: function(){

			var $s = $( this );

			if( LJ.cheers.getCheersBackState() == "pending" ){
				return;
			}

			var cheers_id = LJ.cheers.getActiveCheersBack();

        	LJ.log('Cheering back...');
        	LJ.cheers.cheersBack( cheers_id );

        },
        cheersBack: function( cheers_id ){

			var before_id = LJ.cheers.getCheersItem( cheers_id ).before_id;
			var members   = LJ.cheers.getCheersItem( cheers_id ).members;
			
			LJ.cheers.pendifyCheersItem();
        	LJ.api.changeGroupStatus({
        		cheers_id : cheers_id,
        		before_id : before_id,
        		members   : members,
        		status    : "accepted" 
        	})
    		.then(function( res ){
    			LJ.log("Cheers back successfully");

    		})
    		.catch(function( e ){
				
				LJ.log(e);
    			LJ.ui.showToast( LJ.text("to_default_error"), "error" );
    			LJ.cheers.dependifyCheersItem();

    		});

        },
        loaderifyCheersBack: function(){
        	return LJ.promise(function( resolve, reject ){	

        		var d = LJ.cheers.cheers_back_duration;

        		$('.cheers-back')
        			.children()
        			.velocity('shradeOut', { duration: d, display: 'none' });

	        	var d = LJ.static.renderStaticImage('slide_loader');
				$( d ).addClass('js-cheers-back-loader')
					  .hide().appendTo('.cheers-back')
					  .velocity('shradeIn', { duration: d, delay: d } );

				LJ.delay( 2*d ).then( resolve );

        	});

        },
        deloaderifyCheersBack: function(){
        	return LJ.promise(function( resolve, reject ){

	        	var d = LJ.cheers.cheers_back_duration;

				$('.js-cheers-back-loader')
					  .velocity('shradeOut', { duration: d, complete: function(){ $(this).remove(); }} );

        		$('.cheers-back')
        			.children()
        			.velocity('shradeIn', { duration: d, delay: d, display: 'flex' });


				LJ.delay( 2*d ).then( resolve );

        	});
        }

	});
		