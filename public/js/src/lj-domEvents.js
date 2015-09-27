

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		
		handleDomEvents_Globals: function(){


			LJ.$body.on('mouseenter', '.eventItemWrap', function(){
				$(this).addClass('mouseover');
			});

			LJ.$body.on('mouseleave', '.eventItemWrap', function(){
				$(this).removeClass('mouseover');
			});

			$('.modal-curtain').click( function(){
				LJ.fn.hideModal();
			});

            LJ.$body.on('click', '.detailable', function(){

            	var facebook_id = $(this).attr('data-id') || $(this).closest('[data-userid]').attr('data-userid');

            	if( !facebook_id ){
            		return console.warn('Couldnt find any id to display profile');
            	}

            	LJ.fn.displayUserProfile( facebook_id );
            });
            
            LJ.$body.on('click', '.row-input', function(){
            	var $self = $(this);
            	if( $self.parents('.row').hasClass('editing') ) return;
            	$self.parents('.row').find('.icon-edit').toggleClass('slow-down full-rotation');
            	$self.find('input').focus();
            });

            LJ.$body.on('click', '.pick-lang', function(){

            	var $self = $(this);
            	var lang_code = $self.attr('data-code');

            	if( $self.hasClass('active') ){
            		return;
            	} else {
            		LJ.fn.displayCurtain({
            			behindTheScene: function(){

            				console.log('Changing language');
            				$('.pick-lang').removeClass('active');
            				$self.addClass('active');

            				LJ.fn.setAppLanguage( lang_code );
            			},
            			duration: 550,
            			delay: 100,
            			afterTheScene: function(){

            				LJ.fn.toastMsg( LJ.text_source[ "t_language_changed" ][ lang_code ] );

            			}
            		});
            	}

            });

		},
		handleDomEvents_Search: function(){

			LJ.$body.bind('typeahead:select', function(ev, suggestion) {

				console.log(suggestion);

				if( $('.row-create-party-location input').is( ev.target ) ){
					/* Nothing special - default typeahead behavior, copy name on input */	
				}

			  	if( $('#search input').is( ev.target ) ){
			  		LJ.fn.displayUserProfile( suggestion.facebook_id );
			  	}

			  	if( $('.row-create-friends input').is( ev.target ) ){
			  		delog('Friends input selected!');
			  	}

			});

		},
		handleDomEvents_Settings: function(){

			LJ.$body.on('click', '.row-ux .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id 		  = LJ.user._id,
				$container    = $('.row-ux')
				auto_login    = $container.find('.auto_login.modified').attr('data-selectid'),
				app_preferences = LJ.user.app_preferences;

				app_preferences.ux.auto_login = auto_login;

			var data = {
				userId		    : _id,
				app_preferences : app_preferences
			};

			csl('Emitting update settings [ui]');

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

			LJ.$body.on('click', '.row-notifications .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id 		  = LJ.user._id,
				$container    = $('.row-notifications')
				invitations   = $container.find('.invitations.modified').attr('data-selectid'),
				newsletter    = $container.find('.newsletter.modified').attr('data-selectid'),
				app_preferences = LJ.user.app_preferences;

				app_preferences.email.invitations = invitations;
				app_preferences.email.newsletter  = newsletter;

			var data = {
				userId		    : _id,
				app_preferences : app_preferences
			};

			csl('Emitting update settings [mailinglists]');

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



		}


});