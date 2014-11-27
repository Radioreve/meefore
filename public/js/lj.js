
function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	console.log(msg);
};

//Penser à update le state après une img upload

window.LJ = {
	params:{
		socket    :  null,
		domain	  : "http://87.247.105.70:1337"
	},
	ui:{
		artificialDelay: 600,
		displayIn:  { opacity: [1, 0], translateX: [-8, 0]   },
		displayOut: { opacity: [0, 1], translateX: [10, 0]   }
	},
	cloudinary:{
		uploadParams: { cloud_name:"radioreve", api_key:"835413516756943" },
		/* Image de profile */
		displayParamsProfile: { cloud_name: "radioreve", width: 150, height: 150, crop: 'fill', gravity: 'face' },
		/* Image de l'host dans un event */
		displayParamsEventHost: { cloud_name :"radioreve", width: 80, height: 80, crop: 'fill', gravity: 'face', radius: '2' },
        /* Image des askers dans la vue event */
        displayParamsEventAsker: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'5' },
		/* Image du user dans le header */
		displayParamsHeaderUser: { cloud_name: "radioreve",width: 50,height: 50, crop: 'fill', gravity: 'face', radius: 'max' },
		/* Image zoom lorsqu'on clique sur une photo*/
		displayParamsOverlayUser: { cloud_name: "radioreve", width: 280, height: 280, crop: 'fill', gravity: 'face', radius: 'max' },
        /* Image principale des askers dans vue managemnt */
        displayParamsAskerMain: { cloud_name: "radioreve", width:120, height:120, crop:'fill', gravity:'face', radius:3 },
		/* Image secondaire des askers dans vue management */
        displayParamsAskerThumb: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:7 },
        loader_id: "ajax-loader-black_frpjdb",
        displayParamsLoader:{ cloud_name :"radioreve", html: { 'class': 'loader'} },
        placeholder_id: "placeholder_jmr9zq",
        displayParamsPlaceholder:{ cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width:150 }
	},
	/* To be dynamically filled on login */
	user:{},
	myEvents: [],
    myAskers: [],
    selectedTags: [],
    selectedLocations: [],
    $eventsToDisplay: $(),
	state: {
		fetchingEvents: false,
        fetchingAskers: false,
		animatingContent: false,
		animatingChat: false,
		toastAdded: false,
		jspAPI:{}
	},
	tpl:{
		toastInfo : '<div class="toastInfo" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		toastError: '<div class="toastError" class="none"><span class="toast-icon icon icon-cancel">'
					+'</span><span class="toastMsg"></span></div>',
		toastSuccess: '<div class="toastSuccess" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		noResult: '<center id="noEvents" class="filtered"><h3>Aucun évènement pour ce choix de filtre </h3></center>'
	},
	tagList: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrapp'),
		$signupWrap			  : $('#signupWrapp'),
		$resetWrap   	      : $('#resetWrapp'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventsWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$resetBtn			  : $('#reset'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$validateBtn          : $('#validate'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout'),

	fn: {

		init: function(){

				/*Bind UI action with the proper handler */
				LJ.fn.handleDomEvents();

				/*Bind UI Animating moves */
				LJ.fn.initAnimations();

				/* Gif loader and placeholder */
				LJ.fn.initStaticImages();

				/* Global UI Settings ehanced UX*/
				LJ.fn.initEhancements();

				/* Init Facebook state */
				LJ.fn.initFacebookState();

		},
		initFacebookState: function(){

				  FB.init({

				    appId      : '1509405206012202',
				    xfbml      : true,  
				    version    : 'v2.0' 

				  });

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

				$('.profileInput').on('change keypress',function(){
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
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_FrontPage();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Events();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Management();
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
					duration: 300,
					complete: function(){
						LJ.$signupWrap.velocity('transition.slideLeftIn', { display:'inline-block'});
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

			['#contact', '#create', '#profile', '#events', '#management', '#settings'].forEach(function(menuItem){

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
				$('#profileWrap .drink.selected').removeClass('selected');
				$(this).addClass('selected');
			});

		},
		handleDomEvents_Events: function(){

			LJ.$body.on('click','.themeBtnToggleHost', function(){
				$('#management').click();
			});

			LJ.$body.on('click', '.chatIconWrap', function(){

				LJ.fn.toggleChatWrapEvents( $( this ) );

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

             	if( $filtersWrap.css('opacity') != 0 ){
             		
             		$filtersWrap.velocity('transition.slideUpOut', { duration: 400 });
             		$(this).find('span').text('Afficher');

             	}else{

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
		handleDomEvents_Management: function(){

			$('#manageEventsWrap i.icon').click(function(){

				if( LJ.state.animatingContent ) return;
				LJ.state.animatingContent = true;

				var $currentItem = $('.a-item.active');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem );

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

       		  LJ.$askersListWrap.on('click','.askerPicture',function(){

       		  	if( $(this).parents('.a-row').data('askerid') == 'placeholder' ) return;

            	var $that = $(this);
            	if(! $that.hasClass('moving') ){
            		$that.addClass('moving');
            		LJ.fn.toggleChatWrapAskers( $that );     
            	
            		sleep( LJ.ui.artificialDelay, function(){
            			$that.removeClass('moving');
            		});
            	}
            });	

       		LJ.$body.on('click', '.a-row', function(){

       			if( $(this).data('askerid') == 'placeholder') return;
       			var $aBody = $(this).find('.askerBody'),
       				askerId = $(this).data('askerid');

       			if( $aBody.hasClass('active') ) return;

       			$('.askerBody').removeClass('active');
       			$aBody.addClass('active');

       			$('.a-details.active').velocity('transition.fadeOut',
       				{ 
       					duration: 200,
       					complete: function(){
       						$('.a-details[data-askerid="'+askerId+'"]').addClass('active')
       															   	   .velocity('transition.fadeIn', { duration: 300 });
       					}
       				});

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
				favoriteDrink = $('.drink.selected').text();

			if( LJ.user.status == 'new' ){ LJ.user.status = 'idle' }

			var profile = {

				_id			  : _id,
				age 		  : age,
				name 		  : name,
				description   : description,
				favoriteDrink : favoriteDrink,
				status        : LJ.user.status,

			};
				LJ.params.socket.emit('update profile', profile);
				csl('Emetting update profile');
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

			 $('#thumbWrap').velocity('transition.slideUpIn');

			 $('.menu-item-active').removeClass('menu-item-active');
			 $('#profile').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

             $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('none');}})
			 LJ.fn.displayContent(LJ.$profileWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut' });

		},
		displayViewAsIdle: function(){

            $('#thumbWrap').velocity('transition.slideUpIn');

            $('.menu-item-active').removeClass('menu-item-active');
            $('#events').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            $('#landingWrap, #signupWrapp').velocity({ opacity: [0, 1]}, { complete: function(){ $('#landingWrap').addClass('none');}})
            LJ.fn.displayContent(LJ.$eventsWrap, { myWayIn: 'transition.slideDownIn', myWayOut: 'transition.slideUpOut'  });

		},
		displayViewAsHost: function(){

			$('#thumbWrap').velocity('transition.slideUpIn');

			$('.menu-item-active').removeClass('menu-item-active');
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

				LJ.$thumbWrap.prepend( imgTag );

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
		toggleChatWrapAskers: function( askerPictureTag ){

			var $aRow      = askerPictureTag.parents('.a-row'),
			    $chatWrap  = $aRow.find('.chatWrap'),
        	    $previous  = $('.a-active'),
        		$surfacing = $('.surfacing');

        	var chatId = $chatWrap.data('id');

        	 if( !$surfacing )
			     {
			     	$aRow.addClass('surfacing')
			     			  .find('.chatWrap')
			     			  .velocity('transition.slideLeftIn', { duration: 400 });
			     	return;
			     }

		     if( $surfacing.is( $aRow ))
		     {
		     	$aRow.removeClass('surfacing')
		     			  .find('.chatWrap')
		     			  .velocity('transition.slideLeftOut', { duration: 300 });
		     	return;
		     }

    		$surfacing.removeClass('surfacing')
    				  .find('.chatWrap')
    				  .velocity('transition.slideLeftOut', { duration: 300 });

    		$aRow.addClass('surfacing')
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
			     			  .velocity('transition.slideDownOut', { duration: 300 });
			     	return;
			     }

			    $('.chatIconWrap').removeClass('active');
			    chatIconWrap.addClass('active');

        		$surfacing.removeClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideDownOut', { duration: 300 });

        		$eventWrap.addClass('surfacing')
        				  .find('.chatWrap')
        				  .velocity('transition.slideUpIn', { duration: 400 });

        		sleep(30, function(){ 
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
            LJ.tagList = settings.tagList;

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

			if( $( toastStatus ).length == 0 ){
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
				var toast = $( toastStatus );
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

			$('.upload_form').append( upload_tag );

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

			if( $('.a-item').length == ( 0 || 1 ) ){
				$arrLeft.addClass('none');
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').last() ) ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').first() ) ){
				$arrLeft.addClass('none');
				return;
			}



		},
		displayAskerItem: function( current, next ){

			var currentIndex = current.index(),
				nextIndex    = next.index();

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
		renderEvents: function( arr, max ){

				var html =''; 
				    max = max || arr.length;

				for( var i=0; i < max; i++ ){

					html += LJ.fn.renderEvent( arr[i] ); 

				}
				return html;

		},
        renderAskersMain: function(arr,max){

                var html =''; 
                var arr = LJ.myAskers;
                var max = max || arr.length;

                for( var i=0; i < max ; i++ ){ 
                if( i < max )
                {	
                	if(i == 0){
                		html += LJ.fn.renderAskerMain( arr[i], 'active' );
                	}else
                	{
                	html += LJ.fn.renderAskerMain( arr[i] ); 
                	}
                }

                }
                return html;

        },
        renderChatWrap: function( chatId ){

        	return '<div class="chatWrap chat-asker none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Can I come with my friends ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

        },
        renderEventTags: function( tags ){

        	var eventTags = '<div class="tag-row">',
				L = tags.length;

				for ( var i=0; i<L; i++ )
				{
					eventTags += '<div class="tag tag-'+tags[i]+'">' + LJ.fn.matchTagName( tags[i] ) + '</div>';
				}
				eventTags +='</div>';

				return eventTags;

        },
        renderEventButton: function( eventId, hostId ){

        	var button = '<div class="askInWrap"><button class=" ';
			
			if( hostId == LJ.user._id )
			{
				button += 'themeBtnToggle themeBtnToggleHost"> Management'	
			}
			else
			{
				button += 'askIn themeBtnToggle';
				LJ.user.eventsAskedList.indexOf( eventId ) > -1 ? button += ' asked"> En attente' : button += ' idle">Je veux y aller';
			}
				button += '</button><div class="chatIconWrap"><i class="icon icon-chat"/></div></div>';

				return button;
        },
        renderHostImg: function( hostImgId, hostImgVersion ){

        	var d = LJ.cloudinary.displayParamsEventHost;
				d.version = hostImgVersion;


			var imgTag = $.cloudinary.image( hostImgId, d )
						  .addClass('zoomable')
						  .attr('data-imgid', hostImgId )
						  .attr('data-imgversion', hostImgVersion );

			var imgTagHTML = imgTag.prop('outerHTML');

			return imgTagHTML
        },
        renderAskerInEvent: function( imgId, o){

        	var $img = $.cloudinary.image( imgId, LJ.cloudinary.displayParamsEventAsker );
        		$img.attr('data-imgid', imgId)
        			.addClass('zoomable');
 
        	if( o ){ 
	        	if( o.dataList.length > 0 )
	        	{
	        		for( var i = 0; i < o.dataList.length ; i++ ){
	        			$img.attr('data-'+o.dataList[i].dataName, o.dataList[i].dataValue );
	        		}
	        	}
        		
        	}

        	return $img;

        },
        renderAskersInEvent: function( askersList, maxGuest ){

        	var L = askersList.length,
        	    html='';
        	
        	for ( i = 0; i < maxGuest ; i++ )
        	{ 
        		var o = { classList: ['hello'], dataList: [] };
	        	var d = LJ.cloudinary.displayParamsEventAsker;

        		if( i < L )
        		{
	        		var imgId        = askersList[i].imgId;
	        			d.imgVersion = askersList[i].imgVersion;
	        			o.classList = ['askedInThumb'];
	        			o.dataList   = [ { dataName: 'askerid', dataValue:  askersList[i].id } ];

        		}else //On affiche via placeholder le nb de places restantes.
        		{
        			var imgId = LJ.cloudinary.placeholder_id;
        				o.classList = ['askedInRemaining'];
        		}

        		html += LJ.fn.renderAskerInEvent( imgId, o ).prop('outerHTML');
        	}
        		
        		return html
        },
		renderEvent: function( e ){

			var eventId        = e._id,
				hostId         = e.hostId,
				hostImgId      = e.hostImgId,
				hostImgVersion = e.hostImgVersion,
				tags           = e.tags,
				chatId 		   = LJ.fn.buildChatId( eventId, hostId, LJ.user._id );

			var imgTagHTML   = LJ.fn.renderHostImg( hostImgId, hostImgVersion ),
			    button       = LJ.fn.renderEventButton( e._id, hostId ),
				eventTags    = LJ.fn.renderEventTags( tags ),
            	chatWrap     = LJ.fn.renderChatWrap( chatId ),
            	askersThumbs = LJ.fn.renderAskersInEvent( e.askersList, e.maxGuest );

			var html = '<div class="eventItemWrap" '
						+ 'data-eventid="'+e._id+'" '
						+ 'data-hostid="'+e.hostId+'" '
						+ 'data-location="'+e.location+'"'
						+ 'data-eventstate="'+e.state+'">'
						+'<div class="eventItemLayer">'
						+ '<div class="headWrap">' 
						   + '<div class="e-image left">'+ imgTagHTML +'</div>'
						     + '<div class="e-hour e-weak">'+ LJ.fn.matchDateHHMM( e.beginsAt ) +'</div>'
						   + '<div class="e-guests right">'
						     + '<span class="guestsWrap">'
						       + '<i class="icon icon-users"></i>'
						       + '<span class="nbAskers">'+ e.askersList.length +'</span>/'
						       + '<span class="nbAskersMax">'+ e.maxGuest +'</span>'
						     + '</span>'
						   + '</div>'
						+ '</div>'
						+ '<div class="askedInWrap">'
						+ askersThumbs
						+ '</div>'
						+ '<div class="bodyWrap">'
							+ '<div class="e-location">'
							  + '<span>'+ LJ.fn.matchLocation( e.location ) +'</span>'
							+ '</div>'
							   + '<div class="e-name">'+ e.name +' </div>'
							   + '<div class="e-desc">' + e.description + '</div>'
							   + eventTags
							+ '</div>'
						+ button
                        + chatWrap
						+ '</div></div>';
			return html;
		},
		matchTagName: function(tagClass){

			if( tagClass == 'apparte' ) return 'appart\'';
			if( tagClass == 'apero' ) return 'apéro';
			if( tagClass == 'nuitblanche' ) return 'nuit blanche';
			if( tagClass == 'firsttime' ) return 'première fois';

			return tagClass
		},
		matchLocation: function( loc ){

			if( loc == 1){
				return '1er';
			}
			
				return loc + 'ème';
			
		},
		matchDateHHMM: function(d){

	    	 var dS = '';

    	     if( d.getHours() == 0){
    	     	dS = '0';
    	     }
	       	 dS += d.getHours() + "h";
     	     if( d.getMinutes() < 10){
     	     	dS+='0';
     	     }
             dS += d.getMinutes();
   		     return dS;
		},
		renderAskerPlaceholder: function(){

			var asker = {

				id: "placeholder",
				imgId: LJ.cloudinary.placeholder_id,
				name:"White",
				age: 25,
				description:""

			}

			return LJ.fn.renderAskerMain( asker );

		},
        renderAskerMain: function( a, className ){

        	className = className || '';

            var d = LJ.cloudinary.displayParamsAskerMain;
            	d.version = a.imgVersion; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image( a.imgId, d );
            	imgTag.addClass('zoomable')
            		  .attr('data-imgid', a.imgId)
            		  .attr('data-imgversion', a.imgVersion);

            var imgTagHTML = imgTag.prop('outerHTML');

            var chatId = LJ.fn.buildChatId( LJ.user.hostedEventId, LJ.user._id, a.id );

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Are you alone ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

            var html =  '<div class="a-item '+className+'" data-askerid="'+a.id+'">'
                           +'<div class="a-picture">'
                             + imgTagHTML
                           +'</div>'
	                           +'<div class="a-body">'
	                             +'<div class="a-name"><span class="label">Name</span>'+a.name+'</div>'
	                             +'<div class="a-age"><span class="label">Age</span>'+a.age+' ans'+'</div>'
	                             +'<div class="a-desc"><span class="label">Style</span><div>'+a.description+'</div></div>'
	                             +'<div class="a-drink"><span class="label">Drink</span><div class="drink selected">'+a.favoriteDrink+'</div></div>'
                           +'</div>'
	                             +'<div class="a-btn">'
	                                 +'<button class="themeBtn btn-accept"><i class="icon icon-ok"></i>Accepter</button>'
	                            	 +'<button class="themeBtn btn-refuse"><i class="icon icon-cancel"></i>Refuser</button>'
	                           +'</div>'
                        + chatWrap
                    +'</div>';

            return html;

        },
        renderAskerThumb: function( a ){

        	var d = LJ.cloudinary.displayParamsAskerThumb;
        		d.version = a.imgVersion;

        	var imgTag = $.cloudinary.image( a.imgId, d ).prop('outerHTML');

        	var html = '';

        	return html;

        },
        renderAskersThumbs: function(){

        	var L = LJ.myAskers.length,
        		  html = '';

        	for( var i = 0; i<L ; i++ ){
        		html += LJ.fn.renderAskerThumb( LJ.myAskers[i] );
        	}

        	return html;

        },
        renderOverlayUser: function( imgId, imgVersion ){

        	var d = LJ.cloudinary.displayParamsOverlayUser;
					d.version = imgVersion;

				var imgTag = $.cloudinary.image( imgId, d ).prop('outerHTML');

				return '<div class="largeThumb">'
					     + imgTag
					    +'</div>'

        },
        initLayout: function( settings ){

        	$( '.tags-wrap' ).append( LJ.fn.renderTagsFilters() );
        	$( '.locs-wrap' ).append( LJ.fn.renderLocsFilters() );
        	$( '#eventsListWrap' ).append( LJ.tpl.noResult );

        	var hour = (new Date).getHours();
        	if( hour < settings.eventsEndAt && hour >= settings.eventsFreezeAt ){
        		LJ.fn.displayViewAsFrozen();
        	}

        	sleep( LJ.ui.artificialDelay, function(){   

				switch( LJ.user.status ){
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
						LJ.fn.toastMsg("Welcome back " + LJ.user.name, 'info');
					}
				});

			});

        },
        renderTagsFilters: function(){

        	var html = '',
        		tagList = LJ.tagList,
        		L = tagList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="tag tag-' + tagList[i] + '">' + LJ.fn.matchTagName( tagList[i] ) + '</div>';
        		}
        	return html;

        },
        renderLocsFilters: function(){

        	var html = '',
        		locList = LJ.locList,
        		L = locList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="loc loc-' + locList[i] + '">' + locList[i] + '</div>';
        		}
        	return html;

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
							- On envoie une demande des derniers évènements
							- On envoie une demande pour rejoindre les chatrooms en cours
							- On active le pluggin d'upload de photos
							- On génère le HTML dynamique à partir de données server ( Tags... )
					*/
					LJ.fn.hideLoaders();

					var user 	 = data.user,
						settings = data.settings;

					LJ.fn.initAppSettings( data );
					LJ.fn.displayUserSettings();
					LJ.fn.fetchEvents();
					LJ.fn.initRooms( LJ.user._id );					
					LJ.fn.initCloudinary( user.cloudTag );
					LJ.fn.initLayout( settings );

				});

				LJ.params.socket.on('update profile success', function(data){

					csl('update profile success received');
					sleep(LJ.ui.artificialDelay,function(){
						LJ.fn.updateClientSettings(data);
						$('#thumbName').text(data.name);
						LJ.fn.toastMsg("Vos informations ont été modifiées", 'info');
						$('.modified').removeClass('modified');
						LJ.fn.hideLoaders();
						$('.themeBtn').removeClass('validating-btn');
						$('.themeBtn').removeClass('validating-btn');
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

					var hostId  = data.hostId,
						userId  = data.userId,
						eventId = data.eventId,
						asker   = data.asker;						

					sleep( LJ.ui.artificialDelay, function(){

						if( LJ.user._id === data.userId )
						{

							LJ.fn.hideLoaders();
							LJ.fn.toastMsg('Your request has been sent', 'info');
							$('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
										.siblings('.chatIconWrap').velocity('transition.slideLeftIn', { duration: 400, display:'inline-block'});

						}else
						{
							var askerMainHTML  = LJ.fn.renderAskerMain( data.asker ),
								askerThumbHTML = LJ.fn.renderAskerThumb ( data.asker );

							    $( askerHTML ).appendTo( $('#askersRows') )
							    			.hide()
							    			.velocity("transition.slideLeftIn",{
							    				duration:300
							    			});
							    $( askerDetailsHTML ).appendTo( $('#askersDetailsWrap') )
							    					 .hide();
							    					 

							 LJ.myAskers.push( asker );
						}

						var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
							$nbAskers.text( parseInt( $nbAskers.text() ) + 1 );

						var d = LJ.cloudinary.displayParamsEventAsker;
							d.version = asker.imgVersion;

						var $askerImg = LJ.fn.renderAskerInEvent( asker.imgId, { dataList: [{ dataName: 'askerid', dataValue: asker.id }]});
						var $askedInWrap = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap');
							$askedInWrap.prepend( $askerImg );
							$askedInWrap.find('img').last().remove();

					});

				});

				LJ.params.socket.on('request participation out success', function(data){

						var userId  = data.userId,
							hostId  = data.hostId,
							eventId = data.eventId,
							asker   = data.asker;

						var chatId = LJ.fn.buildChatId( eventId, hostId, userId ),
						    $aRow = LJ.$askersListWrap.find('.askerInfos[data-userid="'+userId+'"]').parents('.a-row'),
						    $chatWrapAsHost = LJ.$askersListWrap.find('.chatWrap[data-chatid="'+chatId+'"]'),
						    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');

						_.remove( LJ.myAskers, function(asker){
							return asker.id === data.userId;
						});

						sleep( LJ.ui.artificialDelay, function(){

							LJ.fn.hideLoaders();
							LJ.fn.toggleChatWrapEvents( $chatWrapAsUser.find('.chatIconWrap') );

							$('.asking').removeClass('asked').removeClass('asking').addClass('idle').text('Je veux y aller!')
										.siblings('.chatIconWrap').velocity('transition.slideLeftOut', { duration: 400, display:'inline-block'});

							if( hostId === LJ.user._id )
							{
								$aRow.velocity("transition.slideLeftOut", { duration: 200 });
								$('.a-row').first().click();
							}
							else
							{
								LJ.fn.toastMsg('Vous avez été désinscris de la liste', 'info');
							}	

							var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
								$nbAskers.text( parseInt( $nbAskers.text() ) - 1 );

							$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																		   .append( LJ.tpl.$placeholderImg.clone() )
																		   .find('img[data-askerid="'+asker.id+'"]')
																		   .remove();
						});
	
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

                LJ.params.socket.on('fetch askers success', function(askersList){

                    LJ.state.fetchingAskers = false;
                    var L = askersList.length;

                    for( var i=0; i<L; i++) {
                        LJ.myAskers[i] = askersList[i];
                    }

                   LJ.fn.displayAskers();

                });

                LJ.params.socket.on('receive message', function(data){

                	LJ.fn.addChatLine(data);

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

            LJ.$eventsListWrap.append( LJ.fn.renderEvents( LJ.myEvents ) );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').append( LJ.fn.renderAskersThumbs() );
            LJ.fn.refreshArrowDisplay();

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
        requestIn: function( askInBtn ){

            var eventId = askInBtn.parents('.eventItemWrap').data('eventid');
            var hostId = askInBtn.parents('.eventItemWrap').data('hostid');

            csl("requesting IN with id : "+eventId);
            LJ.params.socket.emit("request participation in", {
                            userInfos: LJ.user,
                            hostId: hostId,
                            eventId: eventId});

        },
        requestOut: function( askInBtn ){

        	var eventId = askInBtn.parents('.eventItemWrap').data('eventid');
        	var hostId = askInBtn.parents('.eventItemWrap').data('hostid');    

        	csl("requesting OUT with id : "+eventId);
        	LJ.params.socket.emit("request participation out", {
        					userInfos: LJ.user,
        					hostId: hostId,
        					eventId: eventId
        	});

        },
        sendChat: function( submitInput ){

        	var textInput = submitInput.siblings('input[type="text"]');
        	var msg = textInput.val();

        		textInput.val('');

        		var askerId = submitInput.parents('.a-row').find('.askerInfos').data('userid')
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
        			senderId: LJ.user._id  /* = hostId ou askerId, selon le cas*/
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

    }//end fn

}//end LJ

$('document').ready(function(){


		  FB.init({
				    appId      : '1509405206012202',
				    xfbml      : true,  // parse social plugins on this page
				    version    : 'v2.1' // use version 2.1
				  });
	
		csl('Application ready');
		LJ.fn.init();
});