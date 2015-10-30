
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Settings: function(){

			LJ.$body.on('click', '.row-ux .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id             = LJ.user._id;
				var $container      = $('.row-ux');

				var auto_login      = $container.find('.modified[data-propid="auto_login"]').attr('data-selectid');
				var message_readby  = $container.find('.modified[data-propid="message_readby"]').attr('data-selectid');

				var app_preferences = LJ.user.app_preferences;

				app_preferences.ux.auto_login     = auto_login;
				app_preferences.ux.message_readby = message_readby

				var data = {
					userId		    : _id,
					app_preferences : app_preferences
				};

				csl('Emitting update settings [ui]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-ux',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsUxSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );
				
			});

			LJ.$body.on('click', '.row-news .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id 		  = LJ.user._id;
				var $container    = $('.row-news');

				var invitations   = $container.find('[data-propid="invitations"].modified').attr('data-selectid');
				var newsletter    = $container.find('[data-propid="newsletter"].modified').attr('data-selectid');

				var app_preferences = LJ.user.app_preferences;

				app_preferences.email.invitations = invitations;
				app_preferences.email.newsletter  = newsletter;

				var data = {
					userId		    : _id,
					app_preferences : app_preferences
				};

				csl('Emitting update settings [mailinglists]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-mailinglists',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsMailingListsSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );
				
			});

			LJ.$body.on('click', '.row-alerts .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id             = LJ.user._id;
				var $container      = $('.row-alerts');

				var accepted_in     = $container.find('[data-propid="accepted_in"].modified').attr('data-selectid');
				var message_unread  = $container.find('[data-propid="message_unread"].modified').attr('data-selectid');
				var min_frequency   = $container.find('[data-propid="min_frequency"].modified').attr('data-selectid');
				
				var app_preferences = LJ.user.app_preferences;

				app_preferences.alerts.message_unread = message_unread;
				app_preferences.alerts.accepted_in    = accepted_in;
				app_preferences.alerts.min_frequency  = min_frequency;

				var data = {
					userId		    : _id,
					app_preferences : app_preferences
				};

				// Mail needed to be store in cache along with other settings regarding alerts
				// to know where to send the alert
				// @519481
				data.facebook_email = LJ.user.facebook_email;


				csl('Emitting update settings [notifications]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-alerts',
					data = data
					, cb = {
						success: LJ.fn.handleUpdateSettingsAlertsSuccess,
						error: function( xhr ){
							sleep( LJ.ui.artificialDelay, function(){
								LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
							});
						}
					};

					LJ.fn.say( eventName, data, cb );
					
			});

		},
		handleUpdateSettingsUxSuccess: function( data ){

			csl('update settings ux success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-ux').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.setLocalStoragePreferences();
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-ux');
		
			});


		},
		handleUpdateSettingsMailingListsSuccess: function( data ){

			csl('update settings mailing lists success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-news').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-news');
		
			});


		},
		handleUpdateSettingsAlertsSuccess: function( data ){

			csl('update settings alerts success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-alerts').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-alerts');
		
			});


		}

	});	
