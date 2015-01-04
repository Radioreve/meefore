

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_FrontPage();
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

			LJ.$body.on('click','.chatInputWrap input[type="submit"]', function(e){

            	e.preventDefault();
            	e.stopPropagation();
            	LJ.fn.sendChat( $(this) );

            });
			
            LJ.$body.on('click','.overlay-high', function(){

            	LJ.fn.toggleOverlay('high');

            });

            LJ.$body.on('click','.overlay-low', function(){

            	LJ.fn.toastMsg('Relax, things start back at 12:00', 'info');

            });

            LJ.$body.on('click', 'img.zoomable', function(){

			 	/* Extracting the img id from the dom */
			 	var imgId      = $( this ).data('imgid'),
			 		imgVersion = $( this ).data('imgversion')|| ''; 

                LJ.fn.toggleOverlay( 'high', LJ.fn.renderOverlayUser( imgId, imgVersion ), 300);

            });

		},
		handleDomEvents_Landing: function(){

			$('#landingWrap button').click(function(){

				$('#landingWrap').velocity('transition.fadeOut', {
					duration: 400,
					complete: function(){
						
						LJ.$signupWrap.velocity('transition.slideUpIn', { duration: 1400 });
					}

				});

			});

		},
		handleDomEvents_FrontPage: function(){

			LJ.$signupBtn.click(function(e){ 

				e.preventDefault(); 
				LJ.fn.signupUser(); 

			});

			LJ.$loginBtn.click(function(e){	

				e.preventDefault();
				LJ.fn.loginUser();	

			});

			LJ.$resetBtn.click(function(e){

				e.preventDefault();
				LJ.fn.resetPassword();

			});

			$('#login-fb').click(function(e){

				e.preventDefault();
				console.log('Login in with Facebook');

				FB.login( function(res){

					console.log('Client status is now : ' + res.status ) ;

					if( res.status != 'connected' ) return;

						FB.api('/me', function(res){

					  		var facebookId = res.id;
					  		LJ.fn.loginWithFacebook( facebookId );

				  		});
				}, { scope: ['public_profile', 'email']});

			});

		},
		handleDomEvents_Navbar: function(){

			LJ.$logout.click(function(){
				location.reload();

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
						}else{
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
							duration: 320
						});
					
				  
				});
			});

		},
		handleDomEvents_Profile: function(){

			LJ.$validateBtn.click( LJ.fn.updateProfile );

			$('#profileWrap .drink').click( function(){

				$('#profileWrap .drink.modified').removeClass('modified');
				if( $(this).hasClass('selected') ) return; 
				$(this).addClass('modified');
			
			});

			$('#profileWrap .mood').click( function(){

				$('#profileWrap .mood.modified').removeClass('modified');
				if( $(this).hasClass('selected') ) return; 
				$(this).addClass('modified');
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
				LJ.fn.requestIn( eventId, hostId, friend, LJ.user._id );

			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){

				$('#management').click();

			});

			LJ.$body.on('click', '.chatIconWrap', function(){

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

				if( $(this).hasClass('active') )
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeIn');
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
						LJ.fn.requestIn( eventId, hostId, LJ.user, LJ.user._id ); 
					}
					else
					{	// To be removed in production for freemium considerations?
						LJ.fn.requestOut( eventId, hostId, LJ.user, LJ.user._id );
					}
				}
				else
				{
					LJ.fn.toastMsg('Event is currently suspended', 'info');
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
					$('.u-item').removeClass('match').css({ opacity: '0' }).addClass('nonei');

					var word = $('#searchUsersWrap').find('input').val().toLowerCase();	

					$('.u-item:not(.filtered)[data-username^="'+word+'"], \
					   .u-item:not(.filtered)[data-userdrink^="'+word+'"], \
					   .u-item:not(.filtered)[data-userage^="'+word+'"]')
						.addClass('match').css({ opacity: '1' }).removeClass('nonei')
						.each( function(i, el){
							nextEl = $('.u-item:not(.filtered)').first();
							while( nextEl.hasClass('match') )
							{
								nextEl = nextEl.next();	
							}
							$(el).insertBefore( nextEl );
						});

					/* Display button state for all .match elements */
					LJ.fn.displayAddUserAsFriendButton();

					/* Cascading opacity */
					$( $('.u-item:not(.match):not(.filtered)')[0] ).removeClass('nonei').css({ opacity: '.5 '});
					$( $('.u-item:not(.match):not(.filtered)')[1] ).removeClass('nonei').css({ opacity: '.4 '});
					$( $('.u-item:not(.match):not(.filtered)')[2] ).removeClass('nonei').css({ opacity: '.3 '});
					$( $('.u-item:not(.match):not(.filtered)')[3] ).removeClass('nonei').css({ opacity: '.15 '});

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
			}
			LJ.fn.showLoaders();
			LJ.params.socket.emit('friend request in', { userId: userId, friendId: friendId, hostIds: hostIds });
			csl( 'Friending request for : '+friendId );

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
					askerId = $nextItem.data('askerid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('askerid');
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
				var askerId      = $(this).data('askerid'),
					$currentItem = $('.a-item.active'), 
					$nextItem    = $('.a-item[data-askerid="'+askerId+'"]');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('askerid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('askerid');
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

       		  LJ.$askersListWrap.on('click','.btn-chat',function(){

            	var $that = $(this);

            	
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

				LJ.params.socket.emit('send contact email', data);

			});
			
		},
		handleDomEvents_Settings: function(){

			$('#submitSettingsBtn').click(function(){
				LJ.fn.updateSettings();
			});

		}


});