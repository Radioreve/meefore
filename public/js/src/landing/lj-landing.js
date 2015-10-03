
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

        	var data = [
        		{
        			'name':'Rue de lappe',
        			'hashtags': ["bastille","monop'","roquette"]
        		},
        		{
        			'name':'Hôtel de ville',
        			'hashtags': ['concerts',"bhv","crowd"],
        		},
        		{
        			'name':'Les quais de seine',
        			'hashtags': ['pakibière',"sunset","wine"]
        		},
        		{
        			'name':'Event Facebook',
        			'hashtags':['projetX','peutêtre','whatever']
        		},
        		{
        			'name':'La concrete',
        			'hashtags':['after','after','after','md','after']
        		},
        		{
        			'name':'Rue princesse',
        			'hashtags':[ 'lasoif','odéon','bedford','pousseaucrime']
        		},
        		{
        			'name':'Grands boulevards',
        			'hashtags':['étranger(e)s','help','me','out']
        		},
        		{
        			'name':'Westeros',
        			'hashtags':['danaerys','is','coming']
        		}
        	]

        	var names     = _.pluck( data, 'name' ),
        		hashtags  = _.pluck( data, 'hashtags' ),
        		maxLength = names.length,
        		i 		  = 0;  

        	$('html').css({ 'overflow': 'hidden' });
        	$('.hero-img').first()
        				  .addClass('active')
        				  .waitForImages(function(){

	        	$('.curtain').velocity('transition.fadeOut', { duration: 1000 });
	            $('.typed-text').typed({
	                strings: names,
	                typeSpeed: 200, 
	                backDelay: 4000,
	                loop:true,
	                preStringTyped: function(){

	                	/* Display text */
	                	var hashtags = data[i].hashtags, html = '';
	                	for( var j = 0; j < hashtags.length; j++){
	                		html +='<div class="hashtag">#'+hashtags[j]+'</div>';
	                	}
	                	$('.landing-hashtags').html( $(html) );
	                	$('.hashtag').velocity('transition.fadeIn',
	                		{ delay:1000,display:'inline-block', duration:2500
	                	}).delay( data[i].name.length * 250 ).velocity('transition.fadeOut', {duration:1000});

	                	/* Zoom in image */
	                	if( i == 0)
	                		return $('.hero-img.active').removeClass('scaled');

	                },
	                onStringTyped: function(){
	                	i == maxLength-1 ? i=0 : i++;
	                	setTimeout( function(){
	                		if( LJ.state.loggingIn ){
	                			$('.hero-img.active').removeClass('active').addClass('scaled');
	                			$('html').css({'overflow-y':'scroll'});
	                			return 
	                		} 
	                		$('.curtain').velocity('transition.fadeIn', {
	                			duration: 1200, 
	                			complete: function(){ 
	                				$('.hero-img.active').removeClass('active').addClass('scaled');
	                				$('.hero-img.img-'+i).addClass('active');
	                				setTimeout(function(){ $('.hero-img.img-'+i).removeClass('scaled');
	                					$('.curtain').velocity('transition.fadeOut', {
	                						duration:1500
	                					});
	                				 }, 50 )
	                			}
	             			});
	                	}, 3500 ); 
	                }
	            });
			});

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