
	
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

			$('.app__menu-item.--notifications').click( LJ.notifications.handleToggleNotifications );
			$('.app__menu-item.--notifications').click( LJ.notifications.updateNotificationsSeenAt );
			$('.notifications-panel').on('click', '.notification', LJ.notifications.updateNotificationClickedAt );

			LJ.ui.$body.on('click', LJ.notifications.handleHideNotifications );

		},
		refreshNotifications: function(){

			LJ.notifications.addAndShowNotifications();
			LJ.notifications.refreshNotificationsOrder();
			LJ.notifications.refreshNotificationsJsp();
			LJ.notifications.classifyNotifications();  
			LJ.notifications.refreshNotificationsBubble();   

		},
		resetBubbleToNotificationsIcon: function(){

			var $i = $('.app__menu-item.--notifications');
			LJ.ui.setBubble( $i, 0 );

		},
		addBubbleToNotificationsIcon: function(){

			var $i = $('.app__menu-item.--notifications');
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

			$w.find('.notification').removeClass('--seen').removeClass('--clicked');

			LJ.user.notifications.forEach(function( n ){

				var $n = $w.find('.notification[data-notification-id="'+ n.notification_id +'"]');

				// if( n.seen_at ){
				// 	$n.addClass('--seen');
				// }

				if( n.clicked_at ){
					$n.addClass('--clicked');
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
		handleToggleNotifications: function(e){

			e.preventDefault();
				
			var $self = $( this );
			// Toggle notifications pannel
			LJ.notifications.toggleNotificationsPanel();

			// Kill bubbls
			LJ.notifications.resetBubbleToNotificationsIcon();

		},
		handleHideNotifications: function(e){

			var $t = $( e.target );

			var is_not_nav_item    = !$t.closest('.app__menu-item.--notifications').length;
			var panel_visible      = $('.notifications-panel.--active').length;
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

			if( LJ.notifications.state == "visible" ){
				LJ.notifications.hideNotificationsPanel();

			} else {
				LJ.notifications.showNotificationsPanel();
			}

		},
		showNotificationsPanel: function(){

			var $notif = $('.notifications-panel');
			var $icon  = $('.app__menu-item.--notifications');

			if( LJ.notifications.state == "visible" ){

				LJ.log('Notification panel already there');

			} else {

				LJ.notifications.state = "visible";
				$icon.addClass('--active');
				$notif.addClass('--active').show();

			}

			LJ.notifications.refreshNotificationsJsp();

		},
		hideNotificationsPanel: function(){

			var $notif = $('.notifications-panel');
			var $icon  = $('.app__menu-item.--notifications');

			if( LJ.notifications.state == "visible" ){

				LJ.notifications.state = "hidden";
				$icon.removeClass('--active');
				$notif.removeClass('--active').hide();

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

			options.icon_code   = "drinks";
			options.text        = LJ.text("n_group_request_hosts_text");
			options.subtext     = LJ.text("n_group_request_hosts_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( {}, notification, options ) );

		},
		renderNotification__GroupRequestMembers: function( notification ){

			var options = {};

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == notification.main_member;
			});

			var name = friend && friend.name;

			options.icon_code   = "drinks";
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

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == main_host;
			});

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

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == shared_by;
			});

			var name = friend && friend.name;
			var type = notification.target_type == "user" ? LJ.text('lang_profile') : LJ.text('lang_before');

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
                        '<div class="notification notification--header">',
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
                    	'<div class="notification__icon --round-icon"><i class="icon icon-' + icon_code + '"></i></div>',
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

			if( now - m < 15 * 60 ){
				return LJ.text("h_min_ago");
			}

			if( now - m < 3600 ){
				return LJ.text("h_hour_ago");
			}

			if( m.dayOfYear() == now.dayOfYear() ){
				return LJ.text("h_today").replace('%h', hour ).replace('%m', minute );
			}

			return LJ.text("h_past").replace('%moment', m.format('DD/MM'))
															  .replace('%h', hour )
															  .replace('%m', minute )
			

		},
		pushNewNotification: function( notification ){

			LJ.ui.showToast( LJ.text("n_new_notification") );
			LJ.notifications.insertNotification( notification );
			LJ.notifications.refreshNotificationsJsp();

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


			// Someone has shared something
			if( type === "meepass_received" ){
				html = LJ.notifications.renderNotification__MeepassReceived( notification );
				notificationCallback = LJ.notifications.notificationCallback__MeepassReceived;
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
					notificationCallback( notification );
					LJ.notifications.hideNotificationsPanel();
				});
			}

			// Append the new notification on top of all
			$notif.insertAfter( $('.js-notification-appender') );
				
		},
		// Insert notifications based on user profile stored in LJ.user.notifications
		insertNotifications: function( notifications ){

			notifications.sort(function( n1, n2 ){
				return n1.happened_at > n2.happened_at;
			});

			notifications.forEach(function( n, ind ){
				LJ.notifications.insertNotification( n );
				
			});

		},
		notificationCallback__NoFriends: function( n ){

			LJ.facebook.showModalSendMessageToFriends();
			
		},
		notificationCallback__NewFriends: function( n ){

			LJ.nav.navigate("menu");
			LJ.menu.activateMenuSection("friends");

		},
		notificationCallback__InscriptionSuccess: function( n ){


		},
		notificationCallback__GroupRequestHosts: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "group request" callback without event_id and chat_id ' );
			}

		},
		notificationCallback__GroupRequestMembers: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "group request" callback without event_id and chat_id ' );
			}

		},
		notificationCallback__AcceptedIn: function( n ){

			var before_id = n.before_id;
			var group_id  = n.chat_id;

			if( !before_id || !chat_id ){
				return LJ.wlog('Cant register "accepted_in" callback without before_id and chat_id ' );
			}

			LJ.chat.showChat();
			LJ.chat.activateChatInview( chat_id );

		},
		notificationCallback__MarkedAsHost: function( n ){

			var begins_at = n.event_begins_at;

			evt = _.find( LJ.cache.events, function( evt ){
				return moment( evt.begins_at ).dayOfYear() == moment( begins_at ).dayOfYear();
			})

			if( !evt ){
				return LJ.ui.showToast( LJ.text("app_event_unavailable") );
			}

			var event_id = evt._id;
			var group_id = "hosts";

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "unread marked as host" callback without event_id and chat_id ' );
			}

			//LJ.notifications.showChat( event_id, group_id );

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
		testNotificationPanel: function( stack ){

			if( !$('.notifications-panel').length ){
				LJ.ui.$body.append( LJ.notifications.renderNotificationsPanel() );
			} else {
				if( !stack ){
					$('.js-notification-item').remove();
				}
			}

			var html = [];

			var test_notifications = [

				{
					"type": "group_request", 
					"group_name": "Les beaux mecs",
					"happened_at": moment()
				},
				{
					"type": "accepted_in",
					"group_name": "Les belles meufs",
					"happened_at": moment().subtract( 40, 'minutes' )
				},
				{
					"type": "unread_messages",
					"foo": "bar",
					"happened_at": moment().subtract( 1, 'days' )
				}

			]

			LJ.notifications.insertNotifications( test_notifications );

		},
		testNotificationStates: function(){

			LJ.user.notifications.forEach(function( n, i ){

				if( i == 0 ){
					n.seen_at = null;
					n.clicked_at = null;
				}

				if( i == 1 ){
					n.clicked_at = null;
				}

			});

			LJ.notifications.refreshNotifications();

		}

	});