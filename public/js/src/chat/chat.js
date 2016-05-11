
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		state: 'hidden',
		fetched_chats: {},

		init: function(){
				
			LJ.chat.handleDomEvents();
			LJ.chat.addAndFetchChats();
			LJ.chat.navigate('all');

			return;

		},
		handleDomEvents: function(){

			$('.app__menu-item.--chats').on('click', LJ.chat.handleToggleChatWrap );
			$('.chat__close').on('click', LJ.chat.hideChatWrap );
			$('.chat').on('click', '.segment__part', LJ.chat.handleChatNavigate );
			$('.chat').on('click', '.chat-row', LJ.chat.handleShowChatInview );

			LJ.chat.handleDomEvents__Inview();

		},	
		addAndFetchChats: function(){

			// Keep only the channels that are chat-related
			var channels = _.filter( LJ.user.channels, 'channel_all' );

			channels.forEach(function( channel_item ){
				LJ.chat.addAndFetchOneChat( channel_item );
			});


		},		
		addAndFetchOneChat: function( channel_item ){

			LJ.log('Initializing one chat...');

			return LJ.Promise.resolve()
					// Render static HTML that will be dynamically filled (sync)
					.then(function(){
						return LJ.chat.setupChatRow( channel_item );

					})
					// Render static HTML that will be dynamically filled (sync)
					.then(function(){
						return LJ.chat.setupChatInview( channel_item );
						
					})
					// Find the profiles of everyone 
					.then(function(){
						var hosts_profiles   = LJ.api.fetchUsers( channel_item.hosts );
						var members_profiles = LJ.api.fetchUsers( channel_item.members );

						return LJ.Promise.all([ hosts_profiles, members_profiles ]);

					})
					// Update the pictures based on users id (async)
					.then(function( res ){

						var hosts_profiles   = _.map( res[0], 'user' );
						var members_profiles = _.map( res[1], 'user' );

						var main_member_profile = _.find( members_profiles, function(m){ return m.facebook_id == channel_item.main_member; });
						var main_host_profile   = _.find( hosts_profiles, function(h){ return h.facebook_id == channel_item.main_host });

						LJ.chat.fetched_chats[ channel_item.group_id ] = {
							hosts_profiles      : hosts_profiles,
							members_profiles    : members_profiles,
							main_host_profile   : main_host_profile,
							main_member_profile : main_member_profile
						};

						return LJ.chat.updateChatRowPicture( channel_item );
						
					})
					// Fetch the last chat messages (async)
					.then(function(){
						var chat_messages_all  = LJ.api.fetchChatHistory( channel_item.channel_all );
						var chat_messages_team = LJ.api.fetchChatHistory( channel_item.channel_team );

						return LJ.Promise.all([ chat_messages_all, chat_messages_team ])

					})
					// Add them to the DOM (sync)
					.then(function( res ){

						// Add messages to the all chat
						LJ.chat.addChatMessages({
							channel_item     : channel_item,
							chat_messages 	 : res[0],
							chat_type	  	 : "all"
						});

						// Add messages to the team chat
						LJ.chat.addChatMessages({
							channel_item     : channel_item,
							chat_messages 	 : res[1],
							chat_type	  	 : "team"
						});

						return;
						
					})
					.then(function(){
						return LJ.ui.showToast('Le chat a été chargé avec succès');
						
					})
					.catch(function( e ){
						LJ.wlog(e);

					});


		},
		setupChatRow: function( channel_item ){
			
			var group_id  = channel_item.group_id;
			var status    = channel_item.status;
			var before_id = channel_item.before_id;
			
			var before = LJ.before.findById( before_id );

			if( !before ){
				return LJ.wlog('Unable to find user before details (not fetched), before_id="' + before_id );
			}
			
			var html;
			if( status == "hosting" ){
				html = LJ.chat.renderChatRow__Hosting( group_id, before );
			}

			if( status == "pending" ){
				html = LJ.chat.renderChatRow__Pending( group_id, before );
			}

			if( status == "accepted" ){
				html = LJ.chat.renderChatRow__Accepted( group_id, before );
			}

			LJ.chat.addChatRow( html );					
			// LJ.chat.sortChatRows();
			LJ.chat.loaderifyChatRow( group_id );
			LJ.chat.showChatRow( group_id );

		},
		setupChatInview: function( channel_item ){

			var group_id     = channel_item.group_id;
			var before_id    = channel_item.before_id;
			var status       = channel_item.status;

			// Use Pusher channels as frontend ids to target each chat when new message arrives
			var chat_id_all  = channel_item.channel_all;
			var chat_id_team = channel_item.channel_team;
				
			// Extract the data we need
			var before = LJ.before.findById( before_id );

			if( !before ){
				return LJ.wlog('Unable to find user before details (not fetched), before_id="' + before_id );
			}

			var place_name = before.address.place_name;
			var begins_at  = before.begins_at;

			var opts = {
				group_id     : group_id,
				chat_id_all  : chat_id_all, 
				chat_id_team : chat_id_team,
				place_name   : place_name,
				begins_at    : begins_at

			};
						
			var html = LJ.chat.renderChatInview( opts );

			LJ.chat.addChatInview( html );
			LJ.chat.loaderifyChatInview( group_id );					

		},
		loaderifyChatInview: function( group_id ){
			
			var $chatinviews = $('.chat-inview-item[data-group-id="'+ group_id +'"]');

			$chatinviews.each(function( i, el ){

				var $loader = LJ.static.renderStaticImage( "chat_row_loader" );
				$(el).find('.chat-inview-messages').append( $loader );
				
			});

		},
		loaderifyChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			var $loader  = LJ.static.renderStaticImage( "chat_row_loader" );

			$chatrow.children().hide();
			$chatrow.append( $loader );

		},
		addChatInview: function( html ){

			$( html ).hide().appendTo('.chat-inview-wrap');

		},
		addChatRow: function( html ){

			$( html ).hide().appendTo('.chat-rows');

		},
		sortChatRows: function(){

			var L = $('.chat-row').length;
			for( var i = 0; i < L; i++ ){
				for( var j = i; j < L; j++ ){

					var e1 = $('.chat-row').eq(i);
					var e2 = $('.chat-row').eq(j);

					var t1 = e1.attr('data-last-message-at');
					var t2 = e2.attr('data-last-message-at');

					if( t1 < t2 ){
						LJ.swapNodes( t1[0], t2[0] );
					}
				}
			}

		},
		showChatRow: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			$chatrow.show();

		},
		updateChatRowPicture: function( channel_item ){

			LJ.log('Updating chat row pictures..');

			var group_id    = channel_item.group_id;
			var chat_object = LJ.chat.fetched_chats[ group_id ];

			var users       = channel_item.status == "hosting" ? chat_object.members_profiles : chat_object.hosts_profiles;
			
			// Render rosace
			var pictures = [];
			users.forEach(function( usr ){
				pictures.push({
					img_id: usr.img_id,
					img_vs: usr.img_vs
				});
			});

			// Insert rosace into the markup
			var pictures_html = LJ.pictures.makeRosaceHtml( pictures, 'chat-row' );
			$('.chat-row[data-group-id="'+ group_id +'"]')
				.find('.chat-row-pictures')
				.html( pictures_html );

			return;

		},
		addChatMessages: function( opts ){

			LJ.log('Adding chat messages...');

			var chat_type        = opts.chat_type;
			var chat_messages    = opts.chat_messages;
			var group_id 		 = opts.channel_item.group_id;
			var status           = opts.channel_item.status;

			var chat_id = (chat_type == "all") ? opts.channel_item.channel_all : opts.channel_item.channel_team;

			var main_member_profile = LJ.chat.fetched_chats[ group_id ].main_member_profile;
			var main_host_profile   = LJ.chat.fetched_chats[ group_id ].main_host_profile;

			var $wrap = $('.chat-inview-item[data-chat-id="'+ chat_id +'"]').find('.chat-inview-messages');
			var html;

			// No chat messages to append, render the proper empty view based on status
			if( chat_messages.length == 0 ){

				if( chat_type == "team" ){

					var group_name = LJ.renderGroupName( LJ.user.name );
					html = LJ.chat.renderChatInview__TeamEmpty( group_name );

				} else {

					if( status == "hosting" ){

						var group_name = LJ.renderGroupName( main_member_profile.name );
						html = LJ.chat.renderChatInview__HostsEmpty( group_name );

					}
					if( status == "pending" ){

						html = LJ.chat.renderChatInview__PendingEmpty();

					}
					if( status == "accepted" ){

						var group_name = LJ.renderGroupName( main_host_profile.name );
						html = LJ.chat.renderChatInview__AcceptedEmpty( group_name );

					}

				}

			} else {




			}

			$wrap.html( html );

		},
		handleShowChatInview: function(){

			var $s = $(this);
			var group_id = $s.attr('data-group-id');

			LJ.chat.showChatInview( group_id );

		},
		handleToggleChatWrap: function( e ){

			e.preventDefault();
			var $s = $(this);

			$s.toggleClass('--active');
			LJ.chat.toggleChatWrap();


		},
		toggleChatWrap: function(){

			if( LJ.chat.state == 'hidden' ){
				LJ.chat.showChatWrap();

			} else {
				LJ.chat.hideChatWrap();

			}

		},
		showChatWrap: function(){
			
			LJ.chat.state = 'visible';

			var $c     = $('.chat');
			var d      = LJ.search.filters_duration;

			LJ.ui.shradeAndStagger( $c, {
				duration: d
			});
			

		},
		hideChatWrap: function(){

			LJ.chat.state = 'hidden';
			$('.app__menu-item.--chats').removeClass('--active');

			var $c  = $('.chat');
			var $cc = $c.children();
			var d   = LJ.search.filters_duration;

			[ $cc, $c ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				});
			});

		},
		handleChatNavigate: function(){

			var $s = $(this);
			var target = $s.attr('data-link');

			LJ.chat.navigate( target );


		},
		navigate: function( target ){

			if( ['all','hosted','requested'].indexOf( target ) == -1 ){
				return LJ.wlog('Cannot navigate to other chat, invalid target : ' + target );
			}

			var $tar = $('.chat').find('.segment__part[data-link="'+ target +'"]');
			var $cur = $('.chat').find('.segment__part.--active');

			if( $tar.is( $cur ) ){
				return;
			}

			$cur.removeClass('--active');
			$tar.addClass('--active');

			var $targets_to_show;
			if( target == "all" ){
				$targets_to_show = $('.chat-row');

			} else {
				$targets_to_show = $('.chat-row[data-link="'+ target +'"]');

			}

			var $targets_to_hide = $('.chat-row').not( $targets_to_show );
			$targets_to_hide.hide();
			$('.chat-rows').find('.chat-empty').remove();

			if( $targets_to_show.length == 0 ){
				
				if( target == "all" ) return $('.chat-rows').append( LJ.chat.renderChatRow__AllEmpty() );
				if( target == "hosted" ) return $('.chat-rows').append( LJ.chat.renderChatRow__HostedEmpty() );
				if( target == "requested" ) return $('.chat-rows').append( LJ.chat.renderChatRow__RequestedEmpty() );

			} else {
				$targets_to_show.css({ display: 'flex' });

			}

		},
		renderChatRow__AllEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	: 'all',
				subtitle: '<span data-lid="chat_empty_subtitle_all"></span>'
			});

		},
		renderChatRow__HostedEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type 	: 'hosted',
				subtitle: '<span data-lid="chat_empty_subtitle_hosted"></span>'
			});
			
		},
		renderChatRow__RequestedEmpty: function(){

			return LJ.chat.renderChatEmpty({
				type    : 'requested',
				subtitle: '<span data-lid="chat_empty_subtitle_requested"></span>'
			});
			
		},
		renderChatEmpty: function( opts ){

			var subtitle = opts.subtitle;
			var type 	 = opts.type;

			var title    = opts.title || '<span data-lid="chat_empty_title"></span>';
			var icon 	 = opts.icon  || '<i class="icon icon-telescope"></i>';

			return LJ.ui.render([

				'<div class="chat-empty --'+ type + '">',
					'<div class="chat-empty__icon --round-icon">',
						icon,
					'</div>',
					'<div class="chat-empty__title">',
						title,
					'</div>',
					'<div class="chat-empty__subtitle">',
						subtitle,
					'</div>',
				'</div>'


			].join(''));

		},
		updateChatRowPreview: function( opts ){

			var message     = opts.message;
			var author_name = opts.author_name;
			var group_id     = opts.group_id;

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');

			$chatrow.find('.chat-row-infos__name --name').text( author_name );
			$chatrow.find('.chat-row-infos__preview').text( message );

		},
		updateChatRowBubble: function( group_id ){

			var $chatrow    = $('.chat-row[data-group-id="'+ group_id +'"]');
			var $chatinview = $('.chat-inview[data-group-id="'+ group_id +'"]');

			if( $chatinview.hasClass('--active') ){
				return LJ.wlog('Not bubbling up because inview is active');

			} else {
				return LJ.ui.bubbleUp( $chatrow );

			}

		},
		updateChatRowTime: function( opts ){

			var sent_at = opts.sent_at;
			var group_id = opts.group_id;

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');

			var s_date = LJ.text("chatrow_date", moment(sent_at) );
			$chatrow.find('.chat-row-time span').text( s_date );

		},
		updateChatRowStatus: function( group_id ){

			var $chatrow = $('.chat-row[data-group-id="'+ group_id +'"]');
			var $chatinview = $('.chat-inview[data-group-id="'+ group_id +'"]');

			if( $chatinview.hasClass('--active') ){
				return LJ.wlog('Not updating status because inview is active');

			} else {
				$chatrow.addClass('--new');
				$chatrow.insertBefore( $('.chat-row').first() );

			}

		},
		updateChatRow: function( opts ){

			var message  = opts.message;
			var group_id = opts.group_id;
			var sent_at  = opts.sent_at;

			LJ.chat.updateChatRowPreview({ message: message, group_id: group_id });
			LJ.chat.updateChatRowStatus( group_id );
			LJ.chat.updateChatRowBubble( group_id );
			LJ.chat.updateChatRowTime({ group_id: group_id, sent_at: sent_at });

		},
		renderChatRowDate__Hosting: function( date ){

			return LJ.chat.renderChatRowDate( date, {
				icon_html: '<i class="icon icon-star"></i>'
			});
		},
		renderChatRowDate__Pending: function( date ){

			return LJ.chat.renderChatRowDate( date, {
				icon_html: '<i class="icon icon-pending"></i>'
			});
		},
		renderChatRowDate__Accepted: function( date ){

			return LJ.chat.renderChatRowDate( date, {
				icon_html: '<i class="icon icon-chat"></i>'
			});
		},
		renderChatRowDate: function( date, opts ){

			var m = moment( date );
			var DD = m.format('DD');
			var MM = LJ.text("month")[ m.month() ].slice(0,3);
			var HH = m.format('HH:mm');

			return LJ.ui.render([

				'<div class="chat-row-date">',
		            '<div class="chat-row-date__status">',
		              opts.icon_html,
		            '</div>',
		            '<div class="chat-row-date__day">',
		              '<span class="--day">'+ DD +'</span> <span class="--month">'+ MM +'</span>',
		            '</div>',
		            '<div class="chat-row-date__splitter"></div>',
		            '<div class="chat-row-date__hour">',
		              '<span class="--hour">'+ HH +'</span>',
		            '</div>',
		         '</div>'

			].join(''));

		},
		renderChatRowPictures__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-pictures">',
					LJ.pictures.makeImgHtml( LJ.app_settings.placeholder.img_id, LJ.app_settings.placeholder.img_version, 'chat-row' ),
				'</div>'

			].join(''));


		},
		renderChatRowInfos__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-infos">',
					'<div class="chat-row-infos__name">',
						'<span class="--name"><span>',
						'<span class="js-user-online user-online"></span>',
					'</div>',
					'<div class="chat-row-infos__preview">',
		              '<span></span>',
		            '</div>',
				'</div>'

			].join(''));

		},
		renderChatRowTime__Placeholder: function(){

			return LJ.ui.render([

				'<div class="chat-row-time">',
					'<span></span>',
				'</div>'

			].join(''));

		},
		renderChatRow__Hosting: function( group_id, before, group_profiles ){

			return LJ.chat.renderChatRow( group_id, {
				date_html: LJ.chat.renderChatRowDate__Hosting( before.begins_at ),
				link_html: 'data-link="hosted"'
			});

		},
		renderChatRow__Pending: function( group_id, before, hosts_profiles ){

			return LJ.chat.renderChatRow( group_id, {
				date_html: LJ.chat.renderChatRowDate__Pending( before.begins_at ),
				link_html: 'data-link="requested"'
			});

		},
		renderChatRow__Accepted: function( group_id, before, hosts_profiles ){

			return LJ.chat.renderChatRow( group_id, {
				date_html: LJ.chat.renderChatRowDate__Accepted( before.begins_at ),
				link_html: 'data-link="requested"'
			});

		},
		renderChatRow: function( group_id, opts ){

			opts = opts || {};

			var data_link = opts.link_html;
			var date_html = opts.date_html;

			var infos_html = LJ.chat.renderChatRowInfos__Placeholder();
			var time_html  = LJ.chat.renderChatRowTime__Placeholder();
			var pics_html = LJ.chat.renderChatRowPictures__Placeholder();

			return LJ.ui.render([

				'<div class="chat-row" '+ data_link +' data-group-id="'+ group_id +'">',
					date_html,
					pics_html,
					infos_html,
					time_html,
				'</div>'

			].join(''));


		}



	});