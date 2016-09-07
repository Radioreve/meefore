
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		cheers_back_duration: 450,

		fetched_cheers     : [],
		fetched_profiles   : [],
		active_cheers_back : null,
		cheers_back_state  : "idle",

		init: function(){

			LJ.cheers.handleDomEvents();
			LJ.cheers.fetchAndAddCheers();
			return;

		},
		handleDomEvents: function(){

			$('body').on('click', '.cheers-row', LJ.cheers.handleCheersItemClicked__Chat );
			$('body').on('click', '.js-validate', LJ.cheers.handleValidate );
			$('body').on('click', '.js-close-cheers-back', LJ.cheers.handleCloseCheersBack );

		},
		handleCloseCheersBack: function(){

			LJ.chat.refreshChatRowsJsp().then(function(){

				LJ.cheers.resetCheersBackState();
				LJ.cheers.removeCheersBack();
				LJ.chat.hideChatInviewWrap();

			});

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

			$('.cheers-back').find('.loader__overlay').remove();

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

			// LJ.cheers.removeAllCheers__Rows();
			LJ.cheers.removeAllCheers__Chat();
			// LJ.cheers.showCheersLoader__Rows();
			LJ.cheers.showCheersLoader__Chat();

			LJ.api.fetchMeCheers()
				.then(function( res ){
					LJ.cheers.fetched_cheers = res.cheers;

				})
				.then(function(){
					LJ.cheers.sortCheers();

				})
				.then(function(){
					
					var main_hosts = _.map( LJ.cheers.fetched_cheers, 'main_host' );
					var members    = _.flatten( _.map( LJ.cheers.fetched_cheers, 'members' ) );

					var facebook_ids = _.uniq( _.concat( main_hosts, members ) );
					return LJ.api.fetchUsers( facebook_ids )

				})
				.then(function( res ){
					LJ.cheers.fetched_profiles = _.filter( _.map( res, 'user' ), Boolean );
					return {
						// cheers_main_html: LJ.cheers.renderCheersItems__Rows( LJ.cheers.fetched_cheers, LJ.cheers.fetched_profiles ),
						cheers_chat_html: LJ.cheers.renderCheersItems__Chat( LJ.cheers.fetched_cheers, LJ.cheers.fetched_profiles )
					}

				})
				.then(function( o ){
					// LJ.cheers.addCheersItems__Rows( o.cheers_main_html );
					LJ.cheers.addCheersItems__Chat( o.cheers_chat_html );
					return;

				})
				.then(function(){
					// LJ.cheers.hideCheersLoader__Rows();
					return LJ.cheers.hideCheersLoader__Chat();
					
				})
				.then(function(){
					// LJ.cheers.refreshCheersItemsState__Rows();
					// LJ.cheers.showCheersItems__Rows();
					LJ.emit("fetch_cheers_done");
					LJ.cheers.showCheersItems__Chat();

				})
				.catch(function( e ){
					LJ.cheers.hideCheersLoader__Chat();
					// LJ.cheers.hideCheersLoader__Rows();
					LJ.wlog(e);

				});

		},
		getCheersItem: function( cheers_id ){

			return _.find( LJ.cheers.fetched_cheers, function( ch ){
				return ch.cheers_id == cheers_id;
			});

		},
		showValidateCheers: function( cheers_id ){
			
			var cheers_item      = LJ.cheers.getCheersItem( cheers_id );
			var members_profiles = _.filter( LJ.cheers.fetched_profiles, function(m){
				return cheers_item.members.indexOf( m.facebook_id ) != -1;
			});

			LJ.cheers.setActiveCheersBack( cheers_id );
			var html = LJ.cheers.renderCheersBackHive( members_profiles, cheers_item.requested_at );
			LJ.cheers.addCheersBack( html );
			LJ.chat.showChatWrap();
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
			LJ.cheers.scaleOutCheersBack();
			LJ.ui.showLoader("cheers_back");
			LJ.cheers.showCheersBackOverlay();

		},
		dependifyCheersItem: function(){

			if( LJ.cheers.getCheersBackState() != "pending" ){
				return LJ.wlog('Cheers back object isnt in an pending state');
			}

			LJ.cheers.setCheersBackState("idle");
			LJ.cheers.scaleInCheersBack();
			LJ.ui.hideLoader("cheers_back");
			LJ.cheers.hideCheersBackOverlay();

		},
		scaleOutCheersBack: function(){

			$('.cheers-back-pictures')
				.velocity({ 'scale' : [ .9, 1 ]}, {
					duration: 300
				});

		},
		scaleInCheersBack: function(){

			$('.cheers-back-pictures')
				.velocity({ 'scale' : [ 1, .9 ]}, {
					duration: 300
				});

		},
		resetCheersBackState: function(){

			LJ.cheers.setActiveCheersBack( null );
			LJ.cheers.setCheersBackState("idle");

		},
		removeCheersBack: function(){

			$('.cheers-back').remove();

		},	
		hideCheersBack: function(){

			$('.cheers-back').velocity('shradeOut', {
				duration: 500,
				complete: function(){

					LJ.cheers.removeCheersBack();
					LJ.cheers.resetCheersBackState();
				}
			});

		},
		updateCheersItem: function( cheers_id, opts ){

			var cheers_item = LJ.cheers.getCheersItem( cheers_id );

			cheers_item = _.merge( cheers_item, opts );

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
				$tag  = '<span class="row-body__tag">Match</span>';
			}

			$row.find('.row-pic__icon').replaceWith( $icon );
			$('.row-body__title').append('<span class="row-body__tag">Match</span>');

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
				.css({ 'display': 'flex', 'opacity': '0' });

			LJ.cheers.refreshChatBackUsersJsp()
				// .then(function(){
				// 	return LJ.delay()
				// })
				// .then(function(){
			$('.chat, .chat .cheers-back')
				.css({ 'display': 'flex', 'opacity': '1' });

				// });

		},
		refreshChatBackUsersJsp: function(){
			
			var $w = $('.cheers-back');
			
			return LJ.ui.turnToJsp( $w.find('.cheers-back-users'), {
				jsp_id: 'cheers_back'
			});

		},
		renderCheersBackHive: function( members_profiles, sent_at ){

			var pictures = LJ.pictures.makeHiveHtml( members_profiles, "user-cheers-back", {
				class_names : [ "js-show-profile" ],
				attach_data : [ "facebook_id" ]
			});

			var h1 = LJ.text("cheers_back_h1").replace('%groupname', LJ.renderMultipleNames( _.map( members_profiles, 'name' ) ) );
			var h2 = LJ.text("cheers_back_h2").replace('%date', LJ.makeFormattedDate( sent_at ));

			return LJ.ui.render([

				'<div class="cheers-back">',
					'<div class="chat-inview__icon x--previous js-close-cheers-back x--round-icon">',
						'<i class="icon icon-arrow-left-rounded"></i>',
					'</div>',
					'<div class="cheers-back-groupname">',
						'<div class="cheers-back-groupname__h1">',
							'<span>'+ h1 +'</span>',
						'</div>',
						'<div class="cheers-back-groupname__h2">',
							'<span>'+ h2 +'</span>',
						'</div>',
					'</div>',
					'<div class="cheers-back-pictures">',
			        	pictures, 
			        '</div>',
			        '<div class="cheers-back-actions">',
			        	'<button class="x--round-icon js-validate">',
			        		'<i class="icon icon-meedrink"></i>',
			        		'<span data-lid="chat_inview_validate"></span>',
			        	'</button>',
			        '</div>',
				'</div>'

			]);

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
        getCheersItemByMainMember: function( main_member ){

        	return _.find( LJ.cheers.fetched_cheers, function( ch ){
        		return ch.main_member == main_member;
        	});

        },
        getChatIds: function(){

        	return _.map( LJ.cheers.fetched_cheers, 'chat_id' );

        },
        getCheersIds: function(){

        	return _.map( LJ.cheers.fetched_cheers, 'cheers_id' );

        }

	});
		