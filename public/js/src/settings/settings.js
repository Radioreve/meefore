
	window.LJ.settings = _.merge( window.LJ.settings || {}, {

		$settings: $('.menu-section.--settings'),

		allowed_ids: [ 

			'newsletter',
			'invitations',
			'auto_login',
			'show_gender',
			'show_country',
			'new_message_received',
			'accepted_in',
			'message_readby'

		],

		init: function(){
			LJ.promise(function( resolve, reject ){

				LJ.settings.handleDomEvents();
				LJ.settings.setMyPreferences();

				resolve();

			});
		},
		setMyPreferences: function(){

			var app_preferences = LJ.user.app_preferences;

			_.keys( app_preferences ).forEach(function( key ){

                _.keys( app_preferences[ key ]).forEach(function( sub_key ){

                    var value	= app_preferences[ key ][ sub_key ];
                    var $toggle = $('[data-settings-type-id="' + sub_key + '"]').find('.toggle');

                    if( $toggle.length > 0 && value == 'yes' ){
                    	$toggle.addClass('--active');
                    }
                });
            });

			$('#settings__contact-email').val( LJ.user.contact_email );
			$('#settings__invite-code').val( LJ.user.invite_code );

		},
		handleDomEvents: function(){

			LJ.settings.$settings.on('click', '.toggle', 		   		  	 LJ.settings.updateSettingsToggle );
			LJ.settings.$settings.on('click', 'input, textarea, .edit',   	 LJ.settings.activateInput );
			LJ.settings.$settings.on('click', '.action__cancel',   		  	 LJ.settings.deactivateInput );
			LJ.settings.$settings.on('click', '.action__validate', 		     LJ.settings.updateSettingsInput );
			LJ.settings.$settings.on('click', '.settings__button.--sponsor', LJ.settings.showSponsorshipModal );

		},
		updateSettingsInput: function( element ){

			LJ.log('Updating settings input...');

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.settings-item');
			var $input = $block.find('input, textarea');

			if( $block.length == 0 || !$block.hasClass('--active') || $block.hasClass('--validating') ){
				return LJ.wlog('Not calling the api');
			}

			if( $input.val() == $block.attr('data-restore') ){
				LJ.settings.deactivateInput.call( this, element );
				return LJ.wlog('Not calling the api (same value)');
			}

			var type_id = $block.attr('data-settings-type-id');

			if( type_id == "invite_code" ){
				return LJ.settings.updateInviteCode();
			}

			if( type_id = "contact_email" ){
				return LJ.settings.updateContactEmail()
			}

		},
		updateInviteCode: function(){

			LJ.log('Updating invite code');

			var $input = $('#settings__invite-code');
			var $block = $input.closest('.settings-item');

			var new_invite_code = $input.val();

			var call_id = LJ.generateId();
			LJ.ui.showLoader( call_id );

			$block.attr('data-callid', call_id ).addClass('--validating');

			var update = {
				call_id     : call_id,
				invite_code : new_invite_code
			};

			LJ.api.updateInviteCode( update )
				.then( LJ.settings.handleUpdateSettingsSuccess, LJ.settings.handleApiError );

		},
		updateContactEmail: function(){

			LJ.log('Updating contact email');

			var $input = $('#settings__contact-email');
			var $block = $input.closest('.settings-item');

			if( $block.hasClass('--validating') ) return;

			var new_contact_email = $input.val();

			var call_id = LJ.generateId();
			LJ.ui.showLoader( call_id );

			$block.attr('data-callid', call_id ).addClass('--validating');

			var update = {
				call_id         : call_id,
				contact_email   : new_contact_email,
				app_preferences : LJ.user.app_preferences
			};

			LJ.api.updateSettingsContact( update )
				.then( LJ.settings.handleUpdateSettingsSuccess, LJ.settings.handleApiError );

		},
		updateSettingsToggle: function(){

			var $toggle = $(this);

			var settings_id = $toggle.closest('.settings-item').attr('data-settings-type-id');

			var allowed_ids = LJ.settings.allowed_ids; 
			if( allowed_ids.indexOf( settings_id ) == -1 ){
				return LJ.wlog('This settings id : ' + settings_id + ' is not into the allowed list : ' + allowed_ids );
			}

			// Update the ui
			var call_id = LJ.generateId();
			LJ.ui.showLoader( call_id );
			$toggle.toggleClass('--active');

			// Change internal state
			LJ.settings.updateSettings( settings_id );

			var update = {
				app_preferences: LJ.user.app_preferences,
				call_id: call_id
			};

			// Decide for the appropriate url handler based on the state
			if( ['newsletter', 'invitations'].indexOf( settings_id ) != -1 ){
				var apiFn = LJ.api.updateSettingsMailing;
				update.contact_email = LJ.user.contact_email;
			}

			if( ['auto_login', 'show_gender', 'show_country', 'message_readby'].indexOf( settings_id ) != -1 ){
				var apiFn = LJ.api.updateSettingsUx;
				update.contact_email = LJ.user.contact_email;
			}

			if( ['new_message_received', 'accepted_in'].indexOf( settings_id ) != -1 ){
				var apiFn = LJ.api.updateSettingsAlerts;
			}

			if( ! typeof apiFn == 'function' ){
				return LJ.wlog('Unable to find which apiFn to use');
			}

			apiFn( update )
				.then( LJ.settings.handleUpdateSettingsSuccess, LJ.settings.handleApiError );


		},
		updateSettings: function( settings_id ){

			var preferences = LJ.user.app_preferences;
			_.keys( preferences ).forEach(function( key ){
				_.keys( preferences[ key ] ).forEach(function( setting_type ){
					if( setting_type == settings_id ){
						if( preferences[ key ][ setting_type ] == 'yes' ){
							preferences[ key ][ setting_type ] = 'no';
						} else {
							preferences[ key ][ setting_type ] = 'yes';
						}
					}
				});	
			});


		},
		handleApiError: function( err ){

			var err_ns  = err.namespace;
			var err_id  = err.errors[0].err_id;
			var call_id = err.call_id;

			if( err.namespace == 'update_settings' ){

				LJ.ui.showToast('La mise à jour na pas été effectuée', 'error');
				LJ.ui.hideLoader( call_id );

				$('.toggle[data-callid="' + call_id + '"]').toggleClass('--active');
				return;

			}

			if( err_id == 'already_taken' ){
				LJ.ui.showToast( LJ.text('to_invite_code_already_taken'), 'error' );
				LJ.ui.hideLoader( call_id );
				$('.settings-item[data-callid="' + call_id + '"]').removeClass('--validating');
				return;
			}

			LJ.wlog('Unable to figure out what to do with this error (out of scope)');

		},
		handleUpdateSettingsSuccess: function( expose ){

			LJ.log('Update settings success');
			
			var call_id         = expose.call_id;

			LJ.ui.hideLoader( call_id );
			LJ.ui.showToast( LJ.text('to_settings_update_success') );

			// Check if this was 
			var $markedItem = $('.settings-item[data-callid="' + call_id + '"]');
			if( $markedItem.length == 1 ){
				$markedItem.attr('data-callid', null ).attr('data-restore', null );
				LJ.settings.deactivateInput( $markedItem );
			}

			LJ.settings.storeAutologinPreferences();

		},		
		showSponsorshipModal: function(){

			LJ.ui.showModal({
				"type"     : "sponsorship",
				"title"    : LJ.text("settings_modal_sponsor_title"),
				"subtitle" : LJ.text("settings_modal_sponsor_subtitle"),
				"body"     : LJ.settings.renderSponshipModalBody(),
				"footer"   : "<button>" + LJ.text("settings_modal_sponsor_button") + "</button>",
			});

		},
		renderSponshipModalBody: function(){
			return [
				'<div class="modal__input">',
					'<input type="text" placeholder="BL1347">',
				'</div>'
			].join('');
		},
		activateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.settings-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') || $block.hasClass('--no-edit') ){
				return;
			} else {
				$block.addClass('--active'); 
			}

			$input.attr( 'readonly', false );

			$block.find('.action')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	display: 'flex'
				  });

			$block.find('.edit')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.attr('data-restore', $input.val() );

		},
		deactivateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.settings-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') ){ $block.removeClass('--active'); } else { return; }

			$input.attr( 'readonly', true );

			$block.find('.action')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.find('.edit')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	delay: LJ.ui.action_show_duration,
				  	display: 'flex'
				  });

			var former_value = $block.attr('data-restore');
			if( former_value != null ){
				$input.val( former_value );
				$block.attr( 'data-restore', null );
			}

		},
		storeAutologinPreferences: function(){

			var namespace  = 'preferences' ;
			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem( namespace, JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem( namespace );
			}

		}

	});







































































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
				var new_message_received  = $container.find('[data-propid="new_message_received"].selected').attr('data-selectid');
				var min_frequency   = $container.find('[data-propid="min_frequency"].selected').attr('data-selectid');
				app_preferences.alerts.new_message_received = new_message_received;
				app_preferences.alerts.accepted_in    = accepted_in;
				app_preferences.alerts.min_frequency  = min_frequency;


				var data = {
					contact_email   : contact_email,
					app_preferences : app_preferences
				};

				LJ.fn.log('Emitting update settings [contact]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-contact',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsContactSuccess,
					error: function( xhr ){
						LJ.fn.timeout( LJ.ui.artificialDelay, function(){
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

				LJ.fn.log('Emitting update settings [ui]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-ux',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsUxSuccess,
					error: function( xhr ){
						LJ.fn.timeout( LJ.ui.artificialDelay, function(){
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

				LJ.fn.log('Emitting update settings [mailinglists]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-mailinglists',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsMailingListsSuccess,
					error: function( xhr ){
						LJ.fn.timeout( LJ.ui.artificialDelay, function(){
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
				var new_message_received  = $container.find('[data-propid="new_message_received"].modified').attr('data-selectid');
				var min_frequency   = $container.find('[data-propid="min_frequency"].modified').attr('data-selectid');
				
				var app_preferences = LJ.user.app_preferences;

				app_preferences.alerts.new_message_received = new_message_received;
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


				LJ.fn.log('Emitting update settings [notifications]');
				LJ.fn.showLoaders();

				var eventName = 'me/update-settings-alerts',
					data = data
					, cb = {
						success: LJ.fn.handleUpdateSettingsAlertsSuccess,
						error: function( xhr ){
							LJ.fn.timeout( LJ.ui.artificialDelay, function(){
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

				LJ.fn.log('Emitting delete profile...');
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

			LJ.fn.log('update settings ux success received' );

			LJ.fn.timeout( LJ.ui.artificialDelay, function(){

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

			LJ.fn.log('update settings mailing lists success received' );

			LJ.fn.timeout( LJ.ui.artificialDelay, function(){

				$('.row-news').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-news');
		
			});


		},
		handleUpdateSettingsAlertsSuccess: function( data ){

			LJ.fn.log('update settings alerts success received' );

			LJ.fn.timeout( LJ.ui.artificialDelay, function(){

				$('.row-alerts').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-alerts');
		
			});


		},
		handleUpdateSettingsContactSuccess: function( data ){

			LJ.fn.log('update settings contact success received' );

			LJ.fn.timeout( LJ.ui.artificialDelay, function(){

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

			LJ.fn.log('Profile successfully deleted... ');

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

		},
		storeAutologinPreferences: function(){

			var namespace  = 'preferences' ;
			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem( namespace, JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem( namespace );
			}

		}

});
