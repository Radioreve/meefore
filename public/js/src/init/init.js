    /*
        Initialisation script
        Recursively try to initialize the Facebook pluggin
        When it's loaded, app starts.
        Follow the code...
        Léo Jacquemin, 10/03/16, 17h56
    */
    

	window.LJ = _.merge( window.LJ || {}, { 

		init: function( time ){

            $(window).scrollTop(0)
            
            // The application only starts when the Facebook pluggin has loaded
            if( typeof FB === 'undefined' )
                return setTimeout(function(){ LJ.init( time ); }, time );
            
            // Language, Lodash & jQuery augmentations
            LJ.initAugmentations();
            // Translate the whole page based on sourcetext & data-lid attributes
            LJ.lang.init();
            // Cache static assets images used accross modules
            LJ.static.init();
            // Store mechanism (local storage / cookie)
            LJ.store.init();
            // Analytics for tracking what's going on
            LJ.analytics.init();
            // Starts the Facebook SDK
            LJ.facebook.init();
            // Basic routing functionalities to prevent user from accidentally leaving the page
            LJ.router.init();
            // Menu dom interactions
            LJ.menu.init();
            // Navigation for macro views 
            LJ.nav.init();
            // Scrolling globals etc
            LJ.ui.init();
            // Cheers
            LJ.cheers.init();
            // Shared module
            LJ.shared.init();
            // Profile user
            LJ.profile_user.init();


            // Autologin for users who asked the "remember me" feature in their settings
            LJ.autologin.init()
                .then(  LJ.autologin.startLogin )
                .catch( LJ.autologin.startLanding )

            // Login flow
            LJ.login.init()
                .then()
                .then( LJ.facebook.fetchFacebookToken )
                .then( LJ.start );

        },
        start: function( facebook_token ){

            return LJ.Promise.resolve( facebook_token )
                .then( LJ.login.enterLoginProcess )  
                .then(function(){
                    return LJ.api.fetchAppToken( facebook_token );
                })
                .then( LJ.login.stepCompleted )
                // Enter the following step with a valid app token
                // Two kinds of data are fetch :
                // - datas that are self-related  : profile infos, pictures, friends, notifications, chats...
                // - datas that are users-related : search users module, map events...
                .then( LJ.profile.init )
                .then( LJ.login.firstSetup )
                .then( LJ.login.stepCompleted )
                .then( LJ.map.initGeocoder )
                .then(function(){
                    var a = LJ.friends.init();
                    var b = LJ.search.init();
                    var c = LJ.realtime.init();
                    return LJ.Promise.all([ a, b, c ]);
                })
                .then( LJ.notifications.init )
                .then( LJ.before.init )
                .then( LJ.chat.init )
                .then( LJ.login.hideLoginSteps )
                .then( LJ.map.init ) // Must be as close as possible to terminateLogin. Map doesnt render sometimes..
                .then( LJ.login.terminateLoginProcess )
                .then( LJ.onboarding.init )
                // .then( LJ.connecter.init )
                .then( LJ.dev.init )

        }


	});

