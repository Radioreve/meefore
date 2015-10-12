
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Landing: function(){

			$('#facebook_connect').click(function(e){

				e.preventDefault();

				FB.login( function(res){

					delog('Client facebook status is : ' + res.status ) ;

					if( res.status == 'not_authorized' ){
						LJ.state.loggingIn = false;
						delog('User didnt let Facebook access informations');
						return
					}

					if( res.status == 'connected' ){

					  	$('#facebook_connect').velocity({ opacity: [0,1] }, { duration: 1250 });

						LJ.state.loggingIn = true;
						var access_token = res.authResponse.accessToken;
						delog('short lived access token : ' + access_token );

						FB.api('/me', function( facebookProfile ){
							facebookProfile.access_token = access_token;
					  		LJ.fn.loginWithFacebook( facebookProfile );
				  		}); 
					}

				}, { scope: ['public_profile', 'email', 'user_friends', 'user_photos']} );
			});

		},
		initLandingPage: function(){

        $('.curtain').velocity('transition.fadeOut', {
        	duration: 1500,
        	delay: 500
        });

        $('.landing-kenburns').Kenburns({
        	// images: ['img/kb/bg1-min.jpg','img/kb/bg2-min.jpg','img/kb/bg3-min.jpg','img/kb/bg4-min.jpg','img/kb/bg5-min.jpg','img/kb/bg6-min.jpg'],
        	scale: 0.92,
        	duration: 8000,
        	fadeSpeed: 1500,
        	ease3d: 'ease-out',
        	onSlideComplete: function(){
       			console.log('slide ' + this.getSlideIndex());
		    },
		    onLoadingComplete: function(){
		        console.log('image loading complete');
		    }
        }).append('<div class="kenburns-overlay"></div>');
        

		},
		autoLogin: function(){

    		var $el = $('<div class="auto-login-msg super-centered none">' + 'Chargement des prochaines soirées...' + '</b></div>');
			$el.appendTo('.curtain').velocity('transition.fadeIn')
			setTimeout( function(){

			LJ.fn.GraphAPI('/me', function( facebookProfile ){
				delog( facebookProfile );
		  		LJ.fn.loginWithFacebook( facebookProfile );
  			});

			}, 400 );
		},
		loginWithFacebook: function( facebookProfile ){

				delog('logging in with facebook...');
				$.ajax({

					method:'POST',
					data: { facebook_id: facebookProfile.id, facebookProfile: facebookProfile },
					dataType:'json',
					url:'/auth/facebook',
					success: function( data ){
						LJ.fn.handleSuccessLogin( data );
					},
					error: function( err ){
						LJ.fn.handleServerError( err )
					}
				});

		},
		initAppBoot: function(){

			var ls = window.localStorage;

			if( !ls || !ls.getItem('preferences') ){
				delog('No local data available, initializing lp...');
				return LJ.fn.initLandingPage();
			}

			preferences = JSON.parse( ls.getItem('preferences') );

			tk_valid_until = preferences.tk_valid_until;
			long_lived_tk  = preferences.long_lived_tk;

			if( !tk_valid_until || !long_lived_tk ){
				delog('Missing init preference param, initializing lp...');
				return LJ.fn.initLandingPage();
			}
			
			if( moment( new Date(tk_valid_until) ) < moment() ){
				delog('long lived tk found but has expired');
				return LJ.fn.initLandingPage();
			} 

			var current_tk_valid_until = moment( new Date(tk_valid_until) );
			var now  = moment();
			var diff = current_tk_valid_until.diff( now, 'd' );

			if( diff < 30 ) {
				delog('long lived tk found but will expire soon, refresh is needed');
				return LJ.fn.initLandingPage();
			}

			delog('Init data ok, auto logging in...');
			return LJ.fn.autoLogin();
				
		},
		handleSuccessLogin: function( data ){

			delog('Handling success login with fb');
			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 
			//document.cookie = 'token='+data.accessToken;

			// Make sure all ajax request are don with proper accessToken
			LJ.fn.initAjaxSetup();

			// Typeahead pluggin 
			LJ.fn.initTypeahead();

			// Init Pusher Connexion via public chan 
			LJ.fn.initPusherConnection( LJ.accessToken );

			LJ.fn.say('auth/app', {}, {
				success: LJ.fn.handleFetchUserAndConfigurationSuccess 
			});

		}

	});