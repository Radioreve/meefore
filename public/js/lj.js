function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}

var myEvents = [
	{
		status:"",
		name:"Apéro sur les quais",
		host_name:"Marinette",
		location:"75005",
		hour:"20h30",
		maxGuests:"10"
	},
	{
		status:"nouveau",
		name:"Rex club",
		host_name:"Goldman",
		location:"75005",
		hour:"20h30",
		maxGuests:"5"
	},
	{
		status:"",
		name:"Pool Party",
		host_name:"Jean",
		location:"75019",
		hour:"22h30",
		maxGuests:"30"
	},
	{
		status:"vip",
		name:"Soirée K",
		host_name:"Marion",
		location:"75005",
		hour:"20h00",
		maxGuests:"5"
	}
]


LJ = {
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
		img_id:'',
		img_version:''
	},
		$loginWrap		 	  : $('#loginWrap'),
		$signupWrap			  : $('#signupWrap'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$becomeMember         : $('#bcm_member'),
		$validateBtn          : $('#validate'),
		$nameInput            : $('#name'),
		$ageInput             : $('#age'),
		$descInput	          : $('#description'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$menuBtn		      : $('.menuBtn'),
		$contactMenu          : $('#contact'),
		$profileMenu          : $('#profile'),
		$eventsMenu           : $('#events'),
		$createMenu			  : $('#create'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$eventNameInput       : $('#eventName'),
		$eventHourInput       : $('#eventHour'),
		$eventMinutInput      : $('#eventMin'),
		$eventDescriptionInput: $('#eventDescription'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$toastSuccess         : $('#toastSuccess'),
		$toastError           : $('#toastError'),
		$eventsListWrap       : $('#eventsListWrap'),

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
			LJ.$signupBtn.click(function(e){ 
				e.preventDefault(); 
				console.log('About to SU User')
				LJ.fn.signupUser(); 
			});

			LJ.$loginBtn.click(function(e){	
				e.preventDefault();
				LJ.fn.loginUser();	
			});

			LJ.$becomeMember.click(function(){
				LJ.fn.displayContent(LJ.$signupWrap);
			});

			LJ.$backToLogin.click(function(){
				LJ.fn.displayContent(LJ.$loginWrap);
			});


			//===============MENU=================
			LJ.$menuBtn.click(function(){
				LJ.fn.toggleMenu();
			});
			LJ.$contactMenu.click(function(){
				LJ.fn.displayContent(LJ.$contactWrap);
			});
			LJ.$createMenu.click(function(){
				LJ.fn.displayContent(LJ.$createEventWrap);
			})
			LJ.$profileMenu.click(function(){
				LJ.fn.displayContent(LJ.$profileWrap);
			});

			LJ.$eventsMenu.click(function(){
				LJ.fn.displayContent(LJ.$eventsWrap);
			})

			LJ.$validateBtn.click(function(){
				LJ.fn.updateProfile();
			});

			$('#menuWrap').on('click','.menu-item',function(){
				LJ.fn.updateMenuView($(this));
			});

			//============EVENTS====================
			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});
			



		},
		signupUser : function(credentials){

			var credentials = {} ;

				credentials.email = LJ.$emailInputSignup.val();
				credentials.password = LJ.$passwordInputSignup.val();	
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
		updateProfile: function(){
			var _id 		 = LJ.user._id,
				age   		 = LJ.$ageInput.val(),
				name  		 = LJ.$nameInput.val(),
				description  = LJ.$descInput.val();

			var profile = {
				_id			: _id,
				age 		: age,
				name 		: name,
				description : description
			}
				LJ.params.socket.emit('update profile', profile);
				LJ.$loaderWrap.removeClass('none');	
		},
		handleBeforeSendLogin : function(){
			LJ.$loginBtn.val('Loading');
			LJ.fn.fadeOut(LJ.$becomeMember);
			LJ.$loaderWrap.removeClass('none');
			$('input.input-field').addClass('validating');
		},
		handleSuccessLogin : function(user,events){
			sleep(1000,function(){ 

					LJ.fn.initSocketConnection(user.token);
					LJ.fn.initCloudinary(user.cloudTag);

					// Internal State Update
					LJ.fn.setClientSettings(user);
					var el = LJ.fn.renderEventsListView(myEvents);

					LJ.$eventsListWrap.append(el);
					// User Interface Update
					LJ.$loaderWrap.addClass('none');
					$('#codebar').text(user._id);
					LJ.fn.displayContent(LJ.$eventsWrap);
					LJ.fn.replaceMainImage(LJ.user.img_id,LJ.user.img_version,LJ.cloudinary.displayParams);

					sleep(350,function(){LJ.fn.toggleMenu(); });
			});
		},
		handleFailedLogin : function(data){
			var data = JSON.parse(data.responseText);
			sleep(1000,function(){
				LJ.fn.toastMsgError(data.msg);
				$('input.input-field').removeClass('validating');
				LJ.fn.fadeIn(LJ.$becomeMember);
				LJ.$loaderWrap.addClass('none');
				LJ.$loginBtn.val('Login');
			});
		},
		handleBeforeSendSignup : function(){
			LJ.fn.fadeOut(LJ.$backToLogin);
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
				LJ.fn.fadeIn(LJ.$backToLogin);
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
			var that = LJ.$menuBtn;
				if(that.hasClass('menuBtnActive')){
					that.removeClass('menuBtnActive');
				}
				else{
					that.addClass('menuBtnActive');
				}
				LJ.fn.displayInAndOutSmall(LJ.$menuWrap);
		},
		updateMenuView : function(el){
			if(!el.hasClass('menu-item-active')){
					$('.menu-item-active').removeClass('menu-item-active');
					el.addClass('menu-item-active');
				}
		},
		showProfile : function(){
			var el = LJ.$profileMenu;
				LJ.fn.displayContent(LJ.$profileWrap);
		},
		setClientSettings : function(data){
			//console.log('Updating client state : '+JSON.stringify(data,0,4));
			//Internal state update
            LJ.user._id 	    = data._id;
			LJ.user.email 	    = data.email;
			LJ.user.location    = data.location;
			LJ.user.description = data.description;
			LJ.user.age 	    = data.age;
			LJ.user.name 	    = data.name;
			LJ.user.img_id	 	= data.img_id;
			LJ.user.img_version = data.img_version;
			//User Interface Update
			LJ.fn.updateSettingsDOM();
		},
		updateSettingsDOM : function(){
			LJ.$nameInput.val(LJ.user.name);
			LJ.$ageInput.val(LJ.user.age);
			LJ.$descInput.val(LJ.user.description);
		},
		logUser : function(data){
			console.log(JSON.stringify(LJ.user,0,4));
		},
		toastMsgSuccess : function(msg){
			var toast = LJ.$toastSuccess;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInSmall(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutSmall(toast);
			})
		},
		toastMsgError : function(msg){
			var toast = LJ.$toastError;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInSmall(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutSmall(toast);
			})
		},
		replaceMainImage : function(id,version,d){
		    var d = d || LJ.cloudinary.displayParams;
		    	d.version = version;

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
  								var img_version = data.result.version;
  								LJ.params.socket.emit('update picture',{_id: LJ.user._id,
  																		img_id: img_id,
  																		img_version:img_version });

  								LJ.fn.replaceMainImage(img_id,img_version,LJ.cloudinary.displayParams);
					
  							});

  				}).cloudinary_fileupload();
  				

		},
		renderEventsListView : function(arr,max){
				var html ='';
				var max = max || arr.length;
				for(i=0;i<arr.length;i++){ html += LJ.fn.renderEventRowView(arr[i]); }
				return html;
		},
		renderEventRowView : function(event){
			var html = '<div class="eventItemWrap">'
						+'<div class="e-itm e-hour e-weak">'+event.hour+'</div>'
						+'<div class="e-itm e-name">'+event.name+'</div>'
						+'<div class="e-itm e-location e-weak">'+event.location+'</div>'
						+'<div class="e-itm e-host e-weak">Soirée proposée par '+event.host_name+'</div>'
						+'</div>';
			return html;
		},
		initEventListeners : function(){

				LJ.params.socket.on('disconnect', function(data){
					alert('You have been disconnected');
				});

				LJ.params.socket.on('update profile success', function(data){
				sleep(1000,function(){
					LJ.fn.toastMsgSuccess("User settings modified");
					LJ.$loaderWrap.addClass('none');
						//LJ.fn.displayContent(LJ.$profileWrap);
					});
				});	

				LJ.params.socket.on('update profile error',function(){
					sleep(1000,function(){
					LJ.$loaderWrap.addClass('none');
					alert('Error updating profile');
					});			
				});

				LJ.params.socket.on('client connected',function(){
					console.log('Client authenticated on the socket stream');
				});
		},
		createEvent: function(){
			var e = {};
				e.host_id	  = LJ.user._id;
				e.name 		  = LJ.$eventNameInput.val();
				e.hour 		  = LJ.$eventHourInput.val();
				e.min  		  = LJ.$eventMinutInput.val();
				e.description = LJ.$eventDescriptionInput.val();

				LJ.params.socket.emit('create event', e);
				LJ.$loaderWrap.removeClass('none');

		}
	}//end fn

}//end LJ

$('document').ready(function(){
		LJ.fn.init();
		console.log('Application ready');
	
});