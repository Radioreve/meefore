	
	window.LJ.notifications = _.merge( window.LJ.notifications || {}, {

		jsp_id: 'notifications',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.notifications.addNotificationsPanel()
					.then(function(){

						// Notifications persistentes
			            // Certaines doivent être affichées de manière async à un autre moment
			            LJ.user.notifications.forEach(function( notification ){
			                LJ.notifications.insertNotification( notification );
			            });

						// Notifications éphémères
						// Display after so they are always pinned to top
						LJ.notifications.checkNotification_newUser();
			          // LJ.notifications.checkNotification_fillProfile();

			            // Daily notification
			            // ...
						LJ.notifications.handleDomEvents();

						resolve();
					});
			});
		},
		handleDomEvents: function(){

			$('.app__menu-item.--notifications').click(function(){

				var $self = $(this);
				// Toggle notifications pannel
				LJ.notifications.toggleNotificationsPanel();
				// Kill bubbls
				LJ.ui.setBubble('.app__menu-item.--notifications', 0);

			});

			LJ.ui.$body.click(function( e ){

				var $t = $( e.target );

				var is_not_nav_item    = !$t.closest('.app__menu-item.--notifications').length;
				var panel_visible      = $('.notifications-panel.--active').length;
				var is_not_panel_child = !$t.closest('.notifications-panel').length;
				
				if( is_not_nav_item && is_not_panel_child && panel_visible ){
					LJ.notifications.hideNotificationsPanel();
				}

			});

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
		renderNotificationsPanel: function(){

			return LJ.notifications.renderNotificationsElement('wrapper');

		},
		renderNotification_EventCreated: function( notification ){

			// NOT REALLY A NOTIFICATION BUT "ACTUALITY WIRE" ;=p

			// var options = {};
			// var n = 1337;

			// options.icon_code         = "glass";
			// options.text              = LJ.text("n_new_meefore_text").replace('%place', notification.place_name );
			// options.subtext           = LJ.text("n_new_meefore_subtext").replace('%n', n );
			// options.happened_at		  = LJ.notifications.stringifyDuration( notification.happened_at );

			// return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_RequestAccepted: function( notification ){

			var options = {};
			var group_name = notification.group_name;

			var group_html = LJ.notifications.renderNotificationsElement('group_name', { group_name: group_name });

			options.icon_code         = "chat-bubble-duo";
			options.text              = LJ.text("n_accepted_in_text").replace('%group_name', group_html );
			options.subtext           = LJ.text("n_accepted_in_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_UnreadMessages: function( notification ){

			var options  = {};

			options.icon_code         = "chat-bubble";
			options.text              = LJ.text("n_unread_messages_text");
			options.subtext           = LJ.text("n_unread_messages_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_GroupRequest: function( notification ){

			var options = {};
			var group_name = notification.group_name;

			var group_html = LJ.notifications.renderNotificationsElement('group_name', { group_name: group_name });

			options.icon_code         = "users";
			options.text              = LJ.text("n_group_request_text").replace('%group_name', group_html );
			options.subtext           = LJ.text("n_group_request_subtext").replace('%group_name', group_html );
			options.happened_at		  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_MarkedAsHost: function( notification ){

			var options = {};
			var friend_id = notification.facebook_id;

			var friend = _.find( LJ.user.friends, function( friend ){
				return friend.facebook_id == friend_id;
			})

			if( !friend ) return LJ.wlog('Cannot render marked as host, couldnt find friend: ' + friend );

			var friend_name = friend.name;

			var friend_html = LJ.notifications.renderNotificationsElement('friend_name', { friend_name: friend_name });

			options.icon_code         = "star";
			options.text              = LJ.text("n_marked_as_host_text").replace('%friend_name', friend_html );
			options.subtext           = LJ.text("n_marked_as_host_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_InscriptionSuccess: function( notification ){

			var options = {};

			options.icon_code         = "check";
			options.text              = LJ.text("n_inscription_success_text");
			options.subtext           = LJ.text("n_inscription_success_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );


		},
		renderNotification_NoFriends: function( notification ){

			var options = {};

			options.icon_code         = "add-friend";
			options.text              = LJ.text("n_no_friends_text");
			options.subtext           = LJ.text("n_no_friends_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );


		},
		renderNotification_FillProfile: function( notification ){

			var options = {};

			options.icon_code         = "bednight-empty";
			options.text              = LJ.text("n_fill_profile_text");
			options.subtext           = LJ.text("n_fill_profile_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );


		},
		renderNotification_NewFriends: function( notification ){

			var options = {};

			var n_friends = notification.n_new_friends;

			options.icon_code         = "user-add";
			options.subtext           = LJ.text("n_new_friends_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			if( n_friends == 1 ){
				options.text = LJ.text("n_new_friends_text_sin").replace('%n', n_friends);
			} else {
				options.text = LJ.text("n_new_friends_text_plu").replace('%n', n_friends);
			}
			return LJ.notifications.renderNotificationItem( options );

		},
		renderNotification_CheckEmail: function( notification ){

			var options = {};

			options.icon_code         = "arobat";
			options.text              = LJ.text("n_check_email_text");
			options.subtext           = LJ.text("n_check_email_subtext");
			options.happened_at 	  = LJ.notifications.stringifyDuration( notification.happened_at );

			return LJ.notifications.renderNotificationItem( options );


		},
		renderNotificationItem: function( options ){

			return LJ.notifications.renderNotificationsElement( 'item', options );

		},
		renderNotificationsElement: function( element, options ){

			var html = [];
			var options = options || {};

            if( element == "wrapper" ){

                html = html.concat([
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
                ]);

            }

            if( element == "item" ){

				var icon_code         = options.icon_code;
				var text              = options.text;
				var subtext           = options.subtext;
				var happened_at 	  = options.happened_at;

				var happened_at_html = happened_at ? '<div class="notification__date">' + happened_at + '</div>' : '';

            	html = html.concat([
            		'<div class="notification notification-click js-notification-item">',
                    	'<div class="notification__icon --round-icon"><i class="icon icon-' + icon_code + '"></i></div>',
                    	'<div class="notification-message">',
	                    	'<div class="notification-message__text">' + text + '</div>',
	                    	'<div class="notification-message__subtext">' + subtext + '</div>',
                    	'</div>',
                    	happened_at_html,
                    '</div>',
            	]);
            }

            if( element == "group_name" ){

            	var group_name = options.group_name;

            	html = html.concat([
            		'<span class="notification-message__group-name">' + group_name + '</span>'
            	]);

            }

            if( element == "friend_name" ){

            	var friend_name = options.friend_name;

            	html = html.concat([
            		'<span class="notification-message__friend-name">' + friend_name + '</span>'
            	]);

            }
			
			return LJ.ui.render( html.join('') );


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

		},
		insertNotification: function( notification ){

			// var max_item  = 5;

			var html                 = '';
			var notification_id      = notification.notification_id;
			var type 				 = notification.type || "default";

			var notificationCallback;

			// Permanent notifications
			// Accepted in a meefore
			if( notification_id === "accepted_in" ){
				html += LJ.notifications.renderNotification_RequestAccepted( notification );
				notificationCallback = LJ.notifications.notificationCallback_AcceptedIn;
			}

			// A group requested to join in a meefore
			if( notification_id === "group_request" ){
				html += LJ.notifications.renderNotification_GroupRequest( notification );
				notificationCallback = LJ.notifications.notificationCallback_GroupRequest;
			}

			// Some messages are unread !
			if( notification_id === "unread_messages" ){
				html += LJ.notifications.renderNotification_UnreadMessages( notification );
				notificationCallback = LJ.notifications.notificationCallback_UnreadMessages;
			}

			// A friend taggued us as host on one of its meefore
			if( notification_id === "marked_as_host" ){
				html += LJ.notifications.renderNotification_MarkedAsHost( notification );
				notificationCallback = LJ.notifications.notificationCallback_MarkedAsHost;
			}


			// Flash notifications : only occurs based on cache informations (not persisted in db as part of users state)
			// First connexion occured, welcome on board
			if( notification_id === "inscription_success" ){
				html += LJ.notifications.renderNotification_InscriptionSuccess( notification );
				notificationCallback = LJ.notifications.notificationCallback_InscriptionSuccess;
			}

			// User still have no friends, needs a reminder to invite some!
			if( notification_id === "no_friends" ){
				html += LJ.notifications.renderNotification_NoFriends( notification );
				notificationCallback = LJ.notifications.notificationCallback_NoFriends;
			}

			// Profile isnt 100% complete! Especially photos...
			if( notification_id === "fill_profile" ){
				html += LJ.notifications.renderNotification_FillProfile( notification );
				notificationCallback = LJ.notifications.notificationCallback_FillProfile;
			}

			// New friends joined meefore
			if( notification_id === "new_friends" ){
				html += LJ.notifications.renderNotification_NewFriends( notification );
				notificationCallback = LJ.notifications.notificationCallback_NewFriends;
			}


			// Random notifications! "Did you know?" style
			// Make sure user knows its important we got its right email
			if( notification_id === "check_email" ){
				html += LJ.notifications.renderNotification_CheckEmail( notification );
				notificationCallback = LJ.notifications.notificationCallback_CheckEmail;
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

			// if( $('.js-notification-item').length && $('.js-notification-item').length == max_item ){
			// 	$('.js-notification-item').last().remove();
			// }

			// Fire callback if registered
			if( typeof notificationCallback == "function" ){
				$notif.on('click', function(){
					notificationCallback( notification );
					LJ.notifications.hideNotificationsPanel();
				});
			}

			// Append the new notification on top of all
			$notif.insertAfter( $('.js-notification-appender') );
			LJ.ui.jsp[ LJ.notifications.jsp_id ].reinitialise();
				
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
		notificationCallback_NoFriends: function( n ){

			FB.ui({
				method: 'send',
				link: 'http://www.meefore.com'
			});

			
		},
		notificationCallback_NewFriends: function( n ){

			$('#profile').click();

		},
		notificationCallback_InscriptionSuccess: function( n ){


		},
		notificationCallback_UnreadMessages: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "unread messages" callback without event_id and chat_id ' );
			}

			LJ.notifications.showChat( event_id, group_id );

		},
		notificationCallback_GroupRequest: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "group request" callback without event_id and chat_id ' );
			}

			// LJ.notifications.showChat( event_id, group_id );

		},
		notificationCallback_AcceptedIn: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.wlog('Cant register "accepted_in" callback without event_id and chat_id ' );
			}

			// LJ.notifications.showChat( event_id, group_id );

		},
		notificationCallback_MarkedAsHost: function( n ){

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
		notificationCallback_FillProfile: function( n ){

			$('#profile').click();

		},
		notificationCallback_CheckEmail: function( n ){

			$('#settings').click();

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
            LJ.notifications.checkNotification_noFriends();
            LJ.notifications.checkNotification_fillProfile();

		},
		checkNotification_newUser: function(){

			if( LJ.user.status != 'new' ) return;

		   // Notification d'introduction
            LJ.notifications.insertNotification({
				notification_id : "inscription_success",
				type            : "flash"
            });

		},
		checkNotification_noFriends: function(){

			if( LJ.user.friends.length != 0 ) return;

			LJ.notifications.insertNotification({
				notification_id : "no_friends",
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
		checkNotification_unreadMessages: function( chat_id ){

			var $messages       = $('.event-accepted-chat-wrap[data-chatid="' + chat_id +'"]').find('.event-accepted-chat-message');
			var disconnected_at = LJ.user.disconnected_at;

			$messages.each(function( i, msg ){

				$msg = $(msg);

				var $wrap    = $msg.closest('.event-accepted-chat-wrap');
				var group_id = $wrap.attr('data-groupid');
				var event_id = $wrap.closest('[data-eventid]').attr('data-eventid');

				var unix  = $msg.find('.event-accepted-chat-sent-at').attr('data-sent-at'); // Timestamp unix

				// The message is not a real message
				if( $msg.hasClass('me') || $msg.hasClass('bot') )
					return;

				// The message was already seen by the user
				if( unix < moment( disconnected_at ).unix() )
					return;

				//LJ.ui.bubbleUpMessage( chat_id );


				if( $wrap.hasClass('hb-notified') )
					return;

				$wrap.addClass('hb-notified');

				LJ.notifications.insertNotification({
					notification_id : "unread_messages",
					group_id      	: group_id,
					event_id     	: event_id,
					type         	: "flash"
				});
				

			});

		}


	});