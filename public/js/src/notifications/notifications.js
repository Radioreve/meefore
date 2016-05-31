	
	window.LJ.notifications = _.merge( window.LJ.notifications || {}, {

		jsp_id: 'notifications',

		init: function(){

			LJ.notifications.addNotificationsPanel();
			// Notifications persistentes
            // Certaines doivent être affichées de manière async à un autre moment
            LJ.user.notifications.forEach(function( notification ){
               LJ.notifications.insertNotification( notification );
            });
			// Notifications éphémères
			// Display after so they are always pinned to top
			LJ.notifications.checkNotification_newUser();
          	LJ.notifications.checkNotification_fillProfile();
            // Daily notification
            // ...
			LJ.notifications.handleDomEvents();
			return;

		},
		handleDomEvents: function(){

			$('.app__menu-item.--notifications').click( LJ.notifications.handleToggleNotifications );
			LJ.ui.$body.on('click', LJ.notifications.handleHideNotifications );

		},
		handleToggleNotifications: function(e){

			e.preventDefault();
				
			var $self = $( this );
			// Toggle notifications pannel
			LJ.notifications.toggleNotificationsPanel();
			// Kill bubbls
			LJ.ui.setBubble('.app__menu-item.--notifications', 0);

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
			return LJ.promise(function( resolve, reject ){

				LJ.ui.turnToJsp('.notifications-panel__wrapper', {
					jsp_id: LJ.notifications.jsp_id
				}).then( resolve, reject );

			});
		},
		toggleNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('--active') ){
				LJ.notifications.hideNotificationsPanel();
			} else {
				LJ.notifications.showNotificationsPanel();
			}

		},
		showNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('--active') ){
				LJ.log('Notification panel already there');
			} else {
				$('.app__menu-item.--notifications').addClass('--active');
				$notif.addClass('--active')
					  .show();
			}

			LJ.ui.jsp[ LJ.notifications.jsp_id ].reinitialise();

		},
		hideNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('--active') ){
				$('.app__menu-item.--notifications').removeClass('--active');
				$notif.removeClass('--active')
					  .hide();
			} else {
				LJ.log('Notification panel already hidden');
			}

		},
		checkNotification_newUser: function(){

			if( LJ.user.status != 'new' ) return;

		   // Notification d'introduction
            LJ.notifications.insertNotification({
				notification_id : "inscription_success",
				type            : "flash"
            });

		},
		checkNotification_fillProfile: function(){

			var profile_filled = true;

			LJ.user.pictures.forEach(function( pic ){

				if( pic.img_id == LJ.app_settings.placeholder.img_id ){
					profile_filled = false;
				}

			});

			if( profile_filled ) return;

			LJ.notifications.insertNotification({
				notification_id : "fill_profile",
				type            : "flash"
            });
			
		},
		renderNotificationsPanel: function(){

			return LJ.notifications.renderNotificationsElement('wrapper');

		},
		renderNotification__RequestAccepted: function( notification ){

			var options    = {};
			var group_html = LJ.notifications.renderNotificationsElement('group_name');
			
			options.icon_code   = "chat-bubble-duo";
			options.text        = LJ.text("n_accepted_in_text");
			options.subtext     = LJ.text("n_accepted_in_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );

		},
		renderNotification__FillProfile: function( notification ){

			var options = {};
			
			options.icon_code   = "question-mark";
			options.text        = LJ.text("n_fill_profile_text");
			options.subtext     = LJ.text("n_fill_profile_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );


		},
		renderNotification__GroupRequest: function( notification ){

			var options = {};

			options.icon_code   = "drinks";
			options.text        = LJ.text("n_group_request_text");
			options.subtext     = LJ.text("n_group_request_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );

		},
		renderNotification__MarkedAsHost: function( notification ){

			var options = {};
			var main_host = notification.main_host;
			var address   = notification.address;

			var friend = _.find( LJ.friends.friends_profiles, function( f ){
				return f.facebook_id == main_host;
			});

			if( !friend ) return LJ.wlog('Cannot render marked as host, couldnt find friend: ' + friend );

			var friend_name = friend.name;
			
			options.icon_code   = "star";
			options.text        = LJ.text("n_marked_as_host_text").replace('%address', address );
			options.subtext     = LJ.text("n_marked_as_host_subtext").replace('%name', friend_name );
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );

		},
		renderNotification__NewFriends: function( notification ){

			var options = {};

			var n_friends = notification.n_new_friends;
			
			options.icon_code   = "user-add";
			options.subtext     = LJ.text("n_new_friends_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			if( n_friends == 1 ){
				options.text = LJ.text("n_new_friends_text_sin").replace('%n', n_friends);
			} else {
				options.text = LJ.text("n_new_friends_text_plu").replace('%n', n_friends);
			}
			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );

		},
		renderNotification__BeforeCanceled: function( notification ){

			var options = {};
			var address = notification.address;
			
			options.icon_code   = "line";
			options.text        = LJ.text("n_before_canceled_text");
			options.subtext     = LJ.text("n_before_canceled_subtext").replace('%address', address);
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );
			
		},
		renderNotification__ItemShared: function( notification ){

			var options   = {};
			var shared_by = notification.address;

			var name = 
			var type = before_type == "user" ? LJ.text('lang_profile') : LJ.text('lang_before');

			
			options.icon_code   = "line";
			options.text        = LJ.text("n_item_shared_text").replace('%name', name);
			options.subtext     = LJ.text("n_item_shared_subtext").replace('%name', name).replace('%type', type);
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );
			
		},
		renderNotification__InscriptionSuccess: function( notification ){

			var options = {};
			
			options.icon_code   = "check";
			options.text        = LJ.text("n_inscription_success_text");
			options.subtext     = LJ.text("n_inscription_success_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );


		},
		renderNotification__NoFriends: function( notification ){

			var options = {};
			
			options.icon_code   = "add-friend";
			options.text        = LJ.text("n_no_friends_text");
			options.subtext     = LJ.text("n_no_friends_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );


		},
		renderNotification__CheckEmail: function( notification ){

			var options = {};
			
			options.icon_code   = "arobat";
			options.text        = LJ.text("n_check_email_text");
			options.subtext     = LJ.text("n_check_email_subtext");
			options.happened_at = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( _.extend( notification, options ) );


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
                        '<div class="notification notification--footer notification-click">',
                            '<div data-lid="n_footer_text" class="notification--footer_text">This is the footer</div>',
                        '</div>',
                    '</div>'
                ].join(''));

            }

            if( element == "item" ){

            	var notification_id   = options.notification_id;
				var icon_code         = options.icon_code;
				var text              = options.text;
				var subtext           = options.subtext;
				var happened_at 	  = options.happened_at;

				var happened_at_html = happened_at ? '<div class="notification__date">' + happened_at + '</div>' : '';

            	return LJ.ui.render([
            		'<div class="notification notification-click js-notification-item">',
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
		stringifyDuration: function( m ){

			if( m == null )
				return null;

			if( !m._isAMomentObject )
				m = new moment( m );

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

			var html                 = '';
			var notification_id      = notification.notification_id;
			var type 				 = notification.type || "default";

			var notificationCallback;

			// Accepted in a meefore
			if( notification_id === "accepted_in" ){
				html = LJ.notifications.renderNotification__RequestAccepted( notification );
				notificationCallback = LJ.notifications.notificationCallback__AcceptedIn;
			}


			// Profile isnt 100% complete! Especially photos...
			if( notification_id === "fill_profile" ){
				html = LJ.notifications.renderNotification__FillProfile( notification );
				notificationCallback = LJ.notifications.notificationCallback__FillProfile;
			}


			// A group requested to join in a meefore
			if( notification_id === "group_request" ){
				html = LJ.notifications.renderNotification__GroupRequest( notification );
				notificationCallback = LJ.notifications.notificationCallback__GroupRequest;
			}


			// A friend taggued us as host on one of its meefore
			if( notification_id === "marked_as_host" ){
				html = LJ.notifications.renderNotification__MarkedAsHost( notification );
				notificationCallback = LJ.notifications.notificationCallback__MarkedAsHost;
			}


			// New friends joined meefore
			if( notification_id === "new_friends" ){
				html = LJ.notifications.renderNotification__NewFriends( notification );
				notificationCallback = LJ.notifications.notificationCallback__NewFriends;
			}


			// A before has been canceled 
			if( notification_id === "before_canceled" ){
				html = LJ.notifications.renderNotification__BeforeCanceled( notification );
				notificationCallback = LJ.notifications.notificationCallback__BeforeCanceled;
			}

			
			// Someone has shared something
			if( notification_id === "item_shared" ){
				html = LJ.notifications.renderNotification__ItemShared( notification );
				notificationCallback = LJ.notifications.notificationCallback__ItemShared;
			}


			// Someone has shared something
			if( notification_id === "meepass_received" ){
				html = LJ.notifications.renderNotification__MeepassReceived( notification );
				notificationCallback = LJ.notifications.notificationCallback__MeepassReceived;
			}


			// Welcome in meefore !
			if( notification_id === "inscription_success" ){
				html = LJ.notifications.renderNotification__InscriptionSuccess( notification );
				notificationCallback = LJ.notifications.notificationCallback__InscriptionSuccess;
			}


			// Make sure user knows its important we got its right email
			if( notification_id === "check_email" ){
				html = LJ.notifications.renderNotification__CheckEmail( notification );
				notificationCallback = LJ.notifications.notificationCallback__CheckEmail;
			}




			var $notif = $( html ).attr('data-notification-id', notification_id );

			// Notifications éphémères
			if( moment( notification.happened_at ) > moment( LJ.user.disconnected_at ) || type == "flash" ){

				LJ.ui.bubbleUp('.app__menu-item.--notifications');

				$notif.addClass('--new')
					  .one('click', function(){
					  	  $(this).removeClass('--new'); 
					  });

			}

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

			FB.ui({
				method: 'send',
				link: 'http://www.meefore.com'
			});

			
		},
		notificationCallback__NewFriends: function( n ){

			$('#profile').click();

		},
		notificationCallback__InscriptionSuccess: function( n ){


		},
		notificationCallback__GroupRequest: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "group request" callback without event_id and chat_id ' );
			}

			// LJ.notifications.showChat( event_id, group_id );

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

			LJ.nav.navigate("profile");
			LJ.menu.activateMenuSection("profile");

		},
		notificationCallback__CheckEmail: function( n ){

			LJ.nav.navigate("profile");
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
					"notification_id": "group_request", 
					"group_name": "Les beaux mecs",
					"happened_at": moment()
				},
				{
					"notification_id": "accepted_in",
					"group_name": "Les belles meufs",
					"happened_at": moment().subtract( 40, 'minutes' )
				},
				{
					"notification_id": "unread_messages",
					"foo": "bar",
					"happened_at": moment().subtract( 1, 'days' )
				}

			]

			LJ.notifications.insertNotifications( test_notifications );

			LJ.notifications.checkNotification_newUser();
            LJ.notifications.checkNotification_fillProfile();

		}
		


	});