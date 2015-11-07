
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Settings: function(){



			LJ.$body.on('click', '.row-contact .btn-validate', function(){

				// If user changes email, need to update mail in mailchimp and in cache for alerts

				var contact_email   = $('#email_contact').val();
				if( !LJ.fn.isEmail( contact_email ) ){
					return LJ.fn.toastMsg( LJ.text_source["err_settings_invalid_email"][ LJ.app_language ], 'error');
				}

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id             = LJ.user._id;
				var $container      = $('#settingsWrap');

				var app_preferences = LJ.user.app_preferences;

				// Invitation & newsletters
				var invitations   = $container.find('[data-propid="invitations"].selected').attr('data-selectid');
				var newsletter    = $container.find('[data-propid="newsletter"].selected').attr('data-selectid');
				app_preferences.email.invitations = invitations;
				app_preferences.email.newsletter  = newsletter;

				// Alerts
				var accepted_in     = $container.find('[data-propid="accepted_in"].selected').attr('data-selectid');
				var message_unread  = $container.find('[data-propid="message_unread"].selected').attr('data-selectid');
				var min_frequency   = $container.find('[data-propid="min_frequency"].selected').attr('data-selectid');
				app_preferences.alerts.message_unread = message_unread;
				app_preferences.alerts.accepted_in    = accepted_in;
				app_preferences.alerts.min_frequency  = min_frequency;


				var data = {
					contact_email   : contact_email,
					app_preferences : app_preferences
				};

				csl('Emitting update settings [contact]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-contact',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsContactSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );
				
			});


			LJ.$body.on('click', '.row-ux .btn-validate', function(){

				var contact_email   = $('#email_contact').val();
				if( !LJ.fn.isEmail( contact_email ) ){
					return LJ.fn.toastMsg( LJ.text_source["err_settings_invalid_email"][ LJ.app_language ], 'error');
				}

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

				var contact_email   = $('#email_contact').val();
				if( !LJ.fn.isEmail( contact_email ) ){
					return LJ.fn.toastMsg( LJ.text_source["err_settings_invalid_email"][ LJ.app_language ], 'error');
				}

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
					contact_email   : contact_email,
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

				var contact_email   = $('#email_contact').val();
				if( !LJ.fn.isEmail( contact_email ) ){
					return LJ.fn.toastMsg( LJ.text_source["err_settings_invalid_email"][ LJ.app_language ], 'error');
				}

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
				data.contact_email = LJ.user.contact_email;


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

			LJ.$body.on('click', '#delete-profile', function(){

				LJ.fn.displayInModal({
					source: 'local',
					render_cb: LJ.fn.renderDeleteProfile,
					starting_width: 200
				});

			});

			LJ.$body.on('click', '.delete-profile-wrap .btn-validate', function(){

				var $self = $(this);

				csl('Emitting delete profile...');
				$self.addClass('btn-validating');

				var eventName = 'me/delete',
					data = { userId: LJ.user._id },
					cb = {
						success: LJ.fn.handleDeleteProfileSuccess						
					};

				LJ.fn.showLoaders();
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


		},
		handleUpdateSettingsContactSuccess: function( data ){

			csl('update settings contact success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('#email_contact').prop( 'readonly', true );

				$('.row-contact').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-contact');
		
			});


		},
		handleDeleteProfileSuccess: function( data ){

			console.log('Profile successfully deleted... ');

			// Kill local storage variables
			window.localStorage.removeItem('preferences');

			$('#mainWrap').velocity('transition.fadeOut', {
				duration: 3000
			});

			setTimeout(function(){

				var text = LJ.fn.renderGoodbye();

				$('.curtain').velocity('transition.fadeIn', {
					duration: 3000,
					complete: function(){
						$('.curtain')
							.children().remove().end()
							.append( text )
							.find('.goodbye')
							.velocity('transition.fadeIn', {
								duration: 2000,
								complete: function(){
									$(this).velocity('transition.fadeOut', {
										duration: 2000,
										delay: 2000,
										complete: function(){
											document.location = '/home';
										}
									})
								}
							});
					}
				});
			}, 1000);

		}

	});	
