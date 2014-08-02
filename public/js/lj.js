function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}


var LJ = {
	params:{
		socket    :  null,
		FADE_TIME : 3000
	},
	DOM:{
		loginWrap	  : $('#loginWrap'),
		signupWrap	  : $('#signupWrap'),
		profileWrap	  : $('#profileWrap'),
		loginBtn      : $('#login'),
		signupBtn     : $('#signup'),
		emailInput    : $('#email'),
		passwordInput : $('#pw'),
		lostPassword  : $('#lost_pw'),
		backToLogin   : $('#b_to_login'),
		becomeMember  : $('#bcm_member'),
		validateBtn   : $('#validate'),
		nameInput     : $('#name'),
		ageInput      : $('#age'),
		descInput	  : $('#description'),
		locationInput : $('#quartier'),
		loaderWrap 	  : $('#loaderWrap'),
		mainMenu	  : $('#menu'),
		contactMenu	  : $('#contact'),
		contentWrap   : $('#contentWrap'),
		contactWrap   : $('#contactWrap')
	},
	fn:{
		init : function(){

				/*Bind any UI action with the proper handler */
				LJ.fn.handleDomEvents();

				/*Global UI Settings for Third party libraries*/
				LJ.fn.initUISettings();
		},
		initSocketConnection : function(jwt){
			LJ.params.socket = io.connect('http://localhost', {
				query:'token='+jwt
			});

		},
		initUISettings : function(){
			//nothing atm	
		},
		handleDomEvents : function(){
			LJ.DOM.signupBtn.click(function(e){ 
				e.preventDefault(); 
				LJ.fn.signupUser(); 
			});
			LJ.DOM.loginBtn.click(function(e){	
				e.preventDefault();
				LJ.fn.loginUser();	
			});
			LJ.DOM.validateBtn.click(function(){
				LJ.fn.updateProfile();
			});
			LJ.DOM.becomeMember.click(function(){
				LJ.fn.displayContent(LJ.DOM.signupWrap);
			});
			LJ.DOM.backToLogin.click(function(){
				LJ.fn.displayContent(LJ.DOM.loginWrap);
			});
			LJ.DOM.mainMenu.click(function(){

			});
			LJ.DOM.contactMenu.click(function(){
				LJ.fn.displayContent(LJ.DOM.contactWrap);

			});


		},
		signupUser : function(credentials){

			var credentials = credentials || {} ;

				credentials.email = LJ.DOM.emailInput.val();
				credentials.password = LJ.DOM.passwordInput.val();	

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

			var age   = LJ.DOM.ageInput.val(),
				name  = LJ.DOM.ageInput.val(),
				desc  = LJ.DOM.descInput.val();

			$.ajax({
				method:'POST',
				url:'/profile',
				dataType:'json',
				data : {
					name : name,
					age  : age,
					desc : desc
				},
				success : function(data){

				},
				error : function(data){

				}
			})
		},
		handleBeforeSendLogin : function(){
			LJ.DOM.loginBtn.val('Loading');
			LJ.fn.fadeOut(LJ.DOM.becomeMember);
			LJ.DOM.loaderWrap.removeClass('none');
		},
		handleSuccessLogin : function(data){
			sleep(1000,function(){
					LJ.fn.initSocketConnection(data.token);
					LJ.DOM.loaderWrap.addClass('none');
					LJ.fn.displayContent(LJ.DOM.profileWrap);	
			});
			
		},
		handleFailedLogin : function(data){
			var data = JSON.parse(data.responseText);
			sleep(1000,function(){
				LJ.fn.fadeIn(LJ.DOM.becomeMember);
				LJ.DOM.loaderWrap.addClass('none');
				LJ.DOM.loginBtn.val('Login');
			});
		},
		handleBeforeSendSignup : function(){

		},
		handleSuccessSignup : function(data){
			LJ.fn.loginUser(data);
		},
		handleFailedSignup : function(data){
			var data = JSON.parse(data.responseText)
		},
		fadeIn : function(el){
			el.removeClass('fadeOutRight none').addClass('fadeInLeft');
		},
		fadeOut : function(el,none){
			el.addClass('fadeOutRight');
			if(none){el.addClass('none')}
		},
		displayContent : function(content){
			
			var onScreen = $('.onscreen');
			onScreen.removeClass('fadeInLeft onscreen')
					.addClass('fadeOutRight')
					.find('input:not([type="submit"])').val('');

			setTimeout(function(){
					onScreen.addClass('none').removeClass('fadeOutRight');
					content.removeClass('none').addClass('fadeInLeft onscreen');
			}, 350 );
			
		}
	}

}

$('document').ready(function(){
	LJ.fn.init();
});