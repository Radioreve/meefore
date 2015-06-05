
function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	console.log(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {}, 

{

		init: function(){

				/*Bind UI action with the proper handler */
				this.handleDomEvents();

				/* Gif loader and placeholder */
				this.initStaticImages();

				/* Global UI Settings ehanced UX*/
				this.initEhancements();

				/* Init Pusher Connexion via public chan */
				this.initPusherConnection();

		},
		initPusherConnection: function(){

			LJ.pusher = new Pusher('9d9e7859b349d1abe8b2');

			LJ.pusher.connection.bind('state_change', function( states ) {
				csl('Pusher state is noww : ' + states.current );

				if( (states.current == 'connecting') && LJ.state.connected  )
				{
					LJ.fn.toastMsg("La connexion a été interrompue", 'success', true);
				}
				if( states.current == 'disconnected' )
				{
					LJ.fn.toastMsg("Vous avez été déconnecté.", 'error', true);
				}
				if( states.current == 'unavailable' )
				{
					LJ.fn.toastMsg("Le service n'est pas disponible actuellement, essayez de relancer l'application ", 'error', true);
				}
				if( states.current == 'connected' && LJ.state.connected )
				{
					LJ.fn.say('fetch-user-and-configuration', { id: LJ.user._id }, { success: LJ.fn.handleFetchUserAndConfigurationSuccess });

				}
			});

			LJ.pusher.connection.bind('connected', function() {
				csl('Pusher connexion is initialized');
			});

			LJ.pusher.connection.bind('disconnected', function(){
				alert('hey');
			});


		},
		initFacebookState: function(){   /* Legacy Function */

			FB.getLoginStatus( function( res ){

			  	var status = res.status;
			  	console.log('Facebook status : ' + status);

			  	console.log('status : '+status);
			  	if( status != 'connected' )
			  		 return;

			  	sleep(1500, function(){

				  	FB.api('/me', function(res){

				  		var facebookId = res.id;
				  		//LJ.fn.loginWithFacebook( facebookId );
				  		
				  	});
			  	});
		  	
			});

		},
		initStaticImages: function(){

			var $loader = $.cloudinary.image( LJ.cloudinary.loader_id, LJ.cloudinary.displayParamsLoader );
				$loader.appendTo( $('.loaderWrap') );

				LJ.cloudinary.displayParamsLoader.width = 20; /* For mobile use */
			var $mloader = $.cloudinary.image( LJ.cloudinary.m_loader_id, LJ.cloudinary.displayParamsLoader );
				$mloader.appendTo( $('.m-loaderWrap'));

			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsPlaceholder );
				$('#pictureWrap').prepend( $placeholder );

			LJ.$cLoaderTpl = $.cloudinary.image( LJ.cloudinary.c_loader_id, { cloud_name:"radioreve", width:12 });

		},
		initEhancements: function(){

			(function bindEnterKey(){ //Petite IIEF pour le phun

				$('.profileInput, #description').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn:not(.static)',function(){
					$(this).addClass('validating-btn');
				});

				LJ.$body.on('click', '.noFriendsYet', function(){
					$('#search').click();
				});
 
				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length===0){
						$(this).removeClass('text-active').val('');}
					else{$(this).addClass('text-active');}
				}); 

				LJ.$body.on('mousedown','.chatWrap',function(){
					var $that = $(this);
	                $that.find('input[type="text"]').focus();
               		
            	});

            	LJ.$body.on('keypress','.chatInputWrap input[type="text"]', function(e){
            		if(e.which=='13'){
            			$(this).siblings('input[type="submit"]').click();
            		}
            	});

            	$('body').on('click', '.filtersWrap .tag, .filtersWrap .loc, #createEventInputsWrap .tag', function(){ 
            		$(this).toggleClass('selected');
            	});

            	$('#createEventWrap .tag').click( function(){

            			$(this).toggleClass('selected');
            		 	if( $('#createEventWrap .selected').length > 3 ){
            				$(this).toggleClass('selected');
            				return LJ.fn.toastMsg("3 tags maximum", 'error' );
            		}       		
            	});

            	$('.inspire').click( function(){

            		var list = LJ.settings.profileDescList;
            		$(this).siblings('textarea').val( LJ.settings.profileDescList[ LJ.fn.randomInt( 0, list.length - 1) ])

            	});


			})();
				
		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				age   		  = $('#age').val(),
				name  		  = $('#name').val(),
				description   = $('#description').val(),
				favoriteDrink = $('.drink.modified').data('drink') || $('.drink.selected').data('drink'),
				mood          = $('.mood.modified').data('mood')   || $('.mood.selected').data('mood');

			if( LJ.user.status == 'new' ){ LJ.user.status = 'idle'; }

			var profile = {

				userId		  : _id,
				age 		  : age,
				name 		  : name,
				description   : description,
				favoriteDrink : favoriteDrink,
				mood          : mood,
				status        : LJ.user.status

			};
				csl('Emitting update profile');
				LJ.fn.showLoaders();

			var eventName = 'update-profile',
				data = profile
				, cb = {
					success: function( data ){

						csl('update profile success received, user is : ' + data.user );
						var user = data.user;

						sleep( LJ.ui.artificialDelay, function(){

							LJ.fn.updateClientSettings( user );
							$('#thumbName').text( user.name );
							LJ.fn.handleServerSuccess('Vos informations ont été modifiées');
					
						});

					},
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );

		},
		updateSettings: function(){

			var currentEmail    = $('#currentEmail').val(),
				newPw 	   		= $('#newPw').val(),
				newPwConf  		= $('#newPwConf').val(),
				newsletter 		= $('#newsletter').is(':checked'),
				userId     		= LJ.user._id;

			var o = { currentEmail: currentEmail, newPw: newPw, newPwConf: newPwConf, newsletter: newsletter, userId: userId }; 

			LJ.fn.showLoaders();

			var eventName = 'update-settings',
				data = o
				, cb = {
					success: function( data ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.toastMsg( data.msg, 'info');
							$('.validating-btn').removeClass('validating-btn');
							LJ.fn.hideLoaders();
						});
					},
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

			LJ.fn.say( eventName, o, cb );

		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		loginWithFacebook: function( facebookProfile ){

				$.ajax({

					method:'POST',
					data: { facebookProfile: facebookProfile },
					dataType:'json',
					url:'/auth/facebook',
					success: function( data ){
						LJ.fn.handleSuccessLogin( data );
					},
					error: function( err ){

					}
				});

		},
		handleSuccessLogin: function( data ){

			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 
			//document.cookie = 'token='+data.accessToken;

			LJ.fn.say('fetch-user-and-configuration', {}, { success: LJ.fn.handleFetchUserAndConfigurationSuccess });

		},
		displayViewAsFrozen: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];

			$('.eventsHeader, #noEvents').velocity('transition.slideUpOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('#frozenTimezone').velocity('transition.slideLeftIn', { duration: 700 });
				}
			});

		},
		displayViewAsNormal: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];
			
			$('#frozenTimezone').velocity('transition.slideRightOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('.eventsHeader, #no').velocity('transition.slideUpIn', { duration: 700 });
					LJ.fn.displayEvents();
				}
			});

		},
		displayViewAsNew: function(){
			
			$('#management').addClass('filtered');
			$('#profile').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('nonei');}});
			LJ.fn.displayContent( LJ.$profileWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut', prev:'revealed' });

		},
		displayViewAsIdle: function(){

			$('#management').addClass('filtered');
            $('#events').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('nonei');}});
            LJ.fn.displayContent( LJ.$eventsWrap, { mode:'curtain', myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut', prev:'revealed'   });

		},
		displayViewAsHost: function(){

			$('#create').addClass('filtered');
			$('#management').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('nonei');}});
			LJ.fn.displayContent( LJ.$manageEventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut', prev:'revealed'  });

            LJ.fn.fetchAskers();
		},
		randomInt: function(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		},
		displayUserSettings: function(){

				/* Profile View*/
				$('#codebar').text( LJ.user._id );
				$('#name').val( LJ.user.name );
				$('#age').val( LJ.user.age );
				$('#description').val( LJ.user.description );
				$('.drink[data-drink="'+LJ.user.favoriteDrink+'"]').addClass('selected');
				$('.mood[data-mood="'+LJ.user.mood+'"]').addClass('selected');

				/* Update de l'image de profile */
				LJ.fn.replaceMainImage( 	LJ.user.imgId,
								            LJ.user.imgVersion,
								            LJ.cloudinary.displayParamsProfile );

				/* Settings View */
				$('#newsletter').prop( 'checked', LJ.user.newsletter );
				$('#currentEmail').val( LJ.user.email );

				/* Management View */
				if( LJ.user.state == 'hosting' )
				{
					$('#suspendEvent').text('this is a bug');
				}

				/* ThumbHeader View */
				LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );
				var d = LJ.cloudinary.displayParamsHeaderUser;
					d.version = LJ.user.imgVersion;

				var imgTag = $.cloudinary.image( LJ.user.imgId, d );
					imgTag.addClass('left');

				LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

		}, 
		displayContent: function( content, options ){
			
				options = options || {};

			if( !options.mode ){
				
				var prev = options.prev;			
				var $prev = $('.'+options.prev);

				$prev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 0 || 400,
					complete: function(){
						$prev.removeClass( prev );
						content.addClass( prev )
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 0 || 800,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			//LJ.fn.toggleOverlay('high', LJ.tpl.charte );
							   		}
							   	}
							   });
					}
				});
			}

			if( options.mode == 'curtain' ) {

				var prev = options.prev;			
				var $prev = $('.'+options.prev);

				$('.curtain').velocity('transition.fadeIn',
					{ duration: 800,
					complete: function(){
						$prev.removeClass( prev );
						content.addClass( prev )
							   .show()
							   .css({'display':'block'}); }
					}).delay(500).velocity('transition.fadeOut', {
							display:'none',
							duration: 1200
						});
			}

		},
		toggleChatWrapAskers: function( aBtn ){

			var $aWrap      = aBtn.parents('.a-item'),
			    $chatWrap  = $aWrap.find('.chatWrap'),
        	    $previous  = $('.a-active'),
        		$surfacing = $('.surfacing');

        	var chatId = $chatWrap.data('id');

        	 if( !$surfacing )
			     {
			     	$aWrap.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideLeftIn', { duration: 400,
			     			  complete: function(){
				     			  	console.log('Oops');
				     			  	LJ.state.jspAPI[ chatId ].reinitialise();
									LJ.state.jspAPI[ chatId ].scrollToBottom(); 
			     			  		} 
			     			  });
			     	return;
			     }

		     if( $surfacing.is( $aWrap ))
		     {
		     	$aWrap.removeClass('surfacing')
		     			  .find('.chatWrap')
		     			  .velocity('transition.slideLeftOut', { duration: 300 });
		     	return;
		     }

    		$surfacing.removeClass('surfacing')
    				  .find('.chatWrap')
    				  .velocity('transition.slideLeftOut', { duration: 300 });

    		$aWrap.addClass('surfacing')
    				  .find('.chatWrap')
    				  .velocity('transition.slideLeftIn', { duration: 400,
    				   complete: function(){
				     			  	if( LJ.state.jspAPI[ chatId ] != undefined ) return;
				     			  	var $chatLineWrap = $aWrap.find('.chatLineWrap');
				     			  	$chatLineWrap.jScrollPane();
    								LJ.state.jspAPI[ chatId ] =  $chatLineWrap.data('jsp');
				     			  	LJ.state.jspAPI[ chatId ].reinitialise();
									LJ.state.jspAPI[ chatId ].scrollToBottom(); 
			     			  }
			     		});

		},
		toggleChatWrapEvents: function( chatIconWrap ){

			var $eventWrap = chatIconWrap.parents('.eventItemWrap'),
			    $chatWrap  = $eventWrap.find('.chatWrap'),
			    $previous  = $('.prev'),
			    $surfacing = $('.surfacing'); 

			$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
			$('.friendAddIconWrap.active').removeClass('active');

			var chatId = $chatWrap.data('chatid');

			$('.chatWrap[data-chatid="'+chatId+'"]').parents('.eventItemWrap').find('span.bubble').addClass('filtered').text('');

			     if( !$surfacing )
			     {
			     	chatIconWrap.addClass('active');
			     	$eventWrap.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideUpIn', { duration: 550 });
			     	return;
			     }

			     if( $surfacing.is( $eventWrap ))
			     {
			     	chatIconWrap.removeClass('active');
			     	$eventWrap.removeClass('surfacing') 
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideUpOut', { duration: 300 });
			     	return;
			     }

			    $('.chatIconWrap').removeClass('active');
			    chatIconWrap.addClass('active');

        		$surfacing.removeClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideUpOut', { duration: 300 });

        		$eventWrap.addClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideUpIn', { duration: 550 });

        		sleep( 30, function(){ 
        			if( LJ.state.jspAPI[chatId] !== undefined ){ 
	           		  LJ.state.jspAPI[chatId].reinitialise();
	        		  LJ.state.jspAPI[chatId].scrollToBottom();   
        			} 
        		});
             
		},
		initAppSettings: function( data ){

			var user     = data.user,
				settings = data.settings;

			/* Init user settings */
            LJ.user = user;	

            /* Init app settings */
            LJ.settings = settings;

		},
		updateClientSettings: function( newSettings ){

			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		toastMsg: function( msg, status, fixed ){

			var toastStatus, toast, tpl;

			if( status == 'error' ){
				    toastStatus = '.toastError',
					tpl = LJ.tpl.toastError;
			}
			if( status == 'info' ){
				    toastStatus = '.toastInfo',
					tpl = LJ.tpl.toastInfo;
			}
			if( status == 'success'){
				    toastStatus = '.toastSuccess',
					tpl = LJ.tpl.toastSuccess;
			}

			if( $( '.toast' ).length === 0 )
			{
				$( tpl ).prependTo('#mainWrap');

				    toast = $( toastStatus );
					toastMsg = toast.find('.toastMsg');
					toastMsg.text( msg );

					toast.velocity('transition.slideDownIn', {
						duration: 600,
						complete: function(){
						  if( !fixed ){
							toast.velocity('transition.slideUpOut', {
								duration:300,
								delay:2000,
								complete: function(){
									toast.remove();
									if( LJ.msgQueue.length != 0 )
										LJ.fn.toastMsg( LJ.msgQueue[0].msg, LJ.msgQueue[0].type );
									    LJ.msgQueue.splice( 0, 1 ) //remove le premier élément
								}
								});
							}
						  }
					});
			}

			else
			{
				LJ.msgQueue.push({ msg: msg, type: status });
				/*
				toast = $( '.toast' );
				toast.finish().velocity('transition.slideUpOut',{
					duration: 200,
					complete: function(){
						toast.remove();
						LJ.fn.toastMsg( msg, status );
					}
				});
	*/
			}
		},
		replaceMainImage: function( imgId, imgVersion, d ){

		    	d.version = imgVersion;

			var $previousImg = $('#pictureWrap').find('img'),
				$newImg      = $.cloudinary.image( imgId, d ); 
				$newImg.addClass('mainPicture').addClass('none');
				$('#pictureWrap').prepend( $newImg );
 													
				$previousImg.velocity('transition.fadeOut', { 
					duration: 600,
					complete: function(){
						$newImg.velocity('transition.fadeIn', { duration: 700, complete: function(){} });
						$previousImg.remove();
					} 
				});

		},
		replaceThumbImage: function( id, version, d ){

			    d = d || LJ.cloudinary.displayParamsHeaderUser;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.addClass('none');

				$('#thumbWrap .imgWrap').prepend( newImg );

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function( upload_tag ){

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			$('.upload_form').html('').append( upload_tag );

			$('.cloudinary-fileupload')

				.bind('fileuploadstart', function(){

					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

					LJ.user.imgId = data.result.public_id;
					LJ.user.imgVersion = data.result.version;

	                    var eventName = 'update-picture',
	                    	data = {
	                    				_id        : LJ.user._id,
										imgId      : LJ.user.imgId,
										imgVersion : LJ.user.imgVersion 
									}
							, cb = {
								success: function( data ){
									sleep( LJ.ui.artificialDelay, function(){
										$('.progress_bar').velocity('transition.slideUpOut', {
										 	duration: 400,
										 	complete: function(){
										 		$(this).css({ width: '0%' })
										 			   .velocity('transition.slideUpIn');
											} 
										});

										LJ.fn.hideLoaders();
										LJ.fn.toastMsg('Votre photo de profile a été modifiée', 'info');

										var user = data.user;
										//LJ.fn.updateClientSettings( user );
										console.log('User after img upload:' + user );

		  								LJ.fn.replaceMainImage( LJ.user.imgId, LJ.user.imgVersion, LJ.cloudinary.displayParamsProfile );
		  								LJ.fn.replaceThumbImage( LJ.user.imgId, LJ.user.imgVersion, LJ.cloudinary.displayParamsHeaderUser );
		  							});
								},
								error: function( xhr ){
									console.log('Error saving image identifiers to the base');
								}
							};

							LJ.fn.say( eventName, data, cb );

  				}).cloudinary_fileupload();
  				
		},
		refreshOnlineUsers: function(){

			var i=0;
			for( ; i<LJ.myOnlineUsers.length; i++ )
			{
				LJ.fn.displayAsOnline( { userId: LJ.myOnlineUsers[i] } );
			}

		},
		refreshArrowDisplay: function(){

			var $arrLeft  = $('#manageEventsWrap i.next-left'),
				$arrRight = $('#manageEventsWrap i.next-right');

			$arrLeft.removeClass('none');
			$arrRight.removeClass('none');

			if( ($('.a-item').length === 0) ||  ($('.a-item').length == 1) ){
				$arrLeft.addClass('none');
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').last() ) ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').next().hasClass('placeholder') ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').first() ) ){
				$arrLeft.addClass('none');
				return;
			}

		},
		displayAskerItem: function( current, next, askerId ){

			var currentIndex = current.index(),
				nextIndex    = next.index();

			var $askerThumb = $('#askersThumbs').find('.imgWrapThumb[data-userid="'+askerId+'"]');
				$('.imgWrapThumb.active').removeClass('active');
				$askerThumb.addClass('active');

				LJ.state.animatingContent = false;

			if( currentIndex < nextIndex )
			{
				current.velocity('transition.slideLeftOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideRightIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}
			if( currentIndex > nextIndex )
			{
				current.velocity('transition.slideRightOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideLeftIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}		
				
		},
        initLayout: function( settings ){

        	/* Mise à jour dynamique des filters */
        	$( '.tags-wrap' ).html('').append( LJ.fn.renderTagsFilters() );
        	$( '.locs-wrap' ).html('').append( LJ.fn.renderLocsFilters() );
        	$( '.input-profile-rows').html('').append( LJ.fn.renderProfileRows( _.sortBy( settings.profileRowsList, 'place' )) );
        	$( '#no' ).html('').append( LJ.tpl.noResults );

        	$('#friendListWrap').jScrollPane();
        	LJ.state.jspAPI['#friendListWrap'] = $('#friendListWrap').data('jsp');




			/* Affichage de la vue en fonction du state user */
        	sleep( LJ.ui.artificialDelay, function(){   

				if( LJ.state.connected ) return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
				
				LJ.state.connected = true;

	        	$('#facebook_connect').velocity('transition.fadeOut');
				$('#thumbWrap').velocity('transition.slideUpIn',{duration:1000});
				$('.menu-item-active').removeClass('menu-item-active');
				 
				switch( LJ.user.status )
				{
					case 'new':
						LJ.fn.displayViewAsNew();
						LJ.fn.toastMsg('Bienvenue sur le meilleur site de soirée du monde','info');
						break;
					case 'idle':
						LJ.fn.displayViewAsIdle();
						//LJ.fn.toastMsg('Bienvenue '+LJ.user.name,'info');
						break;
					case 'hosting':
						LJ.fn.displayViewAsHost();
						LJ.fn.toastMsg('Bienvenue '+LJ.user.name,'info');
						break;
					default:
						alert('No status available, contact us');
						break;
				}

				sleep( 2400, function() {
					
					$('.menu-item').velocity({ opacity: [1, 0] }, {
						display:'inline-block',
						duration: 800,
						complete: function(){
							$('.menu-item').each( function( i, el ){
								$(el).append('<span class="bubble filtered"></span>')
							});	
						}
					});
				});

			});

        },
        handleServerSuccess: function( msg, ms ){

        	var ms = ms || 500;
        	setTimeout( function(){ 

	        	LJ.fn.toastMsg( msg, 'info');
	        				if( $('.mood.modified').length != 0 ) $('.mood.selected').removeClass('selected');
	        				if( $('.drink.modified').length != 0 ) $('.drink.selected').removeClass('selected');
	        				$('.modified').removeClass('modified').addClass('selected');
	        				$('.validating').removeClass('validating');
							$('.validating-btn').removeClass('validating-btn');
							$('.asking').removeClass('asking');
							$('.pending').removeClass('pending');
							LJ.fn.hideLoaders();
        	}, ms );

        },
        handleServerError: function( msg, ms ){

        	if( typeof(msg) != 'string' )
        		msg = JSON.parse( msg.responseText ).msg;

        	if( typeof(msg) != 'string' )
        		return LJ.fn.toastMsg('Erreur interne');

        	var ms = ms || 500;
        	setTimeout( function(){ 
        	
        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.validating-btn').removeClass('validating-btn');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();

			}, ms );

        },
        handleNewUserSignedUp: function( data ){

        	var user = data.user;

        	LJ.fn.toastMsg('Un utilisateur vient de s\'inscrire', 'info');
			LJ.fn.fetchUsers();

        },
		initSocketEventListeners: function(){
			
				//LJ.fn.on('fetch user success', function( data ){ console.log(data); });


				LJ.fn.on('send contact email success', function(){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( "Merci beaucoup!", 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.fn.on('server error', function( data ){

					var msg   = data.msg,
						flash = data.flash;

					csl('Receiving error from the server');

					if( flash ){
						return LJ.fn.handleServerError( msg );
					}
					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.handleServerError( msg );
					});
				});

                
		},
		handleResetEvents: function(){

					LJ.fn.toastMsg('Les évènements sont maintenant terminés!', 'info');
					LJ.fn.displayEvents();
					if( LJ.user.status == 'hosting') LJ.fn.handleCancelEvent( { hostId: LJ.user._id });
		},
		handleRestartEvents: function(){
					
					LJ.fn.toastMsg('Les évènements sont à présent ouverts!', 'info');
					LJ.fn.displayEvents();
		},
		handleCancelEvent: function( data ){
			
			if( data.hostId == LJ.user._id )
			{
        		$('.pending').removeClass('pending');
        		LJ.user.status = 'idle';
        		LJ.myAskers = [];
        		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
        		LJ.fn.displayMenuStatus( function(){ $('#create').click(); } );
				
			}	  		
		                	 
        	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
        		canceledEvent.velocity("transition.slideRightOut", {
        			complete: function(){
        				canceledEvent.remove();
        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
        			}
        		});

        	_.remove( LJ.myEvents, function(el){
        		return el.hostId == data.hostId; 
        	});


		},
		handleRequestParticipationInSuccess: function( data ){

			console.log('Handling request participation in success');

			var hostId  	= data.hostId,
				userId 		= data.userId,
				eventId 	= data.eventId,
				requesterId = data.requesterId,
				asker   	= data.asker,
				alreadyIn   = data.alreadyIn || false;	

					/* L'ordre de l'appel est important, car certaines 
					/* informations sont cachées par les premières 
					/* et utilisées par celles d'après 
					*/
			sleep( LJ.ui.artificialDelay, function(){
				
				if( alreadyIn )
				{
					LJ.fn.toastMsg('Votre ami s\'est ajouté à l\évènement entre temps', 'info');
					LJ.fn.hideLoaders();
					var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					return;
				}

					
					/* Demande pour soi-même */
					if( LJ.user._id == requesterId && LJ.user._id == userId )
					{
						LJ.fn.hideLoaders();
						LJ.user.eventsAskedList.push( eventId );
						LJ.fn.toastMsg('Votre demande a été envoyée', 'info');
						 $('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande de la part de quelqu'un d'autre */
					if( LJ.user._id != requesterId && LJ.user._id == userId )
					{	
						LJ.fn.bubbleUp( '#events' )
						LJ.fn.toastMsg('Un ami vous a ajouté à une soirée', 'info');
						$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askIn')
						          .removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande pour quelqu'un d'autre */
					if( LJ.user._id == requesterId && LJ.user._id != userId )
					{

						LJ.fn.toastMsg('Votre ami a été ajouté', 'info');
						LJ.fn.hideLoaders();
						var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					}

				/* Pour l'host */
				if( LJ.user._id == hostId )
				{

					LJ.fn.bubbleUp( '#management' )
					LJ.myAskers.push( asker );

					var askerMainHTML  = LJ.fn.renderAskerMain( asker ),
						askerThumbHTML = LJ.fn.renderUserThumb ({ user: asker });

					    $( askerMainHTML ).appendTo( $('#askersMain') ).hide();
					    $( askerThumbHTML ).appendTo( $('#askersThumbs') );

						if( $('.a-item').length == 1 )
						{
							$('#manageEventsWrap .a-item, #manageEventsWrap .imgWrapThumb')
							.addClass('active')
							.velocity('transition.fadeIn',{
							 duration: 300,
							 display:'inline-block'
							 });
						}

						LJ.fn.refetchAskers();
					    LJ.fn.refreshArrowDisplay();
					    LJ.fn.displayAsOnline( requesterId );
				}	

			});

		},
		handleRequestParticipationOutSuccess: function( data ){

			console.log( data.asker.name +' asked out' );

				var userId  	= data.userId,
					hostId  	= data.hostId,
					eventId 	= data.eventId,
					asker   	= data.asker,
					requesterId = data.requesterId;

				var $aItemMain = LJ.$askersListWrap.find('.a-item[data-userid="'+userId+'"]'),
				    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+hostId+'"]');

				_.remove( LJ.myAskers, function( asker ){
					return asker._id === data.userId;
				});

				_.remove( LJ.user.eventsAskedList, function( el ){
					return el == eventId;
				});

				sleep( LJ.ui.artificialDelay, function(){

					LJ.fn.hideLoaders();

					/* Pour l'Host */
					if( hostId === LJ.user._id)
					{		
							$('.imgWrapThumb[data-userid="' + asker._id + '"]').remove();
							LJ.state.jspAPI[ asker._id ] = undefined; // sinon chat fail lorsqu'ask in/out/in...
							$aItemMain.velocity("transition.fadeOut", { 
								duration: 200,
								complete: function(){
									$aItemMain.remove();
									if( !$aItemMain.hasClass('active') ) return LJ.fn.refreshArrowDisplay();
									$('.imgWrapThumb').first().addClass('active');
									$('.a-item').first().addClass('active').velocity('transition.fadeIn', 
										{ 
											duration: 300,
											complete: function(){

												LJ.fn.refreshArrowDisplay();
										}})
								} 
							});
					}
					if( requesterId == userId && LJ.user._id == userId )
					{
						
						LJ.fn.toggleChatWrapEvents( $chatWrapAsUser.find('.chatIconWrap') );
						LJ.fn.toastMsg('Vous avez été désinscris de la liste', 'info');
						$('.asking').removeClass('asked').removeClass('asking').addClass('idle').text('Je veux y aller!')
								.siblings('.chatIconWrap, .friendAddIconWrap').hide();
					}	

					
					/*
					var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
						$nbAskers.text( parseInt( $nbAskers.text() ) - 1 );

					$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																   .find('img[data-userid="'+asker._id+'"]')
																   .remove();  */
				});

		},
		handleFetchUserAndConfigurationSuccess: function( data ){

			/* L'ordre de l'appel est important, car certaines 
			/* informations sont cachées par les premières 
			/* et utilsiées par celles d'après 

					- On cache les informations sur l'user 
					- On fait les mises à jours du DOM (checkbox, thumbPic, input) à partir du cache
					- On envoie une demande des derniers évènements / utilisateurs / amis
					- On envoie une demande pour rejoindre les chatrooms en cours
					- On active le pluggin d'upload de photos
					- On génère le HTML dynamique à partir de données server ( Tags... )
			*/
			console.log('User and configuration successfully fetched');
			LJ.fn.hideLoaders();

			var user 	 = data.user,
				settings = data.settings;
			
			LJ.myOnlineUsers = data.onlineUsers;

			LJ.fn.initAppSettings( data, settings );

			LJ.fn.subscribeToChannels();
			LJ.fn.initChannelListeners();
			
			LJ.fn.initCloudinary( user.cloudTag );
			LJ.fn.initLayout( settings );
			LJ.fn.displayUserSettings();

			LJ.fn.fetchEvents();
			LJ.fn.fetchUsers();
			LJ.fn.fetchFriends();


			/* Admin scripts. Every com is secured serverside */	
			if( LJ.user.access.indexOf('admin') != -1 )
				LJ.fn.initAdminMode();

			if( LJ.user.status == 'new' && LJ.user.fbId ){
				LJ.fn.updatePictureWithFacebook( LJ.user._id, LJ.user.fbId );
				LJ.fn.showLoaders();
			}
			

		},
		updatePictureWithFacebook: function( userId, fbId ){

			var eventName = 'update-picture-fb',
				data = {
					userId: userId,
					fbId: fbId
				},
				cb = {
					success: function( data ){

						LJ.fn.hideLoaders();
						LJ.fn.toastMsg('Synchronisation avec Facebook terminée!', 'info');

						LJ.fn.updateClientSettings( data );

						LJ.fn.replaceMainImage( data.imgId, data.imgVersion, LJ.cloudinary.displayParamsProfile );
						LJ.fn.replaceThumbImage( data.imgId, data.imgVersion, LJ.cloudinary.displayParamsHeaderUser );


					},
					error: function( xhr ){

						LJ.fn.handleServerError("La synchronisation avec Facebook a échouée");

					}
				};

			LJ.fn.say( eventName, data, cb );

		},
		handleSuspendEvent: function(data, state){

			var eventId = data.eventId;

			if( data.hostId == LJ.user._id ){

				var $li = $('#suspendEvent');
				$('.pending').removeClass('pending');

					if( data.myEvent.state == 'suspended' ){
						LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
						$li.text('Reprendre');
					}

					if( data.myEvent.state == 'open' ){
						LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
						$li.text('Suspendre');
					}
			}

			var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-eventid="' + eventId + '"]');

			eventWrap.attr('data-eventstate', state )
					 .find('button.askIn');
					

		},
		insertEvent: function( myEvent ){

			csl('Inserting new event');
			myEvent.beginsAt = new Date ( myEvent.beginsAt );

			/* On ajoute l'event au bon endroit pour maintenir l'ordre*/
			var idx = _.sortedIndex( LJ.myEvents, myEvent, 'beginsAt' );
			LJ.myEvents.splice( idx, 0, myEvent );

			var eventHTML = LJ.fn.renderEvent( myEvent );

			/* Prise en compte des effets de bords sinon le jQuery return undefined */
			if( idx == 0 )
			{	
				csl('Inserting first element');
				if( $('.eventItemWrap').length == 0 )
					$( eventHTML ).insertAfter( $('#noEvents') );
				else
					$( eventHTML ).insertBefore( $('.eventItemWrap').first() );
				$('#noEvents').addClass('filtered');
				return;
			}
			// myEvents just got incremented, hence the - 1
			if( idx == LJ.myEvents.length - 1){
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx-1] ) ).addClass('inserted');
			}else{
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx] ) ).addClass('inserted');
			}

		},
		fetchUsers: function(){

			var eventName = 'fetch-users',
				data = { userId: LJ.user._id };

			var cb = {
				success: function( data ){

					var users = data.users;

				//	csl('Users fetched from the server');
                	LJ.myUsers.length === 0 ? LJ.myUsers = _.shuffle( users ) : LJ.myUsers = users ; 
                    $('#searchUsers').html( LJ.fn.renderUsersInSearch() );

                    $( $('#searchUsers .u-item:not(.match)')[0] ).removeClass('none').css({ opacity: '.5 '});
					$( $('#searchUsers .u-item:not(.match)')[1] ).removeClass('none').css({ opacity: '.4 '});
					$( $('#searchUsers .u-item:not(.match)')[2] ).removeClass('none').css({ opacity: '.3 '});
					$( $('#searchUsers .u-item:not(.match)')[3] ).removeClass('none').css({ opacity: '.15 '});

					LJ.fn.refreshOnlineUsers();
					
				},
				error: function( xhr ){
					console.log('API Error');
				}
			};

			LJ.fn.say( eventName, data, cb ); 

		},
		fetchFriends: function(){ 

			var eventName = 'fetch-friends',
				data = { userId: LJ.user._id }

				, cb = {
					success: function( data ){

						//csl('Friends fetched');
	                	LJ.myFriends = data.myFriends ;

	                	$('#myFriends').html( LJ.fn.renderUsersInFriendlist() );
	                	$('.event-friends-wrap').html( LJ.fn.renderUsersInCreateEvent() );

	                	LJ.fn.displayAddFriendToPartyButton();

	                	if( LJ.nextCallback.context == 'fetch friends' )
	                	{	
	                		csl('Calling method, context detected');
	                		LJ.nextCallback.fn();
	                		LJ.nextCallback = {};
	                	}

	                	LJ.fn.refreshOnlineUsers();

					},
					error: function( xhr ){
						console.log('Error fetching friends');
					}
				};

			LJ.fn.say( eventName, data, cb );

		},
		createEvent: function(){

			var tags = [],
				userIds = [];

			$('#createEventWrap .selected').each( function( i, $el ){
				var tag = $( $el) .attr('class').split(' ')[1].split('-')[1];						 
				tags.push( tag );
			});

			$('#createEventWrap .imgWrapThumb.active').each( function( i, el ){
				userIds.push( $(el).data('userid') ); 
			});

			var e = {};
				e.hostId	  	  = LJ.user._id;
				e.hostName   	  = LJ.user.name;
				e.hostImgId 	  = LJ.user.imgId;
				e.hostImgVersion  = LJ.user.imgVersion;
				e.name 		  	  = $('#eventName').val();
				e.location    	  = $('#eventLocation').val();
				e.hour 		  	  = $('#eventHour').val();
				e.min  	  		  = $('#eventMinut').val();
				e.description 	  = $('#eventDescription').val();
				e.maxGuest        = $('#eventMaxGuest').val();
				e.tags            = tags;
				e.userIds		  = userIds;

				LJ.fn.showLoaders();

				var eventName = 'create-event',
					data = e
					data.socketId = LJ.pusher.connection.socket_id
					, cb = {
						success: function( data ){

							var myEvent = data.myEvent;

							var eventId = myEvent._id,
							hostId = myEvent.hostId;
						
							sleep( LJ.ui.artificialDelay , function(){ 

								/* Internal */
								LJ.user.status = 'hosting';
								LJ.user.hostedEventId = eventId;
								LJ.myAskers = data.myEvent.askersList;

								/* Display in Manage */
        						LJ.fn.displayAskers();
        						LJ.fn.addFriendLinks();
								LJ.fn.refreshArrowDisplay();

								/* Smooth transition */
								LJ.fn.displayMenuStatus( function(){ $('#management').click(); } );

								/* CreateEvent UI restore */
								LJ.fn.hideLoaders();
								$('.themeBtn').removeClass('validating-btn');
								LJ.$createEventWrap.find('input, #eventDescription').val('');
								LJ.$createEventWrap.find('.selected').removeClass('selected');

								/* Display in Events */
								LJ.fn.insertEvent( myEvent );
								$('#refreshEventsFilters').click();

							});

						},
						error: function( xhr ){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						}
					};

				LJ.fn.say( eventName, data, cb );
		},
		fetchEvents: function(){

			if( LJ.state.fetchingEvents )
				return LJ.fn.toastMsg('Already fetching events', 'error');
			
			LJ.state.fetchingEvents = true;

			var eventName = 'fetch-events',
				data = { userId: LJ.user._id };

			var cb = {
				success: function( data ){
					//console.log(data);
					var myEvents = data.myEvents;
					LJ.state.fetchingEvents = false;

					var L = myEvents.length;
					csl('Events fetched from the server, number of events : ' + L);

					for( var i=0; i<L; i++ ){

						LJ.myEvents[i] = myEvents[i];
						LJ.myEvents[i].createdAt = new Date( myEvents[i].createdAt );
						LJ.myEvents[i].beginsAt  = new Date( myEvents[i].beginsAt );
					}

					/* L'array d'event est trié à l'initialisation */
					LJ.myEvents.sort( function( e1, e2 ){
						return e1.beginsAt -  e2.beginsAt ;
					});

					LJ.fn.displayEvents();
				},
				error: function( xhr ){
					csl('Error fetching events');
				}
			};
				
            LJ.fn.say( eventName, data, cb );
            
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers )
                return LJ.fn.toastMsg("Already fetching askers", 'error');

        	console.log('Fetching event with id : ' + LJ.user.hostedEventId );

            LJ.state.fetchingAskers = true;

            var eventName = 'fetch-askers',
            	data = { eventId: LJ.user.hostedEventId };

            var cb = {
            	success: function( data ){

                	LJ.state.fetchingAskers = false;
                    LJ.myAskers = data.askersList;
                    LJ.fn.displayAskers();
                    LJ.fn.addFriendLinks();
					$('#askersListWrap div.active').click(); // force update
					LJ.fn.refreshArrowDisplay();   
            	},
            	error: function( xhr ){
            		console.log('Error fetching askers');
            	}
            };

            LJ.fn.say( eventName, data, cb );

        },
        displayEvents: function(){

        	/* Mise à jour de la vue des évènements
        	  au cas où quelqu'un se connecte en période creuse
        	*/
        	//csl('Displaying events');

	        	var hour = ( new Date() ).getHours();
	        	if( hour < LJ.settings.eventsRestartAt && hour >= LJ.settings.eventsTerminateAt ){
        			csl('Displaying events frozen state');
	        		return LJ.fn.displayViewAsFrozen();
	        	}     		

            LJ.$eventsListWrap.html( LJ.fn.renderEvents( LJ.myEvents ) );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').html('').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').html('').append( LJ.fn.renderUsersThumbs() );

            LJ.fn.refreshArrowDisplay();
            LJ.fn.refreshOnlineUsers();

        },
        refetchAskers: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
        	var eventName = 'refetch-askers',
        		data = {  userId: LJ.user._id, idArray: idArray },
        		cb = {
        			success: function( data ){

        				csl('Refetch askers success');
						LJ.myAskers = data;
						LJ.fn.addFriendLinks();
						$('#askersListWrap div.active').click(); // force update
						LJ.fn.refreshArrowDisplay();

        			},
        			error: function( xhr ){

        				console.log('Error fetching askers');
        			}
        		};

        	LJ.fn.say( eventName, data, cb );

        },
        addFriendLinks: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
	
        	for( var i = 0; i < LJ.myAskers.length ; i ++ )
        	{	
        		$('#askersThumbs .team-'+i).removeClass('team-'+i);
        		$('#askersThumbs .head-'+i).removeClass('head-'+i);
        		
        		$('#askersThumbs div[data-userid="'+ LJ.myAskers[i]._id +'"]').addClass('team-'+i).addClass('head-'+i);
        		
        		for( var k = 0 ; k < LJ.myAskers[i].friendList.length ; k++ )
        		{	
        			if( idArray.indexOf( LJ.myAskers[i].friendList[k].friendId ) == -1 )
        			{
        				//nada
        			}
        			else
        			{	
        				if( LJ.myAskers[i].friendList[k].status == 'mutual' )
        				{	
        					$('#askersThumbs div[data-userid="'+ LJ.myAskers[i].friendList[k].friendId+'"]').addClass('team-'+i);		  
        				}
        			}
        		} 
        	}

        },
        displayAsOnline: function( data ){

        	var userId = data.userId;
			$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.addClass('active');

        },
        displayAsOffline: function( data ){

        	var userId = data.userId;
					$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.removeClass('active');

        },
        filterEvents: function(tags, locations){

        	if( $('.eventItemWrap').length == 0 ) return LJ.fn.toastMsg('Aucun évènement à filtrer', 'error');

        	LJ.$eventsListWrap.find('.selected').removeClass('selected');

        	    isFilteredByLoc = ( locations.length != 0 ),
        		isFilteredByTag = ( tags.length      != 0 );

	        	var eventsToDisplay = [];
	        	var matchLocation = false;
	        	var matchTags = false;

	        	$('.eventItemWrap').each( function( i, itemWrap ) {

	        		matchLocation = matchTags = false;

	        		if( locations.indexOf( $(itemWrap).data('location') ) != -1 ){
	        			matchLocation = true;
	        		}

	        		$( itemWrap ).find('.tag')
	        					 .each( function( i, tag ){
	        					 	var l = $( tag ).prop('class').split(' ')[1];
	        					 	if( tags.indexOf( l ) != -1 ){
	        					 		$( tag ).addClass('selected');
	        					 		matchTags = true;
	        					 	}
	        					 });

			        function addItem(){ eventsToDisplay.push( $(itemWrap) ); } /*For readability */	

			    	if ( !isFilteredByTag && !isFilteredByLoc 								 ){ addItem(); }
			    	if (  isFilteredByTag &&  isFilteredByLoc && matchTags && matchLocation  ){ addItem(); }
			    	if (  isFilteredByTag && !isFilteredByLoc && matchTags 					 ){ addItem(); }
			    	if ( !isFilteredByTag &&  isFilteredByLoc && matchLocation 				 ){ addItem(); }

	      		});

	        	//console.log('Events to display : ' + eventsToDisplay );

        		/* Transforme un Array de jQuery objects, en un jQuery-Array */
        		LJ.$eventsToDisplay = $(eventsToDisplay).map( function(){ return this.toArray(); });
	        	
       		$('.eventItemWrap, #noResults ').addClass('filtered');
       		LJ.$eventsToDisplay.removeClass('filtered');

       		if( LJ.$eventsToDisplay.length == 0){
       			LJ.fn.toastMsg( 'Aucun évènement trouvés', 'info');
       			$('#noEvents').addClass('filtered');
       			$('#noResults').removeClass('filtered')
       						  .velocity('transition.slideLeftIn', { duration: 700 });

       		}else{
       			//LJ.fn.toastMsg( LJ.$eventsToDisplay.length + ' soirées pour ces filtres!', 'info');
       		}

        },
        requestIn: function( eventId, hostId, userId, requesterId ){

            csl("requesting IN with id : "+ eventId);

            var eventName = 'request-participation-in',
            	data = {
            		eventId: eventId,
            		hostId: hostId,
            		userId: userId,
            		requesterId: requesterId
            	},
            	cb = {
            		success: function( data ){
            			LJ.fn.handleRequestParticipationInSuccess( data );
            		},
            		error: function( xhr ){
            			LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
            		}
            	};

            LJ.fn.say( eventName, data, cb );

        },
        requestOut: function( eventId, hostId, userId, requesterId ){  

        	csl("requesting OUT with id : "+ eventId);

        	var eventName = 'request-participation-out',
        		data = {
        			userId: userId,
					hostId: hostId,
					eventId: eventId,
					requesterId: requesterId
        		},
        		cb = {
        			success: function( data ){
        				LJ.fn.handleRequestParticipationOutSuccess( data );
        			},
        			error: function( xhr ){

        			}
        		}

        	LJ.fn.say( eventName, data, cb );


        },/*sayfn*/
        say: function( eventName, data, cb ){

        	var url = '/' + eventName;

        	$.ajax({
        		method:'POST',
        		url:url,
        		dataType:'json',
        		data: data,
        		beforeSend: function(req){
        			req.setRequestHeader('x-access-token', LJ.accessToken );
        		},
        		success: function( data ){
        			if( typeof( cb.success ) == 'function' ) cb.success( data );
        		},
        		error: function( data ){
        			if( typeof( cb.error ) == 'function' ) return cb.error( data );
        			/* Default response to any HTTP error */
        			LJ.fn.handleServerError( JSON.parse( data.responseText ).msg );
        		}
        	});

        	//LJ.fn.handleTimeout();

        },
        handleTimeout: function(){

        	/* !! Algo ne marche pas si loader success en cours d'affichage après une failure */
        	sleep( 8000, function(){

        		if( $('.loaderWrap').css('display') == 'none' && $('.m-loaderWrap').css('display') == 'none') return  // pas jolie mais bn

        		LJ.fn.handleServerError('Timeout');
        	});

        }, 
        sendChat: function( submitInput ){

        	var textInput = submitInput.siblings('input[type="text"]');
        	var msg = textInput.val();

    		textInput.val('');

    		// On retreive l'id de la personne avec qui on chat
    		// En cas de chat multiple, l'id de la room
    		var senderId   = LJ.user._id,
    			receiverId = LJ.fn.findReceiverId( submitInput );

    		csl('Sending chat with receiverId : ' + receiverId );

    		var eventName = 'send-message', 
    			data = {
    				msg: msg,
	    			senderId: senderId, 
	    			receiverId: receiverId
    			},
    			cb = {
    				success: function( data ){
    					var data = {
    						submitInput: submitInput,
    						msg: msg,
    						receiverId: receiverId
    					};
    					LJ.fn.handleSendChatSuccess( data );
    				},
    				error: function( xhr ){
    					console.log('Error sending the chat');
    				}
    			};

    		LJ.fn.say( eventName, data, cb );

        },
        findReceiverId: function( submitInput ){

	        var possibleIds = [
	        	submitInput.parents('.a-item').data('userid'),
	        	submitInput.parents('.eventItemWrap').data('hostid')
	        ]

	        if( _.compact( possibleIds ).length != 1 )
	        	LJ.fn.toastMsg('No id matched for that chat', 'error', true );	

	        return _.compact( possibleIds )[0];
        },
        handleSendChatSuccess: function( data ){

        	csl('Adding chatline (me)');

        	 var chatLineHtml = '<div class="chatLine">'
								+'<div class="cha cha-user">'+data.msg+'</div>'
        						+'</div>';

        	var chatId = data.receiverId;

        	var $chatLineWrap = data.submitInput.parents('.chatWrap').find('.chatLineWrap');

        	if( LJ.state.jspAPI[ chatId ] == undefined )
    		{
    			csl('Turning chatLineWrap scrollable');
    			$chatLineWrap.jScrollPane();
    			LJ.state.jspAPI[ chatId ] =  $chatLineWrap.data('jsp');
    		}

    		$chatLineWrap.find('.jspPane').append( chatLineHtml );
    		$chatLineWrap.find('.chatLine:last-child').velocity("fadeIn", { duration: 350 });

    		sleep( 50, function(){
				csl('Refreshing jsp API');
				LJ.state.jspAPI[ chatId ].reinitialise();
				LJ.state.jspAPI[ chatId ].scrollToBottom(); 
    	    });

        },
        addChatLine: function( data ){

        	csl('Adding chatline');

        	var chatId = data.senderId;

        	var $chatIconWrap = $('.chatWrap[data-chatid="'+chatId+'"]').parents('.eventItemWrap').find('.chatIconWrap');
        		if( !$chatIconWrap.hasClass('active') )
        			LJ.fn.bubbleUp( $chatIconWrap );

            var chatLineHtml = '<div class="chatLine none">'
								+'<div class="cha cha-other">'+data.msg+'</div>'
        						+'</div>';

        	var $chatLineWrap = $('.chatWrap[data-chatid="'+chatId+'"]').find('.chatLineWrap');
        	
    		if( LJ.state.jspAPI[ chatId ] == undefined )
    		{
    			csl('Turning chatLineWrap scrollable');
    			$chatLineWrap.jScrollPane();
    			console.log( $chatLineWrap.data('jsp') );
    			LJ.state.jspAPI[ chatId ] =  $chatLineWrap.data('jsp');
    			console.log( LJ.state.jspAPI );
    		}

    		$chatLineWrap.find('.jspPane').append( chatLineHtml );
    		$chatLineWrap.find('.chatLine:last-child').velocity("fadeIn", { duration: 350 });

    		sleep( 50, function(){
				csl('Refreshing jsp API');
				console.log( LJ.state.jspAPI );
				LJ.state.jspAPI[ chatId ].reinitialise();
				LJ.state.jspAPI[ chatId ].scrollToBottom(); 
    	    });

        },
        bubbleUp: function( el ){

        	var $el = $(el);

        	if( $el.hasClass('menu-item-active') ) return; 

        	var $bubble = $el.find('.bubble'),
        		n = $bubble.text() == 0 ? 0 : parseInt( $bubble.text() );

        	$bubble.removeClass('filtered');

        		if( n == 99 ) 
        			return $bubble.text(n+'+');

        	return $bubble.text( n + 1 );

        },
        handleFriendRequestSuccess: function( data ){

			var userId     = data.userId,
        		friendId   = data.friendId,
        		upType     = data.updateType,
        		friend     = data.friend,
        		friendList = data.friendList;

            	LJ.user.friendList = data.friendList;
				
				LJ.nextCallback.context = 'fetch friends';
				LJ.nextCallback.fn = function(){
            		 
            		csl('Calling function');
					sleep( LJ.ui.artificialDelay, function(){

					LJ.fn.displayAddUserAsFriendButton();

						if( upType == 'askedhim' )
						{
							LJ.fn.handleServerSuccess('Votre demande a été envoyée');
						}

						if( upType == 'askedme' )
						{
							LJ.fn.handleServerSuccess('Vous avez une demande d\'ami');
							LJ.fn.bubbleUp( '#search' )
						}

						if( (upType == 'mutual') && (userId == LJ.user._id) )
						{
							LJ.fn.handleServerSuccess('Vous êtes à présent amis');
						}

						if( (upType == 'mutual') && (friendId == LJ.user._id) )
						{
							LJ.fn.handleServerSuccess('Votre demande a été acceptée!');
							LJ.fn.bubbleUp( '#search' )
						}

						if( upType == 'mutual' && LJ.myFriends.length == 1 )
						{
							$('#friendListWrap .noFriendsYet').replaceWith( LJ.fn.renderUsersInFriendlist( friend ) );
							$('#createEventWrap .noFriendsYet').replaceWith( LJ.fn.renderUserThumb({ user:friend }) );
						}
					});
				}
				LJ.fn.fetchFriends();

        },
        handleFetchAskedInSuccess: function( data ){

        	var askersList = data.askersList,
        		eventId = data.eventId,
        		$itemWrap =  $('.eventItemWrap[data-eventid="'+eventId+'"]'),
        		$askersWrap = $itemWrap.find('.askedInWrap');

        	var d = LJ.cloudinary.displayParamsEventAsker;
        		$askersWrap.html('');

			for( var i = 0; i < askersList.length ; i ++ ){
				
				var asker = askersList[i];

					d.version = asker.imgVersion;

				var $askerImg = LJ.fn.renderAskerInEvent( asker.imgId, { dataList: [{ dataName: 'userid', dataValue: asker._id }]});
					$askersWrap.prepend( $askerImg );					

				var $nbAskers = $itemWrap.find('.e-guests span.nbAskers');
					$nbAskers.text( askersList.length );
			}

        },
        handleSuccessDefault: function( data ){
        	console.log('Success!');
        },
        handleErrorDefault: function( data ){
        	console.log('Error!');
        },
        handleFriendRequestSuccessHost: function( data ){
        	
        	var userId     = data.userId,
                friendId   = data.friendId;

            	/* Host checks if he has to update his friendLinks, hence reload friends status*/
            	if( LJ.myAskers.length != 0 )
            	{
            		var askersId = _.pluck( LJ.myAskers, '_id' );
            		if( askersId.indexOf( userId ) != -1 && askersId.indexOf( friendId ) != -1 )
            			{ LJ.fn.refetchAskers(); }
            	}

        },
        displayAddUserAsFriendButton: function(){

        	var $users = $('#searchUsers .u-item.match');

        		$users.each( function( i, user ){

        			var $user = $(user),
        				userId = $user.attr('data-userid');

        			var button;

        			if( _.pluck( LJ.user.friendList, 'friendId' ).indexOf( userId ) != -1 )
        			{
        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'mutual' )
        				    button =  '<button class="themeBtn onHold"><i class="icon icon-ok-1"></i></button>' ;

        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'askedMe' )
        				    button = '<button class="themeBtn"><i class="icon icon-ellipsis"></i></button>' ;

        				if( _.find( LJ.user.friendList, function(el){ return el.friendId == userId ; }).status == 'askedHim' )
        				    button = '<button class="themeBtn onHold"><i class="icon icon-ellipsis"></i></button>' ; 
        			}
        			else
        			{
        				    button = '<button class="themeBtn"><i class="icon icon-user-add"></i></button>' ; 
        			}

        				$user.find('button').replaceWith( button );

        		});

        },
        displayAddFriendToPartyButton: function(){

        	var $friendListWrap = $('#friendListWrap'),
        		$eventWrap = $friendListWrap.parents('.eventItemWrap'),
        		$askedInWrap = $friendListWrap.parents('.eventItemWrap').find('.askedInWrap');

        	$friendListWrap.find('.f-item').each( function( i, el ){

        		var $friend = $(el),
        			friendId = $friend.data('userid');

        		var button;
        		
        		var myFriend = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

           		if( myFriend.status == 'hosting' )
           		{
	                button = '<button class="themeBtn isHosting">'
	                  + '<i class="icon icon-forward-1"></i>'
	                  +'</button>';
	                return $friend.find('button').replaceWith( button );
              	}

	        	if( $askedInWrap.find('img[data-userid="'+friendId+'"]').length == 1 )
	        	{  
              		button = '<button class="themeBtn onHold">'
                      + '<i class="icon icon-ok-1"></i>'
                      +'</button>';
	              	return $friend.find('button').replaceWith( button );
	        	}

        		    button = '<button class="themeBtn ready">'
                  + '<i class="icon icon-user-add"></i>'
                  +'</button>';
	        	return $friend.find('button').replaceWith( button );
	        	
        	});

        },
        showUserTyping: function( data ){

        console.log('User typing received...');
        var chatId = data.chatId,
        	$liveTypeWrap = $('div[data-chatid="'+chatId+'"]').find('.liveTypeWrap');

        	$liveTypeWrap.velocity( { translateY: [0,7], opacity: [1,0] }, { duration:300 });

        },
        hideUserTyping: function( data ){

        var chatId = data.chatId,
        	$liveTypeWrap = $('div[data-chatid="'+chatId+'"]').find('.liveTypeWrap');

        	$liveTypeWrap.velocity( { translateY: [-7,0], opacity: [0,1] }, { duration:300 });

        },
        subscribeToChannels: function(){

        	var channels = LJ.user.myChannels,
        		L = channels.length;
        	for( var i=0; i<L; i++ )
        	{
        		LJ.myChannels[ channels[i].accessName ] = LJ.pusher.subscribe( channels[i].channelName )
        	}
        	return;

        },
        initChannelListeners: function(){

        	/* Bind all defaults global events */
        	LJ.myChannels['defchan'].bind('create-event-success', LJ.fn.handleCreateEventSuccess );
        	LJ.myChannels['defchan'].bind('suspend-event-success', LJ.fn.handleSuspendEventSuccess );
        	LJ.myChannels['defchan'].bind('cancel-event-success', LJ.fn.handleCancelEventSuccess );

        	LJ.myChannels['defchan'].bind('restart-events', LJ.fn.handleRestartEvents );
        	LJ.myChannels['defchan'].bind('reset-events', LJ.fn.handleResetEvents );

        	LJ.myChannels['defchan'].bind('refresh-users-conn-states', LJ.fn.refreshUserConnState );

        	//-----------------------------------------------------
        	/* Bind personnal events */
        	LJ.myChannels['mychan'].bind('friend-request-in-success', LJ.fn.handleFriendRequestSuccess );
        	LJ.myChannels['mychan'].bind('friend-request-in-success-host', LJ.fn.handleFriendRequestSuccessHost );
        	
        	LJ.myChannels['mychan'].bind('request-participation-in-success', LJ.fn.handleRequestParticipationInSuccess );
        	LJ.myChannels['mychan'].bind('request-participation-out-success', LJ.fn.handleRequestParticipationOutSuccess );

        	LJ.myChannels['mychan'].bind('send-message-success', LJ.fn.addChatLine );

        	LJ.myChannels['mychan'].bind('user-started-typing-success', LJ.fn.showUserTyping );
        	LJ.myChannels['mychan'].bind('user-stopped-typing-success', LJ.fn.hideUserTyping );

        	LJ.myChannels['defchan'].bind('display-msg', function( data ){
        		LJ.fn.toastMsg( data.msg, 'info' );
        	});



        },
        refreshUserConnState: function( data ){

        	console.log('Refreshing');
        	LJ.myOnlineUsers = _.keys( data.onlineUsers );
        	$('.online-marker').removeClass('active');
        	LJ.fn.refreshOnlineUsers();
        },
        testAllChannels: function(){

        	var userId = LJ.user._id;
        	var channelName = 'test-all-channels'
        		, data = { userId: userId }
        		, cb = {
        			success: function( data ){
        				console.log('Test launched...ok');
        			},
        			error: function( xhr ){
        				console.log('Error! :@');
        			}
        		};

        	LJ.fn.say( channelName, data, cb );

        },
        cancelEvent: function( eventId, hostId, templateId ){

        	csl('canceling event : '+eventId+'  with hostId : '+hostId);
        	$( '#cancelEvent' ).addClass( 'pending' );

        	var eventName = 'cancel-event',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id, templateId: templateId }
        		, cb = {
        			success: function( data ){

        				/* Host only */
			        		$('.pending').removeClass('pending');
			        		LJ.user.status = 'idle';
			        		LJ.myAskers = [];
			        		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
			        		LJ.fn.displayMenuStatus( function(){ if(hostId==LJ.user._id) $('#create').click(); } );
					
						/* For all users */							                	 
			        	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+hostId+'"]');
			        		canceledEvent.velocity("transition.slideRightOut", {
			        			complete: function(){
			        				canceledEvent.remove();
			        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
			        			}
			        		});

			        	_.remove( LJ.myEvents, function( el ){
			        		return el.hostId == hostId; 
			        	});
        			},
        			error: function( xhr ){
        				console.log('Error canceling event');
        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        			}
        		};

        	LJ.fn.say( eventName, data, cb );

        },
        suspendEvent: function( eventId, hostId ){

        	console.log('Suspending event with id : ' + eventId + ' and hostId : ' + hostId );
        	$( '#suspendEvent' ).addClass( 'pending' );

        	var eventName = 'suspend-event',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id }
        		, cb = {
        			success: function( data ){
        				sleep( LJ.ui.artificialDelay, function(){

	        				var eventState = data.eventState,
	        					hostId     = data.hostId;

	        				var $li = $('#suspendEvent');
							$('.pending').removeClass('pending');

							if( eventState == 'suspended' ){
								LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
								$li.text('Reprendre');
							}

							if( eventState == 'open' ){
								LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
								$li.text('Suspendre');
							}
        				});
        			},
        			error: function( xhr ){
        				sleep( LJ.ui.artificialDelay, function(){
	        				console.log('Error suspending event');
	        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        				});
        			}
        		};

        	console.log('Calling say with eventName:' +eventName+'  and data:'+data);
        	LJ.fn.say( eventName, data, cb );

        },
        showLoaders: function(){

        	$( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

        },
        hideLoaders: function(){

            $( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

        }, 
        handleCreateEventSuccess: function( data ){

        	var myEvent = data.myEvent;

        		LJ.myAskers = data.myEvent.askersList;
        		LJ.fn.displayAskers();

        		/* Réagir si un ami créé un évènement, MAJ les buttons */ 
				//LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );
				LJ.fn.bubbleUp( '#events' );

				LJ.fn.insertEvent( myEvent );
				$('#refreshEventsFilters').click();

        },
        handleSuspendEventSuccess: function( data ){

        	var hostId     = data.hostId,
        		eventId    = data.eventId,
			    eventState = data.eventState;			


        		sleep( LJ.ui.artificialDelay , function(){ 

						var eventId = data.eventId;
						var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-hostid="' + hostId + '"]');

						var textBtn = eventState == 'suspended' ? "L'évènement est complet" : "Je veux y aller";

						eventWrap.attr('data-eventstate', eventState );

						if( LJ.user.eventsAskedList.indexOf( eventId ) != -1 ){
							return console.log('Exiting');
						}
						 eventWrap.find('button.askIn')
						 		  .text( textBtn );
						
					});	

        },
        handleCancelEventSuccess: function( data ){

        	var hostId  = data.hostId;

        		sleep( LJ.ui.artificialDelay , function(){ 

					var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
	        		canceledEvent.velocity("transition.slideRightOut", {
	        			complete: function(){
	        				canceledEvent.remove();
	        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
	        			}
	        		});

		        	_.remove( LJ.myEvents, function( el ){
		        		return el.hostId == data.hostId; 
		        	});
				});	

        },
        displayMenuStatus: function( cb ){
 
			var status = LJ.user.status;

			if( status == 'idle' )
			{
				$('#management').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#create').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display:'inline-block', complete: function(){ cb(); } }); }
				});
			}

			 if( status == 'hosting' )
			{
				$('#create').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#management').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display: 'inline-block', complete: function(){ cb(); } }); }
				});
			}
        }

}); //end LJ

$('document').ready(function(){
		
		csl('Application ready!');
		LJ.fn.init();

		/* Recursive initialisation of FB pluggin*/
		var initFB = function(time){
			if( typeof(FB) === 'undefined' ) return sleep(time, initFB )
			FB.init({
					    appId      : '1509405206012202',
					    xfbml      : true,  // parse social plugins on this page
					    version    : 'v2.1' // use version 2.1
				});
		}

		initFB(300);


});