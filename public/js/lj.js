
var LJ = {
	params:{

	},
	DOM:{
		loginBtn : $('#login'),
		signupBtn : $('#signup'),
		emailInput : $('#email'),
		passwordInput :$('#pw')
	},
	fn:{
		signup : function(){
			e.preventDefault();

			var email = LJ.DOM.emailInput.val();
			var password = LJ.DOM.passwordInput.val();

			$.ajax({
				method:'POST',
				url:'/signup',
				dataType:'json',
				data:{
					email:email,
					password:password
				},
				beforeSend:function(){
					toastr.info("Création de votre profile...")
				},
				success:function(data){
					console.log('Success signup : ' + data.msg );
				},
				error:function(data){
					var data = JSON.parse(data.responseText)
					console.log('Failed signup : ' + data.msg );
				}
			});
		},
		login : function(e){
			e.preventDefault();

			var email = LJ.DOM.emailInput.val();
			var password = LJ.DOM.passwordInput.val();

			$.ajax({
				method:'POST',
				url:'/login',
				dataType:'json',
				data:{
					email:email,
					password:password
				},
				beforeSend:function(){
					toastr.info("Authentification en cours...")
				},
				success:function(data){
					toastr.success("Authentification réussie!", data);
				},
				error:function(data){
					var data = JSON.parse(data.responseText)
					toastr.error(data.msg);
				}
			});
		},
		init : function(){
				LJ.DOM.signupBtn.click(function(e){
					LJ.fn.signup(e);
				});
				LJ.DOM.loginBtn.click(function(e){
					LJ.fn.login(e);
				});
				toastr.options.showDuration = 250;
				toastr.options.hideDuration = 250;
				toastr.options.timeOut = 2500;
		}

	}

}

$('document').ready(function(){
	LJ.fn.init();

});