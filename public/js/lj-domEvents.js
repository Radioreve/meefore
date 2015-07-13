

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Events();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Management();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Contact();
			LJ.fn.handleDomEvents_Settings();

		},
		handleDomEvents_Globals: function(){

			/* Faire disparaitre les chats tab lorsqu'on clic à côté */
			LJ.$body.click( function( e ){
				var el = $(e.target);
				if( !el.parents('.eventItemWrap').hasClass('mouseover') )
					$('.chatIconWrap.active, .friendAddIconWrap.active').click();
			});


			LJ.$body.on('mouseenter', '.eventItemWrap', function(){
				$(this).addClass('mouseover');
			});

			LJ.$body.on('mouseleave', '.eventItemWrap', function(){
				$(this).removeClass('mouseover');
			});

			LJ.$body.on('click','.chatInputWrap input[type="submit"]', function( e ){

            	e.preventDefault();
            	e.stopPropagation();

            	LJ.fn.sendChat( $(this) );

            });

            /* Pouvoir zoomer sur une image */
            LJ.$body.on('click', 'img.zoomable', function(){

			 	var user = {
			 		imgId      : $( this ).data('imgid'),
			 		imgVersion : $( this ).data('imgversion')|| ''
			 	};

               // LJ.fn.toggleOverlay( 'high', LJ.fn.renderOverlayUser( user ), 300);

            });
            
            LJ.$body.on('keyup', '.chatInputWrap input', function(){

            	var $self = $(this);
            	var chatId = $self.parents('.chatWrap').data('chatid')

            	if( $self.val() === '' ) 
            	{	
            		if( ! LJ.state.typingMsg[ chatId ] ) return;

            		console.log('Ended typing detected...');
            		LJ.state.typingMsg[ chatId ] = false;

            		var eventName = 'user-stopped-typing',
            			data = { senderId: LJ.user._id, receiverId: chatId },
            			cb = {
            				success: function( data ){
            					//
            				},
            				error: function( xhr ){
            					console.log('Error occured notifying typing');
            				}
            			};
            		LJ.fn.say( eventName, data, cb );
            		return;
            	}

            	if( ! LJ.state.typingMsg[ chatId ] )
            	{
            		console.log('Started typing detected!');
            		LJ.state.typingMsg[ chatId ] = true;
            		
            		var eventName = 'user-started-typing',
            			data = { senderId: LJ.user._id, receiverId: chatId },
            			cb = {
            				success: function( data ){
            					//
            				},
            				error: function( xhr ){
            					LJ.fn.toastMsg( JSON.parse( xhr.responseText ).msg ,'error');
            				}
            			};
            		LJ.fn.say( eventName, data, cb );
            		return;
            	}

            });


		},
		handleDomEvents_Landing: function(){

			$('#facebook_connect').click(function(e){

				e.preventDefault();
				console.log('Login in with Facebook...');
				LJ.state.loggingIn = true;

				FB.login( function(res){

					console.log('Client facebook status is : ' + res.status ) ;

					if( res.status != 'connected' ){
						LJ.state.loggingIn = false;
						console.log('Exiting');
						return
					}

						FB.api('/me', function( facebookProfile ){

							console.log( facebookProfile );
					  		LJ.fn.loginWithFacebook( facebookProfile );

				  		});
				}, { scope: ['public_profile', 'email']});

			});

		},
		handleDomEvents_Navbar: function(){

			LJ.$logout.click(function(){
				location.reload();

			});

			LJ.$body.on('click', '#thumbWrap img', function(){
				$('#profile').click();
			});

			['#contact', '#create', '#profile', '#events', '#management','#search', '#settings'].forEach(function(menuItem){

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

						LJ.fn.displayContent( $(linkedContent), {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							prev:'revealed',
							duration: 320
						});
					
				  
				});
			});

		},
		handleDomEvents_Profile: function(){

			LJ.$body.on('click', '.row-informations .btn-validate', function(){
				if( $(this).hasClass('btn-validating') )
					return;
				$(this).addClass('btn-validating');
				LJ.fn.updateProfile();
			})

			LJ.$body.on('click', '.drink', function(){

				if( !$(this).parents('.row-informations').hasClass('editing') )
					return ;
				$('.row-informations .drink.modified').removeClass('modified');
				$(this).addClass('modified');
			
			});

			LJ.$body.on('click', '.mood', function(){

				if( !$(this).parents('.row-informations').hasClass('editing') )
					return ;
				$('.row-informations .mood.modified').removeClass('modified');
				$(this).addClass('modified');
			});

			LJ.$body.on('click', '.row-informations .icon-edit:not(.active)', function(){ 

				var $self = $(this);
				$self.addClass('active').parents('.row-informations').addClass('editing');
				
				$('.row-informations')
					.find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('input').attr('readonly', false)
					.end().find('.row-input')
					.each( function( i, el ){
						var current_val = $(el).find('input').val(),
					    	current_mood_id = $(el).find('.mood.selected').attr('data-moodid'),
					    	current_drink_id = $(el).find('.drink.selected').attr('data-drinkid'),
					    	restore_arr = [ current_val, current_mood_id, current_drink_id ];
					    	restore_arr.forEach(function( val ){
					    		if( val != undefined )
					    			$(el).attr('data-restore', val );
					    	});
					});
					$('.mood.selected, .drink.selected').removeClass('selected').addClass('modified');
			});

			LJ.$body.on('click', '.row-informations .icon-edit.active, .row-informations .btn-cancel', function(){

				$('.row-informations')
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('input').attr('readonly',true)
					.end().find('.row-buttons').hide()
					.end().find('.modified').removeClass('modified')
					.end().find('[data-restore]')
					.each(function( i, el ){
						var val = $(el).attr('data-restore')
						if( $(el).hasClass('row-name') || $(el).hasClass('row-age') || $(el).hasClass('row-motto') || $(el).hasClass('row-job')) 
							$(el).find('input').val( val );
						if( $(el).hasClass('row-mood') || $(el).hasClass('row-drink') )
							$(el).find('[data-moodid="'+val+'"], [data-drinkid="'+val+'"]').addClass( 'selected' );
						
					});

			});

			LJ.$body.on('click', '.row-pictures .icon-edit:not(.active)', function(){

				var $self = $(this);
				$self.addClass('active').parents('.row-pictures').addClass('editing');

				$('.row-pictures')
					.find('.picture-hashtag input').attr('readonly', false)
					.end().find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('.picture-edit, .row-pictures .row-buttons').velocity('transition.fadeIn',{ duration:600 });

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
								imgPlace: $el.data('imgplace'),
								action: "delete"
							};
							updatedPictures.push( picture );
					});

					$newMainPicture.each(function( i, el ){
						var $el = $( el ),
							picture = {
								imgPlace: $el.data('imgplace'),
								action: "mainify"
							};
							updatedPictures.push( picture );
					});

					$hashtagPictures.each(function( i, el ){
						var new_hashtag = $('.picture[data-imgplace="'+i+'"]').find('.picture-hashtag').find('input').val();
						var $el = $( el ),
							picture = {
								imgPlace: $el.data('imgplace'),
								action: "hashtag",
								new_hashtag: LJ.fn.hashtagify( new_hashtag )
							};
							updatedPictures.push( picture );
					});

				if( updatedPictures.length == 0 )
					return LJ.fn.toastMsg("Aucune mise à jour nécessaire!","error");

				csl('Emitting update pictures (all)');
				$self.addClass('btn-validating');

				var eventName = 'update-pictures',
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

			LJ.$body.on('click', '.chatIconWrap, .closeChat', function(){

				LJ.fn.toggleChatWrapEvents( $(this) );

			});

			LJ.$body.on('click', '.friendAddIconWrap', function(){
				
				$('.eventItemWrap.surfacing').find('.chatWrap').velocity('transition.slideDownOut', { duration: 300 });
				$('.chatIconWrap.active').removeClass('active');

				sleep( 30, function(){ LJ.state.jspAPI['#friendListWrap'].reinitialise(); });

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active');
					$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
					LJ.fn.displayAddFriendToPartyButton();
					return;
				}

				$('.friendAddIconWrap').removeClass('active');
				$(this).addClass('active');

				$('#friendListWrap').insertAfter( $(this).parents('.eventItemWrap').find('.chatWrap') )
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

			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});

			$('#createEventWrap').on('click', '.imgWrapThumb', function(){
				var $t = $(this);
					$t.toggleClass('active');
			});

		},
		handleDomEvents_Search: function(){

			$('#friendsOnly').click( function(){

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active').text('Amis uniquement');
					$('#searchUsers .u-item').removeClass('filtered');
					$('#searchBar input').val('').trigger('keydown');
				}
				else
				{
					$(this).addClass('active').text('Voir tous les utilisateurs');
					$('#searchUsers .u-item').each( function( i, el ){

						var arr = _.pluck( LJ.user.friendList, 'friendId' );
						var userId = $(el).attr('data-userid');
						var ind = arr.indexOf( userId );
						if( arr.indexOf( userId ) == -1 )
						{
							$(el).addClass('filtered')
						}
						else
						{
							var status = _.find( LJ.user.friendList, function(el){ return el.friendId == userId; }).status
							if( status == 'mutual')
							{
								$(el).addClass('match f-mutual').insertBefore( $('#searchUsers .u-item').first() );
							}
							if( status == 'askedMe' ) 
							{
								if( $('#searchUsers .u-item.f-mutual').length == 0 )
								{
									$(el).addClass('match f-askedme').insertBefore( $('#searchUsers .u-item').first() );
								}
								else
								{
									$(el).addClass('match f-askedme').insertAfter( $('#searchUsers .u-item.f-mutual').last() );
								}
							}
							if( status == 'askedHim'  )
							{
								if( $('#searchUsers .u-item.f-askedme').length == 0 )
								{
									if( $('#searchUsers .u-item.f-mutual').length == 0 )
									{
										$(el).addClass('match f-askedhim').insertBefore( $('#searchUsers .u-item').first() );
									}
									else
									{
										$(el).addClass('match f-askedhim').insertAfter( $('#searchUsers .u-item.f-mutual').last() );
									}
								}
								else
								{
									$(el).addClass('match f-askedhim').insertAfter( $('#searchUsers .u-item.f-askedme').last() );
								}
							}
								
						}
					});

					var $items = $('#searchUsers .u-item:not(.filtered)');

					/* Mise à jour des button à partir de .match*/
					$items.addClass('match').css({ 'opacity':'1'}).removeClass('nonei');
					LJ.fn.displayAddUserAsFriendButton();

				}
	
			});


			$('#searchBar input').on('keydown', function(){
				
				sleep(100, function(){

				if( $('#friendsOnly').hasClass('active') && $('#searchBar input').val().length == 0 )
				{
					return $('#friendsOnly').removeClass('active').trigger('click');
				}
					$('#searchUsers .u-item').removeClass('match').css({ opacity: '0' }).addClass('none');

					var word = $('#searchUsersWrap').find('input').val().toLowerCase();	

					$('#searchUsers .u-item:not(.filtered)[data-username^="'+word+'"], \
					   #searchUsers .u-item:not(.filtered)[data-userdrink^="'+word+'"], \
					   #searchUsers .u-item:not(.filtered)[data-userage^="'+word+'"]')
						.addClass('match').css({ opacity: '1' }).removeClass('none')
						.each( function(i, el){
							nextEl = $('#searchUsers .u-item:not(.filtered)').first();
							while( nextEl.hasClass('match') )
							{
								nextEl = nextEl.next();	
							}
							$(el).insertBefore( nextEl );
						});

					/* Display button state for all .match elements */
					LJ.fn.displayAddUserAsFriendButton();

					/* Cascading opacity */
					$( $('#searchUsers .u-item:not(.match):not(.filtered)')[0] ).removeClass('none').css({ opacity: '.5 '});
					$( $('#searchUsers .u-item:not(.match):not(.filtered)')[1] ).removeClass('none').css({ opacity: '.4 '});
					$( $('#searchUsers .u-item:not(.match):not(.filtered)')[2] ).removeClass('none').css({ opacity: '.3 '});
					$( $('#searchUsers .u-item:not(.match):not(.filtered)')[3] ).removeClass('none').css({ opacity: '.15 '});

				});
			});


		$('#searchUsersWrap').on('click', 'button', function(){

			var $button = $(this);

			if( $button.hasClass('onHold') ) return;

			$button.parents('.u-item').addClass('sent');

			var userId = LJ.user._id,
				friendId = $button.parents('.u-item').data('userid');

			var hostIds = [];
			for( var i = 0 ; i < LJ.user.eventsAskedList.length; i++)
			{	
				hostIds[i] = $('.eventItemWrap[data-eventid="'+LJ.user.eventsAskedList[i]+'"]').attr('data-hostid');
				console.log('Host found : '+hostIds[i] );
			} 
			LJ.fn.showLoaders();

			var eventName = 'friend-request-in',
				data = {
					userId: userId,
					friendId: friendId,
					hostIds: hostIds
				},
				cb = {
					success: function( data ){
						LJ.fn.handleFriendRequestSuccess( data );
					},
					error: function( xhr ){

					}
				};

			csl( 'Friending request for : '+friendId );
			LJ.fn.say( eventName, data, cb );

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
	            			eventId = LJ.user.hostedEventId;

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

       		  LJ.$askersListWrap.on('click','.btn-chat, .closeChat',function(){

            	var $that = $(this),
            		chatId = $that.parents('#askersListWrap').find('div.chatWrap').data('chatid');
     	
            	if(! $that.hasClass('moving') ){
            		$that.addClass('moving');
            		LJ.fn.toggleChatWrapAskers( $that );
            		sleep( LJ.ui.artificialDelay, function(){
            			$that.removeClass('moving');
            		});
            	}
            });	

		},
		handleDomEvents_Contact: function(){

			$('#sendContactForm').click( function(){

				var userId   = LJ.user._id,
					username = $('#contactName').val(),
					email = $('#contactMail').val(),
					bodytext = $('#contactBody').val();

				var data = { userId: userId, username: username, email: email, bodytext: bodytext };

				LJ.fn.showLoaders();
				$(this).addClass('validating-btn');

				LJ.fn.say('send contact email', data);

			});
			
		},
		handleDomEvents_Settings: function(){

			$('#submitSettingsBtn').click(function(){
				LJ.fn.updateSettings();
			});

		}


});