

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
						
						LJ.$signupWrap.velocity('transition.fadeIn', { duration: 2000, display:'inline-block'});
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
		
				  if( ! LJ.state.animatingContent && !$(menuItem).hasClass('menu-item-active') && !($(menuItem).hasClass('disabled')) ){
				  		LJ.state.animatingContent = true;
						
						var linkedContent = $(menuItem).data('linkedcontent');
						
						var indexActive = $('.menu-item-active').offset().left,
							indexTarget = $(menuItem).offset().left;

						if( indexActive > indexTarget ){
							var myWayOut = "transition.slideRightOut",
								myWayIn = "transition.slideLeftIn";
						}else{
							var myWayOut = "transition.slideLeftOut",
								myWayIn = "transition.slideRightIn";
						}

						$('.menu-item-active').removeClass('menu-item-active')
											  .find('span')
											  .velocity({ opacity: [0, 1], translateY: [-2, 0]   },
											   { duration: 300,
											   complete: function(){
											   	$(menuItem).addClass('menu-item-active')
														   .find('span')
													   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
											   	} 
											});

						LJ.fn.displayContent( $(linkedContent), {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							duration: 200
						});
					
				  }
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

			LJ.$body.on('click','.themeBtnToggleHost', function(){

				$('#management').click();

			});

			LJ.$body.on('click', '.chatIconWrap', function(){

				LJ.fn.toggleChatWrapEvents( $(this) );

			});

			LJ.$body.on('click', '.friendAddIconWrap', function(){
				
				$('.eventItemWrap.surfacing').find('.chatWrap').velocity('transition.slideDownOut', { duration: 300 });
				$('.chatIconWrap.active').removeClass('active');

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active');
					$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
					return;
				}

				$('.friendAddIconWrap').removeClass('active');
				$(this).addClass('active');

				$('#friendListWrap').insertAfter( $(this).parents('.eventItemWrap').find('.chatWrap') )
									.velocity('transition.slideUpIn',
									{
										duration: 400
									});

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

				if( $itemWrap.attr('data-eventstate') == 'open' )
				{
					LJ.fn.showLoaders();
					$self.addClass('asking');

					if( $self.hasClass('idle') )
					{	
						LJ.fn.requestIn( $self ); 
					}
					else
					{	// To be removed in production for freemium considerations?
						LJ.fn.requestOut( $self );
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
             		$filtersWrap.velocity('transition.slideDownIn', { duration: 400 });
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

		},
		handleDomEvents_Create: function(){

			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});

		},
		handleDomEvents_Search: function(){

			$('#searchBar input').on('keydown', function(){
					
				sleep(100, function(){

					$('.u-item').removeClass('match').css({ opacity: '0' });

					var word = $('#searchUsersWrap').find('input').val().toLowerCase();	

					$('.u-item[data-username^="'+word+'"], .u-item[data-userdrink^="'+word+'"], .u-item[data-userage^="'+word+'"]')
						.addClass('match').css({ opacity: '1' })
						.each( function(i, el){
							nextEl = $('.u-item').first();
							while( nextEl.hasClass('match') )
							{
								nextEl = nextEl.next();	
							}
							$(el).insertBefore(nextEl);
						});

					/* Cascading opacity */
					$( $('.u-item:not(.match)')[0] ).css({ opacity: '.5 '});
					$( $('.u-item:not(.match)')[1] ).css({ opacity: '.4 '});
					$( $('.u-item:not(.match)')[2] ).css({ opacity: '.3 '});
					$( $('.u-item:not(.match)')[3] ).css({ opacity: '.15 '});

				});
			});


		$('#searchUsersWrap').on('click', 'button', function(){

			var $button = $(this);

			if( $button.parents('.u-item').hasClass('sent') ) return;

			$button.parents('.u-item').addClass('sent');

			var userId = LJ.user._id,
				friendId = $button.parents('.u-item').data('userid');

			LJ.fn.showLoaders();
			LJ.params.socket.emit('friend request in', { userId: userId, friendId: friendId });
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

			});

			LJ.$body.on('click', '.imgWrapThumbAsker', function(){

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