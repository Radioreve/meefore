function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}



var LJ = {
	params:{
		socket    :  null,
		domain	  : "http://192.168.1.87:1337"
	},
	cloudinary:{
		uploadParams: {
			cloud_name:"radioreve",
			api_key:"835413516756943"
		},
		displayParams : {
				cloud_name :"radioreve",
				width:150,
				height:150,
				effect:'grayscale',
				crop:'fill',
				gravity:'face'
		}
	},
	user:{
		_id:'',
		name:'',
		email:'',
		age:'',
		location:'',
		img_id:''
	},
	DOM:{
		loginWrap		 	 : $('#loginWrap'),
		signupWrap			 : $('#signupWrap'),
		profileWrap		     : $('#profileWrap'),
		eventsWrap		     : $('#eventsWrap'),
		loginBtn  	         : $('#login'),
		signupBtn            : $('#signup'),
		emailInput           : $('#email'),
		passwordInput        : $('#pw'),
		lostPassword         : $('#lost_pw'),
		emailInputSignup     : $('#emailSignup'),
		passwordInputSignup  : $('#pwSignup'),
		passwordCheckInput   : $('#pwCheckSignup'),
		backToLogin          : $('#b_to_login'),
		becomeMember         : $('#bcm_member'),
		validateBtn          : $('#validate'),
		nameInput            : $('#name'),
		ageInput             : $('#age'),
		descInput	         : $('#description'),
		locationInput        : $('#location'),
		loaderWrap 	         : $('.loaderWrap'),
		menuBtn		         : $('.menuBtn'),
		contactMenu	         : $('#contact'),
		profileMenu          : $('#profile'),
		eventsMenu           : $('#events'),
		contentWrap          : $('#contentWrap'),
		contactWrap          : $('#contactWrap'),
		menuWrap             : $('#menuWrap'),
		toastSuccess         : $('#toastSuccess'),
		toastError           : $('#toastError')
	},
	fn:{
		init : function(){
				/*Bind any UI action with the proper handler */
				LJ.fn.handleDomEvents();

				/*Global UI Settings ehanced UX*/
				LJ.fn.initEhancements();

		},
		initSocketConnection : function(jwt){
			LJ.params.socket = io.connect(LJ.params.domain, {
				query:'token='+jwt
			});
			LJ.fn.initEventListeners();

		},
		initEhancements : function(){
			(function bindEnterKey(){
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
			})();
				
		},
		handleDomEvents : function(){
			//============= LOGIN AND SIGNUP=========
			LJ.DOM.signupBtn.click(function(e){ 
				e.preventDefault(); 
				console.log('About to SU User')
				LJ.fn.signupUser(); 
			});

			LJ.DOM.loginBtn.click(function(e){	
				e.preventDefault();
				LJ.fn.loginUser();	
			});

			LJ.DOM.becomeMember.click(function(){
				LJ.fn.displayContent(LJ.DOM.signupWrap);
			});

			LJ.DOM.backToLogin.click(function(){
				LJ.fn.displayContent(LJ.DOM.loginWrap);
			});


			//===============MENU=================
			LJ.DOM.menuBtn.click(function(){
				LJ.fn.toggleMenu();
			});
			LJ.DOM.contactMenu.click(function(){
				LJ.fn.displayContent(LJ.DOM.contactWrap);
			});

			LJ.DOM.profileMenu.click(function(){
				LJ.fn.displayContent(LJ.DOM.profileWrap);
			});

			LJ.DOM.eventsMenu.click(function(){
				LJ.fn.displayContent(LJ.DOM.eventsWrap);
			})

			LJ.DOM.validateBtn.click(function(){
				LJ.fn.updateProfile();
			});

			$('#menuWrap').on('click','.menu-item',function(){
				LJ.fn.updateMenuView($(this));
			});



		},
		signupUser : function(credentials){

			var credentials = {} ;

				credentials.email = LJ.DOM.emailInputSignup.val();
				credentials.password = LJ.DOM.passwordInputSignup.val();	
				console.log("Posting this : " +JSON.stringify(credentials,0,4))

			$.ajax({
				method:'POST',
				url:'/signup',
				dataType:'json',
				data : {
					email    : credentials.email,
					password : credentials.password
				},
				beforeSend : function(){
					LJ.fn.handleBeforeSendSignup();
				},
				success : function(data){
					data.email    = credentials.email;
					data.password = credentials.password;
					LJ.fn.handleSuccessSignup(data);
				},
				error : function(data){
					LJ.fn.handleFailedSignup(data);
				}
			});
		},
		loginUser : function(credentials){

			var credentials = credentials || {} ;

				credentials.email    = credentials.email    || LJ.DOM.emailInput.val();
				credentials.password = credentials.password || LJ.DOM.passwordInput.val();

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
		updateProfile: function(){
			var _id 		 = LJ.user._id,
				age   		 = LJ.DOM.ageInput.val(),
				name  		 = LJ.DOM.nameInput.val(),
				description  = LJ.DOM.descInput.val();

			var profile = {
				_id			: _id,
				age 		: age,
				name 		: name,
				description : description
			}
				LJ.params.socket.emit('update profile', profile);	
				$('.profileInput').addClass('validating');			
		},
		handleBeforeSendLogin : function(){
			LJ.DOM.loginBtn.val('Loading');
			LJ.fn.fadeOut(LJ.DOM.becomeMember);
			LJ.DOM.loaderWrap.removeClass('none');
			$('input.input-field').addClass('validating');
		},
		handleSuccessLogin : function(data){
			sleep(1000,function(){ 

					LJ.fn.initSocketConnection(data.token);
					LJ.fn.initCloudinary(data.cloudTag);

					// Internal State Update
					LJ.fn.logUser(data);
					LJ.fn.setClientSettings(data);

					// User Interface Update
					LJ.DOM.loaderWrap.addClass('none');
					LJ.fn.displayContent(LJ.DOM.eventsWrap);
					LJ.fn.replaceMainImage(LJ.user.img_id,LJ.cloudinary.displayParams);

					sleep(350,function(){LJ.fn.toggleMenu(); });
			});
		},
		handleFailedLogin : function(data){
			var data = JSON.parse(data.responseText);
			sleep(1000,function(){
				LJ.fn.toastMsgError(data.msg);
				$('input.input-field').removeClass('validating');
				LJ.fn.fadeIn(LJ.DOM.becomeMember);
				LJ.DOM.loaderWrap.addClass('none');
				LJ.DOM.loginBtn.val('Login');
			});
		},
		handleBeforeSendSignup : function(){
			LJ.fn.fadeOut(LJ.DOM.backToLogin);
			$('.loaderWrap').removeClass('none');
			$('input.input-field').addClass('validating');
		},
		handleSuccessSignup : function(data){
			sleep(1000,function(){
				$('.loaderWrap').addClass('none');
				LJ.fn.loginUser(data);
			});		
		},
		handleFailedSignup : function(data){
			var data = JSON.parse(data.responseText);
			sleep(1000,function(){
				$('input.input-field').removeClass('validating');
				LJ.fn.toastMsgError(data.msg);
				LJ.fn.fadeIn(LJ.DOM.backToLogin);
				$('.loaderWrap').addClass('none');
			});
		},
		fadeIn : function(el){
			el.removeClass('fadeOutRight none').addClass('fadeInLeft');
		},
		fadeOut : function(el,none){
			el.addClass('fadeOutRight');
			if(none){el.addClass('none')}
		},
		fadeInSmall : function(el){
			el.removeClass('fadeOutRightSmall none').addClass('fadeInLeftSmall');
		},
		fadeOutSmall : function(el,none){
			el.addClass('fadeOutRightSmall');
			if(none){el.addClass('none')}
		},
		displayContent : function(content){		
			var onScreen = $('.onscreen');
			onScreen.removeClass('fadeInLeft onscreen')
					.addClass('fadeOutRight');
			setTimeout(function(){
					onScreen.addClass('none').removeClass('fadeOutRight');
					content.removeClass('none').addClass('fadeInLeft onscreen');
			}, 350 );
			
		},
		displayInAndOutSmall : function(content){ //small version only
			if(content.hasClass('fadeOutLeftSmall')){
				content.removeClass(' fadeOutLeftSmall none')
					   .addClass('fadeInLeftSmall');
					   return;
			};
			if(content.hasClass('fadeInLeftSmall')){
				console.log(2);
				content.addClass('fadeOutLeftSmall');

				sleep(500,function(){content.addClass('none')});
				       return;
			};
		},
		toggleMenu : function(){
			var that = LJ.DOM.menuBtn;
				if(that.hasClass('menuBtnActive')){
					that.removeClass('menuBtnActive');
				}
				else{
					that.addClass('menuBtnActive');
				}
				LJ.fn.displayInAndOutSmall(LJ.DOM.menuWrap);
		},
		updateMenuView : function(el){
			if(!el.hasClass('menu-item-active')){
					$('.menu-item-active').removeClass('menu-item-active');
					el.addClass('menu-item-active');
				}
		},
		showProfile : function(){
			var el = LJ.DOM.profileMenu;
				LJ.fn.displayContent(LJ.DOM.profileWrap);
		},
		setClientSettings : function(data){
			console.log('Updating client state : '+JSON.stringify(data,0,4));
			//Internal state update
            LJ.user._id 	    = data._id;
			LJ.user.email 	    = data.email;
			LJ.user.location    = data.location;
			LJ.user.description = data.description;
			LJ.user.age 	    = data.age;
			LJ.user.name 	    = data.name;
			LJ.user.img_id	 	= data.img_id;
			//User Interface Update
			LJ.fn.updateSettingsDOM();
		},
		updateSettingsDOM : function(){
			LJ.DOM.nameInput.val(LJ.user.name);
			LJ.DOM.ageInput.val(LJ.user.age);
			LJ.DOM.descInput.val(LJ.user.description);
		},
		logUser : function(data){
			console.log(JSON.stringify(LJ.user,0,4));
		},
		toastMsgSuccess : function(msg){
			var toast = LJ.DOM.toastSuccess;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInSmall(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutSmall(toast);
			})
		},
		toastMsgError : function(msg){
			var toast = LJ.DOM.toastError;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInSmall(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutSmall(toast);
			})
		},
		replaceMainImage : function(id,d){
		    var d = d || LJ.cloudinary.displayParams();
			var previousImg = $('#pictureWrap').find('img'),
				newImg      = $.cloudinary.image(id, d); 
				newImg.addClass('mainPicture').hide();
				$('#pictureWrap').prepend(newImg);
 													
				previousImg.fadeOut(700,function(){
					$(this).remove();
					newImg.fadeIn(700);
				});

		},
		initCloudinary : function(upload_tag){

			$.cloudinary.config(LJ.cloudinary.uploadParams);
			$('.upload_form').append(upload_tag);
			$('.cloudinary-fileupload')

				.bind('fileuploadprogress',function(e,data){
  							$('.progress_bar').css('width', 
    						Math.round((data.loaded * 100.0) / data.total) + '%');

				}).bind('cloudinarydone',function(e,data){
  							console.log(JSON.stringify(data.result,0,4));

  							sleep(1000,function(){
  								$('.progress_bar').fadeOut(function(){
  									$(this).css({width:"0%"}).fadeIn();
  									});

  								LJ.fn.toastMsgSuccess('Your face has changed');

  								var img_id=data.result.public_id;
  								LJ.params.socket.emit('update picture',{_id: LJ.user._id,
  																		img_id: img_id });

  								LJ.fn.replaceMainImage(img_id,LJ.cloudinary.displayParams);
					
  							});

  				}).cloudinary_fileupload();
  				

		},
		initEventListeners : function(){

				LJ.params.socket.on('disconnect', function(data){
					alert('You have been disconnected');
				});

				LJ.params.socket.on('update profile success', function(data){
				sleep(1000,function(){
					LJ.fn.toastMsgSuccess("User settings modified");
						//LJ.fn.displayContent(LJ.DOM.profileWrap);
						$('.profileInput').removeClass('validating');
					});
				});	

				LJ.params.socket.on('update profile error',function(){
					sleep(1000,function(){
						$('.profileInput').removeClass('validating');
					});			
				});

				LJ.params.socket.on('client connected',function(){
					console.log('Client authenticated on the socket stream');
				})
		}
	}//end fn

}//end LJ

$('document').ready(function(){
	LJ.fn.init();
	console.log('Application ready');
});