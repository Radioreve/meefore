
	
	window.LJ.notifications = _.merge( window.LJ.notifications || {}, {

		state : 'hidden',
		jsp_id: 'notifications',

		init: function(){

			return LJ.notifications.addNotificationsPanel()
					.then(function(){
						LJ.notifications.refreshNotifications();
						LJ.notifications.handleDomEvents();
					});

		},
		handleDomEvents: function(){

			$('.app__menu-item.x--notifications').click( LJ.notifications.handleToggleNotifications );
			$('.app__menu-item.x--notifications').click( LJ.notifications.updateNotificationsSeenAt );
			$('.notifications-panel').on('click', '.notification', LJ.notifications.updateNotificationClickedAt );

			LJ.ui.$body.on('click', LJ.notifications.handleHideNotifications );

		},
		getNotification: function( n_id ){

			return _.find( LJ.user.notifications, function( n ){
				return n.notification_id == n_id;
			});

		},
		cacheNotification: function( notification ){

			LJ.user.notifications.push( notification );

		},
		refreshNotifications: function(){

			LJ.ui.adjustWrapperHeight( $('.notifications-panel') );
			LJ.notifications.addAndShowNotifications();
			LJ.notifications.refreshNotificationsOrder();
			LJ.notifications.refreshNotificationsJsp();
			LJ.notifications.classifyNotifications();  
			LJ.notifications.refreshNotificationsBubble();   

		},
		resetBubbleToNotificationsIcon: function(){

			var $i = $('.app__menu-item.x--notifications');
			LJ.ui.setBubble( $i, 0 );

		},
		addBubbleToNotificationsIcon: function(){

			var $i = $('.app__menu-item.x--notifications');
			LJ.ui.bubbleUp( $i );

		},
		refreshNotificationsBubble: function(){

			var $w = $('.notifications-panel');

			LJ.notifications.resetBubbleToNotificationsIcon();

			LJ.user.notifications.forEach(function( n ){

				if( !n.seen_at ){
					return LJ.notifications.addBubbleToNotificationsIcon();
				}

			});

		},
		classifyNotifications: function(){

			var $w = $('.notifications-panel');

			$w.find('.notification').removeClass('x--seen').removeClass('x--clicked');

			LJ.user.notifications.forEach(function( n ){

				var $n = $w.find('.notification[data-notification-id="'+ n.notification_id +'"]');

				// if( n.seen_at ){
				// 	$n.addClass('x--seen');
				// }

				if( n.clicked_at ){
					$n.addClass('x--clicked');
				}

			});

		},
		reorderNotifications: function( i ){

			i = i || 1;

			var notifs = LJ.user.notifications;	

			notifs.sort(function( n1, n2 ){
				return ( moment( n2.happened_at ) - moment( n1.happened_at ) ) * i;
			});

		},
		refreshNotificationsOrder: function(){
			
			var notifs = LJ.user.notifications;			

			LJ.notifications.reorderNotifications();

			notifs.forEach(function( n, i ){
				$('.notification[data-notification-id="'+ n.notification_id +'"]').css({ 'order': i });
			});

		},
		refreshNotificationsJsp: function(){

			LJ.ui.jsp[ LJ.notifications.jsp_id ].reinitialise();

		},
		addAndShowNotifications: function(){

			$('.notifications-panel').find('.js-notification-item').remove();

			LJ.user.notifications.forEach(function( notification ){
            	LJ.notifications.insertNotification( notification );
            });

		},
		findById: function( n_id ){

			return _.find( LJ.user.notifications, function( n ){
				return n.notification_id == n_id;
			});

		},
		updateNotificationsSeenAt: function(){

			var unseen_notifications = _.filter( LJ.user.notifications, function( n ){
				return !n.seen_at;
			});

			// Only call the api if there is something to call
			if( unseen_notifications.length != 0 ){
				LJ.api.updateNotificationsSeenAt();
			}

		},
		updateNotificationClickedAt: function(){

			var $n              = $( this );
			var notification_id = $n.attr('data-notification-id');
			var n               = LJ.notifications.findById( notification_id );

			if( !n.clicked_at ){

				LJ.api.updateNotificationClickedAt( notification_id );
				n.clicked_at = new Date();
				LJ.notifications.refreshNotifications();
			
			}

		},
		handleToggleNotifications: function( e ){

			e.preventDefault();
				
			var $self = $( this );
			// Toggle notifications pannel
			LJ.notifications.toggleNotificationsPanel();

			// Kill bubbls
			LJ.notifications.resetBubbleToNotificationsIcon();

		},
		handleHideNotifications: function( e ){

			if( LJ.isMobileMode() ){
				return;
			}

			var $t = $( e.target );

			var is_not_nav_item    = !$t.closest('.app__menu-item.x--notifications').length;
			var panel_visible      = $('.notifications-panel.x--active').length;
			var is_not_panel_child = !$t.closest('.notifications-panel').length;
			
			if( is_not_nav_item && is_not_panel_child && panel_visible ){
				LJ.notifications.hideNotificationsPanel();
			}

		},
		addNotificationsPanel: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.ui.$body.append( LJ.notifications.renderNotificationsPanel() );
				LJ.notifications.turnToJspNotificationsPanel()
					.then( resolve, reject );

			});
		},
		turnToJspNotificationsPanel: function(){

			return LJ.ui.turnToJsp('.notifications-panel__wrapper', {
					jsp_id: LJ.notifications.jsp_id
				})

		},
		toggleNotificationsPanel: function(){

			if( LJ.isMobileMode() && LJ.notifications.state == "visible" ){
				return;
			}

			if( LJ.notifications.state == "visible" ){
				LJ.notifications.hideNotificationsPanel();

			} else {
				LJ.notifications.showNotificationsPanel();
			}

		},
		showNotificationsPanel: function(){

			var $notif = $('.notifications-panel');
			var $icon  = $('.app__menu-item.x--notifications');

			LJ.ui.adjustWrapperHeight( $('.notifications-panel') );

			if( LJ.isMobileMode() ){
				LJ.nav.denavigate();
				LJ.ui.deactivateHtmlScroll();
			}

			if( LJ.notifications.state == "visible" ){

				LJ.log('Notification panel already there');

			} else {

				LJ.notifications.state = "visible";
				$icon.addClass('x--active');
				$notif.addClass('x--active').show();

			}

			LJ.notifications.refreshNotificationsJsp();

		},
		hideNotificationsPanel: function(){

			LJ.ui.activateHtmlScroll();
			
			var $notif = $('.notifications-panel');
			var $icon  = $('.app__menu-item.x--notifications');

			if( LJ.notifications.state == "visible" ){

				LJ.notifications.state = "hidden";
				$icon.removeClass('x--active');
				$notif.removeClass('x--active').hide();

			} else {
				LJ.log('Notification panel already hidden');

			}

		},
		renderNotificationsPanel: function(){

			return LJ.notifications.renderNotificationsElement('wrapper');

		},
		renderNotification__RequestAcceptedHosts: function( notification ){

			var options    = {};
			var group_html = LJ.notifications.renderNotificationsElement('group_name');
			
			options.icon_code   = "chat-bubble-duo";
			options.text        = LJ.text("n_accepted_in_text");
			options.subtext     = LJ.text("n_accepted_in_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		// Identical to the one just above, for now at least 
		renderNotification__RequestAcceptedMembers: function( notification ){

			var options    = {};
			var group_html = LJ.notifications.renderNotificationsElement('group_name');
			
			options.icon_code   = "chat-bubble-duo";
			options.text        = LJ.text("n_accepted_in_text");
			options.subtext     = LJ.text("n_accepted_in_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__FillProfile: function( notification ){

			var options = {};
			
			options.icon_code   = "question-mark";
			options.text        = LJ.text("n_fill_profile_text");
			options.subtext     = LJ.text("n_fill_profile_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );


		},
		renderNotification__GroupRequestHosts: function( notification ){

			var options = {};

			options.icon_code   = "meedrink";
			options.text        = LJ.text("n_group_request_hosts_text");
			options.subtext     = LJ.text("n_group_request_hosts_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__GroupRequestMembers: function( notification ){

			var options = {};

			var friend = LJ.friends.getFriendProfile( notification.main_member );

			var name = friend && friend.name;

			options.icon_code   = "meedrink";
			options.text        = LJ.text("n_group_request_members_text");
			options.subtext     = LJ.text("n_group_request_members_subtext").replace( '%name', name );
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__MarkedAsHost: function( notification ){

			var options = {};
			var main_host = notification.main_host;
			var address   = notification.address;
			var date 	  = moment( notification.begins_at ).format('DD/MM');

			var friend = LJ.friends.getFriendProfile( main_host );

			if( !friend ) return LJ.wlog('Cannot render marked as host, couldnt find friend: ' + friend );

			var friend_name = friend.name;
			
			options.icon_code   = "star";
			options.text        = LJ.text("n_marked_as_host_text").replace('%name', friend_name );
			options.subtext     = LJ.text("n_marked_as_host_subtext").replace('%date', date ).replace('%address', address );
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__NewFriends: function( notification ){

			var options = {};

			var new_friends = _.map( notification.new_friends, 'facebook_name' );
			
			options.icon_code   = "users";
			options.text 		= LJ.text("n_new_friends_text", new_friends );
			options.subtext     = LJ.text("n_new_friends_subtext", new_friends );
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__BeforeCanceled: function( notification ){

			var options = {};
			var address = notification.address;
			
			options.icon_code   = "line";
			options.text        = LJ.text("n_before_canceled_text");
			options.subtext     = LJ.text("n_before_canceled_subtext").replace('%address', address);
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );
			
		},
		renderNotification__ItemShared: function( notification ){

			var options   = {};
			var shared_by = notification.shared_by;

			var friend = LJ.friends.getFriendProfile( shared_by );
			var name = friend && friend.name;
			var type = notification.target_type == "user" ? LJ.text('w_profile') : LJ.text('w_before');

			options.icon_code   = "forward";
			options.text        = LJ.text("n_item_shared_text").replace( '%name', name );
			options.subtext     = LJ.text("n_item_shared_subtext").replace( '%name', name ).replace( '%type', type );
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );
			
		},
		renderNotification__InscriptionSuccess: function( notification ){

			var options = {};
			
			options.icon_code   = "heart";
			options.text        = LJ.text("n_inscription_success_text");
			options.subtext     = LJ.text("n_inscription_success_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );


		},
		renderNotification__NoFriends: function( notification ){

			var options = {};
			
			options.icon_code   = "add-friend";
			options.text        = LJ.text("n_no_friends_text");
			options.subtext     = LJ.text("n_no_friends_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );


		},
		renderNotification__CheckEmail: function( notification ){

			var options = {};
			
			options.icon_code   = "arobat";
			options.text        = LJ.text("n_check_email_text");
			options.subtext     = LJ.text("n_check_email_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );


		},
		renderNotificationItem: function( options ){

			return LJ.notifications.renderNotificationsElement( 'item', options );

		},
		renderNotificationsElement: function( element, options ){

			var html = [];
			var options = options || {};

            if( element == "wrapper" ){

                return LJ.ui.render([
                    '<div class="notifications-panel">',
                        '<div class="notification--header">',
                       		'<div data-lid="n_header_text" class="notification--header__text">Notifications</div>',
                        '</div>',
                        '<div class="notifications-panel__wrapper">',
	                        '<div class="js-notification-appender notification--none"></div>',
							// There goes the notifications                        
						'</div>',
                        '<div class="notification notification--footer">',
                            '<div data-lid="n_footer_text" class="notification--footer_text">This is the footer</div>',
                        '</div>',
                    '</div>'
                ].join(''));

            }

            if( element == "item" ){

				var type            = options.type;
				var icon_code       = options.icon_code;
				var text            = options.text;
				var subtext         = options.subtext;
				var happened_at     = options.happened_at;
				var notification_id = options.notification_id;

				var happened_at_html = happened_at ? '<div class="notification__date">' + happened_at + '</div>' : '';

            	return LJ.ui.render([
            		'<div class="notification js-notification-item" data-type="'+ type +'" data-notification-id="'+ notification_id +'">',
                    	'<div class="notification__icon x--round-icon"><i class="icon icon-' + icon_code + '"></i></div>',
                    	'<div class="notification-message">',
	                    	'<div class="notification-message__text">' + text + '</div>',
	                    	'<div class="notification-message__subtext">' + subtext + '</div>',
                    	'</div>',
                    	happened_at_html,
                    '</div>',
            	].join(''));
            }
			

		},
		stringifyDuration: function( happened_at ){

			var m = moment( happened_at );

			var hour = m.hour();
			var minute = m.minute();

			if( hour == 0 ){
				hour = "00";
			}

			if( minute < 10 ){
				minute = "0" + minute;
			}

			var now = moment();

			if( (now - m)/1000 < 5 * 60 ){
				return LJ.text("h_sec_ago");
			}

			if( (now - m)/1000 < 15 * 60 ){
				return LJ.text("h_min_ago");
			}

			if( (now - m)/1000 < 3600 ){
				return LJ.text("h_hour_ago");
			}

			if( m.dayOfYear() == now.dayOfYear() ){
				return LJ.text("h_today").replace('%h', hour ).replace('%m', minute );
			}

			return LJ.text("h_past").replace('%moment', m.format('DD/MM'))
															  .replace('%h', hour )
															  .replace('%m', minute )
			

		},
		insertNotification: function( notification ){
			
			var html = '';
			var type = notification.type;
			var type = notification.type || "default";

			var notificationCallback;

			// Accepted in a meefore
			if( type === "accepted_in_hosts" ){
				html = LJ.notifications.renderNotification__RequestAcceptedHosts( notification );
				notificationCallback = LJ.notifications.notificationCallback__AcceptedInHosts;
			}

			// Accepted in a meefore
			if( type === "accepted_in_members" ){
				html = LJ.notifications.renderNotification__RequestAcceptedMembers( notification );
				notificationCallback = LJ.notifications.notificationCallback__AcceptedInMembers;
			}


			// Profile isnt 100% complete! Especially photos...
			if( type === "fill_profile" ){
				html = LJ.notifications.renderNotification__FillProfile( notification );
				notificationCallback = LJ.notifications.notificationCallback__FillProfile;
			}


			// A group requested to join in a meefore, host version
			if( type === "group_request_hosts" ){
				html = LJ.notifications.renderNotification__GroupRequestHosts( notification );
				notificationCallback = LJ.notifications.notificationCallback__GroupRequestHosts;
			}

			// A group requested to join in a meefore, members version
			if( type === "group_request_members" ){
				html = LJ.notifications.renderNotification__GroupRequestMembers( notification );
				notificationCallback = LJ.notifications.notificationCallback__GroupRequestMembers;
			}


			// A friend taggued us as host on one of its meefore
			if( type === "marked_as_host" ){
				html = LJ.notifications.renderNotification__MarkedAsHost( notification );
				notificationCallback = LJ.notifications.notificationCallback__MarkedAsHost;
			}


			// New friends joined meefore
			if( type === "new_friends" ){
				html = LJ.notifications.renderNotification__NewFriends( notification );
				notificationCallback = LJ.notifications.notificationCallback__NewFriends;
			}


			// A before has been canceled 
			if( type === "before_canceled" ){
				html = LJ.notifications.renderNotification__BeforeCanceled( notification );
				notificationCallback = LJ.notifications.notificationCallback__BeforeCanceled;
			}

			
			// Someone has shared something
			if( type === "item_shared" ){
				html = LJ.notifications.renderNotification__ItemShared( notification );
				notificationCallback = LJ.notifications.notificationCallback__ItemShared;
			}


			// Welcome in meefore !
			if( type === "inscription_success" ){
				html = LJ.notifications.renderNotification__InscriptionSuccess( notification );
				notificationCallback = LJ.notifications.notificationCallback__InscriptionSuccess;
			}


			// Make sure user knows its important we got its right email
			if( type === "check_email" ){
				html = LJ.notifications.renderNotification__CheckEmail( notification );
				notificationCallback = LJ.notifications.notificationCallback__CheckEmail;
			}

			var $notif = $( html );

			// Fire callback if registered
			if( typeof notificationCallback == "function" ){
				$notif.on('click', function(){
					try {
						notificationCallback( notification );
					} catch( e ){
						LJ.ui.showToast( LJ.text("n_outdated_notification") );
					}
					LJ.notifications.hideNotificationsPanel();
				});
			}

			// Append the new notification on top of all
			$notif.insertAfter( $('.js-notification-appender') );
				
		},
		notificationCallback__InscriptionSuccess: function( n ){

			LJ.log('Welcome onboard !');

		},
		notificationCallback__NewFriends: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("friends");

		},
		notificationCallback__GroupRequestHosts: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("cheers");
			LJ.cheers.activateCheers("received");


		},
		notificationCallback__GroupRequestMembers: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("cheers");
			LJ.cheers.activateCheers("sent");

		},
		notificationCallback__AcceptedInMembers: function( n ){

			var before_id  = n.before_id;
			var chat_id    = LJ.chat.getChatIdByBeforeId( before_id );

			if( LJ.chat.getChatState() == "hidden" ){
				LJ.chat.showChatWrap();
			}

			LJ.chat.showChatInview( chat_id );
			LJ.chat.activateChat( chat_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.refreshChatState( chat_id );

		},
		notificationCallback__AcceptedInHosts: function( n ){

			var before_id  = n.before_id;
			var chat_id    = LJ.chat.getChatIdByBeforeId( before_id );

			if( LJ.chat.getChatState() == "hidden" ){
				LJ.chat.showChatWrap();
			}

			LJ.chat.showChatInview( chat_id );
			LJ.chat.activateChat( chat_id );
			LJ.chat.refreshChatJsp( chat_id );
			LJ.chat.refreshChatState( chat_id );

		},
		notificationCallback__MarkedAsHost: function( n ){

			var before_id  = n.before_id;
			// var chat_id    = LJ.chat.getChatIdByBeforeId( before_id );

			// if( LJ.chat.getChatState() == "hidden" ){
			// 	LJ.chat.showChatWrap();
			// }

			// LJ.chat.showChatInview( chat_id );
			// LJ.chat.activateChat( chat_id );
			// LJ.chat.refreshChatJsp( chat_id );
			// LJ.chat.refreshChatState( chat_id );

			LJ.before.fetchAndShowBeforeInview( before_id );

		},
		notificationCallback__FillProfile: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("profile");

		},
		notificationCallback__CheckEmail: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("settings");
			LJ.settings.activateSubmenuSection("account")

		},
		notificationCallback__BeforeCanceled: function( n ){

			LJ.ui.showToast( LJ.text("n_before_canceled") );

		}

	});