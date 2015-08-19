

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		
		handleDomEvents_Globals: function(){

			LJ.$body.on('mouseover', '#createEvent', function(){
				LJ.fn.sanitizeCreateInputs();
			});
			LJ.$body.on('mouseenter', '#createEvent input', function(){
				$(this).addClass('no-sanitize');
			});
			LJ.$body.on('mouseleave', '#createEvent', function(){
				$(this).removeClass('no-sanitize');
			});

			LJ.$body.on('click', '.rem-click', function(){

				var $self   = $(this);
				if( $self.parents('.row-create-ambiance').length != 0 ){
					var $input  = $self.parents('.row-input').find('input');
						$input.css({ width: $input.outerWidth() + $self.outerWidth(true) });
						$self.remove();
				}
				if( $self.parents('.row-create-hosts').length != 0 ){
					var $input  = $self.parents('.row-input').find('input');
						$input.css({ width: $input.outerWidth() + $self.outerWidth(true) });
					var $sug = $('.search-results-autocomplete');
					var current_offset = parseInt( $sug.css('left').split('px')[0] );
					$sug.css({ left: current_offset + $self.outerWidth(true) });
						$self.remove();
				}	


			});

			LJ.$body.on('keydown', 'input', function(e){

				var $self = $(this);
				var keyCode = e.keyCode || e.which;

				/* Remove des hashtag event  */
				if( keyCode == 8  && $self.parents('.row-create-ambiance').length != 0 && $self.val().length == 0 ){
					var $itm = $self.parents('.row-input').find('.rem-click').last();
						$self.css({ width: $self.outerWidth() + $itm.outerWidth(true) });
						$itm.remove();
				}

				/* Remove des hosts event  */
				if( keyCode == 8  && $self.parents('.row-create-hosts').length != 0 && $self.val().length == 0 ){
					var $itm = $self.parents('.row-input').find('.rem-click').last();
						$self.css({ width: $self.outerWidth() + $itm.outerWidth(true) });
						var $sug = $('.search-results-autocomplete');
						var current_offset = parseInt( $sug.css('left').split('px')[0] );
						$sug.css({ left: current_offset + $itm.outerWidth(true) });
						$itm.remove();
				}

				/* Ajout des hashtag */
				if( (keyCode == 9 || keyCode == 13) && $self.parents('.row-create-ambiance').length != 0 && $self.val().length != 0 ){
					e.preventDefault();
					var str = LJ.fn.hashtagify( $self.val() );
					LJ.fn.addItemToInput({ html: LJ.fn.renderAmbianceInCreate( str ), inp: this, max: LJ.settings.app.max_ambiance });
					$(this).val('');
				}

					
			});

			/* Ajout des hosts / partyplace via la touche tab && click */
			LJ.$body.bind('typeahead:autocomplete typeahead:select', function(ev, suggestion) {
				var $input = $('.row-create-hosts input');
			  	if( $input.is( ev.target ) ){
			  		$input.parents('.twitter-typeahead').addClass('autocompleted');
			  		LJ.fn.addItemToInput({ max: LJ.settings.app.max_hosts, inp: '.autocompleted', html: LJ.fn.renderFriendInCreate( suggestion ), suggestions: '.search-results-hosts' });
			  	}
			  	var $input = $('.row-create-party-place input');
			  	if( $input.is( ev.target ) ){
			  		LJ.fn.addPartyPlaceToInput( suggestion );
			  	}
			});


			/* make sure always empty when closed */
			LJ.$body.bind('typeahead:autocomplete typeahead:select typeahead:change', function( ev, suggestion ){
				var $input = $('.row-create-hosts input');
					if( $input.is( ev.target ) ){
			  			$input.typeahead('val','');
					}
			});


			LJ.$body.on('mouseenter', '.eventItemWrap', function(){
				$(this).addClass('mouseover');
			});

			LJ.$body.on('mouseleave', '.eventItemWrap', function(){
				$(this).removeClass('mouseover');
			});

			$('.curtain').click( function(){
				LJ.fn.hideModal();
			});

            LJ.$body.on('click', '.detailable', function(){
            	LJ.fn.displayUserProfile( $(this).attr('data-id') );
            });
            
            LJ.$body.on('click', '.row-input', function(){
            	var $self = $(this);
            	if( $self.parents('.row').hasClass('editing') ) return;
            	$self.parents('.row').find('.icon-edit').toggleClass('slow-down full-rotation');
            });

		},
		handleDomEvents_EventInview: function(){

			LJ.$body.on('keypress', '.event-accepted-chat-typing input', function(e){
				var keyCode = e.keyCode || e.which;
				if( keyCode === 13 ){
					$(this).siblings('button').click();
				}
			});

			LJ.$body.on('click', '.event-accepted-chat-typing button', function(){

				var $self 	  = $(this);
				var author    = LJ.user;
				var msg   	  = $self.siblings('input').val();
				var event_id  = $self.parents('.row-events-accepted-inview').attr('data-eventid');

				if( $self.parents('.validating').length != 0 )
					return LJ.fn.toastMsg("Vous n'avez pas encore été accepté!", 'info');

				if( msg.trim().length == 0 )
					return LJ.fn.toastMsg('Le message est vide!', 'info');

				$self.siblings('input').val('');
				LJ.fn.addChatLine({ event_id: event_id, msg: msg, author: author });
				// Send to the server

			});

		},
		handleDomEvents_EventPreview: function(){

			LJ.$body.on('click', '.event-accepted-tabview', function(){

				var $self = $(this);
				var event_id = $self.attr('data-eventid');
				var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="'+event_id+'"]');
				var duration = 900;

				if( $self.hasClass('active') ){
					$inview_wrap_target.velocity('transition.slideUpOut');
					$self.removeClass('active');
					return;
				}

				if( $('.event-accepted-tabview.active').length == 0 ){
					$self.addClass('active');
					$inview_wrap_target.velocity('transition.slideUpIn');
					return;
				}

				var current_event_id = $('.event-accepted-tabview.active').attr('data-eventid');
				var $inview_wrap_current = $('.row-events-accepted-inview[data-eventid="'+current_event_id+'"]');

				$('.event-accepted-tabview').removeClass('active');
				$self.addClass('active');
				
				$('.row-events-accepted-inview[data-eventid="'+current_event_id+'"]')
				.velocity('transition.slideUpOut', {
					duration: duration
				});

				setTimeout(function(){
					$inview_wrap_target.velocity('transition.slideUpIn', { duration: duration });
					return;
				}, 220 );


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

			  	if( $('.row-create-hosts input').is( ev.target ) ){
			  		delog('Hosts input selected!');
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