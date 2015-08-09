

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Modal();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Events();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Management();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Settings();

		},
		handleDomEvents_Globals: function(){


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
		handleDomEvents_Landing: function(){

			$('#facebook_connect').click(function(e){

				e.preventDefault();

				FB.login( function(res){

					delog('Client facebook status is : ' + res.status ) ;

					if( res.status == 'not_authorized' ){
						LJ.state.loggingIn = false;
						delog('User didnt let Facebook access informations');
						return
					}

					if( res.status == 'connected' ){

					  	$('#facebook_connect').velocity({ opacity: [0,1] }, { duration: 1250 });

						LJ.state.loggingIn = true;
						var access_token = res.authResponse.accessToken;
						delog('short lived access token : ' + access_token );

						FB.api('/me', function( facebookProfile ){
							facebookProfile.access_token = access_token;
					  		LJ.fn.loginWithFacebook( facebookProfile );
				  		}); 
					}

				}, { scope: ['public_profile', 'email', 'user_friends', 'user_photos']} );
			});

		},
		handleDomEvents_Navbar: function(){

			LJ.$logout.click(function(){
				LJ.user.app_preferences.ux.auto_login = 'no';
				LJ.fn.setLocalStoragePreferences();
				location.reload();

			});

			LJ.$body.on('click', '#thumbWrap img', function(){
				LJ.fn.displayUserProfile( LJ.user.facebook_id );
			});

			$('#search').click(function(){
				$(this).find('input').focus();
			});

			$('#search').mouseover(function(){

			});

			['#contact', '#profile', '#events', '#management', '#settings'].forEach(function(menuItem){

				$(menuItem).click(function(){

				$(menuItem).find('span.bubble').addClass('filtered').text('');
		
				  if( LJ.state.animatingContent || $(menuItem).hasClass('menu-item-active') || ($(menuItem).hasClass('disabled')) )
				  	return;

				  		LJ.state.animatingContent = true;
						
						var linkedContent = $(menuItem).data('linkedcontent');
						
						var indexActive = $('.menu-item-active').offset().left,
							indexTarget = $(menuItem).offset().left;

						if( indexActive > indexTarget ){
							var myWayOut = 'transition.slideLeftOut' ; //{opacity: [0, 1], translateX:[15,0 ] },
								myWayIn = 'transition.slideRightIn' ; //{opacity: [1, 0], translateX:[0,-5 ] };
						} else {
							var myWayOut = 'transition.slideRightOut' ;// {opacity: [0, 1], translateX:[-15,0 ] },
								myWayIn = 'transition.slideLeftIn' ; //{opacity: [1, 0], translateX:[0, 5] };
						}

						$('.menu-item-active').removeClass('menu-item-active')
											  .find('span.underlay')
											  .velocity({ opacity: [0, 1], translateY: [-2, 0]   },
											   { duration: 300,
											   complete: function(){
											   	$(menuItem).addClass('menu-item-active')
														   .find('span.underlay')
													   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
											   	} 
											});

						LJ.fn.displayContent( linkedContent, {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							prev:'revealed',
							duration: 320
						});
					
				  
				});
			});

		},
		handleDomEvents_Profile: function(){

			LJ.$body.on('mouseover', '#createEvent', function(){
				$('.search-results-places').addClass('open');
			});

			LJ.$body.on('change-user-xp', LJ.fn.updateUserXp );

			LJ.$body.on('click', '.upload-facebook', function(){
				
				var img_place = $(this).parents('.picture').data('img_place');
				LJ.fn.displayInModal({
					url:'/me/photos/uploaded',
					source:'facebook',
					render_cb: LJ.fn.renderFacebookUploadedPictures,
					error_cb: LJ.fn.renderFacebookUploadedPicturesNone,
					custom_data: [{ key: 'img-place', val: img_place }]
				});

			});

			LJ.$body.on('click', '.row-informations .btn-validate', function(){
				if( $(this).hasClass('btn-validating') )
					return;
				$(this).addClass('btn-validating');
				LJ.fn.updateProfile();
			});

			/* Généric ui update of selectable inputs */
			LJ.$body.on('click', '.row-select', function(){
				var $self = $(this);
				if( !$self.parents('.row-select-daddy').hasClass('editing') )
					return ;

				var $selectedType = $self.parents('.row-select-wrap');
				$selectedType.find('.row-select.modified').removeClass('modified');
				$self.addClass('modified');
			
			});


			/* Activate modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit:not(.active)', function(){ 

				var $self = $(this);
				var $daddy = $self.parents('.row-select-daddy');

				$self.addClass('active');
				$daddy.addClass('editing');
				
				$daddy
					.find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('input').attr('readonly', false)
					.end().find('.row-input')
					.each( function( i, el ){
						var current_val = $(el).find('input').val(),
					    	current_select_id = $(el).find('.row-select.selected').attr('data-selectid'),
					    	restore_arr = [ current_val, current_select_id ];
					    	restore_arr.forEach(function( val ){
					    		if( val != undefined )
					    			$(el).attr('data-restore', val );
					    	});
					});

				$daddy.find('.row-select.selected').removeClass('selected').addClass('modified');
			});

			/* Cancel ugoing modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit.active, .row-select-daddy .btn-cancel', function(){

				var $daddy = $(this).parents('.row-select-daddy');

				$daddy
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('input').attr('readonly',true)
					.end().find('.row-buttons').hide()
					.end().find('.modified').removeClass('modified')
					.end().find('[data-restore]')
					.each(function( i, el ){
						var val = $(el).attr('data-restore')
						$(el).find('input').val( val )
							 .end()
							 .find('[data-selectid="'+val+'"]').addClass('selected');						
					});

			});

			LJ.$body.on('click', '.row-pictures .icon-edit:not(.active)', function(){

				var $self = $(this);
				$self.addClass('active').parents('.row-pictures').addClass('editing');

				$('.row-pictures')
					.find('.picture-hashtag input').attr('readonly', false)
					.end().find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('.picture-edit, .row-pictures .row-buttons').velocity('transition.fadeIn',{ duration: 600 });

			});

			LJ.$body.on('mouseenter', ".row-pictures:not('.editing') .picture", function(){
				if( LJ.state.uploadingImage ) return;
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeIn', { duration: 260 });
			});
			LJ.$body.on('mouseleave', ".row-pictures:not('.editing') .picture", function(){
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeOut', { duration: 260 });
			});

			LJ.$body.on('click', '.row-pictures .icon-edit.active, .row-pictures .btn-cancel', function(){

				$('.row-pictures')
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('.selected').removeClass('selected')
					.end().find('.picture-hashtag input').attr('readonly',true)
					.end().find('.picture-edit').velocity('transition.fadeOut', { duration: 600 })
					.end().find('.row-buttons').hide();
				return;

			});

			LJ.$body.on('click', '.picture-edit i', function(){

				var $self = $(this);

				if( $self.hasClass('selected') )
					return $self.removeClass('selected');

				if( $self.hasClass('icon-main') ){
					$('.icon-main').removeClass('selected');
					$self.siblings('.icon-delete').removeClass('selected');
					$self.addClass('selected');
					return;
				}

				if( $self.hasClass('icon-delete') ){
					$self.siblings('.icon-main').removeClass('selected');
					$self.addClass('selected');
				}

			});


			LJ.$body.on('focusout', '.picture-hashtag input', function(){
				$(this).val( LJ.fn.hashtagify( $(this).val() ));
			});

			LJ.$body.on('click', '.row-pictures .btn-validate', function(){
				
				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				var updatedPictures  = [],
					$newMainPicture  = $('.icon-main.selected').parents('.picture'),
					$deletedPictures = $('.icon-trash-empty.selected').parents('.picture');
					$hashtagPictures = $('.picture');
					
					$deletedPictures.each(function( i, el ){
						var $el = $( el ),
							picture = { 
								img_place: $el.data('img_place'),
								action: "delete"
							};
							updatedPictures.push( picture );
					});

					$newMainPicture.each(function( i, el ){
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "mainify"
							};
							updatedPictures.push( picture );
					});

					$hashtagPictures.each(function( i, el ){
						var new_hashtag = $('.picture[data-img_place="'+i+'"]').find('.picture-hashtag').find('input').val();
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "hashtag",
								new_hashtag: LJ.fn.hashtagify( new_hashtag )
							};
							updatedPictures.push( picture );
					});

				if( updatedPictures.length == 0 )
					return LJ.fn.toastMsg("Aucune mise à jour nécessaire!","error");

				csl('Emitting update pictures (all)');
				$self.addClass('btn-validating');

				var eventName = 'me/update-pictures',
					data = { userId: LJ.user._id, updatedPictures: updatedPictures },
					cb = {
						success: LJ.fn.handleUpdatePicturesSuccess						
					};

				LJ.fn.say( eventName, data, cb );

			});

			$('.inspire').click( function(){
        		var list = LJ.settings.profileDescList;
        		$(this).siblings('input').val( LJ.settings.profileDescList[ LJ.fn.randomInt( 0, list.length - 1) ])
            });


		},
		handleDomEvents_Modal: function(){

			$('.modal-container').on('click','.modal-thumb-picture', function(){

				var $self = $(this);

				if( $self.hasClass('active') )
					return;

				if( $self.attr('src').split('/').slice(-1)[0] == 'placeholder_picture')
					return 

				var img_place = $self.attr('img-place');
				$('.modal-thumb-picture, .modal-user-picture-hashtag').removeClass('active');
				$self.add( $('.modal-user-picture-hashtag[img-place="'+ img_place +'"]') ).addClass('active');

				var img_version = $self.attr('img_version');

				$('.modal-main-picture').removeClass('active');
				$('.modal-main-picture[img_version="'+img_version+'"]').addClass('active');

			});

			$('.modal-container').on('click', '.facebook-image-item', function(){

				var $self = $(this);

				if( $self.hasClass('active') ){
					$self.removeClass('active');
					$('.modal-container').find('.btn-validate').addClass('btn-validating');
				} else {
					$('.facebook-image-item').removeClass('active')
					$('.modal-container').find('.btn-validate').removeClass('btn-validating');
					$self.addClass('active');
				}

			});

			$('.modal-container').on('click', '.btn-cancel', LJ.fn.hideModal );

			$('.modal-container').on('click', '.btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				if( $('.facebook-image-item.active').length != 1 )
					return;

				$self.addClass('btn-validating');

				var url = $('.facebook-image-item.active').find('img').attr('src');
				var img_place = $self.parents('.modal-container-body').children().last().attr('data-img-place');

				LJ.fn.hideModal();

				LJ.fn.updatePictureWithUrl({
        				userId: LJ.user._id,
        				url: url,
        				img_place: img_place
        			}, function( err, data ){

					if( err )
						return LJ.fn.handleServerError("L'upload avec Facebook a échoué.");

					LJ.fn.handleServerSuccess("Vos photos ont été mises à jour");

					LJ.fn.replaceImage({
							img_id: data.img_id,
							img_version: data.img_version,
							img_place: img_place,
							scope: ['profile']
						});

				});
				

			});

		},
		handleDomEvents_Events: function(){
	
			$('#refreshEventsFilters').click( function(){
					
				var $inserted = $('.inserted');

				if( $inserted.length == 0 ) return ;

				if( LJ.selectedTags.length == 0 ) return $('.inserted').removeClass('inserted');

				$inserted.each( function( i, el )
				{
					var $eventItemWrap = $( el );
					var myEvent = _.find( LJ.myEvents, function(elem){ return elem.hostId == $eventItemWrap.attr('data-hostid'); });

					var eventTags = myEvent.tags,
								L = eventTags.length;

					for( var k = 0; k < L; k++ ){
						eventTags[k] = "tag-" + eventTags[k];
					}

					if( _.intersection( eventTags, LJ.selectedTags ).length != 0 || LJ.selectedTags.length == 0 )
					{

						$eventItemWrap.find('.tag').each( function( i, tag )
						{	
							var $tag = $(tag);
							if( LJ.selectedTags.indexOf( $tag.attr('class').split(' ')[1] ) != -1 )
							{
								$tag.addClass( 'selected' );
							}
						});

						if( $eventItemWrap.find('.tag.selected').length != 0 ) $eventItemWrap.removeClass('inserted');

					}
				});

			});
			LJ.$body.on('click', '.f-item button', function(){

				csl('Asking for someone else');
				var $that = $(this);

				if( $that.hasClass('isHosting') )
				{
					LJ.fn.toastMsg('Redirecting to his event','info');
					$('.friendAddIconWrap.active').click();
				}

				if( ! $that.hasClass('ready') ) return;

				var eventId  = $that.parents('.eventItemWrap').attr('data-eventid'),
					hostId   = $that.parents('.eventItemWrap').attr('data-hostid'),
					friendId = $that.parents('.f-item').attr('data-userid'),
					friend   = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

				$that.removeClass('ready');

				csl('eventId : ' + eventId+ '\n hostId : '+hostId +'\n friend : '+friend );
				LJ.fn.showLoaders();
				LJ.fn.requestIn( eventId, hostId, friendId, LJ.user._id );

			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){

				$('#management').click();

			});


			LJ.$body.on('click', '.friendAddIconWrap', function(){

				sleep( 30, function(){ LJ.state.jspAPI['#friendsWrap'].reinitialise(); });

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active');
					$('#friendsWrap').velocity('transition.slideUpOut', { duration: 300 });
					LJ.fn.displayAddFriendToPartyButton();
					return;
				}

				$('.friendAddIconWrap').removeClass('active');
				$(this).addClass('active');

				$('#friendsWrap').insertAfter( $(this).parents('.eventItemWrap').children() )
									.velocity('transition.slideUpIn',
									{
										duration: 550
									});
				LJ.fn.displayAddFriendToPartyButton();

			});

			LJ.$body.on('click', '.guestsWrap', function(){

				$(this).toggleClass('active');
				var $askersWrap = $(this).parents('.eventItemWrap').find('.askedInWrap');
				var eventId = $(this).parents('.eventItemWrap').data('eventid');

				if( $(this).hasClass('active') )
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeIn');

					var eventName = 'fetch-asked-in',
						data = {
							eventId: eventId
						},
						cb = {
							success: LJ.fn.handleFetchAskedInSuccess,
							error: LJ.fn.handleErrorDefault
						}
					LJ.fn.say( eventName, data, cb );

				}else
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeOut');
				}

			});

			LJ.$body.on('click', '.askIn', function(){

				// Make sure client doesn't spam ask
				if( $('.asking').length > 0 ) return;

				var $self = $(this),
					$itemWrap = $self.parents('.eventItemWrap');

				var eventId = $self.parents('.eventItemWrap').data('eventid');
           		var hostId  = $self.parents('.eventItemWrap').data('hostid');

				if( $itemWrap.attr('data-eventstate') == 'open' )
				{
					LJ.fn.showLoaders();
					$self.addClass('asking');

					if( $self.hasClass('idle') )
					{	
						LJ.fn.requestIn( eventId, hostId, LJ.user._id, LJ.user._id ); 
					}
					else
					{	// To be removed in production for freemium considerations?
						LJ.fn.requestOut( eventId, hostId, LJ.user._id, LJ.user._id );
					}
				}
				else
				{
					LJ.fn.toastMsg("Cet évènement est complet!", 'error');
				}

			});

             $('#resetFilters').click( function(){

            	LJ.$eventsWrap.find('.selected').removeClass('selected');
            	$('#activateFilters').click();

            });

             $('#displayFilters').click( function(){

             	var $filtersWrap = $('.filtersWrap');

             	if( $filtersWrap.css('opacity') != 0 )
             	{
             		$filtersWrap.velocity('transition.slideUpOut', { duration: 400 });
             		$(this).find('span').text('Afficher');

             	}else
             	{
             		$filtersWrap.velocity('transition.slideDownIn', { duration: 550 });
             		$(this).find('span').text('Masquer');

             	}

             });

            $('#activateFilters').click( function() {

            	var tags 	  = [];
            		locations = [];  

				$('.filters-tags-row .selected').each( function( i, el ){
					var tag = $( el ).attr('class').split(' ')[1];						 
					tags.push( tag );
				});
				
				$('.filters-locs-row .selected').each( function( i, el ){
					var loc = parseInt( $( el ).attr('class').split(' ')[1].split('loc-')[1] );				 
					locations.push( loc );
				});  

				LJ.selectedTags 	 = tags;
				LJ.selectedLocations = locations;

				LJ.fn.filterEvents( LJ.selectedTags, LJ.selectedLocations );
            	
            });

           $('body').on('click', '#noFriendsYet span', function(){
           		$('#search').click();
           });

		},
		handleDomEvents_Create: function(){

			
			LJ.$body.on('click', '.mixity', function(){

				var $self = $(this);
				$('.mixity').removeClass('selected');
				$self.addClass('selected');

			});

			LJ.$body.on('click', '.btn-create-event', function(){

				LJ.fn.displayInModal({ 
					source:'local',
					fix_height: -43,
					custom_classes: ['text-left'],
					render_cb: LJ.fn.renderCreateEvent,
					predisplay_cb: function(){
						LJ.fn.initTypeaheadPlaces();
						LJ.fn.adjustAllInputsWidth('#createEvent');
					} 
				});

			});


		},
		handleDomEvents_Search: function(){

			LJ.$body.bind('typeahead:select', function(ev, suggestion) {

				console.log(suggestion);

				if( $('.row-create-party-location input').is( ev.target ) ){
					/*setTimeout(function(){
			  			$('.row-create-party-location input').val( suggestion.name );
					}, 10 ) */
				}

			  	if( $('#search input').is( ev.target ) ){
			  		LJ.fn.displayUserProfile( suggestion.facebook_id );
			  	}

			  	
			  
			});

		},
		handleDomEvents_Management: function(){

			$('#manageEventsWrap i.icon').click(function(){

				if( LJ.state.animatingContent ) return;
				LJ.state.animatingContent = true;

				var askerId = '';
				var $currentItem = $('.a-item.active');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('userid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('userid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlight friend */
				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $('#askersThumbs div.active').attr('class').match(/head-\d/)[0][5] ); /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');

			});

			LJ.$body.on('click', '#askersListWrap .imgWrapThumb', function(){
				
				//if( $(this).hasClass('active') ) return;
				
				/* Displaying asker profile */
				var askerId      = $(this).data('userid'),
					$currentItem = $('.a-item.active'), 
					$nextItem    = $('.a-item[data-userid="'+askerId+'"]');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('userid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('userid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlighting friends */
				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $(this).attr('class').match(/head-\d/)[0][5] );		 /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');				  

			});

			 [ '#cancelEvent', '#suspendEvent' ].forEach( function(item){ 

		 		var $item = $( item );

        		$item.click( function() {

	            		var hostId = LJ.user._id,
	            			eventId = LJ.user.hosted_event_id;

        			switch( item ){
        				case '#cancelEvent':
        				LJ.fn.cancelEvent( eventId, hostId );
        				break;

        				case '#suspendEvent':
        				LJ.fn.suspendEvent( eventId, hostId );
        				break;

        				default:
        				break;
        			}

        		});
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