	
	LJ.text = function( text_id, param ){
		var app_lang = LJ.lang.getAppLang();
		var text_src = LJ.text_source[ text_id ];

		if( !text_src ){
			return LJ.wlog('Error, couldnt find text source for text_id : ' + text_id );
		} else {
			if( typeof text_src[ app_lang ] == "function" ){
				return text_src[ app_lang ]( param );
			} else {
				return text_src[ app_lang ];
			}
		}
	};

	LJ.text_source = _.merge( LJ.text_source || {}, {

		pikaday: {
			"us": {
                previousMonth : 'Previous Month',
                nextMonth     : 'Next Month',
                months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
                weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            },
            "fr": {
            	previousMonth : 'Mois Précédant',
                nextMonth     : 'Mois Suivant',
                months        : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                weekdays      : ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
                weekdaysShort : ['Dim','Lun','Ma','Me','Jeu','Ven','Sam']
            }
		},
		day: {
			"fr": [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ],
			"us": [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
		},
		month: {
			"fr": ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
			"us": ['January','February','March','April','May','June','July','August','September','October','November','December']
		},
		h_sec_ago: {
			"fr": "à l'instant !",
			"us": "just now !"
		},
		h_min_ago: {
			"fr": "il y a quelques minutes",
			"us": "a few minuts ago"
		},
		h_hour_ago: {
			"fr": "il y a moins d'une heure",
			"us": "less than an hour ago"
		},
		today: {
			"fr": "Aujourd'hui",
			"us": "Today"
		},
		tomorrow: {
			"fr": "Demain",
			"us": "Tomorrow"
		},
		yesterday: {
			"fr": "Hier",
			"us": "Yesterday"
		},
		before_date_hour: {
			"fr": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			},
			"us": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			}
		},
		chatrow_date_hour: {
			"fr": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			},
			"us": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			}
		},
		chatinview_date_hour: {
			"fr": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			},
			"us": function( m ){
				return [ m.format('HH'), m.format('mm') ].join(':');
			}
		},
		before_date_day: {
			"fr": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return LJ.text_source['today']["fr"];
				}

				if( m.dayOfYear() == moment().dayOfYear() + 1 || ( moment().dayOfYear() + 1 == 1 ) ){
					return LJ.text_source['tomorrow']["fr"];
				}

				var d = LJ.text_source['day']['fr'][ m.day() ];
				var n = m.format('DD').replace(/^0/,'');
				var m = LJ.text_source['month']['fr'][ m.month() ].toLowerCase();

				return [ d, n, m ].join(' ');
			},
			"us": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return LJ.text_source['today']["us"];
				}

				if(  m.dayOfYear() == moment().dayOfYear() + 1 || ( moment().dayOfYear() + 1 == 1 ) ){
					return LJ.text_source['tomorrow']["us"];
				}

				var d = LJ.text_source['day']['us'][ m.day() ];
				var n = m.format('DD').replace(/^0/,'');
				var m = LJ.text_source['month']['us'][ m.month() ];

				m = m[0].toUpperCase() + m.slice(1); // english style

				return [ d, n, m ].join(' ');
			}
		},
		chatrow_date_day: {
			"fr": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return '';
				}

				if(  m.dayOfYear() == moment().dayOfYear() - 1 || ( moment().dayOfYear() - 1 == 365 ) ){
					return LJ.text_source['yesterday']["fr"].toLowerCase() + ', ';
				}

				var n = m.format('DD').replace(/^0/,'');
				var m = LJ.text_source['month']['fr'][ m.month() ].toLowerCase();

				return [ n, m ].join(' ') + ', ';
			},
			"us": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return '';
				}

				if(  m.dayOfYear() == moment().dayOfYear() + 1 || ( moment().dayOfYear() + 1 == 1 ) ){
					return LJ.text_source['yesterday']["us"].toLowerCase() + ', ';
				}

				var n = m.format('DD').replace(/^0/,'');
				var m = LJ.text_source['month']['us'][ m.month() ];

				m = m[0].toUpperCase() + m.slice(1); // english style

				return [ n, m ].join(' ') + ', ';
			}
		},
		chatinview_date_day: {
			"fr": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return LJ.text_source['today']["fr"];
				}

				if( m.dayOfYear() == moment().dayOfYear() + 1 || ( moment().dayOfYear() + 1 == 1 ) ){
					return LJ.text_source['tomorrow']["fr"];
				}

				var d = LJ.text_source['day']['fr'][ m.day() ];
				var n = m.format('DD').replace(/^0/,'');
				var m = m.format('MM');

				return [ d, [ n, m ].join('/') ].join(' ');
			},
			"us": function( m ){

				if( m.dayOfYear() == moment().dayOfYear() ){
					return LJ.text_source['today']["us"];
				}

				if(  m.dayOfYear() == moment().dayOfYear() + 1 || ( moment().dayOfYear() + 1 == 1 ) ){
					return LJ.text_source['tomorrow']["us"];
				}

				var d = LJ.text_source['day']['fr'][ m.day() ];
				var n = m.format('DD').replace(/^0/,'');
				var m = m.format('MM');

				return [ d, [ n, m ].join('/') ].join(' ');

			}
		},
		before_date: {
			"fr": function( m ){

				var day  = LJ.text_source["before_date_day"]["fr"]( m );
				var hour = LJ.text_source["before_date_hour"]["fr"]( m );

				return [ day, hour ].join(', ');

			},
			"us": function( m ){

				var day  = LJ.text_source["before_date_day"]["us"]( m );
				var hour = LJ.text_source["before_date_hour"]["us"]( m );

				return [ day, hour ].join(', ');

			}
		},
		chatrow_date: {
			"fr": function( m ){

				var day  = LJ.text_source["chatrow_date_day"]["fr"]( m );
				var hour = LJ.text_source["chatrow_date_hour"]["fr"]( m );

				return [ day, hour ].join('');

			},
			"us": function( m ){

				var day  = LJ.text_source["chatrow_date_day"]["us"]( m );
				var hour = LJ.text_source["chatrow_date_hour"]["us"]( m );

				return [ day, hour ].join('');

			}
		},
		chatinview_date: {
			"fr": function( m ){

				var day  = LJ.text_source["chatinview_date_day"]["fr"]( m );
				var hour = LJ.text_source["chatinview_date_hour"]["fr"]( m );

				return [ day, hour ].join(', ');

			},
			"us": function( m ){

				var day  = LJ.text_source["chatinview_date_day"]["us"]( m );
				var hour = LJ.text_source["chatinview_date_hour"]["us"]( m );

				return [ day, hour ].join('');

			}
		},
		menurow_date: {
			"fr": function( m ){ return LJ.text_source.before_date["fr"]( m ); },
			"us": function( m ){ return LJ.text_source.before_date["us"]( m ); }
		},
		h_today: {
			"fr": "aujourd'hui, à %hh%m",
			"us": "today, %hh%m"
		},
		h_past: {
			"fr": "Le %moment, à %hh%m",
			"us": "%moment, %hh%m"
		},
		t_language_changed: {
			"fr": "La langue a été changée",
			"us": "The language has been changed"
		},
		lang_change_title: {
			"fr": "Changer de langue",
			"us": "Change language"
		},
		lang_change_subtitle: {
			"fr": "La langue ne devrait jamais être une barrière pour sortir faire la fête.",
			"us": "Language should never get in the way of partying. Ever."
		},
		lang_soon: {
			"fr": "Prochainement",
			"us": "Soon"
		},
		lang_before: {
			"fr": "before",
			"us": "pregame"
		},
		lang_profile: {
			"fr": "profil",
			"us": "profile"
		},
		menu_profile: {
			"fr": "Profil",
			"us": "Profile"
		},
		menu_subsection_pictures: {
			"fr": "Mes 5 photos",
			"us": "My 5 photos"
		},
		menu_subsection_informations: {
			"fr": "A propos de moi",
			"us": "About me"
		},
		menu_subsection_account: {
			"fr": "Paramètres du compte",
			"us": "Account settings"
		},
		menu_subsection_code: {
			"fr": "Code d'invitation",
			"us": "Invite code"
		},
		menu_subsection_notifications: {
			"fr": "Notifications",
			"us": "Notifications"
		},
		menu_subsection_emails: {
			"fr": "Emails",
			"us": "Emails"
		},
		menu_subsection_ux: {
			"fr": "Expérience d'utilisation",
			"us": "User experience"
		},
		menu_shared: {
			"fr": "Partagés",
			"us": "Shared"
		},
		menu_cheers: {
			"fr": "Cheers",
			"us": "Cheers"
		},
		menu_friends: {
			"fr": "Mes amis",
			"us": "Friends"
		},
		menu_invite: {
			"fr": "Inviter des amis",
			"us": "Invite"
		},
		menu_settings: {
			"fr": "Préférences",
			"us": "Settings"
		},
		p_name_label: {
			"fr": "Nom",
			"us": "Name"
		},
		p_name_placeholder: {
			"fr": "Prad Bitt",
			"us": "Prad Bitt"
		},
		p_age_placeholder: {
			"fr": "18",
			"us": "18"
		},
		p_job_placeholder: {
			"fr": "Etudiant",
			"us": "Student"
		},
		p_ideal_night_placeholder: {
			"fr": "Les amis, les soirées, les rencontres...",
			"us": "Friends, parties, new people..."
		},
		p_age_label: {
			"fr": "Âge",
			"us": "Age"
		},
		p_country_label: {
			"fr": "Pays",
			"us": "Country"
		},
		p_job_label: {
			"fr": "Situation",
			"us": "Occupation"
		},
		p_location_label: {
			"fr": "Ville actuelle",
			"us": "Current city"
		},
		p_ideal_night_label: {
			"fr": "Ta soirée idéale",
			"us": "Your ideal night"
		},
		p_name_explanation: {
			"fr": "Pseudonyme par lequel les autres membres vous appelerons. Choose wisely.",
			"us": "Pseudo everyone will call you as. Choose wisely."
		},
		p_age_explanation: {
			"fr": "On évite de mentir ;-)",
			"us": "Please don't lie ;-)"
		},
		p_country_explanation: {
			"fr": "Votre nationalité est celle indiquée sur Facebook. En cas d'erreur, envoyez-nous un mail.",
			"us": "Your nationality is the one indicated on Facebook. If there is a mistake, please email us."
		},
		p_job_explanation: {
			"fr": "Concrètement, vous faites quoi dans la vie ?",
			"us": "So, how do you keep busy everyday ?"
		},
		p_location_explanation: {
			"fr": "Où sortez-vous en ce moment ? Meefore works everywhere",
			"us": "Where do you get out these days ? Meefore works everywhere"
		},
		p_ideal_night_explanation: {
			"fr": "Sans alcool, la fête est plus...",
			"us": "Knock yourself out"
		},
		p_friends_title: {
			"fr": "Mes amis Facebook",
			"us": "Everybody is on Meefore"
		},
		p_friends_subtitle: {
			"fr": "Vos amis Facebook sont tous sur Meefore. Il en manque? Invitez-les à vous rejoindre!",
			"us": "All your Facebook friends are on Meefore. Are some of them missing? Invite them to join!"
		},
		p_friends_nofriends: {
			"fr": "Vous n'avez aucun ami Facebook inscrit sur Meefore. Invitez-les pour commencer à participer à des meefore!",
			"us": "You don't have any Facebook friends on Meefore. Invite them all to start taking part in meefore!"
		},
		p_button_validate: {
			"fr": "Valider",
			"us": "OK"
		},
		p_button_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		p_picture_upload_success: {
			"fr": "Votre photo a été mise à jour",
			"us": "Your photo has been uploaded"
		},
		p_picture_upload_error: {
			"fr": "Une erreur s'est produite lors de l'envoie de la photo",
			"us": "An error occured during the upload, please try again later"
		},
		p_facebook_upload_title: {
			"fr": "Vos photos de profil Facebook",
			"us": "Your Facebook profile pictures"
		},
		h_search_placeholder: {
			"fr": "Rechercher quelqu'un",
			"us": "Looking for someone?"
		},
		h_logout: {
			"fr": "Se déconnecter",
			"us": "Log out"
		},
		e_title: {
			"fr": "Tous les meefore",
			"us": "Get the party started"
		},
		e_subtitle: {
			"fr": "L'abus de soirées est bon pour la santé",
			"us": "Non-stop partying is actually healthy"
		},
		e_create_button: {
			"fr": "Proposer un meefore",
			"us": "Create a meefore"
		},
		e_create_title: {
			"fr": "Proposer un meefore",
			"us": "Create a meefore"
		},
		e_create_hosts: {
			"fr": "Organisateurs",
			"us": "Hosts"
		},
		e_create_hosts_placeholder: {
			"fr": "Sélectionnez parmi vos amis (1 minimum)",
			"us": "Select among your friends (1 minimum)"
		},
		e_create_begins_at: {
			"fr": "Date du before",
			"us": "Before date"
		},
		e_create_begins_at_placeholder: {
			"fr": "Quel jour? ",
			"us": "Which day?"
		},
		e_create_hour: {
			"fr": "Heure du Before",
			"us": "Before hour"
		},
		e_create_hour_placeholder: {
			"fr": "Quelle heure?",
			"us": "What time?"
		},
		e_create_address: {
			"fr": "Lieu du before",
			"us": "Location"
		},
		e_create_address_placeholder: {
			"fr": "Où vous rejoignez-vous?",
			"us": "Where will you meet?"
		},
		e_create_party: {
			"fr": "Lieu de la soirée",
			"us": "Party location"
		},
		e_create_party_placeholder: {
			"fr": "Où allez-vous ensuite?",
			"us": "Where are you going next?"
		},
		e_create_agerange: {
			"fr": "Âge souhaité",
			"us": "Age preference"
		},
		e_create_ambiance: {
			"fr": "Ambiance",
			"us": "Ambiance"
		},
		e_create_ambiance_placeholder: {
			"fr": "#hashtagTonMeefore",
			"us": "#hashtagYourMeefore"
		},
		e_create_guests_type: {
			"fr": "Type d'invités",
			"us": "Guests type"
		},
		e_create_button_validate: {
			"fr": "Créer un meefore",
			"us": "Create a meefore"
		},
		e_create_button_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		e_create_loading_text: {
			"fr": "Votre meefore a été créé avec succès ! ",
			"us": "Your meefore has been successully created !"
		},
		e_request_title: {
			"fr": "Demande de participation",
			"us": "Participation request"
		},
		e_request_button_validate: {
			"fr": "Rejoindre ce meefore",
			"us": "Join this meefore"
		},
		e_request_group_name: {
			"fr": "Nom de ton groupe",
			"us": "Your group name"
		},
		e_request_group_members: {
			"fr": "Membres de ton groupe",
			"us": "Members of your group"
		},
		e_request_group_message: {
			"fr": "Message",
			"us": "Message"
		},
		e_request_group_name_placeholder: {
			"fr": "Ce nom apparaîtra dans le chat",
			"us": "This name will be displayed in the chat"
		},
		e_request_group_members_placeholder: {
			"fr": "Choisissez les personnes avec qui vous souhaitez sortir",
			"us": "Choose the people you wanna go out with"
		},
		e_request_group_message_placeholder: {
			"fr": "Dites-nous en plus à propos de votre groupe",
			"us": "Tell us more about your group"
		},
		e_request_button_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		e_request_event_got_canceled: {
			"fr": "Le meefore vient d'être annulé :/",
			"us": "The meefore just got canceled :/"
		},
		e_preview_participate: {
			"fr": "Participer",
			"us": "Participate"
		},
		e_preview_manage: {
			"fr": "Organiser",
			"us": "Organize"
		},
		e_mapview_first_to_create: {
			"fr": "Proposer un meefore",
			"us": "Create a meefore"
		},
		e_preview_chat: {
			"fr": "Discuter",
			"us": "Chat"
		},
		e_preview_pending: {
			"fr": "En attente",
			"us": "Pending"
		},
		e_filters_location: {
			"fr": "Changer d'endroit",
			"us": "Change location"
		},
		e_filters_date: {
			"fr": "Date(s)",
			"us": "Date(s)"
		},
		e_create_party_button: {
			"fr": "Soirée partenaire",
			"us": "Partner event"
		},
		e_mapview_empty_text: {
			"fr": "Aucun meefore de prévu",
			"us": "No meefore is scheduled"
		},
		e_sideview_empty_text: {
			"fr": "Aucun meefore de prévu ce jour-ci. Essayez un autre jour ou soyez le premier à en proposer un.",
			"us": "No meefore is scheduled for this day. Try another day or be the first to create one."
		},
		p_sideview_default_text: {
			"fr": "Sélectionner une soirée sur la carte pour voir plus de détails",
			"us": "Select a party on the map to display more details"
		},
		p_sideview_header: {
			"fr": "La où est l'ambiance",
			"us": "Where the fun is"
		},
		e_sideview_header: {
			"fr": "Ils vont y aller",
			"us": "They are going"
		},
		e_preview_planned: {
			"fr": "%n meefore à venir",
			"us": "%n meefore are planned"
		},
		s_title: {
			"fr": "Préférences",
			"us": "Preferences"
		},
		s_app_title: {
			"fr": "Application",
			"us": "In app"
		},
		s_app_subtitle: {
			"fr": "Modifier le comportement général de l'application",
			"us": "Modify the general behavior of the app"
		},
		s_contact_title: {
			"fr": "Informations de contact",
			"us": "Contact information"
		},
		s_contact_subtitle: {
			"fr": "Restez informé",
			"us": "Stay in touch'"
		},
		s_contact_email_label: {
			"fr": "Email de contact",
			"us": "Contact email"
		},
		s_contact_email_desc: {
			"fr": "Indiquez-nous l'email sur lequel vous souhaitez être contacté",
			"us": "Let us know at what email address we can reach you"
		},
		s_autologin_label: {
			"fr": "Connexion automatique",
			"us": "AutoLogin"
		},
		s_autologin_desc: {
			"fr": "Activez cette option pour accéder directement à Meefore sans passer par la page d'accueil",
			"us": "Activate this option to reach directly Meefore and skip the landing page"
		},
		s_message_seen_by_label: {
			"fr": "Connexion automatique",
			"us": "AutoLogin"
		},
		s_message_seen_by_desc: {
			"fr": "Activez cette option pour accéder directement à Meefore sans passer par la page d'accueil",
			"us": "Activate this option to reach directly Meefore and skip the landing page"
		},
		s_news_title: {
			"fr": "Newsletter et Invitations",
			"us": "Newsletter and Invitations"
		},
		s_news_subtitle: {
			"fr": "Recevez nos emails concernant soirées, bons plans et rencontres.",
			"us": "Receive our emails that deal with parties, opportunities and meetups."
		},
		s_newsletter_label: {
			"fr": "Newsletter",
			"us": "Newsletter"
		},
		s_newsletter_desc: {
			"fr": "Notre newsletter est envoyée chaque semaine",
			"us": "Our newsletter is sent every week"
		},
		s_invits_label: {
			"fr": "Invitations",
			"us": "Invitations"
		},
		s_invits_desc: {
			"fr": "Bons plans pour être invité à des soirées exclusives",
			"us": "Get invited to exclusive parties"
		},
		s_alerts_title: {
			"fr": "Alertes et notifications",
			"us": "Alerts and notifications"
		},
		s_alerts_subtitle: {
			"fr": "Soyez alerté dès que de l'activité vous concernant se présente",
			"us": "Be informed when anything about you happens"
		},
		s_accepted_in_label: {
			"fr": "Accepté dans un meefore",
			"us": "Accepted in a meefore"
		},
		s_accepted_in_desc: {
			"fr": "Recevez un email dès que vous êtes accepté dans un meefore",
			"us": "Receive an email when you are accepted in a meefore"
		},
		s_new_message_received_label: {
			"fr": "Message reçu hors-ligne",
			"us": "Unread message"
		},
		s_new_message_received_desc: {
			"fr": "Recevez un email dès que vous êtes hors-ligne et que vous recevez un nouveau message",
			"us": "Receive an email when you're offline and someone sends you a new message"
		},
		s_message_seen_by_label: {
			"fr": "Signaler message lu",
			"us": "Signal message read"
		},
		s_message_seen_by_desc: {
			"fr": "Signalez automatiquement aux autres utilisateurs que vous avez vu leur message",
			"us": "Signal to other users that you have read their message"
		},
		s_min_frequency_label: {
			"fr": "Temps entre chaque email",
			"us": "Time lapse between each emails"
		},
		s_min_frequency_desc: {
			"fr": "Pour éviter d'être spammé par l'application",
			"us": "To avoid any spam by the app"
		},
		s_0min: {
			"fr": "Aucune limite",
			"us": "No limit"
		},
		s_15min: {
			"fr": "15min",
			"us": "15min"
		},
		s_60min: {
			"fr": "1h",
			"us": "1h"
		},
		s_360min: {
			"fr": "6h",
			"us": "6h"
		},
		s_720min: {
			"fr": "12h",
			"us": "12h"
		},
		s_1440min: {
			"fr": "24h",
			"us": "24h"
		},
		s_yes: {
			"fr": "Oui",
			"us": "Yes"
		},
		s_no: {
			"fr": "Non",
			"us": "No"
		},
		s_delete_goodbye: {
			"fr": "Votre compte a bien été supprimé",
			"us": "Your account has been deleted"
		},
		s_delete_title: {
			"fr": "Supprimer mon profil",
			"us": "Delete my profile"
		},
		s_delete_text: {
			"fr": "Toutes les données vous concernant seront supprimées",
			"us": "All your data will be deleted"
		},
		s_delete_validate: {
			"fr": "Supprimer",
			"us": "Delete"
		},
		s_delete_profile_btn: {
			"fr": "Supprimer mon profil",
			"us": "Delete my profile"
		},
		s_delete_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		ch_hosts: {
			"fr": "Organisateurs",
			"us": "Hosts"
		},
		ch_placeholder: {
			"fr": "Message...",
			"us": "Message..."
		},
		ch_button_update: {
			"fr": "Mettre à jour",
			"us": "Update"
		},
		ch_button_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		ch_settings_status_label: {
			"fr": "Statut du meefore",
			"us": "Meefore status"
		},
		ch_settings_status_open: {
			"fr": "Ouvert",
			"us": "Opened"
		},
		ch_settings_status_suspended: {
			"fr": "Suspendu/Complet",
			"us": "Suspended/Full"
		},
		ch_settings_status_canceled: {
			"fr": "Supprimé",
			"us": "Removed"
		},
		ch_bot_msg_group_pending: {
			"fr": "Votre groupe a été suspendu de la discussion",
			"us": "Your group has been suspended from the discussion"
		},
		ch_bot_msg_group_accepted: {
			"fr": "Votre groupe vient d'être accepté dans la discussion!",
			"us": "Your group just got accepted in the discussion"
		},
		ch_first_msg_host_channel: {
			"fr": "Votre meefore a été créé avec succès. <br> Ce chat est privé entre vous et les autres organisateurs.",
			"us": "Your meefore has been successully created. <br> This chat is dedicated to you and the other hosts."
		},
		ch_first_msg_host: {
			"fr": "  a demandé à rejoindre votre meefore : ",
			"us": "  has asked to join your meefore : "
		},
		ch_first_msg_group: {
			"fr": "Votre demande a bien été envoyée. <br> Dès que l'un des organisateurs vous aura accepté, vous aurez accès à la discussion.",
			"us": "Your request has been sent. <br> As soon as one of the hosts has approved your request, you'll have access to the chat."
		},
		ch_request_validate: {
			"fr": "Accepter ce groupe",
			"us": "Chat with this group"
		},
		ch_button_send: {
			"fr": "Envoyer",
			"us": "Send"
		},
		ch_button_whisper: {
			"fr": "Chuchoter",
			"us": "Whisper"
		},
		to_invite_code_already_taken: {
			"fr": "Ce code est déjà utilisé par un autre utilisateur",
			"us": "This code is already used by another user"
		},
		to_invite_code_bad_pattern: {
			"fr": "Votre code ne doit contenir que des chiffres & des lettres",
			"us": "Your code must contain only letters & numbers"
		},
		to_easy_on_api: {
			"fr": "Une photo est déjà en cours de téléchargement",
			"en ": "A photo is already downloading"
		},
		to_new_meefore: {
			"fr": "%name propose un meefore le %date",
			"us": "%name hosts a meefore the %date"
		},
		to_new_meefore_host: {
			"fr": "Un ami vous a ajouté en tant qu'organisateur de son meefore",
			"us": "A friend added you as host of his meefore"
		},
		to_default_error: {
			"fr": "Une erreur est survenue",
			"us": "Something went wrong"
		}, 
		to_chat_inp_not_in: {
			"fr": "Vous n'avez pas encore été accepté!",
			"us": "You haven't been accepted yet"
		},
		to_chat_inp_too_quick: {
			"fr": "Moins vite",
			"us": "Slow down"
		},
		to_chat_inp_empty: {
			"fr": "Le message est vide!",
			"us": "The message is empty"
		},
		to_event_created_success_2: {
			"fr": "Que la fête commence...",
			"us": "May the party get started..."
		},
		to_party_created_success: {
			"fr": "La soirée a été ajoutée",
			"us": "The party has been added"
		},
		to_event_group_accepted: { 
			"fr": "Le groupe %s a été accepté",
			"us": "The group %s has been accepted"
		},
		to_event_group_pending: {
			"fr": "Le groupe %s a été mis en attente",
			"us": "The group %s has been put on hold"
		},
		to_request_sent: {
			"fr": "Votre demande a été envoyée!",
			"us": "Your request has been sent"
		},
		to_request_event_status_modified: {
			"fr": "Le statut de l'évènement a été modifié",
			"us": "The event status has been modified"
		},
		// to_init_no_friends: {
		// 	"fr": "Aucun de vos amis n'est sur Meefore? Invitez-les à vous rejoindre!",
		// 	"us": "None of your friends is on Meefore? Invite them all!"
		// },
		to_noupload_necessary: {
			"fr": "Aucune mise à jour n'est nécessaire!",
			"us": "No update is necessary!"
		},
		to_upload_singlepic: {
			"fr": "Ne téléchargez qu'une seule image à la fois",
			"us": "Please, don't upload more than one picture at once"
		},
		to_profile_update_success: {
			"fr": "Vos informations ont été modifiées",
			"us": "Your informations has been updated"
		},
		to_settings_update_success: {
			"fr": "Vos préférences ont été modifiées",
			"us": "Your settings have been updated"
		},
		to_upload_pic_success: {
			"fr": "Votre photo a été modifiée",
			"us": "Your picture has been updated"
		},
		to_update_pic_success: {
			"fr": "Vos photos ont été mise à jour",
			"us": "Your pictures have been updated"
		},
		to_host_push_new_group: {
			"fr": "Un groupe souhaite rejoindre votre meefore",
			"us": "A group has requested to join your meefore"
		},
		to_push_new_request_by_friend: {
			"fr": "Un ami vous a ajouté à un meefore",
			"us": "A friend of yours has added you to a meefore"
		},
		to_push_new_status_by_friend: {
			"fr": "Un de vos amis a modifié le statut d'un de vos meefore",
			"us": "A friend of yours has modified the status of one of your meefore"
		},
		to_push_request_accepted: {
			"fr": "Vous avez été accepté dans un meefore!",
			"us": "You have been accepted in a meefore!"
		},
		to_push_group_validated_by_friend: {
			"fr": "Un de vos amis a validé un groupe",
			"us": "A friend of yours has validated a group"
		},
		to_push_group_suspended_by_friend: {
			"fr": "Un de vos amis a suspendu un groupe de la discussion",
			"us": "A friend of yours has suspended a group from the chat"
		},
		to_welcome: {
			"fr": "Bienvenue sur Meefore",
			"us": "Welcome to Meefore"
		},

		//mp stands for missing parameter
		err_create_n_hosts: {
			"fr": "Il faut être entre %min et %max pour organiser un before",
			"us": "You must be between %min and %max to organize a pregame party",
		},
		err_create_mp_ambiance: {
			"fr": "Hashtag ton meefore pour le décrire",
			"us": "Hashtag your meefore to describe it"
		},
		err_create_mp_party: {
			"fr": "Adresse de la soirée manquante",
			"us": "Missing the address of the party"
		},
		err_create_mp_address: {
			"fr": "Adresse du meefore manquante",
			"us": "Missing meefore's address"
		},
		err_create_mp_begins_at: {
			"fr": "Date manquante/incomplète",
			"us": "Missing the date"
		},
		err_create_mp_default: {
			"fr": "Une des valeurs semble manquer",
			"us": "There is a field that seems to be missing "
		},
		err_create_already_hosting_me: {
			"fr": "Vous organisez déjà un meefore ce jour là",
			"us": "You have already planned a meefore this day"
		},
		err_create_already_hosting_other: {
			"fr": "%s organise déjà un meefore ce jour là",
			"us": "%s has already planned a meefore this day"
		},
		err_create_twin_hosts: {
			"fr": "Tous les organisateurs doivent être différents",
			"us": "Every host must be different"
		},
		err_create_time_travel: {
			"fr": "La date de début ne peut être une date passée",
			"us": "The date seems to be wrong"
		},
		err_create_ghost_hosts: {
			"fr": "Un des organisateurs n'a pas été trouvé",
			"us": "One of the hosts can't be found"
		},
		err_request_mp_members_facebook_id: {
			"fr": "Il faut être au moins deux pour rejoindre un meefore",
			"us": "You must be at least two to organize a meefore"
		},
		err_request_mp_name: {
			"fr": "En manque d'inspiration? Un petit effort!",
			"us": "Lacking inspiration? A little bit of extra effort!"
		},
		err_request_mp_message: {
			"fr": "Un message de bienvenue est indispensable!",
			"us": "A welcome message is much-needed!"
		},
		err_request_mp_default: {
			"fr": "Une des valeurs semble manquer",
			"us": "One of the values seems to be missing"
		},
		err_request_already_there: {
			"fr": " déjà présent en tant ",
			"us": " already there "
		},
		err_request_already_there_role_host: {
			"fr": "qu'organisateur",
			"us": "as host"
		},
		err_request_already_there_role_asker: {
			"fr": "que participant",
			"us": "as participant"
		},
		err_request_already_there_me: {
			"fr": "Tu es",
			"us": "You are"
		},
		err_request_already_there_other: {
			"fr": "%s est",
			"us": "%s is"
		},
		err_unknown: {
			"fr": "Une erreur inconnue s'est produite",
			"us": "An unknown error has occured"
		},
		err_request_name_bad_length: {
			"fr": "Le nom doit avoir entre %min et %max caractères",
			"us": "The name must be composed of a minimum of %min and a maximum of %max characters"
		},
		err_request_message_bad_length: {
			"fr": "Le message doit avoir entre %min et %max caractères",
			"us": "The message must be composed of a minimum of %min and a maximun of %max characters"
		},
		err_request_n_group: {
			"fr": "Votre groupe doit avoir entre %min et %max personnes",
			"us": "Your group must have between %min and %max people"
		},
		err_request_ghost_members: {
			"fr": "Des membres ne sont pas encore inscrits sur Meefore",
			"us": "Some members have not signed up to Meefore yet"
		},
		err_request_event_not_open: {
			"fr": "Les organisateurs ont suspendu momentanément le meefore",
			"us": "The hosts have suspended the meefore at the moment"
		},
		err_chat_send_message: {
			"fr": "Une erreur inconnue s'est produite suite à l'envoie du message",
			"us": "An unknown error has occured when sending the message"
		},
		err_chat_fetch_unauth_group: {
			"fr": "Tu n'es pas autorisé à participer à cette discussion!",
			"us": "You are not authorized to take part in this discussion"
		},
		err_chat_fetch_unauth_fetch: {
			"fr": "Tu n'es pas autorisé à demander les messages de cette discussion",
			"us": "You are not authorized to request this discussion's messages"
		},
		err_chat_fetch_unauth_admin: {
			"fr": "Vous n'êtes pas autorisé à participer à cette discussion! (admin)",
			"us": "You are not authorized to take part in this discussion"
		},
		err_chat_mp: {
			"fr": "Il manque un paramètre pour envoyer le message",
			"us": "A parameter is missing to send the message"
		},
		err_chat_seen_by: {
			"fr": "Une erreur inconnue s'est produite à la lecture du message",
			"us": "An unknown error has occured when reading the message"
		},
		err_pusher_unauth: {
			"fr": "",
			"us": "Cannot join the channel (access denied, auth failed)"
		},
		err_settings_invalid_email: {
			"fr": "Nous avons besoin d'un email de contact valide pour changer vos préférences",
			"us": "We need a valid contact email to change your preferences"
		},
		err_update_profile_age: {
			"fr": "Votre âge ne semble pas avoir le bon format",
			"us": "Your age doesnt seem to be properly formatted"
		},
		err_update_profile_mainify_placeholder: {
			"fr": "Votre photo de profil doit vous représenter",
			"us": "Your profile picture must represent yourself"
		},
		err_update_profile_delete_main_picture: {
			"fr": "Vous ne pouvez pas supprimer votre photo de profil",
			"us": "You can't delete your profile picture"
		},
		err_update_profile_default: {
			"fr": "Une erreur inattendue s'est produite",
			"us": "Something unexpected happened"
		},
		err_unexpected_message: {
			"fr": "Une erreur inattendue s'est produite. <br> Cette erreur peut-être due à des circonstances exceptionnelles ou à un bug !" 
			       + "<br> Nous vous invitons à retenter votre action plus tard et à nous contacter si l'erreur persiste :/",
			"us": "Something unexpected happened. <br> This error might be caused by exceptionnal circumstances or simply bug a bug."
				   + "<br> Please try again later and we thank you in advance to contact us if the problem persists :/"
		},
		lp_subtitle: {
			"fr": "<div class='lp-subpart'>Des rencontres <div class='lp-avant'><span>avant</span><img src='/img/app/avant.png' width='90%' /></div> d'aller en soirée.   " ,
			"us": "<div class='lp-subpart'>Meeting new people <div class='lp-avant'><span>before</span><img src='/img/app/avant.png' width='90%' /></div> partying.</div>"
		},
		lp_subtitle_sub: {
			"fr": "Participez à des before près de chez vous.",
			"us": "Join pregame parties around you."
		},
		lp_conn_button: {
			"fr": "Connexion",
			"us": "Connection"
		},
		lp_reason_1_h1: {
			"fr": "Trouvez votre before",
			"us": "Find a pregame party"
		},
		lp_reason_2_h1: {
			"fr": "Demandez à participer",
			"us": "Request to join"
		},
		lp_reason_3_h1: {
			"fr": "Faites connaissance",
			"us": "Get to know each other"
		},
		lp_reason_1_h2: {
			"fr": "Parcourez et repérez sur la map les before qui s'organisent près de chez vous.",
			"us": "Go on the map and find all the pregame parties happening around you."
		},
		lp_reason_2_h2: {
			"fr": "Envoyez une demande de participation pour rejoindre le before qui vous ambiance le plus avec au moins un de vos amis.",
			"us": "Request to join the pregame party that seems to fit you the most with at least one of your friends."
		},
		lp_reason_3_h2: {
			"fr": "Une fois accepté, discutez avec les organisateurs pour préparer votre soirée avant de vous retrouver.",
			"us": "Once accepted, chat with the hosts to plan your evening before you meet with them."
		},
		lp_footer_followus: {
			"fr": "Nous suivre",
			"us": "Follow us"
		},
		lp_contact_title: {
			"fr": "Contactez-nous",
			"us": "Contact us"
		},
		lp_contact_name: {
			"fr": "Nom*",
			"us": "Name*"
		},
		lp_contact_email: {
			"fr": "Email*",
			"us": "Email*"
		},
		lp_contact_message: {
			"fr": "Message*",
			"us": "Message*"
		},
		lp_contact_send_success: {
			"fr": "Votre message a bien été envoyé <br> Merci !",
			"us": "Your message has been sent <br> Thank you !"
		},
		lp_contact_error_fields: {
			"fr": "Il manque certains champs",
			"us": "Some fields are missing"
		},
		lp_contact_error_email: {
			"fr": "L'adresse email indiquée semble avoir une petite erreur",
			"us": "Your email address doesn't look like one "
		},
		lp_contact_error_generic: {
			"fr": "Une erreur s'est produite. Contactez-nous directement à contact@meefore.com",
			"us": "Something wrong happened. Mail us directly at contact@meefore.com"
		},
		login_loading_msg: {
			"fr": "Chargement des prochaines soirées",
			"us": "Loading next parties"
		},
		app_mobile_warning: {
			"fr": "Meefore est en mode navigation limitée sur web mobile. L'application sera bientôt disponible sur iOS !",
			"us": "Meefore in limited mode on web mobile. The iOS app should be soon available on the AppleStore"
		},
		app_event_unavailable: {
			"fr": "Ce before n'est plus d'actualité",
			"us": "This before is no longer available"
		},
		app_reconnect: {
			"fr": "Vous avez été déconnecté. <br> L'application redémarrera dès que vous aurez retrouvé la connexion.",
			"us": "You have been disconnected. <br> App will reboot automatically once your connection is back."
		},
		app_button_invite: {
			"fr": "Invitez vos amis",
			"us": "Invite your friends"
		},
		app_searching_text: {
			"fr": "Recherche...",
			"us": "Searching..."
		},
		app_no_results_invite: {
			"fr": "Aucun résultats à afficher",
			"us": "The search returned no results"
		},
		n_new_meefore_text: {
			"fr": "Nouveau meefore proposé pour %place",
			"us": "New meefore created for %place"
		},
		n_new_meefore_subtext: {
			"fr": "Il y a actuellement %n meefore pour cette soirée",
			"us": "There are currently %n meefore for this party"
		},
		n_accepted_in_text: {
			"fr": "Vous avez un Match !",
			"us": "It's a Match !"
		},
		n_accepted_in_subtext: {
			"fr": "Faites connaissance dès maintenant",
			"us": "Get to know each other now"
		},
		n_group_request_hosts_text: {
			"fr": "Cheers reçu",
			"us": "Cheers received"
		},
		n_group_request_hosts_subtext: {
			"fr": "Un groupe a montré un intérêt pour votre before",
			"us": "A group seems to be interested by your pregame"
		},
		n_group_request_members_text: {
			"fr": "Cheers envoyé",
			"us": "Cheers sent"
		},
		n_group_request_members_subtext: {
			"fr": "%name a envoyé un Cheers avec vous",
			"us": "%name has sent a Cheers with you"
		},
		n_marked_as_host_text: {
			"fr": "Marqué coorganisateur par %name",
			"us": "Marked as co-host by %name"
		},
		n_marked_as_host_subtext: {
			"fr": "%address - %date",
			"us": "%address - %date"
		},
		n_fill_profile_text: {
			"fr": "Complétez votre profil",
			"us": "Complete your profile"
		},
		n_fill_profile_subtext: {
			"fr": "Vous augmenterez vos chances d'avoir des Cheers",
			"us": "That will increase your chances to get a Cheers"
		},
		n_new_friends_text: {
			"fr": "Nouveaux amis",
			"us": "New friends"
		},
		n_new_friends_subtext: {
			"fr": function( names ){
				return "Bienvenue à " + LJ.renderManyMultipleNames( names, 3 );
				var came = names.length == 1 ? "vient" : "viennent";
				return LJ.renderManyMultipleNames( names, 3 ) + ' ami(e)s '+ came +' de rejoindre Meefore';
			},
			"us": function( names ){
				return "Welcome to " + LJ.renderManyMultipleNames( names, 3 );
				return LJ.renderManyMultipleNames( names, 3 ) + ' friends just joined Meefore';
			},
		},
		n_inscription_success_text: {
			"fr": "Bienvenue sur Meefore",
			"us": "Welcome on Meefore"
		},
		n_inscription_success_subtext: {
			"fr": "Faites des rencontres avant d'aller en soirée",
			"us": "Meet new people before going out"
		},
		n_before_canceled_text: {
			"fr": "Before annulé",
			"us": "Pregame canceled"
		},
		n_before_canceled_subtext: {
			"fr": "%address",
			"us": "%address"
		},
		n_item_shared_text: {
			"fr": "Partagé par %name",
			"us": "Shared by %name"
		},
		n_item_shared_subtext: {
			"fr": "%name vient de vous partager un %type",
			"us": "%name just shared a %type with you"
		},
		n_check_email_text: {
			"fr": "Votre addresse email est-elle à jour ?",
			"us": "Is your email address up-to-date ?"
		},
		n_check_email_subtext: {
			"fr": "L'addresse récupérée avec Facebook est parfois très ancienne !",
			"us": "The email address we got from Facebook might be outdated !"
		},
		n_new_notification: {
			"fr": "Vous avez une nouvelle notification",
			"us": "You have a new notification"
		},
		n_header_text: {
			"fr": "Notifications",
			"us": "Notifications"
		},
		n_footer_text: {
			"fr": "Délivré avec <3 par meefore",
			"us": "Delivered with <3 by meefore"
		},
		mod_facebook_pictures_title: {
			"fr": "Photos Facebook",
			"en ": "Facebook photos"
		},
		mod_facebook_pictures_subtitle: {
			"fr": "Sélectionner la photo que vous souhaitez importer à partir de Facebook",
			"en ": "Select the photo you wish to import from Facebook"
		},
		segment_cheers_received: {
			"fr": "Reçus",
			"us": "Received"
		},
		segment_cheers_sent: {
			"fr": "Envoyés",
			"us": "Sent"
		},
		cheers_requested_with: {
			"fr": "Avec %names",
			"us": "With %names"
		},
		shared_by_item_subtitle: {
			"fr": "%type partagé par %name",
			"us": "%type shared by %name"
		},
		shared_with_item_subtitle: {
			"fr": "%type partagé avec %names",
			"us": "%type shared with %names"
		},
		friends_title_invite: {
			"fr": "Invitez plus d'amis",
			"us": "Invite more friends"
		},
		cheers_item_title_sent: {
			"fr": "%groupname",
			"us": "%groupname"
		},
		cheers_item_title_received: {
			"fr": "%groupname",
			"us": "%groupname"
		},
		cheers_item_subtitle: {
			"fr": "Pour un before le %date",
			"us": "The pregame starts the %date"
		},
		w_profile: {
			"fr": "profil",
			"us": "profile"
		},
		w_and: {
			"fr": "et",
			"us": "and"
		},
		w_more: {
			"fr": "autre(s)",
			"us": "more"
		},
		w_you: {
			"fr": "vous",
			"us": "you"
		},
		settings_ux_unread_messages_label: {
			"fr": "Signaler messages lus",
			"us": "Signal read messages"
		},
		settings_ux_unread_messages_explanation: {
			"fr": "Les autres utilisateurs sauront que vous avez lu leurs messages",
			"us": "Other users will know that you have read their messages"
		},
		settings_ux_country_label: {
			"fr": "Afficher les nationalités",
			"us": "Display the nationalities"
		},
		settings_ux_country_explanation: {
			"fr": "Afficher les nationalités autre que la mienne sur les miniatures",
			"us": "Display nationalities other than mine on the thumbnail"
		},
		settings_ux_gender_label: {
			"fr": "Afficher le sexe (H/F)",
			"us": "Display the gender (H/F)"
		},
		settings_ux_gender_explanation: {
			"fr": "Afficher le sexe des utilisateurs sur leur miniature pour les distinguer plus facilement",
			"us": "Display the user's gender on his thumbnail"
		},
		settings_ux_auto_login_label: {
			"fr": "Login automatique",
			"us": "Auto login"
		},
		settings_ux_auto_login_explanation: {
			"fr": "Se connecter directement sans passer par la page d'accueil",
			"us": "Connect directly skipping the homepage"
		},
		settings_part_title_email: {
			"fr": "Emails",
			"us": "Emails"
		},
		settings_part_title_notifications_email: {
			"fr": "Notifications par email",
			"us": "Email notifications"
		},
		settings_emails_accepted_in_label: {
			"fr": "Nouveau match",
			"us": "New match"
		},
		settings_emails_accepted_in_explanation: {
			"fr": "Envoyée lorsque vous avez un nouveau matché",
			"us": "Sent when you have a new match"
		},
		settings_emails_new_message_received_label: {
			"fr": "Nouveau message reçu",
			"us": "New message received"
		},
		settings_emails_new_message_received_explanation: {
			"fr": "Envoyée à chaque nouveau message",
			"us": "Sent every time you receive a new message"
		},
		settings_notifs_newsletter_label: {
			"fr": "Newsletter",
			"us": "Newsletter"
		},
		settings_notifs_newsletter_explanation: {
			"fr": "Notre newsletter hebdomadaire",
			"us": "Our weekly newsletter"
		},
		settings_notifs_invitations_label: {
			"fr": "Invitations",
			"us": "Invitations"
		},
		settings_notifs_invitations_explanation: {
			"fr": "Bon plans et invitations à des soirées spéciales",
			"us": "Invitations to special events"
		},
		settings_code_sponsor_button: {
			"fr": "Activer un code d'invitation",
			"us": "Activate an invitation code"
		},
		settings_code_sponsor_explanation: {
			"fr": "Partagez ce code avec vos amis pour les parrainer",
			"us": "Share this code with your friends to sponsor them"
		},
		settings_part_title_code: {
			"fr": "Code d'invitation",
			"us": "Invite code"
		},
		settings_modal_sponsor_title: {
			"fr": "Code parrainage",
			"us": "Sponsor code"
		},
		settings_modal_sponsor_subtitle: {
			"fr": "Entrez le code de votre parrain et bénéficiez chacun de 5 meepass",
			"us": "Enter your sponsor's code and receive both 5 meepass"
		},
		settings_modal_sponsor_button: {
			"fr": "Activer",
			"us": "Activate"
		},
		picture_main_label: {
			"fr": "Photo principale",
			"us": "Main picture"
		},
		empty_shared_title: {
			"fr": "Rien à l'horizon...",
			"us": "Nothing on the horizon..."
		},
		empty_shared_subtitle: {
			"fr": "Partagez des profils ou des before avec vos amis pour pouvoir vous organiser plus rapidement.",
			"us": "Share profiles or pregame with your friends to help you organize your nights."
		},
		empty_cheers_sent_title: {
			"fr": "Aucun Cheers envoyés",
			"us": "No Cheers sent"
		},
		empty_cheers_sent_subtitle: {
			"fr": "Les Cheers permettent à chaque membre de montrer à des organisateurs qu'ils sont intéressé par leur before.",
			"us": "Cheers allow each member to let hosts of pregames know that they are interested in their pregame."
		},
		empty_cheers_received_title: {
			"fr": "Aucun Cheers reçus",
			"us": "No Cheers received"
		},
		empty_cheers_received_subtitle: {
			"fr": "Les Cheers permettent à chaque membre de montrer à des organisateurs qu'ils sont intéressé par leur before.",
			"us": "Cheers allow each member to let hosts of pregames know that they are interested in their pregame."
		},
		empty_friends_title: {
			"fr": "Pas encore d'amis",
			"us": "No friends yet"
		},
		empty_friends_subtitle: {
			"fr": "Il faut être au moins 2 pour créer ou participer à un before. Invitez vos amis à vous rejoindre pour sortir et faire de nouvelles rencontres.",
			"us": "You need to be at least 2 in order to pregrame. Invite your friends to join you to get out and meet new people."
		},
		hint_cheers_pending: {
			"fr": "En attente de Match",
			"us": "Waitinf for a Match"
		},
		hint_cheers_accepted: {
			"fr": "Match !",
			"us": "It's a Match !"
		},
		to_group_accepted_hosts: {
			"fr": "Vous avez un Match !",
			"us": "You have a new Match !"
		},
		to_group_accepted_users: {
			"fr": "Vous avez un Match !",
			"us": "You have a new Match !"
		},
		disconnected_title: {
			"fr": "Vous êtes déconnecté",
			"us": "You are offline"
		},
		disconnected_subtitle: {
			"fr": "Vous serez reconnecté automatiquement dès que vous aurez retrouvé internet.",
			"us": "You will be automatically reconnected when you're back online. "
		},
		init_location_title: {
			"fr": "Bienvenidos !",
			"us": "Bienvenidos !"
		},
		init_location_subtitle_placeholder: {
			"fr": "Où souhaitez-vous sortir ?",
			"us": "Where would you like to go out ?"
		},
		init_location_explanation: {
			"fr": "Vous pourrez toujours changer de ville ultérieurement",
			"us": "You'll still be able to change that later"
		},
		init_location_geoloc: {
			"fr": "Utiliser ma position",
			"us": "Use my location"
		},
		user_profile_about: {
			"fr": "Détails",
			"us": "Details"
		},
		user_profile_ideal_night: {
			"fr": "Ta soirée parfaite",
			"us": "Your perfect night"
		},
		logout_title: {
			"fr": "A bientôt",
			"us": "See you soon"
		},
		logout_subtitle: {
			"fr": "Êtes vous-sûr de vouloir vous déconnecter ?",
			"us": "Are you sure you want to log out ?"
		},
		modal_err_empty_fetch: {
			"fr": "Nous n'avons pas trouvé vos photos de profil",
			"us": "We were unable to find your profile pictures album"
		},
		settings_account_email: {
			"fr": "Tous nos emails seront envoyés à cette addresse",
			"us": "All our emails will be sent to this address"
		},
		settings_account_delete_button: {
			"fr": "Supprimer mon compte",
			"us": "Delete my account"
		},
		settings_modal_delete_title: {
			"fr": "A bientôt !",
			"us": "See you around !"
		},
		settings_modal_delete_subtitle: {
			"fr": "En supprimant votre compte, toutes les données vous concernant seront supprimées de nos serveurs."
				  + "<br><br><b>Attention, cette opération est irréversible.</b>",
			"us": "By deleting your account, every data about you will be deleted from our servers."
				  + "<br><br><b>Careful, this cannot be undone.</b>"
		},
		settings_modal_delete_button_confirm: {
			"fr": "Supprimer mon compte",
			"us": "Delete my account"
		},
		settings_modal_delete_button_cancel: {
			"fr": "Annuler",
			"us": "Cancel"
		},
		search_filters_gender_title: {
			"fr": "Montrez-moi seulement :",
			"us": "Show me only : "
		},
		search_filters_gender_explanations: {
			"fr": "Sélectionner le sexe des personnes que vous recherchez.",
			"us": "Select the gender of the people you wish to see."
		},
		search_filters_age_title: {
			"fr": "Afficher les personnes de <span class='search-filters-min-age'></span> à <span class='search-filters-max-age'></span> ans",
			"us": "Display people from <span class='search-filters-min-age'></span> to <span class='search-filters-max-age'></span> years old"
		},
		search_filters_age_explanations: {
			"fr": "Seuls les utilisateurs dans la tranche d'âge sélectionnée apparaîtront dans la recherche.",
			"us": "Only the users within the selected agerange will be displayed."
		},
		search_filters_countries_title: {
			"fr": "Filter par pays :",
			"us": "Filter by country :"
		},
		search_filters_countries_explanations: {
			"fr": "Les pays proposés sont ceux comptant au moins un utilisateur.",
			"us": "The countries displayed are those for which there is at least one user."
		},
		search_filters_gender_label_male: {
			"fr": "Des hommes",
			"us": "Men"
		},
		search_filters_gender_label_female: {
			"fr": "Des femmes",
			"us": "Women"
		},
		nav_search_title: {
			"fr": "Tous les membres",
			"us": "All members"
		},
		nav_menu_title: {
			"fr": "Menu",
			"us": "Menu"
		},
		nav_map_title: {
			"fr": "Carte des soirées",
			"us": "The Meemap"
		},
		modal_search_input_placeholder: {
			"fr": "Rechercher",
			"us": "Search"
		},
		modal_share_title_profile: {
			"fr": "Partager un profil",
			"us": "Share a profile"
		},
		modal_share_subtitle_profile: {
			"fr": "Sélectionnez dans la liste les personnes avec qui vous souhaitez partager ce profil.",
			"us": "Select in your friendlist who you wish to share this profile with."
		},
		to_profile_shared_success: {
			"fr": "Le profil a bien été partagé",
			"us": "The profile has been shared"
		},
		modal_share_title_before: {
			"fr": "Partager un before",
			"us": "Share a pregame"
		},
		modal_share_subtitle_before: {
			"fr": "Sélectionnez dans la liste les personnes avec qui vous souhaitez partager ce before.",
			"us": "Select in your friendlist who you wish to share this pregame with."
		},
		to_before_shared_success: {
			"fr": "Le before a bien été partagé",
			"us": "The pregame has been shared"
		},
		to_cheers_sent_success: {
			"fr": "Votre Cheers a bien été envoyée",
			"us": "Your Cheers has been sent"
		},
		to_cheers_received_success: {
			"fr": "Vous avez reçu un Cheers",
			"us": "You have received a Cheers"
		},
		to_cheers_sent_success_friend: {
			"fr": "Un ami souhaite participer à un before avec vous",
			"us": "A friend wishes to join a before with you"
		},
		meepass_ribbon2: {
			"fr": "Il vous reste <span class='n_meepass'>%n</span> meepass",
			"us": "You have <span class='n_meepass'>%n</span> meepass left"
		},
		meepass_ribbon: {
			fr: function(){
				var n_meepass = LJ.user.meepass.length;
				return "Il vous reste <span class='n_meepass'>" + n_meepass + "</span> meepass";
			},
			us: function(){
				var n_meepass = LJ.user.meepass.length;
				return "You have <span class='n_meepass'>" + n_meepass + "</span> meepass left";
			}
		},
		settings_ux_changelang_button: {
			"fr": "Changer de langue",
			"us": "Change the language"
		},
		be_close_to: {
			"fr": "A proximité de",
			"us": "Close to"
		},
		"be_create_title": {
			"fr": "Créer un before",
			"us": "Create a pregame"
		},
		be_create_subtitle_hosts: {
			"fr": "Membres du groupe",
			"us": "Hosts"
		},
		be_create_hosts_explanations: {
			"fr": "Sélectionnez les autres coorganisateurs parmis vos amis",
			"us": "Select the other hosts among your friends"
		},
		be_create_subtitle_before: {
			"fr": "Le before",
			"us": "The pregame"
		},
		be_create_hosts_placeholder: {
			"fr": "Coorganisateurs",
			"us": "Other hosts"
		},
		be_create_date_placeholder: {
			"fr": "Date",
			"us": "Date"
		},
		be_create_hour_placeholder: {
			"fr": "Heure",
			"us": "Hour"
		},
		be_create_location_placeholder: {
			"fr": "Lieu",
			"us": "Address"
		},
		be_create_before_explanations: {
			"fr": "Où et quand vous rejoignez-vous ?",
			"us": "Where and when will you guys meet ?"
		},
		be_create_button: {
			"fr": "Créer",
			"us": "Create"
		},
		modal_be_create_title: {
			"fr": "Membres du groupe",
			"us": "Group members"
		},
		modal_be_create_subtitle: {
			"fr": function(){
				var min = LJ.app_settings.app.min_hosts - 1;
				var max = LJ.app_settings.app.max_hosts - 1;
				return "Sélectionnez les autres organisateurs parmis vos amis <br> (%min minimum, %max maximum)".replace('%min', min).replace('%max', max);
			},
			"us": function(){
				var min = LJ.app_settings.app.min_hosts - 1;
				var max = LJ.app_settings.app.max_hosts - 1;
				return "Select the other hosts among your friends <br> (%min minimum, %max maximum)".replace('%min', min).replace('%max', max);
			}
		},
		err_be_create_missing_hosts: {
			"fr": "Les coorganisateurs sont manquants",
			"us": "Cohosts are missing"
		},
		err_be_create_missing_date: {
			"fr": "La date de début est manquante",
			"us": "The date is missing"
		},
		err_be_create_missing_location: {
			"fr": "L'addresse est manquante",
			"us": "The address is missing"
		},
		err_be_create_already_hosting_me: {
			"fr": "Vous organisez déjà un before ce jour-là",
			"us": "You already host an event on this day"
		},
		err_be_create_already_hosting: {
			"fr": "%names organise(nt) déjà un before ce jour-là",
			"us": "%names are already hosting a before on this day"
		},
		shared_before_title: {
			"fr": function( names ){
				return 'Before avec ' + LJ.renderMultipleNames( names );
			},
			"us": function( names ){
				return 'Pregame with ' + LJ.renderMultipleNames( names );
			}
		},
		slide_overlay_before_message: {
			"fr": "Que souhaitez-vous faire ?",
			"us": "What would you like to do ?"
		},
		slide_overlay_before_cancel: {
			"fr": "Annuler mon before",
			"us": "Cancel my pregame"
		},
		slide_overlay_back: {
			"fr": "Retour",
			"us": "Back"
		},
		to_cancel_before_success: {
			"fr": "Le before a bien été annulé",
			"us": "The pregame have been canceled"
		},
		before_just_canceled: {
			"fr": "Nous sommes désolés, ce before vient d'être annulé par un des organisateurs.",
			"us": "We are sorry, this pregame just got canceled by one of the hosts."
		},
		be_ended: {
			"fr": "Le before est terminé",
			"us": "The pregame is over"
		},
		be_hosted: {
			"fr": "Vous faites parti des organisateurs",
			"us": "You are one of the hosts"
		},
		to_friend_canceled_event: {
			"fr": "%name vient d'annulé un before que vous organisiez ensemble",
			"us": "%name just canceled a pregame that you organized together"
		},
		modal_request_subtitle: {
			"fr": "Sélectionnez au plus 3 amis avec lesquels vous souhaiteriez participer.",
			"us": "Select at most 3 friends you would like to go with."
		},
		to_before_create_success: {
			"fr": "Votre before vient d'être créé",
			"us": "Your pregame was created successfully"
		},
		to_before_create_success_friends: {
			"fr": "%name vous a marqué coorganisateur de son before",
			"us": "%name marked you as host of his pregame"
		},
		modal_no_friends_btn: {
			"fr": "Invitez des amis",
			"us": "Invite your friends"
		},
		modal_no_friends_text: {
			"fr": "Il faut être au moins 2 pour effectuer cette action",
			"us": "You need to be at least two to perform this action"
		},
		be_request_already_there: {
			"fr": "a déjà envoyé un Cheers pour ce before",
			"us": "has already sent a Cheers for this before"
		},
		to_request_pending: {
			"fr": "Vous pourrez discuter dès que vous aurez un Match",
			"us": "You can start chatting when you have a Match"
		},
		chat_header_title: {
			"fr": "Discussions",
			"us": "Conversations"
		},
		chat_segment_all: {
			"fr": "Toutes",
			"us": "All"
		},
		chat_segment_hosted: {
			"fr": "J'organise",
			"us": "I host"
		},
		chat_segment_requested: {
			"fr": "Je participe",
			"us": "I join"
		},
		chat_empty_title: {
			"fr": "Rien à l'horizon...",
			"us": "Nothing on the horizon..."
		},
		chat_empty_subtitle_row: {
			"fr": "Vous pourrez discuter avec vos amis et faire connaissance avec les autres membres lorsque vous aurez créé un before ou obtenu un Match",
			"us": "You will be able to chat with your friends and the other members once you have created a pregame or obtained a Match"
		},
		chat_empty_title_inview_hosts: {
			"fr": "Vous avez un Match !",
			"us": "It's a Match !"
		},
		chat_empty_subtitle_inview_hosts: {
			"fr": function( group_name ){
				return  "Faîtes connaissance avec " + group_name + " dès maintenant."
			},
			"us": function( group_name ){
				return "Get to know " + group_name + " now."
			} 
		},
		chat_empty_title_inview_accepted: {
			"fr": "Vous avez un Match !",
			"us": "It's a Match !"
		},
		chat_empty_subtitle_inview_accepted: {
			"fr": function( group_name ){
				return  "Faîtes connaissance avec " + group_name + " dès maintenant."
			},
			"us": function( group_name ){
				return "Get to know " + group_name + " now."
			} 
		},
		chat_empty_title_inview_team: {
			"fr": function( group_name ){ return group_name; },
			"us": function( group_name ){ return group_name; }
		},
		chat_empty_subtitle_inview_team: {
			"fr": "Seuls vous et les autres membres de ce groupe recevront les messages qui seront envoyés sur cette discussion.",
			"us": "Only you and the other members of your group will receive messages that are sent on this chat."
		},
		chat_empty_title_inview_pending: {
			"fr": "Un peu de patience...",
			"us": "Be patient..."
		},
		chat_empty_subtitle_inview_pending: {
			"fr": "Vous pourrez faire connaissance dès que vous aurez un Match avec les organisateurs.",
			"us": "You'll be able to start chatting as soon as there is a Match with the hosts."
		},
		chat_rows_team_title: {
			"fr": "Amis",
			"us": "Friends"
		},
		chat_rows_all_title: {
			"fr": "Match",
			"us": "Match"
		},
		chat_inview_options_message: {
			"fr": "Que souhaitez-vous faire ?",
			"us": "What would you like to do ?"
		},
		chat_inview_options_message_show_users_all: {
			"fr": "Voir tous les participants",
			"us": "See everyone"
		},
		chat_inview_options_message_show_users_team: {
			"fr": "Voir les membres de mon groupe",
			"us": "See members of my group"
		},
		chat_inview_options_message_show_before: {
			"fr": "Voir le before",
			"us": "See the pregame"
		},
		chat_inview_users_group_users: {
			"fr": "Votre groupe",
			"us": "Your group"
		},
		chat_inview_users_group_hosts: {
			"fr": "Organisateurs",
			"us": "Hosts"
		},
		chat_groupname_all: {
			"fr": "Tout le monde",
			"us": "All"
		},
		chat_groupname_team: {
			"fr": "Mon groupe",
			"us": "My group"
		},
		chat_row_request_all_title: {
			"fr": "Vous avez un Match !",
			"us": "It's a Match !"
		},
		chat_row_request_all_subtitle: {
			"fr": function( names ){ return "avec " + names; },
			"us": function( names ){ return  "with " + names; } 
		},
		chat_row_request_team_title: {
			"fr": "Nouvelle conversation de groupe",
			"us": "New group conversation"
		},
		chat_row_request_team_subtitle: {
			"fr": function( names ){ return "entre " + names; },
			"us": function( names ){ return  "between " + names; } 
		},
		chat_inview_validate_later: {
			"fr": "Plus tard",
			"us": "Later"
		},
		chat_inview_validate: {
			"fr": "Cheers !",
			"us": "Cheers !"
		},
		seen_by_everyone: {
			"fr": "Vu par tout le monde",
			"us": "Seen by everyone"
		},
		seen_by_some: {
			"fr": function( names ){
				return "Vu par " + LJ.renderMultipleNames( names );
			},
			"us": function( names ){
				return "Seen by " + LJ.renderMultipleNames( names );
			}
		},
		cheers_back_h2: {
			"fr": "vous ont envoyé un Cheers",
			"us": "have sent you a Cheers"
		}



	});

