
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		init: function(){

			LJ.cheers.handleDomEvents();
			LJ.cheers.activateSegment("sent");
			return;

		},
		handleDomEvents: function(){

			$('.menu-section.--cheers').on('click', '.segment__part', LJ.cheers.handleSegmentClicked );
			$('.menu-item.--cheers').one('click', LJ.cheers.handleCheersClicked );

		},
		handleSegmentClicked: function(){

			var $seg = $( this );
			var link = $seg.attr('data-link');

			LJ.cheers.activateSegment( link );

		},
		activateSegment: function( link ){

			var $seg = $('.menu-section.--cheers').find('.segment__part[data-link="'+ link +'"]');

			if( $seg.hasClass('--active') ){
				return LJ.wlog('Already activated');
			}

			$seg.siblings().removeClass('--active');
			$seg.addClass('--active');

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
					duration: 500,
					complete: function(){
						$( this ).remove();
						resolve();
					}
				});

			});
		},
		handleCheersClicked: function(){

			LJ.cheers.showCheersLoader();
			LJ.cheers.clearAllCheers();
			LJ.cheers.refreshCheersItems();

		},	
		refreshCheersItems: function(){

			LJ.log('Fetching and setting cheers items...');

			var cheers;
			var user_profiles;

			LJ.cheers.showCheersLoader();

			LJ.api.fetchMeCheers()
				.then(function( res ){
					cheers = res.cheers;

				})
				.then(function(){
					var main_hosts     = _.map( cheers, 'main_host' );
					var main_members   = _.map( cheers, 'main_member');
					var requested_with = _.map( cheers, 'requested_with' );

					var facebook_ids = _.uniq( _.concat( main_hosts, main_members, requested_with ) );
					return LJ.api.fetchUsers( facebook_ids )

				})
				.then(function( res ){
					user_profiles = _.map( res, 'user' );
					return LJ.cheers.renderCheersItems( cheers, user_profiles );

				})
				.then(function( cheers_html ){
					return LJ.cheers.addCheersItems( cheers_html );

				})
				.then(function( $cheers ){
					return LJ.cheers.hideCheersLoader();

				})
				.then(function(){
					return LJ.cheers.showCheersItems();

				})
				.catch(function( e ){
					LJ.cheers.hideCheersLoader();
					LJ.wlog(e);

				});

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
					html.push( LJ.cheers.renderCheersItem__Received( ch, main_member_profile, ch.address ) );

				}

				if( ch.cheers_type == "sent" ){

					no_cheers_sent = false;
					var main_host_profile = _.find( user_profiles, function( u ){
						return u.facebook_id == ch.main_host;
					})
					var requested_with_profiles = _.filter( user_profiles, function( u ){
						return ch.requested_with.indexOf( u.facebook_id ) != -1;
					});
					html.push( LJ.cheers.renderCheersItem__Sent( ch, main_host_profile, requested_with_profiles, ch.address ));
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
		showCheersItems: function(){

			var $w = $('.cheers');

			$w.find('[data-link="' + "sent" + '"]').velocity('shradeIn', {
				duration : 250,
				display  : 'flex'
			});

		},
		renderCheersItem__ReceivedEmpty: function(){

			return LJ.ui.render([

				'<div class="empty" data-link="received">',
					'<div class="empty__icon --round-icon">',
						'<i class="icon icon-drinks"></i>',
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
					'<div class="empty__icon --round-icon">',
						'<i class="icon icon-drinks"></i>',
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
				return '<div class="row-pic__icon --round-icon"><i class="icon icon-drinks"></i></div>';
			}

			if( status == "accepted" ){
				return '<div class="row-pic__icon --round-icon"><i class="icon icon-chat-bubble-duo"></i></div>';
			}

		},
		renderCheersItem__Received: function( cheers_object, main_requester, address ){

			var ch = cheers_object;

			var formatted_date = LJ.text( "menurow_date", ch.requested_at );
			var img_html       = LJ.pictures.makeImgHtml( main_requester.img_id, main_requester.img_vs, 'menu-row' );

			var groupname 	   = LJ.renderGroupName( main_requester.name );
			var groupname_html = LJ.text('cheers_item_title_received').replace('%groupname', groupname);

			var address  	   = ch.address;

			return LJ.ui.render([

				'<div class="cheers__item" data-link="received" data-cheers-id="' + ch.cheers_id + '">',
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
							'<div class="row-body__icon --round-icon"><i class="icon icon-location"></i></div>',
							'<h4>' + address + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderCheersItemIcon__Sent: function( status ){

			if( status == "pending" ){
				return '<div class="row-pic__icon --round-icon"><i class="icon icon-pending"></i></div>';
			}

			if( status == "accepted" ){
				return '<div class="row-pic__icon --round-icon"><i class="icon icon-chat-bubble-duo"></i></div>';
			}

		},
		renderCheersItem__Sent: function( cheers_object, main_host_profile, requested_with_profiles, address ){

			var ch = cheers_object;

			var formatted_date       = LJ.text( "menurow_date", ch.requested_at );
			var img_html             = LJ.pictures.makeImgHtml( main_host_profile.img_id, main_host_profile.img_vs, 'menu-row' );

			var groupname            = LJ.renderGroupName( main_host_profile.name );
			var groupname_html       = LJ.text('cheers_item_title_sent').replace('%groupname', groupname );

			var requested_with_names = LJ.renderMultipleNames( _.map( requested_with_profiles, 'name' ) );
			var requested_with_html  = LJ.text("cheers_requested_with").replace( '%names', requested_with_names );

			var address              = ch.address;

			return LJ.ui.render([

				'<div class="cheers__item" data-link="sent" data-cheers-id="' + ch.cheers_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						'<div class="row-pic__filterlay --filterlay"></div>',
						LJ.cheers.renderCheersItemIcon__Sent( ch.status ),
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + groupname_html +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-users"></i></div>',
							'<h4>' + requested_with_html + '</h4>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-location"></i></div>',
							'<h4>' + address + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});
		