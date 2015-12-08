
	_.merge( window.LJ.fn || {}, {

		handleDomEvents_Notifications: function(){

			$('#notifications').click(function(){

				var $self = $(this);

				// Toggle notifications pannel
				LJ.fn.toggleNotificationsPanel();

				// Kill bubbls
				$self.find('.bubble').addClass('filtered').text('');
			});

		},
		initNotifications: function(){

            // Notifications persistentes
            LJ.user.notifications.forEach(function( notification ){
                LJ.fn.insertNotification( notification );
            });

			// Notifications éphémères
			// Display after so they are always pinned to top
			LJ.fn.checkNotification_newUser();
            LJ.fn.checkNotification_noFriends();
            LJ.fn.checkNotification_fillProfile();


            // Daily notification
            // ...

		},
		toggleNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('active') ){
				LJ.fn.hideNotificationsPanel();
			} else {
				LJ.fn.showNotificationsPanel();
			}

		},
		showNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('active') ){
				LJ.fn.log('Notification panel already there', 1);
			} else {
				$('#notifications').addClass('notification-active');
				$notif.addClass('active')
					  .show();
			}

			LJ.jsp_api_notifications.reinitialise();

		},
		hideNotificationsPanel: function(){

			var $notif = $('.notifications-panel');

			if( $notif.hasClass('active') ){
				$('#notifications').removeClass('notification-active');
				$notif.removeClass('active')
					  .hide();
			} else {
				LJ.fn.log('Notification panel already hidden', 1);
			}

		},
		renderNotificationsPanel: function(){

			return LJ.fn.renderNotificationsElement('wrapper');

		},
		renderNotification_EventCreated: function( notification ){

			// NOT REALLY A NOTIFICATION BUT "ACTUALITY WIRE" ;=p

			// var options = {};
			// var n = 1337;

			// options.icon_code         = "glass";
			// options.text              = LJ.text_source["n_new_meefore_text"][ LJ.app_language ].replace('%place', notification.place_name );
			// options.subtext           = LJ.text_source["n_new_meefore_subtext"][ LJ.app_language ].replace('%n', n );
			// options.happened_at		  = LJ.fn.stringifyDuration( notification.happened_at );

			// return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_RequestAccepted: function( notification ){

			var options = {};
			var group_name = notification.group_name;

			var group_html = LJ.fn.renderNotificationsElement('group_name', { group_name: group_name });

			options.icon_code         = "chat";
			options.text              = LJ.text_source["n_accepted_in_text"][ LJ.app_language ].replace('%group_name', group_html );
			options.subtext           = LJ.text_source["n_accepted_in_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_UnreadMessages: function( notification ){

			var options  = {};

			options.icon_code         = "attention-alt";
			options.text              = LJ.text_source["n_unread_messages_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_unread_messages_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_GroupRequest: function( notification ){

			var options = {};
			var group_name = notification.group_name;

			var group_html = LJ.fn.renderNotificationsElement('group_name', { group_name: group_name });

			options.icon_code         = "group";
			options.text              = LJ.text_source["n_group_request_text"][ LJ.app_language ].replace('%group_name', group_html );
			options.subtext           = LJ.text_source["n_group_request_subtext"][ LJ.app_language ].replace('%group_name', group_html );
			options.happened_at = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_MarkedAsHost: function( notification ){

			var options = {};
			var friend_name = notification.friend_name;

			var friend_html = LJ.fn.renderNotificationsElement('friend_name', { friend_name: friend_name });

			options.icon_code         = "star-1";
			options.text              = LJ.text_source["n_marked_as_host_text"][ LJ.app_language ].replace('%friend_name', friend_html );
			options.subtext           = LJ.text_source["n_marked_as_host_subtext"][ LJ.app_language ];
			options.happened_at = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_InscriptionSuccess: function( notification ){

			var options = {};

			options.icon_code         = "ok";
			options.text              = LJ.text_source["n_inscription_success_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_inscription_success_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );


		},
		renderNotification_NoFriends: function( notification ){

			var options = {};

			options.icon_code         = "user-times";
			options.text              = LJ.text_source["n_no_friends_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_no_friends_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );


		},
		renderNotification_FillProfile: function( notification ){

			var options = {};

			options.icon_code         = "attention-alt";
			options.text              = LJ.text_source["n_fill_profile_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_fill_profile_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );


		},
		renderNotification_NewFriends: function( notification ){

			var options = {};

			var n_friends = notification.n_new_friends;

			options.icon_code         = "user-plus";
			options.subtext           = LJ.text_source["n_new_friends_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			if( n_friends == 1 ){
				options.text = LJ.text_source["n_new_friends_text_sin"][ LJ.app_language ].replace('%n', n_friends);
			} else {
				options.text = LJ.text_source["n_new_friends_text_plu"][ LJ.app_language ].replace('%n', n_friends);
			}
			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_CheckEmail: function( notification ){

			var options = {};

			options.icon_code         = "info";
			options.text              = LJ.text_source["n_check_email_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_check_email_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );


		},
		renderNotificationItem: function( options ){

			return LJ.fn.renderNotificationsElement( 'item', options );

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

            	html = html.concat([
            		'<div class="notification notification-click js-notification-item">',
                    	'<div class="notification__icon"><i class="icon icon-' + icon_code + '"></i></div>',
                    	'<div class="notification-message">',
	                    	'<div class="notification-message__text">' + text + '</div>',
	                    	'<div class="notification-message__subtext">' + subtext + '</div>',
                    	'</div>',
                    	'<div class="notification__date">' + happened_at + '</div>',
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
				
			var $html = $( html.join('') );

			if( happened_at == null ){
				$html.find('.notification__date').remove();	
			}

			LJ.fn.setAppLanguage( LJ.app_language, $html );
            return $html.prop('outerHTML');

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
				return LJ.text_source["h_min_ago"][ LJ.app_language ];
			}

			if( now - m < 3600 ){
				return LJ.text_source["h_hour_ago"][ LJ.app_language ];
			}

			if( m.dayOfYear() == now.dayOfYear() ){
				return LJ.text_source["h_today"][ LJ.app_language ].replace('%h', hour ).replace('%m', minute );
			}

			return LJ.text_source["h_past"][ LJ.app_language ].replace('%moment', m.format('DD/MM'))
															  .replace('%h', hour )
															  .replace('%m', minute )
			

		},
		pushNewNotification: function( notification ){

			LJ.fn.toastMsg( LJ.text_source["n_new_notification"][ LJ.app_language ], "info" );

			LJ.fn.insertNotification( notification );

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
				html += LJ.fn.renderNotification_RequestAccepted( notification );
				notificationCallback = LJ.fn.notificationCallback_AcceptedIn;
			}

			// A group requested to join in a meefore
			if( notification_id === "group_request" ){
				html += LJ.fn.renderNotification_GroupRequest( notification );
				notificationCallback = LJ.fn.notificationCallback_GroupRequest;
			}

			// Some messages are unread !
			if( notification_id === "unread_messages" ){
				html += LJ.fn.renderNotification_UnreadMessages( notification );
				notificationCallback = LJ.fn.notificationCallback_UnreadMessages;
			}

			// A friend taggued us as host on one of its meefore
			if( notification_id === "marked_as_host" ){
				html += LJ.fn.renderNotification_MarkedAsHost( notification );
				notificationCallback = LJ.fn.notificationCallback_MarkedAsHost;
			}


			// Flash notifications : only occurs based on cache informations (not persisted in db as part of users state)
			// First connexion occured, welcome on board
			if( notification_id === "inscription_success" ){
				html += LJ.fn.renderNotification_InscriptionSuccess( notification );
				notificationCallback = LJ.fn.notificationCallback_InscriptionSuccess;
			}

			// User still have no friends, needs a reminder to invite some!
			if( notification_id === "no_friends" ){
				html += LJ.fn.renderNotification_NoFriends( notification );
				notificationCallback = LJ.fn.notificationCallback_NoFriends;
			}

			// Profile isnt 100% complete! Especially photos...
			if( notification_id === "fill_profile" ){
				html += LJ.fn.renderNotification_FillProfile( notification );
				notificationCallback = LJ.fn.notificationCallback_FillProfile;
			}

			// New friends joined meefore
			if( notification_id === "new_friends" ){
				html += LJ.fn.renderNotification_NewFriends( notification );
				notificationCallback = LJ.fn.notificationCallback_NewFriends;
			}


			// Random notifications! "Did you know?" style
			// Make sure user knows its important we got its right email
			if( notification_id === "check_email" ){
				html += LJ.fn.renderNotification_CheckEmail( notification );
				notificationCallback = LJ.fn.notificationCallback_CheckEmail;
			}


			var $notif = $( html );

			// Notifications éphémères
			if( moment( notification.happened_at ) > moment( LJ.user.disconnected_at ) || type == "flash" ){

				LJ.fn.bubbleUp('#notifications');

				$notif.addClass('notification--new')
					  .one('click', function(){
					  	  $(this).removeClass('notification--new'); 
					  });

			}

			// if( $('.js-notification-item').length && $('.js-notification-item').length == max_item ){
			// 	$('.js-notification-item').last().remove();
			// }

			// Fire callback if registered
			if( typeof notificationCallback == "function" ){
				$notif.on('click', function(){
					notificationCallback( notification );
					LJ.fn.hideNotificationsPanel();
				});
			}

			// Append the new notification on top of all
			$notif.insertAfter( $('.js-notification-appender') );
			LJ.jsp_api_notifications.reinitialise();
				
		},
		// Insert notifications based on user profile stored in LJ.user.notifications
		insertNotifications: function( notifications ){

			notifications.sort(function( n1, n2 ){
				return n1.happened_at > n2.happened_at;
			});

			notifications.forEach(function( n, ind ){
				LJ.fn.insertNotification( n );
				
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
				return LJ.fn.warn('Cant register "unread messages" callback without event_id and chat_id ', 2);
			}

			LJ.fn.showChat( event_id, group_id );

		},
		notificationCallback_GroupRequest: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.fn.warn('Cant register "group request" callback without event_id and chat_id ', 2);
			}

			LJ.fn.showChat( event_id, group_id );

		},
		notificationCallback_AcceptedIn: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.fn.warn('Cant register "accepted_in" callback without event_id and chat_id ', 2);
			}

			LJ.fn.showChat( event_id, group_id );

		},
		notificationCallback_MarkedAsHost: function( n ){

			var event_id = n.event_id;
			var group_id = n.group_id;

			if( !event_id || !group_id ){
				return LJ.fn.warn('Cant register "unread marked as host" callback without event_id and chat_id ', 2);
			}

			LJ.fn.showChat( event_id, group_id );

		},
		notificationCallback_FillProfile: function( n ){

			$('#profile').click();

		},
		notificationCallback_CheckEmail: function( n ){

			$('#settings').click();

		},
		testNotificationPanel: function( stack ){

			if( !$('.notifications-panel').length ){
				LJ.$body.append( LJ.fn.renderNotificationsPanel() );
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
				},
				{
					"notification_id": "marked_as_host",
					"friend_name": "Odile",
					"happened_at": moment().subtract( 3, 'days' )
				}

			]

			LJ.fn.insertNotifications( test_notifications);

			LJ.fn.checkNotification_newUser();
            LJ.fn.checkNotification_noFriends();
            LJ.fn.checkNotification_fillProfile();

		},
		checkNotification_newUser: function(){

			if( LJ.user.status != 'new' ) return;

		   // Notification d'introduction
            LJ.fn.insertNotification({
				notification_id : "inscription_success",
				type            : "flash"
            });

		},
		checkNotification_noFriends: function(){

			if( LJ.user.friends.length != 0 ) return;

			LJ.fn.insertNotification({
				notification_id : "no_friends",
				type            : "flash"
            });

		},
		checkNotification_fillProfile: function(){

			var profile_filled = true;

			LJ.user.pictures.forEach(function( pic ){

				if( pic.img_id == LJ.settings.placeholder.img_id ){
					profile_filled = false;
				}

			});

			if( profile_filled ) return;

			LJ.fn.insertNotification({
				notification_id : "fill_profile",
				type            : "flash"
            });
			

		},
		checkNotification_unreadMessages: function(){

			var $messages       = $('.event-accepted-chat-message');
			var disconnected_at = LJ.user.disconnected_at;

			$messages.each(function( i, msg ){

				$msg = $(msg);

				var $wrap    = $msg.closest('.event-accepted-chat-wrap');
				var group_id = $wrap.attr('data-groupid');
				var event_id = $wrap.closest('[data-eventid]').attr('data-eventid');

				var unix  = $msg.find('.event-accepted-chat-sent-at').attr('data-sent-at'); // Timestamp unix
				var mdate = moment.unix( unix );

				// The message is not a real message
				if( $msg.hasClass('me') || $msg.hasClass('bot') )
					return;

				// The message was already seen by the user
				if( mdate < disconnected_at )
					return;

				if( $wrap.hasClass('hb-notified') )
					return;


				$wrap.addClass('hb-notified');

				LJ.fn.insertNotification({
					notification_id : "unread_messages",
					group_id      	: group_id,
					event_id     	: event_id,
					type         	: "flash"
				});
				

			});

		}


	});