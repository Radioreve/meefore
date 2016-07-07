
	window.LJ.settings = _.merge( window.LJ.settings || {}, {

		$settings: $('.menu-section.--settings'),

		allowed_ids: [ 

			// 'subscribed'
			'newsletter',

			// 'ux'
			'auto_login',
			'show_gender',
			'show_country',
			'message_seen',

			// 'alerts_email'
			"new_message",
			"marked_as_host",
			"new_cheers",
			"new_match"

		],

		init: function(){

			LJ.settings.activateSubmenuSection('account');
			LJ.settings.handleDomEvents();
			LJ.settings.setMyPreferences();
			LJ.settings.applyUxPreferences();
			LJ.settings.storeAutologinPreferences();
			
			return;

		},
		findObjectLeaves: function( o ){
			
			var self   = this;
			var leaves = [];
			var keys   = Object.keys( o );
		    
		    for( var i=0; i<keys.length; i++ ){
		    	
		        var key = keys[ i ];
		    	if( o.hasOwnProperty( key ) ){
		        	if( typeof o[ key ] != "object" ){
		            	var item = { "key": key, "value": o[ key ] };
		            	leaves.push( item );
		            } else {
		            	leaves = leaves.concat( self.findObjectLeaves.call( self, o[ key ] ) );
		            }
		        } 
		    }
		    
		    return leaves;
		    
		},
		setMyPreferences: function(){

			// Reset
			$('[data-settings-type-id]').find('.toggle').removeClass('--active');
			
			// Setting the toggles to active/inactive
			LJ.settings.findObjectLeaves( LJ.user.app_preferences ).forEach(function( leaf ){

				var $toggle = $('[data-settings-type-id="' + leaf.key + '"]').find('.toggle');
				var $input  = $('[data-settings-type-id="' + leaf.key + '"]').find('input');

				if( $toggle.length > 0 && leaf.value === true ){
                    	$toggle.addClass('--active');
                }

                // if someday some preferences are of type string...
                if( $input.length > 0 ){
                	$input.val( leaf.value );
                }

			});

			$('[data-settings-type-id="contact_email"]').find('input').val( LJ.user.contact_email );
			$('[data-settings-type-id="invite_code"]').find('input').val( LJ.user.invite_code );

		},	
		applyUxPreferences: function(){

			if( LJ.user.app_preferences.ux.show_country === true ){
				$('.js-user-country').show();
			} else {
				$('.js-user-country').hide();
			}

			if( LJ.user.app_preferences.ux.show_gender === true ){
				$('.js-user-gender').css({ display: 'inline-block' });
			} else {
				$('.js-user-gender').hide();
			}

		},
		handleDomEvents: function(){

			LJ.settings.$settings.on('click', '.toggle', 		   		  	 LJ.settings.updateSettingsToggle );
			LJ.settings.$settings.on('click', 'input, textarea, .edit',   	 LJ.settings.activateInput );
			LJ.settings.$settings.on('click', '.action__cancel',   		  	 LJ.settings.deactivateInput );
			LJ.settings.$settings.on('click', '.action__validate', 		     LJ.settings.updateSettingsInput );
			LJ.settings.$settings.on('click', '.settings__button.--sponsor', LJ.settings.showSponsorshipModal );
			LJ.settings.$settings.on('click', '.segment__part', 			 LJ.settings.showSubmenuItem );
			LJ.settings.$settings.on('click', '.settings__button.--delete',  LJ.settings.showDeleteAccountModal );
			LJ.ui.$body.on('click', '.modal.--delete button',				 LJ.settings.handleDeleteAccountAction );

		},
		showSubmenuItem: function(){

			var $self = $(this);

			var link_id = $self.attr('data-link');
			LJ.settings.activateSubmenuSection( link_id );

		},
		activateSubmenuSection: function( section_id ){	

			var current_section_id = $('.menu-section.--settings').find('.segment__part.--active').attr('data-link');

			var $submenu_item_activated    = $('.menu-section.--settings').find('.segment__part[data-link="' + current_section_id + '"]');
			var $submenu_item_to_activate  = $('.menu-section.--settings').find('.segment__part[data-link="' + section_id + '"]');

			var $submenu_block_activated   = $('.settings[data-link="' + current_section_id + '"]');
			var $submenu_block_to_activate = $('.settings[data-link="' + section_id + '"]');


			if( !current_section_id ){
				$submenu_item_to_activate.addClass('--active');
				return $('.menu-section.--settings').find('[data-link="' + section_id + '"]').css({ 'display': 'flex' });
			}


			if( section_id == current_section_id ){
				return LJ.wlog('Section is already activated');
			}


			$submenu_item_activated
				.removeClass('--active')
				.find('.menu-section-submenu__bar')
				.velocity('bounceOut', { duration: 450, display: 'none' });

			$submenu_item_to_activate
				.addClass('--active')
				.find('.menu-section-submenu__bar')
				.velocity('bounceInQuick', { duration: 450, display: 'block' });

			$submenu_block_activated.hide();
			$submenu_block_to_activate.css({ display: 'flex' });

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
				call_id       : call_id,
				contact_email : new_contact_email
			};

			LJ.api.updateUser( update )
				.then( LJ.settings.handleUpdateSettingsSuccess, LJ.settings.handleApiError );

		},
		updateKey: function( o, target_key, value ){
			
		    var self = this;
		    var keys = Object.keys( o );
		    
		    for( var i=0; i<keys.length; i++ ){
		  
		        var key = keys[ i ];
		    	if( key === target_key && typeof o[ key ] == typeof value ){
		        	return o[ key ] = value;
		        }
		        
		        if( typeof o[ key ] == "object" ){
		        	self.updateKey.apply( self, [ o[ key ], target_key, value ]);
		        }

		    }
		    		    
		},
		updateSettingsToggle: function(){
			
			var $toggle     = $( this );
			var settings_id = $toggle.closest('.settings-item').attr('data-settings-type-id');

			var allowed_ids = LJ.settings.allowed_ids; 
			if( allowed_ids.indexOf( settings_id ) == -1 ){
				return LJ.wlog('This settings id : ' + settings_id + ' is not into the allowed list : ' + allowed_ids );
			}

			var settings_value = $toggle.hasClass('--active') ? false : true;
			LJ.settings.updateKey( LJ.user.app_preferences, settings_id, settings_value );
						
			// Update the ui
			var call_id = LJ.generateId();
			LJ.ui.showLoader( call_id );
			$toggle.toggleClass('--active');
	
			
			var update = {
				call_id         : call_id,
				app_preferences : LJ.user.app_preferences
			};
						
			LJ.api.updateUser( update )
				.then(function( res ){
					LJ.settings.handleUpdateSettingsSuccess( res );
				})
				.catch(function( err ){
					LJ.settings.handleApiError( err );
				});

		},
		handleApiError: function( err ){

			var err_ns  = err.namespace;
			var err_id  = err.errors[0].err_id || (err.errors[0].data && err.errors[0].data.err_id );
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

			 if( err_id == 'bad_pattern' ){
				LJ.ui.showToast( LJ.text('to_invite_code_bad_pattern'), 'error' );
				LJ.ui.hideLoader( call_id );
				$('.settings-item[data-callid="' + call_id + '"]').removeClass('--validating');
				return;
			}

			LJ.wlog('Unable to figure out what to do with this error (out of scope)');

		},
		handleUpdateSettingsSuccess: function( expose ){

			LJ.log('Update settings success');
			
			var call_id = expose.call_id;

			LJ.ui.hideLoader( call_id );
			LJ.ui.showToast( LJ.text('to_settings_update_success') );
			LJ.settings.storeAutologinPreferences();
			LJ.settings.applyUxPreferences();

			// Check if this was a textfield input;
			var $markedItem = $('.settings-item[data-callid="' + call_id + '"]');
			if( $markedItem.length == 1 ){
				$markedItem.attr('data-callid', null ).attr('data-restore', null );
				LJ.settings.deactivateInput( $markedItem );
			}

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
		showDeleteAccountModal: function(){

			var footer = [
				'<button data-action="confirm">' + LJ.text("settings_modal_delete_button_confirm") + '</button>',
				'<button data-action="cancel">' + LJ.text("settings_modal_delete_button_cancel") + '</button>'
			].join('');

			LJ.ui.showModal({
				"type"  : "delete",
				"title"    : LJ.text("settings_modal_delete_title"),
				"subtitle" : LJ.text("settings_modal_delete_subtitle"),
				"footer"   : footer
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
				  	duration: 10, // LJ.ui.action_hide_duration,
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

			if( $block.hasClass('--active') ){
				$block.removeClass('--active')
					  .removeClass('--validating');
			} else {
				return;
			}

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

			LJ.store.set( "autologin", LJ.user.app_preferences.ux.auto_login );

		},
		handleDeleteAccountAction: function(){

			var $btn = $( this );
			var action = $btn.attr('data-action');

			if( action == "cancel" ){
				return LJ.ui.hideModal();
			}

			if( $btn.hasClass('--pending') ){
				return LJ.log('Already hiding...');
			}
			
			LJ.log('Deleting user account...');
			$btn.addClass('--pending');
			LJ.api.deleteMyAccount()
				.then( LJ.ui.shadeModal )
				.then(function(){
						
					// Clear the local storage
					LJ.store.remove("autologin");
					LJ.store.remove("facebook_access_token");
					LJ.store.remove("seen_chats");

					location.reload();

				})
				.catch(function(){
					$btn.removeClass('--pending');
					LJ.ui.hideModal()
						.then(function(){
							LJ.ui.showToast("Une erreur s'est produite, nous avons été notifié", "error" );
							window.localStorage.removeItem('preferences');
						});
				});
		}

	});


