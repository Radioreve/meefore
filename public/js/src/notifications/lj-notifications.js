
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

			// Notifications éphémères
			LJ.fn.checkNotification_newUser();
            LJ.fn.checkNotification_noFriends();

            // Notifications persistentes
            LJ.user.notifications.forEach(function( notification ){
                LJ.fn.insertNotification( notification );
            });

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

			options.icon_code         = "ok-1";
			options.text              = LJ.text_source["n_accepted_in_text"][ LJ.app_language ].replace('%group_name', group_html );
			options.subtext           = LJ.text_source["n_accepted_in_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_UnreadMessages: function( notification ){

			var options  = {};

			if( !chat_id ){
				return LJ.fn.warn('Cant render notification without chat_id (chat_id=' + chat_id + ')');
			}

			options.icon_code         = "user-plus";
			options.text              = LJ.text_source["n_unread_messages_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_unread_messages_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_GroupRequest: function( notification ){

			var options = {};
			var group_name = notification.group_name;

			var group_html = LJ.fn.renderNotificationsElement('group_name', { group_name: group_name });

			options.icon_code         = "user-plus";
			options.text              = LJ.text_source["n_group_request_text"][ LJ.app_language ].replace('%group_name', group_html );
			options.subtext           = LJ.text_source["n_group_request_subtext"][ LJ.app_language ].replace('%group_name', group_html );
			options.happened_at = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_MarkedAsHost: function( notification ){

			var options = {};
			var friend_name = notification.friend_name;

			var friend_html = LJ.fn.renderNotificationsElement('friend_name', { friend_name: friend_name });

			options.icon_code         = "attention-alt";
			options.text              = LJ.text_source["n_marked_as_host_text"][ LJ.app_language ].replace('%friend_name', friend_html );
			options.subtext           = LJ.text_source["n_marked_as_host_subtext"][ LJ.app_language ];
			options.happened_at = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );

		},
		renderNotification_InscriptionSuccess: function( notification ){

			var options = {};

			options.icon_code         = "attention-alt";
			options.text              = LJ.text_source["n_inscription_success_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_inscription_success_subtext"][ LJ.app_language ];
			options.happened_at 	  = LJ.fn.stringifyDuration( notification.happened_at );

			return LJ.fn.renderNotificationItem( options );


		},
		renderNotification_NoFriends: function( notification ){

			var options = {};

			options.icon_code         = "attention-alt";
			options.text              = LJ.text_source["n_no_friends_text"][ LJ.app_language ];
			options.subtext           = LJ.text_source["n_no_friends_subtext"][ LJ.app_language ];
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

                        '<div class="js-notification-appender notification--none"></div>',
						// There goes the notification                        

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
		insertNotification: function( notification ){

			var max_item  = 5;

			var html                 = '';
			var type                 = notification.type;
			var hl                   = notification.highlight || false;


			if( type === "accepted_in" ){
				html += LJ.fn.renderNotification_RequestAccepted( notification );
				notificationCallback = LJ.fn.notificationCallback_AcceptedIn;
			}

			if( type === "group_request" ){
				html += LJ.fn.renderNotification_GroupRequest( notification );
				notificationCallback = LJ.fn.notificationCallback_GroupRequest;
			}

			if( type === "unread_messages" ){
				html += LJ.fn.renderNotification_UnreadMessages( notification );
				notificationCallback = LJ.fn.notificationCallback_UnreadMessages;
			}

			if( type === "marked_as_host" ){
				html += LJ.fn.renderNotification_MarkedAsHost( notification );
				notificationCallback = LJ.fn.notificationCallback_MarkedAsHost;
			}

			if( type === "inscription_success" ){
				html += LJ.fn.renderNotification_InscriptionSuccess( notification );
				notificationCallback = LJ.fn.notificationCallback_InscriptionSuccess;
			}

			if( type === "no_friends" ){
				html += LJ.fn.renderNotification_NoFriends( notification );
				notificationCallback = LJ.fn.notificationCallback_NoFriends;
			}

			var $notif = $( html );

			// Notifications éphémères
			if( hl || notification.happened_at > LJ.user.disconnected_at ){
				LJ.fn.bubbleUp('#notifications');
				$notif.addClass('notification--new')
					  .one('click', function(){ $(this).removeClass('notification--new'); });
			}

			if( $('.js-notification-item').length && $('.js-notification-item').length == max_item ){
				$('.js-notification-item').last().remove();
			}

			// Fire callback if registered
			if( typeof notificationCallback == "function" ){
				$notif.on('click', function(){
					notificationCallback( notification );
				});
			}

			// Append the new notification on top of all
			$notif.insertAfter( $('.js-notification-appender') )
				
		},
		insertNotifications: function( notifications ){

			notifications.sort(function( n1, n2 ){
				return n1.happened_at > n2.happened_at;
			});

			notifications.forEach(function( n, ind ){
				LJ.fn.insertNotification( n );
				
			});

		},
		notificationCallback_NoFriends: function( n ){
			
		},
		notificationCallback_InscriptionSuccess: function( n ){

		},
		notificationCallback_UnreadMessages: function( n ){

			var event_id = n.event_id;
			var chat_id  = n.chat_id;

			if( !event_id || !chat_id ){
				return LJ.fn.warn('Cant register "unread messaged" callback without event_id and chat_id ');
			}

			// Show event panel && specific chat that contain unread messages
			LJ.fn.showEventInview( event_id );
			LJ.fn.activateEventTabview( event_id );

		},
		notificationCallback_GroupRequest: function( n ){

		},
		notificationCallback_AcceptedIn: function( n ){

		},
		notificationCallback_MarkedAsHost: function( n ){

		},
		testNotificationPanel: function(){

			if( !$('.notifications-panel').length ){
				LJ.$body.append( LJ.fn.renderNotificationsPanel() );
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
				},
				{
					"type": "marked_as_host",
					"friend_name": "Odile",
					"happened_at": moment().subtract( 3, 'days' )
				}

			]

			LJ.fn.insertNotifications( test_notifications, 3 );

		},
		checkNotification_newUser: function(){

			if( LJ.user.status != 'new' ) return;

		   // Notification d'introduction
            LJ.fn.insertNotification({
				type        : "inscription_success",
				happened_at : LJ.user.signup_date
            });

		},
		checkNotification_noFriends: function(){

			if( LJ.user.friends.length != 0 ) return;

			LJ.fn.insertNotification({
				type        : "no_friends",
				happened_at : null,
				highlight   : true
            });

		},
		checkNotification_unreadMessages: function(){

			var $messages       = $('.event-accepted-chat-message');
			var disconnected_at = LJ.user.disconnected_at;

			$messages.each(function( i, msg ){

				$msg = $(msg);

				var $wrap    = $msg.closest('.event-accepted-chat-wrap');
				var chat_id  = $wrap.attr('data-chatid');
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
					type        : "unread_messages",
					chat_id     : chat_id,
					event_id    : event_id,
					highlight   : true,
					happened_at : null
				});


				

			});

		}


	});