
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
		artificialDelay: 600
	},
	cloudinary:{
		uploadParams: {
			cloud_name:"radioreve",
			api_key:"835413516756943"
		},
		displayParamsProfile: {
				cloud_name :"radioreve",
				width:150,
				height:150,
			//	effect:'grayscale',
				crop:'fill',
				gravity:'face'
		},
		displayParamsEvent: {
				cloud_name :"radioreve",
				width:80,
				height:80,
			//	effect:'sepia',
				crop:'fill',
				gravity:'face',
				radius:'15'
		},
		displayParamsMainThumb: {
				cloud_name :"radioreve",
				width:50,
				height:50,
			//	effect:'grayscale',
				crop:'fill',
				gravity:'face',
				radius:'max'
		},
        displayParamsAsker:{
                cloud_name :"radioreve",
                width:45,
                height:45,
                crop:'fill',
                gravity:'face',
            //   effect:'grayscale',
                radius:7
        }
	},
	user:{  
		_id:'',
		name:'',
		email:'',
		age:'',
		location:1,
		description:'',
		imgId:'',
		imgVersion:'',
		status:'',
		hostedEventId:'',
		eventsAskedList:[],
		newsletter:false
	},
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
		noResult: '<center id="noEvents" class="filtered"> Aucun évènement pour ce choix de filtre </center>'
	},
	tagList: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrap'),
		$signupWrap			  : $('#signupWrap'),
		$resetWrap   	      : $('#resetWrap'),
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
		$menuBtn		      : $('.menuBtn'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout'),

	fn: {
		init: function(){

				/*Bind any UI action with the proper handler */
				LJ.fn.handleDomEvents();

				/*Bind UI Animating moves */
				LJ.fn.initAnimations();

				/*Global UI Settings ehanced UX*/
				LJ.fn.initEhancements();

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
		initEhancements: function(){
			(function bindEnterKey(){ //Petite IIEF pour le phun

				$('#loginWrap').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#login').click();
					}
				});

				$('#signupWrap').on('keypress','input.input-field',function(e){
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
					csl('Hello');
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

			LJ.$menuBtn.click(function(){
				LJ.fn.toggleMenu();
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

			LJ.$validateBtn.click( LJ.fn.updateProfile );

			LJ.$body.on('click', '.askIn', function(){

				var $self = $(this);

				if( $self.hasClass('open') ){

					if( ! $self.hasClass('asked') )
					{
						$self.addClass('asked');
						$self.text('En attente');
						LJ.fn.requestIn( $self ); 
					}

					else
					{
						var $eHead = $self.parents('.eventItemWrap').find('.e-head');
						if( $eHead.hasClass('e-active') ) $eHead.click(); 
						$self.removeClass('asked');
						$self.text('Je veux y aller');
						LJ.fn.requestOut( $self );
					}
				}
				else
				{
					LJ.fn.toastMsg('Event is currently suspended', 'info');
				}

			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){
				$('#management').click();
			});

			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});

			$('#submitSettingsBtn').click(function(){
				LJ.fn.updateSettings();
			});

			LJ.$logout.click(function(){
				location.reload();
			});

            LJ.$askersListWrap.on('click','.askerPicture',function(){
            	var $that = $(this);
            	if(! $that.hasClass('moving') ){
            		$that.addClass('moving');
            		LJ.fn.toggleChatWrapAskers($that);     
            	
            		sleep(600, function(){
            			$that.removeClass('moving');
            		});
            	}
            });

            LJ.$eventsListWrap.on('click', '.e-head', function(){
                LJ.fn.toggleChatWrapEvents($(this));
            });

            $('body').on('click', '.close-chat', function(){
            	var $chatWrap = $(this).parents('.chatWrap');
                    LJ.fn.hideChat($chatWrap);
            });

            LJ.$body.on('click','.chatInputWrap input[type="submit"]', function(e){
            	e.preventDefault();
            	e.stopPropagation();
            	LJ.fn.sendChat($(this));
            });
			
            $('.overlay').click(function(){
            	$(this).velocity("fadeOut", { duration: 400 });
            });

            $('#resetFilters').click( function() {
            	LJ.$eventsWrap.find('.selected').removeClass('selected');
            	$('#activateFilters').click();
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
				data : {
					email    : credentials.email,
					password : credentials.password
				},
				success: function(data){
					data.email    = credentials.email;
					data.password = credentials.password;
					LJ.fn.handleSuccessSignup(data);
				},
				error : function(data){
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
				beforeSend:function(){
					LJ.fn.handleBeforeSendLogin();
				},
				success:function(data){
					LJ.fn.handleSuccessLogin(data);
				},
				error:function(data){
					LJ.fn.handleFailedLogin(data);
				}
			});
		},
		resetPassword: function(){

			var email = $('#pwResetInput').val().trim();

			LJ.fn.showLoaders();
			$('input.input-field').addClass('validating');
			$('#pw_remember').velocity('transition.slideRightOut', { duration: 300 });

			$.ajax({
				method:'POST',
				url:'/reset',
				dataType:'json',
				data : {
					email: email
				},
				success: function(data){
					LJ.fn.handleSuccessReset(data);
				},
				error : function(data){
					LJ.fn.handleFailedReset(data);
				}
			});

		},
		updateProfile: function(){
			var _id 		 = LJ.user._id,
				age   		 = $('#age').val(),
				name  		 = $('#name').val(),
				description  = $('#description').val();

			if(LJ.user.status == 'new'){LJ.user.status = 'idle'}

			var profile = {
				_id			: _id,
				age 		: age,
				name 		: name,
				description : description,
				status      : LJ.user.status
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

			LJ.params.socket.emit('update settings', o);

		},
		handleBeforeSendLogin: function(){

			LJ.$loginBtn.val('Loading');
			$('#bcm_member').velocity('transition.slideRightOut', { duration: 500 });
			$('#lost_pw').velocity('transition.slideLeftOut', { duration: 500 });
			$('input.input-field').addClass('validating');

		},
		handleSuccessLogin: function( user ){

			LJ.user._id = user._id; /* Nécessaire pour aller chercher toutes les infos, mais par socket.*/
			LJ.fn.initSocketConnection( user.token );

		},
		handleFailedLogin: function(data){

			data = JSON.parse(data.responseText);
			sleep(LJ.ui.artificialDelay,function(){
				LJ.fn.toastMsg( data.msg, 'error');
				$('input.input-field').removeClass('validating');
				$('#bcm_member').velocity('transition.slideRightIn', { duration: 400 });
				$('#lost_pw').velocity('transition.slideLeftIn', { duration: 400 });
				LJ.fn.hideLoaders();
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

				$('input.input-field').removeClass('validating');
				LJ.fn.toastMsg( errorMsg, 'error');
				$('#pw_remember').velocity('transition.slideRightIn', { duration: 400 });
				LJ.fn.hideLoaders();

			});

		},
		displayViewAsNew: function(){

			 $('#thumbWrap').velocity('transition.slideUpIn');

			 $('.menu-item-active').removeClass('menu-item-active');
			 $('#profile').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

			 LJ.fn.displayContent(LJ.$profileWrap, { myWayIn: 'transition.slideDownIn' });

		},
		displayViewAsIdle: function(){

            $('#thumbWrap').velocity('transition.slideUpIn');

            $('.menu-item-active').removeClass('menu-item-active');
            $('#events').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

            LJ.fn.displayContent(LJ.$eventsWrap, { myWayIn: 'transition.slideDownIn' });

		},
		displayViewAsHost: function(){

			$('#thumbWrap').velocity('transition.slideUpIn');

			$('#suspendEvent').text

			$('.menu-item-active').removeClass('menu-item-active');
			$('#management').addClass('menu-item-active')
            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

			LJ.fn.displayContent(LJ.$manageEventsWrap, { myWayIn: 'transition.slideDownIn' });

            LJ.fn.fetchAskers();
		},
		displayUserSettings: function(){

				/* Mise à jour des inputs, checkbox...*/
				$('#codebar').text( LJ.user._id );
				$('#currentEmail').val( LJ.user.email );
				$('#newsletter').prop( 'checked', LJ.user.newsletter );
				$('#name').val( LJ.user.name );
				$('#age').val( LJ.user.age );
				$('#description').val( LJ.user.description );
				LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );

				/* Update du thumb ( image et informations ) */
				var d = LJ.cloudinary.displayParamsMainThumb;
					d.version = LJ.user.imgVersion;

				var imgTag = $.cloudinary.image( LJ.user.imgId, d );
					imgTag.addClass('left');

				LJ.$thumbWrap.prepend( imgTag );

				/* Update de l'image de profile */
				LJ.fn.replaceMainImage( LJ.user.imgId,
								            LJ.user.imgVersion,
								            LJ.cloudinary.displayParamsProfile );
		},
		displayContent: function( content, options ){
			
				options = options || {};			
				var rev = $('.revealed');

				rev.velocity( options.myWayOut || "transition.slideRightOut", {
					duration: options.duration || 300,
					complete: function(){
						rev.removeClass('revealed');
						content.addClass('revealed')
							   .velocity( options.myWayIn || "transition.slideLeftIn", {
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			$('.overlay').velocity('fadeIn', { duration: 700 });
							   		}
							   	}
							   });
					}
				});

		},
		toggleMenu: function(){

			var that = LJ.$menuBtn;
				if(that.hasClass('menuBtnActive')){
					that.removeClass('menuBtnActive');
				}
				else{
					that.addClass('menuBtnActive');
				}
		},
		toggleChatWrapAskers: function(askerPictureTag){

			var $chatWrap = askerPictureTag.parents('.a-row').find('.chatWrap');
        	var $previous = $('.a-active');

        	var $eventWrap = $chatWrap.parents('.eventItemWrap');
        		$('.surfacing').removeClass('surfacing');
        		$eventWrap.addClass('surfacing');

			$previous.removeClass('a-active')
				 	 .parents('.a-row')
				  	 .find('.chatWrap')
				  	 .velocity('transition.slideLeftOut', { duration: 300 }); 

                if( !askerPictureTag.hasClass('a-active') && ! askerPictureTag.is($previous) ){
                    askerPictureTag.addClass('a-active');
                    LJ.fn.displayChat($chatWrap);


                }else{
                    askerPictureTag.removeClass('a-active');
                    LJ.fn.hideChat($chatWrap);
                }          
		},
		toggleChatWrapEvents: function(eHeadTag){

			 var $chatWrap = eHeadTag.siblings('.chatWrap');
			 var $previous = $('.e-active');

			 var $eventWrap = $chatWrap.parents('.eventItemWrap');
        		$('.surfacing').removeClass('surfacing');
        		$eventWrap.addClass('surfacing');

			 $previous.removeClass('e-active')
			 		  .siblings('.chatWrap')
			 		  .velocity('transition.slideLeftOut', { duration: 300 });

                if( eHeadTag.siblings('.askInWrap').find('button').hasClass('asked') ){
                    if( !eHeadTag.hasClass('e-active') && ! eHeadTag.is($previous) ){
                        eHeadTag.addClass('e-active');
                        LJ.fn.displayChat($chatWrap);
                    }
                    else{
                        eHeadTag.removeClass('e-active');
                    	LJ.fn.hideChat($chatWrap);
                    }
                }
                else{
                    LJ.fn.toastMsg('You need to ask participation to chat with the host', 'error');
                }
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
		replaceMainImage: function( id, version, d ){

		        d = d || LJ.cloudinary.displayParamsProfile;
		    	d.version = version;

			var previousImg = $('#pictureWrap').find('img'),
				newImg      = $.cloudinary.image(id, d); 
				newImg.addClass('mainPicture').hide();
				$('#pictureWrap').prepend(newImg);
 													
				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});

		},
		replaceThumbImage: function( id, version, d ){
			    d = d || LJ.cloudinary.displayParamsMainThumb;
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
			$('.upload_form').append( upload_tag );
			$('.cloudinary-fileupload')

				.bind('fileuploadprogress', function( e,data ){
  							$('.progress_bar').css('width', 
    						Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function(e, data){
  							//csl(JSON.stringify(data.result,0,4));

  							sleep( LJ.ui.artificialDelay,function(){
  								$('.progress_bar').fadeOut(function(){
  									$(this).css({width:"0%"}).fadeIn();
  									});

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
  								LJ.fn.replaceThumbImage( imgId, imgVersion, LJ.cloudinary.displayParamsMainThumb );
					
  							});

  				}).cloudinary_fileupload();
  				
		},
		renderEvents: function(arr,max){

				var html =''; 
				    max = max || arr.length;
				for(var i=0;i<max;i++){ html += LJ.fn.renderEvent(arr[i]); }
				return html;

		},
        renderAskers: function(arr,max){

                var html =''; 
                    max = max || arr.length;
                for(var i=0;i<max;i++){ html += LJ.fn.renderAsker(arr[i]); }
                return html;

        },
		renderEvent: function(e){

			var d = LJ.cloudinary.displayParamsEvent;
				d.version = e.hostImgVersion;

			var chatId = LJ.fn.buildChatId(e._id, e.hostId, LJ.user._id);
            var chatWrap = '<div class="chatWrap chat-asker none" data-chatid="'+chatId+'">'
                           +'<div class="close-chat hint--right" data-hint="close"><span class="icon icon-cancel"></span></div>'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Can I come with my friends ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';
			
			var imgTag = $.cloudinary.image(e.hostImgId, d).prop('outerHTML'); // Thanks StackoverFlow	

			var button = '<div class="askInWrap"><button class=" ';
			
			if( e.hostId == LJ.user._id ){
				button += 'right themeBtnToggle themeBtnToggleHost"> Management'	
			}else{
				button += 'askIn themeBtnToggle right ' + e.state;
				LJ.user.eventsAskedList.indexOf(e._id)>-1? button+=' asked "> En attente' : button+='">Je veux y aller';
			}
				button+="</button></div>";

			var eventTags = '<div class="tag-row">',
				L = e.tags.length;

				for ( var i=0; i<L; i++ ){
					eventTags += '<div class="tag tag-'+e.tags[i]+'">' + LJ.fn.matchTagName(e.tags[i]) + '</div>';
				}
				eventTags +='</div>';
		
			var html = '<div class="eventItemWrap" data-eventid="'+e._id+'" data-hostid="'+e.hostId+'" data-location="'+e.location+'">'
						+'<div class="e-head hint--left" data-hint="'+e.hostName+'">' + imgTag 
						+'</div>'
						+'<div class="e-hour e-weak">'+ LJ.fn.matchDateHHMM( e.beginsAt ) +'</div>'
						+'<div class="e-guests">'
						  +'<i class="icon icon-users"></i><span>'+ e.askersList.length +'</span>/'+'<span>'+ e.maxGuest +'</span>'
						+'</div>'
						+'<div class="e-location">'
						  +'<span>'+ LJ.fn.matchLocation( e.location ) +'</span>'
						+'</div>'
						+'<div class="e-body">'
						   +'<div class="e-name">'+ e.name +' </div>'
						   +'<div class="e-row">'
						   +'</div>'
						   +'<div class="e-row">'
						     +'<div class="e-description e-weak">'+ e.description +'</div>'
						   +'</div>'
						   + eventTags
						+'</div>'
						+ button
                        + chatWrap
						+'</div>';
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
        renderAsker: function(a){

            var d = LJ.cloudinary.displayParamsAsker;
            	d.version = a.imgVersion; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image( a.imgId, d ).prop('outerHTML');

            var chatId = LJ.fn.buildChatId( LJ.user.hostedEventId, LJ.user._id, a.id );

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                           +'<div class="close-chat hint--right" data-hint="close"><span class="icon icon-cancel"></span></div>'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="say something..">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

            var html =  '<div class="a-row">'
                        +'<div class="askerPicture">'
                          + imgTag
                        +'</div>'
                        +'<div class="askerInfos" data-userid="'+a.id+'">'
                          +'<div class="a-name">'+a.name+'</div>'
                          +'<div class="a-age">'+a.age+' ans'+'</div>'
                          +'<div class="a-desc">'+a.description+'</div>'
                        +'</div>'
                        + chatWrap
                    +'</div>';
            return html;
        },
        initLayout: function(){

        	$( '.tags-wrap' ).append( LJ.fn.renderTagsFilters() );
        	$( '.locs-wrap' ).append( LJ.fn.renderLocsFilters() );
        	$( '#eventsListWrap' ).append( LJ.tpl.noResult );

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
        displayChat: function(chatWrap){

        	var chatId = chatWrap.data('chatid');
            chatWrap.velocity("transition.slideLeftIn", {
            	duration: 450,
            	complete: function(){
            		if(LJ.state.jspAPI[chatId] != undefined){
	           		  LJ.state.jspAPI[chatId].reinitialise();
	        		  LJ.state.jspAPI[chatId].scrollToBottom();   
        			} 
            	}
            });
                            
        },
        hideChat: function(chatWrap){

           	chatWrap.velocity("transition.slideLeftOut", { duration: 300 });
        },
		initSocketEventListeners: function(){

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

				LJ.params.socket.on('connect', function(){

					csl('Client authenticated on the socket stream');
					var userId = LJ.user._id;

					/* Request all informations */
					LJ.params.socket.emit('fetch user and configuration', userId );

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

					var user = data.user;

					LJ.fn.initAppSettings( data );
					LJ.fn.displayUserSettings();
					LJ.fn.fetchEvents();
					LJ.fn.initRooms( LJ.user._id );					
					LJ.fn.initCloudinary( user.cloudTag );
					LJ.fn.initLayout();

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

				});

				LJ.params.socket.on('create event success', function( myEvent ){
					
					var eventId = myEvent._id,
						hostId = myEvent.hostId;
					
					myEvent.beginsAt = new Date ( myEvent.beginsAt );

					sleep( LJ.ui.artificialDelay , function(){ 

					/* Host Only */
					if( LJ.user._id === hostId ){
							LJ.user.status = 'hosting';
							LJ.user.hostedEventId = eventId;
							LJ.fn.toastMsg("Evènement créé avec succès !", 'info');
							LJ.fn.hideLoaders();
							$('.themeBtn').removeClass('validating-btn');
							LJ.$createEventWrap.find('input, #eventDescription').val('');
							LJ.$createEventWrap.find('.selected').removeClass('selected');

							$('#management').click();
					} 
					});

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

					LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );

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

					var hostId = data.hostId,
						userId = data.userId,
						asker  = data.asker;

					console.log('Requestion participation in received');
					if( LJ.user._id === data.userId ){
						LJ.fn.toastMsg('You may now chat with the host', 'info');
					}else{

						var askerHTML = LJ.fn.renderAsker(data.asker);

						    $( askerHTML ).appendTo(LJ.$askersListWrap)
						    			.hide()
						    			.velocity("transition.slideLeftIn",{
						    				duration:300
						    			});

						 LJ.myAskers.push( asker );
						}

				});

				LJ.params.socket.on('request participation out success', function(data){

						var userId = data.userId,
							hostId = data.hostId,
							eventId = data.eventId;

						var chatId = LJ.fn.buildChatId(eventId, hostId, userId);
						var $aRow = LJ.$askersListWrap.find('.askerInfos[data-userid="'+userId+'"]').parents('.a-row');
						var $chatWrapAsHost = LJ.$askersListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');
						var $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');

						_.remove( LJ.myAskers, function(asker){
							return asker.id === data.userId;
						});

						hostId === LJ.user._id ? $aRow.velocity("transition.slideLeftOut", { duration: 200 }) : LJ.fn.toastMsg('Vous avez été désinscris de la liste', 'info');

				});

				LJ.params.socket.on('update settings success', function(data){

					sleep( 600, function(){
						LJ.fn.toastMsg( data.msg, 'info');
						$('.validating-btn').removeClass('validating-btn');
						LJ.fn.hideLoaders();
					});

				});

				LJ.params.socket.on('server error', function(msg){

					sleep( 600, function(){
						LJ.fn.toastMsg( msg, 'error');
						$('.validating-btn').removeClass('validating-btn');
						$('.pending').removeClass('pending');
						LJ.fn.hideLoaders();
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
		                		LJ.$manageEventsWrap.find('#askersListWrap').html('');
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

			/* Pour tous les users */
			var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-eventid="' + eventId + '"]');

			eventWrap.find('button.askIn')
					 .text('Suspendu')
					 .removeClass('open').removeClass('suspended').addClass( state );

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

				LJ.params.socket.emit('create event', e);
				LJ.fn.showLoaders();
		},
		fetchEvents: function(){

			if( LJ.state.fetchingEvents ){ 
				LJ.fn.toastMsg('Aleady fetching events', 'error');
			}else{
				LJ.state.fetchingEvents = true;
                LJ.params.socket.emit('fetch events', LJ.user._id );
            }
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers ){
                LJ.fn.toastMsg("Already fetching askers", 'error');
            }else{
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

            LJ.$askersListWrap.append( LJ.fn.renderAskers( LJ.myAskers ));

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
        sendChat: function(submitInput){

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

        		LJ.params.socket.emit('send message',{
        			msg: msg,
        			eventId: eventId,
        			hostId: hostId,
        			askerId: askerId,
        			senderId: LJ.user._id
        		});
        },
        buildChatId: function(eventId, hostId, userId){

        	return eventId + '_' + hostId + '-' + userId;

        },
        /*
        	Ajoute une ligne en prennant comme paramètre:
        		- Le message (data.msg)
        		- Les ids définissant de manière unique un message entre 2 personnes
        		  (data.eventId - data.hostId - data.askerId) 
        		  utilisés pour construire une room unique 
        */
        addChatLine: function(data){

        	csl('Adding chatLine');
            var cha12 = '';
            data.senderId === LJ.user._id ?  cha12 = 'cha1' : cha12 = 'cha2';
            var chatLineHtml = '<div class="chatLine none">'
								+'<div class="cha '+cha12+'">'+data.msg+'</div>'
        						+'</div>';

       		var chatId = data.chatId;
       		
        	var $chatLineWrap = $('.chatWrap[data-chatid="'+chatId+'"]').find('.chatLineWrap');
        		if($chatLineWrap){csl('DOM Found');}
        		
        		if(!$chatLineWrap.hasClass('jspScrollable')){
        			$chatLineWrap.jScrollPane();
        			LJ.state.jspAPI[chatId] =  $chatLineWrap.data('jsp');
        		}
        		$chatLineWrap.find('.jspPane').append(chatLineHtml);

        		var anim = '';
        		cha12 == 'cha1' ? anim = "slideLeftIn" : anim = "slideRightIn" ;  

        		$chatLineWrap.find('.chatLine:last-child')
        					  .velocity("fadeIn", {
        					  	duration: 500,
        					  	complete: function(){
        					  	}
        					  });

        		sleep(30, function(){ LJ.state.jspAPI[chatId].reinitialise();
        							LJ.state.jspAPI[chatId].scrollToBottom(); })

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

        }	       
    }//end fn

}//end LJ

$('document').ready(function(){
		LJ.fn.init();
		csl('Application ready');
	
});