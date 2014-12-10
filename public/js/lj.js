
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

				/*Bind UI Animating moves */
				this.initAnimations();

				/* Gif loader and placeholder */
				this.initStaticImages();

				/* Global UI Settings ehanced UX*/
				this.initEhancements();

				/* Init Facebook state */
				this.initFacebookState();

		},
		initFacebookState: function(){

				  FB.getLoginStatus( function( res ){

				  	var status = res.status;
				  	console.log('Facebook status : ' + status);

				  	console.log('status : '+status);
				  	if( status != 'connected' )
				  		 return;

				  	LJ.fn.toastMsg('Facebook account detected, login in...', 'info' );

				  	sleep(1000, function(){

					  	FB.api('/me', function(res){

					  		var facebookId = res.id;
					  		LJ.fn.loginWithFacebook( facebookId );
					  		
					  	});
				  	});
			  	
				  });


		},
		initSocketConnection: function(jwt){

			LJ.params.socket = io.connect({
				query:'token='+jwt
			});


			/* Initialisation des socket.on('event',...); */
			LJ.fn.initSocketEventListeners();

		},
		initAnimations: function(){

			$('#bcm_member').click(function(){

				LJ.fn.displayContent( LJ.$signupWrap, {
					myWayOut: "transition.slideLeftOut",
					myWayIn: "transition.slideRightIn"
				});
			});

			$('#lost_pw').click(function(){

				LJ.fn.displayContent( LJ.$resetWrap, {
					myWayOut: "transition.slideRightOut",
					myWayIn: "transition.slideLeftIn"
				});
			});

			$('#pw_remember').click(function(){

				LJ.fn.displayContent( LJ.$loginWrap, {
					myWayOut: "transition.slideLeftOut",
					myWayIn: "transition.slideRightIn"
				});
			});

			LJ.$backToLogin.click(function(){

				LJ.fn.displayContent( LJ.$loginWrap, {
					myWayOut: "transition.slideRightOut",
					myWayIn: "transition.slideLeftIn"}
				);
			});

		},
		initStaticImages: function(){

			var $loader = $.cloudinary.image( LJ.cloudinary.loader_id, LJ.cloudinary.displayParamsLoader );
				$loader.appendTo( $('.loaderWrap') );

			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsPlaceholder );
				$('#pictureWrap').prepend( $placeholder );

		},
		initEhancements: function(){

			(function bindEnterKey(){ //Petite IIEF pour le phun

				$('#loginWrapp').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#login').click();
					}
				});

				$('#signupWrapp').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#signup').click();
					}
				});

				$('.profileInput, #description').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn',function(){
					$(this).addClass('validating-btn');
				});
 
				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length==0){
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
            				return LJ.fn.toastMsg("Can't have more than 3 tags", 'error' );
            		}       		
            	});
			})();
				
		},
		signupUser: function(credentials){

		    credentials = {} ;

			credentials.email = LJ.$emailInputSignup.val();
			credentials.password = LJ.$passwordInputSignup.val();	
			//csl("Posting this : " +JSON.stringify(credentials,0,4))

			LJ.$backToLogin.velocity("transition.slideLeftOut", { duration:300 });
			LJ.fn.showLoaders();
			$('input.input-field').addClass('validating');

			if( "" ===  $('#pwSignup').val().trim() || "" === $('#pwCheckSignup').val().trim() || "" === $('#emailSignup').val().trim() ){
				return LJ.fn.handleFailedSignup( { msg: "Input is missing" });
			}

			if( $('#pwSignup').val() != $('#pwCheckSignup').val() ){
				return LJ.fn.handleFailedSignup( { msg: "Passwords don't match" });
			}

			$.ajax({

				method:'POST',
				url:'/signup',
				dataType:'json',
				data: {
					email    : credentials.email,
					password : credentials.password
				},
				success: function(data){
					data.email    = credentials.email;
					data.password = credentials.password;
					LJ.fn.handleSuccessSignup(data);

				},
				error: function(data){
					LJ.fn.handleFailedSignup(data);
				}
			});
		},
		loginUser: function(credentials){

			    credentials = credentials || {} ;

				credentials.email    = credentials.email    || LJ.$emailInput.val();
				credentials.password = credentials.password || LJ.$passwordInput.val();

			$.ajax({
				method:'POST',
				url:'/login',
				dataType:'json',
				data : {
					email   :  credentials.email,
					password : credentials.password
				},
				beforeSend: function(){
					LJ.fn.handleBeforeSendLogin();
				},
				success: function( data ){
					LJ.fn.handleSuccessLogin( data );
				},
				error: function( data ){
					LJ.fn.handleFailedLogin( data );
				}
			});
		},
		resetPassword: function(){

			var email = $('#pwResetInput').val().trim();

			LJ.fn.showLoaders();
			$('#resetWrapp input[type="submit"]').addClass('validating-btn');
			$('#pw_remember').velocity('transition.slideRightOut', { duration: 300 });

			$.ajax({
				method:'POST',
				url:'/reset',
				dataType:'json',
				data: {
					email: email
				},
				success: function(data){
					LJ.fn.handleSuccessReset(data);
				},
				error: function(data){
					LJ.fn.handleFailedReset(data);
				}
			});

		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				age   		  = $('#age').val(),
				name  		  = $('#name').val(),
				description   = $('#description').val(),
				favoriteDrink = $('.drink.modified').data('drink') || $('.drink.selected').data('drink') 
				mood          = $('.mood.modified').data('mood')   || $('.mood.selected').data('mood') 

			if( LJ.user.status == 'new' ){ LJ.user.status = 'idle' }

			var profile = {

				_id			  : _id,
				age 		  : age,
				name 		  : name,
				description   : description,
				favoriteDrink : favoriteDrink,
				mood          : mood,
				status        : LJ.user.status,

			};
				LJ.params.socket.emit('update profile', profile);
				csl('Emitting update profile');
				LJ.fn.showLoaders();

		},
		updateSettings: function(){

			var currentEmail    = $('#currentEmail').val(),
				newPw 	   		= $('#newPw').val(),
				newPwConf  		= $('#newPwConf').val(),
				newsletter 		= $('#newsletter').is(':checked'),
				userId     		= LJ.user._id;

			var o = { currentEmail: currentEmail, newPw: newPw, newPwConf: newPwConf, newsletter: newsletter, userId: userId }; 

			LJ.fn.showLoaders();
			LJ.params.socket.emit('update settings', o);

		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		handleBeforeSendLogin: function(){

			LJ.$loginBtn.val('Loading');
			LJ.$loginBtn.addClass('validating-btn');
			LJ.fn.showLoaders();
			$('#bcm_member').velocity('transition.slideRightOut', { duration: 500 });
			$('#lost_pw').velocity('transition.slideLeftOut', { duration: 500 });
			$('input.input-field').addClass('validating');

		},
		loginWithFacebook: function( facebookId ){

				$.ajax({

					method:'POST',
					data: { facebookId: facebookId },
					dataType:'json',
					url:'/auth/facebook',
					success: function(data){

						LJ.fn.handleSuccessLogin( data );

					},
					error: function(err){

					}

				});

		},
		handleSuccessLogin: function( user ){

			LJ.user._id = user._id; /* Nécessaire pour aller chercher toutes les infos, mais par socket.*/
			LJ.fn.initSocketConnection( user.token );
			LJ.$loginWrap.find('.header-field').addClass('validated');

		},
		handleFailedLogin: function(data){

			csl('handling fail login');
			data = JSON.parse(data.responseText);

			sleep( LJ.ui.artificialDelay, function(){

				LJ.fn.handleServerError( data.msg );
				$('#bcm_member').velocity('transition.slideRightIn', { duration: 400, display:"inline-block" });
				$('#lost_pw').velocity('transition.slideLeftIn', { duration: 400, display:"inline-block" });
				LJ.$loginBtn.val('Login');

			});

		},
		handleSuccessSignup: function(data){

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.hideLoaders();
				LJ.fn.loginUser(data);

			});		

		},
		handleFailedSignup: function(data){

			if ( data.responseText )
				data = JSON.parse(data.responseText);

			var errorMsg = data.msg;

			sleep(LJ.ui.artificialDelay,function(){

				$('input.input-field').removeClass('validating');
				LJ.fn.toastMsg( errorMsg, 'error' );
				LJ.$backToLogin.velocity('transition.slideRightIn', { duration: 400 });
				LJ.fn.hideLoaders();

			});

		},
		handleSuccessReset: function(data){

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.hideLoaders();
				$('input.input-field').removeClass('validating');
				$('#email').val( $('#pwResetInput').val() );

				LJ.fn.displayContent( LJ.$loginWrap );

				sleep(1000, function(){
					LJ.fn.toastMsg( data.msg , 'info');
					$('#pwResetInput').val('');
					$('#pw_remember').velocity('transition.slideRightIn', { duration: 400 });
				
				});

			});		

		},
		handleFailedReset: function(data){

			if ( data.responseText )
				data = JSON.parse(data.responseText);

			var errorMsg = data.msg;

			sleep(LJ.ui.artificialDelay,function(){

				LJ.fn.handleServerError( errorMsg );
				$('#pw_remember').velocity('transition.slideRightIn', { duration: 400 });

			});

		},
		displayViewAsFrozen: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];

			$('.eventsHeader').velocity('transition.slideUpOut', 
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
				  	$('.eventsHeader').velocity('transition.slideUpIn', { duration: 700 });
				}
			});

		},
		displayViewAsNew: function(){

			 $('#profile').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

             $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('none');}})
			 LJ.fn.displayContent(LJ.$profileWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut' });

		},
		displayViewAsIdle: function(){

            $('#events').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('none');}})
            LJ.fn.displayContent(LJ.$eventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut'  });

		},
		displayViewAsHost: function(){

			$('#management').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

             $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('none');}})
			LJ.fn.displayContent(LJ.$manageEventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut'  });

            LJ.fn.fetchAskers();
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
				LJ.fn.replaceMainImage( LJ.user.imgId,
								            LJ.user.imgVersion,
								            LJ.cloudinary.displayParamsProfile );

				/* Settings View */
				$('#newsletter').prop( 'checked', LJ.user.newsletter );
				$('#currentEmail').val( LJ.user.email );

				/* Management View */
				if( LJ.user.state == 'hosting' )
				{
					$('#suspendEvent').text( LJ.my)
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
				var rev = $('.revealed');

				rev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 300,
					complete: function(){
						rev.removeClass('revealed');
						content.addClass('revealed')
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 700,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			LJ.fn.toggleOverlay('high');
							   		}
							   	}
							   });
					}
				});

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
			     			  .velocity('transition.slideLeftIn', { duration: 400 });
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
    				  .velocity('transition.slideLeftIn', { duration: 400 });

    		sleep(30, function(){ 
    			if( LJ.state.jspAPI[chatId] != undefined )
    			{
           		  LJ.state.jspAPI[chatId].reinitialise();
        		  LJ.state.jspAPI[chatId].scrollToBottom();   
    			} 
    		});

		},
		toggleChatWrapEvents: function( chatIconWrap ){

			var $eventWrap = chatIconWrap.parents('.eventItemWrap');
			    $chatWrap  = $eventWrap.find('.chatWrap');
			    $previous  = $('.prev'),
			    $surfacing = $('.surfacing'); 

			$('#friendListWrap').velocity('transition.slideUpOut', { duration: 300 });
			$('.friendAddIconWrap.active').removeClass('active');

			var chatId = $chatWrap.data('chatid');

			     if( !$surfacing )
			     {
			     	chatIconWrap.addClass('active');
			     	$eventWrap.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideUpIn', { duration: 400 });
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
        				  .velocity('transition.slideUpIn', { duration: 400 });

        		sleep( 30, function(){ 
        			if( LJ.state.jspAPI[chatId] != undefined ){ 
	           		  LJ.state.jspAPI[chatId].reinitialise();
	        		  LJ.state.jspAPI[chatId].scrollToBottom();   
        			} 
        		});
             
		},
		initAppSettings: function(data){

			var user     = data.user,
				settings = data.settings;

			/* Init user settings */
            LJ.user = user;	

            /* Init app settings */
            LJ.settings = settings;

		},
		updateClientSettings: function(newSettings){

			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		toastMsg: function(msg, status, fixed){

			if( status == 'error' ){
				var toastStatus = '.toastError',
					tpl = LJ.tpl.toastError;
			}
			if( status == 'info' ){
				var toastStatus = '.toastInfo',
					tpl = LJ.tpl.toastInfo;
			}
			if( status == 'success'){
				var toastStatus = '.toastSuccess',
					tpl = LJ.tpl.toastSuccess;
			}

			if( $( '.toast' ).length == 0 ){
				$( tpl ).prependTo('#mainWrap');
				var toast = $( toastStatus );
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
							}
							});
						}
					  }
					});
			}

			else{
				var toast = $( '.toast' );
				csl(toast);
					toast.finish().velocity('transition.slideUpOut',{
						duration: 200,
						complete: function(){
							toast.remove();
							LJ.fn.toastMsg( msg, status );
						}
					});
			
			}
		},
		replaceThumbImage: function( imgId, imgVersion, d, previousImg ){

			d.version = imgVersion;

			var newImg = $.cloudinary.img( imgId, d )
						  .addClass('none')
						  .insertAfter( previousImg );

				previousImg.velocity('transition.fadeOut', {
					duration: 300,
					complete: function(){
						previousImg.remove();
						newImg.velocity('transition.fadeIn')
					}
				})

		},
		replaceMainImage: function( imgId, imgVersion, d ){

		    	d.version = imgVersion;

			var $previousImg = $('#pictureWrap').find('img'),
				$newImg      = $.cloudinary.image( imgId, d ); 
				$newImg.addClass('mainPicture').hide();
				$('#pictureWrap').prepend( $newImg );
 													
				$previousImg.velocity('transition.fadeOut', { 
					duration: 600,
					complete: function(){
						$previousImg.remove();
						$newImg.velocity('transition.fadeIn', { duration: 700 });
					}
				});

		},
		replaceThumbImage: function( id, version, d ){

			    d = d || LJ.cloudinary.displayParamsHeaderUser;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.hide();

				$('#thumbWrap').prepend( newImg );

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function(upload_tag){

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

  							sleep( LJ.ui.artificialDelay,function(){

  								$('.progress_bar').velocity('transition.slideUpOut', {
  								 	duration: 400,
  								 	complete: function(){
  								 		$(this).css({ width: '0%' })
  								 			   .velocity('transition.slideUpIn');
  									} 
  								});

  								LJ.fn.hideLoaders();
  								LJ.fn.toastMsg('Votre photo de profile a été modifiée', 'info');

  								var imgId      = data.result.public_id;
  								var imgVersion = data.result.version;

                                LJ.user.imgVersion = imgVersion;
                                LJ.user.imgId      = imgId;

  								LJ.params.socket.emit('update picture', {
																			_id        : LJ.user._id,
																			imgId      : imgId,
																			imgVersion : imgVersion 
  																		});

  								LJ.fn.replaceMainImage( imgId, imgVersion, LJ.cloudinary.displayParamsProfile );
  								LJ.fn.replaceThumbImage( imgId, imgVersion, LJ.cloudinary.displayParamsHeaderUser );
					
  							});

  				}).cloudinary_fileupload();
  				
		},
		refreshArrowDisplay: function(){

			var $arrLeft  = $('#manageEventsWrap i.next-left'),
				$arrRight = $('#manageEventsWrap i.next-right');

			$arrLeft.removeClass('none');
			$arrRight.removeClass('none');

			if( ($('.a-item').length == 0) ||  ($('.a-item').length == 1) ){
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

			var $askerThumb = $('#askersThumbs').find('.imgWrapThumb[data-askerid="'+askerId+'"]');
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
        	$( '#eventsListWrap' ).html('').append( LJ.tpl.noResult );

			/* Affichage de la vue en fonction du state user */
        	sleep( LJ.ui.artificialDelay, function(){   

				if( LJ.state.connected )
				{
					LJ.fn.toastMsg('You have been reconnected', 'success');
				}
				else
				{ 

				 LJ.state.connected = true;
				 $('#thumbWrap').velocity('transition.slideUpIn');
				 $('.menu-item-active').removeClass('menu-item-active');
				 
					switch( LJ.user.status )
					{
						case 'new':
							LJ.params.socket.emit('request welcome email', LJ.user._id );
							LJ.fn.displayViewAsNew();
							break;
						case 'idle':
							LJ.fn.displayViewAsIdle();
							break;
						case 'hosting':
							LJ.fn.displayViewAsHost();
							break;
						default:
							alert('No status available, contact us');
							break;
					}


					$('.menu-item').velocity({ opacity: [1, 0] }, {
						display:'inline-block',
						complete: function(){
							//LJ.fn.toastMsg("Welcome back " + LJ.user.name, 'info');
						}
					});
				}

			});

        },
        handleServerSuccess: function( msg ){

        	LJ.fn.toastMsg( msg, 'info');
        				if( $('.mood.modified').length != 0 ) $('.mood.selected').removeClass('selected');
        				if( $('.drink.modified').length != 0 ) $('.drink.selected').removeClass('selected');
        				$('.modified').removeClass('modified').addClass('selected');
        				$('.validating').removeClass('validating');
						$('.validating-btn').removeClass('validating-btn');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();

        },
        handleServerError: function( msg ){

        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.validating-btn').removeClass('validating-btn');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();

        },
		initSocketEventListeners: function(){

				LJ.params.socket.on('connect', function(){

					csl('Client authenticated on the socket stream');
					var userId = LJ.user._id;

					/* Request all informations */
					LJ.params.socket.emit('fetch user and configuration', userId );

				});

				LJ.params.socket.on('refetch askers success', function( askers ){
					csl('Refetch askers success, askers = ' + askers );
					LJ.myAskers = askers;
					LJ.fn.addFriendLinks();

				});


				LJ.params.socket.on('freeze events', function(){

					LJ.fn.toastMsg('Events are frozen!', 'info', true);
					$('.eventItemWrap').attr('data-eventstate','frozen')
									   .click( function(e){
									   	e.stopPropagation();
									   });

					LJ.fn.displayViewAsFrozen();


				});

				LJ.params.socket.on('end events', function(){

					LJ.fn.toastMsg('Events hostings have started!', 'info', true);
					$('.eventItemWrap').remove();
					LJ.myEvents = [];

					LJ.fn.displayViewAsNormal();


				});

				LJ.params.socket.on('fetch user and configuration success', function( data ){

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
					LJ.fn.hideLoaders();

					var user 	 = data.user,
						settings = data.settings;

					LJ.fn.initAppSettings( data, settings );
					LJ.fn.displayUserSettings();
					LJ.fn.fetchEvents();
					LJ.fn.fetchUsers();
					LJ.fn.fetchFriends();
					LJ.fn.initRooms( LJ.user._id );					
					LJ.fn.initCloudinary( user.cloudTag );
					LJ.fn.initLayout( settings );

				});

				LJ.params.socket.on('update profile success', function(data){

					csl('update profile success received');

					sleep( LJ.ui.artificialDelay, function(){

						LJ.fn.updateClientSettings( data );
						$('#thumbName').text( data.name );
						LJ.fn.handleServerSuccess('Vos informations ont été modifiées');
				
						});

				});

				LJ.params.socket.on('update image success', function( data ){

					LJ.fn.updateClientSettings(data);
					csl(JSON.stringify(data,0,4));
				});

				LJ.params.socket.on('create event success', function( myEvent ){
					
					var eventId = myEvent._id,
						hostId = myEvent.hostId;
					
					myEvent.beginsAt = new Date ( myEvent.beginsAt );

					sleep( LJ.ui.artificialDelay , function(){ 

						if( LJ.user._id === hostId )
						{
								LJ.user.status = 'hosting';
								LJ.user.hostedEventId = eventId;
								LJ.fn.toastMsg("Evènement créé avec succès !", 'info');
								LJ.fn.hideLoaders();
								$('.themeBtn').removeClass('validating-btn');
								LJ.$createEventWrap.find('input, #eventDescription').val('');
								LJ.$createEventWrap.find('.selected').removeClass('selected');

								$('#management').click();
						}
						else
						{
							LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );
						}

						/* Pour tous les users */
						var idx = _.sortedIndex( LJ.myEvents, myEvent, 'beginsAt' );
						console.log('idx = ' + idx);
						LJ.myEvents.splice( idx, 0, myEvent );
						var eventHTML = LJ.fn.renderEvent( myEvent );

						/* Prise en compte des effets de bords sinon le jQuery return undefined */
						if( ( idx == 0 ) ){
							$( eventHTML ).insertAfter( $('#noEvents') );
						}else if( idx == LJ.myEvents.length - 1){ // myEvents just got incremented, hence the - 1
							$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx-1] ) );
						}else{
							$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx] ) );
						}

						$( eventHTML ).addClass('inserted');

						/* On affiche directement l'event <=> au moins 1 tag correspond à ce qui été dernièrement filtré */
						var eventTags = myEvent.tags,
									L = eventTags.length;

						for( var k = 0; k < L; k++ ){
							eventTags[k] = "tag-" + eventTags[k];
						}

						if( _.intersection( eventTags, LJ.selectedTags ).length != 0 || LJ.selectedTags.length == 0){

							var $inserted = $('.inserted');

								$inserted.find('.tag').each( function( i, el ){
									if( LJ.selectedTags.indexOf( $( el ).attr('class').split(' ')[1] ) != -1 ){
										$( el ).addClass( 'selected' );
									}
								});

							$inserted.velocity('transition.slideLeftIn', { duration: 400 })
									 .removeClass('inserted');
						}
					});
				});

				LJ.params.socket.on('change state event success', function( data ){
					
					sleep( LJ.ui.artificialDelay , function(){ 

						var eventState = data.myEvent.state,
							eventId    = data.eventId;

						switch( eventState ){

						case 'canceled':
							LJ.fn.handleCancelEvent( data );
						break;

						case 'suspended':
							LJ.fn.handleSuspendEvent( data, 'suspended' );
						break;

						case 'open':
							LJ.fn.handleSuspendEvent( data, 'open' );
						break;

						default:
							LJ.fn.toastMsg('Strange thing happend', 'error');
						break;

						}

					});				

		        });

				LJ.params.socket.on('fetch user success', function( data ){ console.log(data); });
 
				LJ.params.socket.on('fetch events success', function( events ){

					LJ.state.fetchingEvents = false;
					var L = events.length;

					for( var i=0; i<L; i++ ){

						LJ.myEvents[i] = events[i];
						LJ.myEvents[i].createdAt = new Date( events[i].createdAt );
						LJ.myEvents[i].beginsAt  = new Date( events[i].beginsAt );
					}

					/* L'array d'event est trié à l'initialisation */
					LJ.myEvents.sort( function( e1, e2 ){
						return e1.beginsAt -  e2.beginsAt ;
					});

					LJ.fn.displayEvents();
				});

				LJ.params.socket.on('request participation in success', function( data ){

					var hostId  	= data.hostId,
						userId 		= data.userId,
						eventId 	= data.eventId,
						requesterId = data.requesterId,
						asker   	= data.asker;						

					sleep( LJ.ui.artificialDelay, function(){


						var d = LJ.cloudinary.displayParamsEventAsker;
							d.version = asker.imgVersion;

						var $askerImg = LJ.fn.renderAskerInEvent( asker.imgId, { dataList: [{ dataName: 'askerid', dataValue: asker._id }]});
						var $askedInWrap = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap');
							$askedInWrap.prepend( $askerImg );
							$askedInWrap.find('img').last().remove();

						
							if( LJ.user._id == requesterId && LJ.user._id == userId )
							{
								LJ.fn.hideLoaders();
								LJ.fn.toastMsg('Your request has been sent', 'info');
								 $('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
										  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
							}

							if( LJ.user._id != requesterId && LJ.user._id == userId )
							{
								LJ.fn.toastMsg('A friend added you to an event', 'info');
								$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askIn')
								          .removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
										  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
							}

							if( LJ.user._id == requesterId && LJ.user._id != userId )
							{
								LJ.fn.toastMsg('Your friend has been added!', 'info');
								LJ.fn.hideLoaders();
								LJ.fn.displayAddFriendToPartyButton();
							}

						/* Pour l'host */
						if( LJ.user._id == hostId )
						{

							var askerMainHTML  = LJ.fn.renderAskerMain( asker ),
								askerThumbHTML = LJ.fn.renderAskerThumb ({ asker: asker });

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
						}

					});

				});

				LJ.params.socket.on('request participation out success', function(data){

						console.log(data.asker.name +' asked out');

						var userId  	= data.userId,
							hostId  	= data.hostId,
							eventId 	= data.eventId,
							asker   	= data.asker,
							requesterId = data.requesterId;


						var chatId = LJ.fn.buildChatId( eventId, hostId, userId ),
						    $aItemMain = LJ.$askersListWrap.find('.a-item[data-askerid="'+userId+'"]'),
						    //$aItemThumb = LJ.$askersListWrap.find('.a-item[data-userid="'+userId+'"]'),
						    $chatWrapAsHost = LJ.$askersListWrap.find('.chatWrap[data-chatid="'+chatId+'"]'),
						    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');

						_.remove( LJ.myAskers, function( asker ){
							return asker._id === data.userId;
						});

						sleep( LJ.ui.artificialDelay, function(){

							LJ.fn.hideLoaders();

							/* Pour l'Host */
							if( hostId === LJ.user._id)
							{		
									$('.imgWrapThumb[data-askerid="' + asker._id + '"]').remove();
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

							*/

							$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																		   .append( LJ.tpl.$placeholderImg.clone() )
																		   .find('img[data-askerid="'+asker._id+'"]')
																		   .remove();
						});
	
				});

				LJ.params.socket.on('accept asker success', function( data ){

					csl('Asker has been accepted');

					var eventId = data.eventId,
						hostId  = data.hostId,
						askerId = data.askerId;

					/* For everyone */
					var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
							$nbAskers.text( parseInt( $nbAskers.text() ) + 1 );

					/* Host exclusively */
					if( hostId = LJ.user._id )
					{

					}

				});

				LJ.params.socket.on('update settings success', function(data){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( data.msg, 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.params.socket.on('send contact email success', function(){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( "Mail successfully sent", 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.params.socket.on('server error', function( data ){

					var msg   = data.msg,
						flash = data.flash;

					if( flash ){
						return LJ.fn.handleServerError( msg );
					}
					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.handleServerError( msg );
					});
				});

				LJ.params.socket.on('disconnect', function(){

					LJ.fn.toastMsg("You have been disconnected from the stream", 'error', true);
					LJ.params.socket.disconnect(LJ.user._id);


				});

                LJ.params.socket.on('fetch askers success', function( data ){

                	console.log(data);
                    LJ.state.fetchingAskers = false;
                    LJ.myAskers = data.askersList;
                    LJ.fn.displayAskers();
                    LJ.fn.addFriendLinks();

                });

                LJ.params.socket.on('receive message', function( data ){

                	LJ.fn.addChatLine(data);

                });

                LJ.params.socket.on('fetch friends success', function( data ){

                	csl('Friends fetched');
                	LJ.myFriends = data;
                	$('#myFriends').html( LJ.fn.renderUsersInFriendlist() );
                	LJ.fn.displayAddFriendToPartyButton();

                });

                LJ.params.socket.on('fetch users success', function( data ){

                	csl('Users fetched');
                	LJ.myUsers = _.shuffle( data ); /*Not to have always the same user first*/
                    $('#searchUsers').html( LJ.fn.renderUsersInSearch() );

                    $( $('.u-item:not(.match)')[0] ).css({ opacity: '.5 '});
					$( $('.u-item:not(.match)')[1] ).css({ opacity: '.4 '});
					$( $('.u-item:not(.match)')[2] ).css({ opacity: '.3 '});
					$( $('.u-item:not(.match)')[3] ).css({ opacity: '.15 '});

                });

                LJ.params.socket.on('friend request in success', function( data ){

                	var userId     = data.userId,
                		friendId   = data.friendId,
                		upType     = data.updateType,
                		friendList = data.friendList;

                	LJ.user.friendList = data.friendList;
                	LJ.fn.fetchFriends();

                		
	                sleep( LJ.ui.artificialDelay, function(){

	                	if( upType == 'askedhim' )
	                	{
	                		LJ.fn.handleServerSuccess('Votre demande a été envoyée');
	                		return;
	             	  	}

	                	if( upType == 'askedme' )
	                	{
	                		LJ.fn.handleServerSuccess('Vous avez une demande d\'ami');
	                		return;
	                	}

	                	if( (upType == 'mutual') && (userId == LJ.user._id) )
	                	{
	                		LJ.fn.handleServerSuccess('Vous êtes à présent amis');
	                		return;
	                	}

	                	if( (upType == 'mutual') && (friendId == LJ.user._id) )
	                	{
	                		LJ.fn.handleServerSuccess('Votre demande a été acceptée!');
	                		return;
	                	}
	                });
                });
                
		},
		handleCancelEvent: function(data){
			
			LJ.fn.toastMsg("L'évènement a été annulé !")
			if( data.hostId == LJ.user._id ){
		                		$('.pending').removeClass('pending');
		                		LJ.user.status = 'idle';
		                		LJ.$manageEventsWrap.find('#askersRows, #askersDetails').html('');
								$('#create').click();
							}	  		
		                	 
        	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
        		canceledEvent.velocity("transition.slideRightOut", {
        			complete: function(){
        				canceledEvent.remove();
        			}
        		});

        	_.remove(LJ.myEvents, function(el){
        		return el.hostId == data.hostId; 
        	});

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
		fetchUsers: function(){ LJ.params.socket.emit('fetch users', LJ.user._id ); },
		fetchFriends: function(){ LJ.params.socket.emit('fetch friends', LJ.user._id ); },
		createEvent: function(){

			var tags = [];

			$('#createEventWrap .selected').each( function( i, $el ){
				var tag = $( $el) .attr('class').split(' ')[1].split('-')[1];						 
				tags.push(tag);
			});

			var e = {};
				e.hostId	  	  = LJ.user._id;
				e.hostName   	  = LJ.user.name;
				e.hostImgId 	  = LJ.user.imgId;
				e.hostImgVersion  = LJ.user.imgVersion;
				e.name 		  	  = $('#eventName').val();
				e.location    	  = $('#eventLocation').val();
				e.hour 		  	  = $('#eventHour').val();
				e.min  		  	  = $('#eventMinut').val();
				e.description 	  = $('#eventDescription').val();
				e.maxGuest        = $('#eventMaxGuest').val();
				e.tags            = tags;

				LJ.fn.showLoaders();
				LJ.params.socket.emit('create event', e);
		},
		fetchEvents: function(){

			if( LJ.state.fetchingEvents )
			{ 
				LJ.fn.toastMsg('Already fetching events', 'error');
			}
			else
			{
				LJ.state.fetchingEvents = true;
                LJ.params.socket.emit('fetch events', LJ.user._id );
            }
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers )
            {
                LJ.fn.toastMsg("Already fetching askers", 'error');
            }
            else
            {
                LJ.state.fetchingAskers = true;
                LJ.params.socket.emit('fetch askers',{ eventId: LJ.user.hostedEventId, hostId: LJ.user._id });
            }

        },
        displayEvents: function(){

        	/* Mise à jour de la vue des évènements */
        		csl('Displaying events frozen state');
	        	var hour = (new Date).getHours();
	        	if( hour < LJ.settings.eventsEndAt && hour >= LJ.settings.eventsFreezeAt ){
	        		return LJ.fn.displayViewAsFrozen();
	        	}     		

            LJ.$eventsListWrap.html('').append( LJ.fn.renderEvents( LJ.myEvents ) );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').html('').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').html('').append( LJ.fn.renderAskersThumbs() );

            LJ.fn.refreshArrowDisplay();

        },
        refetchAskers: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
        	LJ.params.socket.emit('refetch askers', { userId: LJ.user._id, idArray: idArray });

        },
        addFriendLinks: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
	
        	for( var i = 0; i < LJ.myAskers.length ; i ++ )
        	{	
        		$('#askersThumbs .team-'+i).removeClass('team-'+i);
        		$('#askersThumbs .head-'+i).removeClass('head-'+i);
        		
        		console.log('Browsing for : '+ LJ.myAskers[i].name );
        		$('#askersThumbs div[data-askerid="'+ LJ.myAskers[i]._id +'"]').addClass('team-'+i).addClass('head-'+i);
        		
        		for( var k = 0 ; k < LJ.myAskers[i].friendList.length ; k++ )
        		{	
        			if( idArray.indexOf( LJ.myAskers[i].friendList[k].friendId ) == -1 )
        			{
        				console.log( 'Friend n° : '+k+'  '+LJ.myAskers[i].friendList[k].name + ' is not in the event' );
        			}
        			else
        			{	
        				console.log( LJ.myAskers[i].friendList[k].name + ' is in the event, status : ' + LJ.myAskers[i].friendList[k].status );
        				if( LJ.myAskers[i].friendList[k].status == 'mutual' )
        				{	
        					console.log('Adding link team-'+i+' , for  ' + LJ.myAskers[i].friendList[k].name );
        					$('#askersThumbs div[data-askerid="'+ LJ.myAskers[i].friendList[k].friendId+'"]').addClass('team-'+i);		  
        				}
        			}
        		} 
        	}
        	

        },
        filterEvents: function(tags, locations){

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

	        	console.log('Events to display : ' + eventsToDisplay );

        		/* Transforme un Array de jQuery objects, en un jQuery-Array */
        		LJ.$eventsToDisplay = $(eventsToDisplay).map( function(){ return this.toArray(); });
	        	
       		$('.eventItemWrap, #noEvents ').addClass('filtered');
       		LJ.$eventsToDisplay.removeClass('filtered');

       		if( LJ.$eventsToDisplay.length == 0){
       			LJ.fn.toastMsg( 'Aucun évènement trouvés', 'info');
       			$('#noEvents').removeClass('filtered').addClass('none')	
       						  .velocity('transition.slideLeftIn', { duration: 700 });

       		}else{
       			LJ.fn.toastMsg( LJ.$eventsToDisplay.length + ' events matched!', 'info');	
       		}

        },
        requestIn: function( eventId, hostId, user, requesterId ){

            csl("requesting IN with id : "+ eventId);

            LJ.params.socket.emit("request participation in", {

                            userInfos: user,
                            hostId: hostId,
                            eventId: eventId,
                            requesterId: requesterId

            });

        },
        requestOut: function( eventId, hostId, user, requesterId ){  

        	csl("requesting OUT with id : "+ eventId);

        	LJ.params.socket.emit("request participation out", {

        					userInfos: LJ.user,
        					hostId: hostId,
        					eventId: eventId,
        					requesterId: requesterId
        	});

        },
        sendChat: function( submitInput ){

        	var textInput = submitInput.siblings('input[type="text"]');
        	var msg = textInput.val();

        		textInput.val('');

        		var askerId = submitInput.parents('.a-item').data('askerid')
        				 || LJ.user._id;
        		var hostId  = submitInput.parents('.eventItemWrap').data('hostid')
        				 || LJ.user._id;
        		var eventId = submitInput.parents('.eventItemWrap').data('eventid')
        		         || LJ.user.hostedEventId;

        		csl('Sending chat with id : '+eventId + ' and '+ hostId + ' and '+askerId);

        		LJ.params.socket.emit('send message',
        		{
        			msg: msg,
        			eventId: eventId,
        			hostId: hostId,
        			askerId: askerId,
        			senderId: LJ.user._id  /* = hostId ou askerId, selon le cas, utile pour le display only*/
        		});
        },
        displayAddFriendToPartyButton: function(){

        	var $friendListWrap = $('#friendListWrap'),
        		$eventWrap = $friendListWrap.parents('.eventItemWrap'),
        		$askedInWrap = $friendListWrap.parents('.eventItemWrap').find('.askedInWrap');

        	$friendListWrap.find('.f-item').each( function(i, el){

        		var $friend = $(el),
        			friendId = $friend.data('userid');

        		var myFriend = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

	        	if( $askedInWrap.find('img[data-askerid="'+friendId+'"]').length == 1 )
	        	{
	        		var inEvent = true;
	        	}
	        	else
	        	{
	        		var inEvent = false;
	        	}

	        	/* On sait que le friend est déjà dans la liste. On update addFriendButton */
	        	$friend.find('button').remove();
	        	$friend.append( LJ.fn.renderAddFriendToPartyButton( myFriend , inEvent ) );

        	});


        },
        buildChatId: function( eventId, hostId, userId ){

        	return eventId + '_' + hostId + '-' + userId;

        },
        addChatLine: function(data){

        	csl('Adding chatline');
            var cha;
            data.senderId === LJ.user._id ?  cha = 'cha-user' : cha = 'cha-other';

            var chatLineHtml = '<div class="chatLine none">'
								+'<div class="cha '+cha+'">'+data.msg+'</div>'
        						+'</div>';

       		var chatId = data.chatId;
       		
        	var $chatLineWrap = $('.chatWrap[data-chatid="'+chatId+'"]').find('.chatLineWrap');
        		
        		if( !$chatLineWrap.hasClass('jspScrollable') )
        		{
        			csl('Turning chatLineWrap scrollable');
        			$chatLineWrap.jScrollPane();
        			LJ.state.jspAPI[chatId] =  $chatLineWrap.data('jsp');
        		}

        		$chatLineWrap.find('.jspPane').append( chatLineHtml );
        		$chatLineWrap.find('.chatLine:last-child')
        					  .velocity("fadeIn", {
        					  	duration: 500,
        					  	complete: function(){
        					  	}
        					  });

        		sleep(30, function(){
        							csl('Refreshing jsp API');
        							LJ.state.jspAPI[chatId].reinitialise();
        							LJ.state.jspAPI[chatId].scrollToBottom(); 
        						  });

        },
        initRooms: function( id ){

        	LJ.params.socket.emit( 'load rooms' , id );

        },
        cancelEvent: function( eventId, hostId ){

        	csl('canceling event : '+eventId+'  with hostId : '+hostId);
        	LJ.params.socket.emit( 'cancel event', { eventId: eventId, hostId: hostId });
        	$( '#cancelEvent' ).addClass( 'pending' );

        },
        suspendEvent: function( eventId, hostId ){

        	LJ.params.socket.emit( 'suspend event', { eventId: eventId, hostId: hostId });
        	$( '#suspendEvent' ).addClass( 'pending' );

        },
        showLoaders: function(){

        	$( '.loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

        },
        hideLoaders: function(){

            $( '.loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

        },
        toggleOverlay: function(type, html, speed){

    			var $overlay = $('.overlay-'+type ),
					$overlayMsgWrap = $('.overlayMsgWrap');

        	var html = html || '';

				$overlayMsgWrap.html( html );

			if( $overlay.hasClass('active') )
			{
				$overlay.removeClass('active')
						.velocity('fadeOut', { 
						duration: speed || 700,
						complete: function(){
							$overlayMsgWrap.html('')
							$overlay.find('.largeThumb').remove();
						} 
					});
			}
			else
			{
				$overlay.addClass('active')
						.velocity('fadeIn', { 
						duration: 700
					 });
			}

		}

}); //end LJ

$('document').ready(function(){

		//penser à remplacer ça par une récursion sur un setTimeout toutes les 300ms
		sleep(1000, function(){

		/*
		  FB.init({

				    appId      : '1509405206012202',
				    xfbml      : true,  // parse social plugins on this page
				    version    : 'v2.1' // use version 2.1

				  });
		*/

		csl('Application ready');
		LJ.fn.init();

	});


});