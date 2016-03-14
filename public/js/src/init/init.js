    /*
        Initialisation script
        Recursively try to initialize the Facebook pluggin
        When it's loaded, app starts.
        Follow the code...
        Léo Jacquemin,10/03/16, 17h56
    */

	window.LJ = _.merge( window.LJ || {}, { 

		init: function( time ){

            // The application only starts when the Facebook pluggin has loaded
            if( typeof FB === 'undefined' )
                return setTimeout(function(){ LJ.init( time ); }, time );
            
            // Translate the whole page based on sourcetext & data-lid attributes
            LJ.lang.init();
            // Cache static assets images used accross modules
            LJ.static.init();
            // Analytics for tracking what's going on
            LJ.analytics.init();
            // Starts the Facebook SDK
            LJ.facebook.init();
            // Basic routing functionalities to prevent user from accidentally leaving the page
            LJ.router.init();

            // Autologin for users who asked the "remember me" feature in their settings
            LJ.autologin.init()
                .then(  LJ.autologin.startLogin )
                .catch( LJ.autologin.startLanding )
            // Login flow
            LJ.login.init()
                .then( LJ.facebook.fetchFacebookToken )
                .then( LJ.login.firstStepCompleted )
                .then( LJ.facebook.fetchFacebookProfile )
                .then( LJ.login.stepCompleted )
                .then( LJ.setLocalStorage("login") )
                .then( LJ.api.fetchAppToken )
                .then( LJ.login.stepCompleted )
                .then( LJ.Promise.all([
                    LJ.profile.init,
                    LJ.user.init,
                    LJ.settings.init, 
                    LJ.uploader.init,
                    LJ.friends.init, 
                    LJ.search.init, 
                    LJ.map.init, 
                    LJ.before.init, 
                    LJ.party.init, 
                    LJ.notifications.init,
                    LJ.meepass.init, 
                    LJ.spotted.init,
                    LJ.invite.init,
                    LJ.chat.init, 
                ])
                .then( LJ.login.lastStepCompleted())
                .then( LJ.onboarding.init )
                )

		} 


	});







window.LJ.fn = _.merge( window.LJ.fn || {},

    {   

        init2: function(o) {

            // Set log levels
            LJ.log_level = o.log_level || 0;

            // Set app language
            var country = o.country;
            moment.locale( country );
            LJ.fn.setAppLanguage( country );

            // Gif loader and placeholder 
            this.initStaticImages();

            // Landing page animation 
            this.initAppBoot();

            // Bind UI action with the proper handler 
            this.handleDomEvents();

            // Augment lodash & jQuery
            this.initAugmentations();

            // Init basic spa routing
            this.initRouter();

            // Init analytics
            this.initAnalytics();

            // Detect when browser is closed
            // this.initHandleCloseBrowser();


        },
        initHandleCloseBrowser: function() {

            LJ.mouse_out_window = false;

            LJ.$body
                .mouseover(function() {
                    LJ.mouse_out_window = false;
                })
                .mouseout(function() {
                    LJ.mouse_out_window = true;
                });

            $(window).bind('beforeunload', function(e) {

                if (LJ.mouse_out_window) {
                    LJ.subscribed_channels = 'lol';
                }

            });

        },
        initTypeahead: function() {

            LJ.fn.initTypeaheadUsers();

        },
        initAugmentations: function() {

            /* La base! */
            _.mixin({
                pluckMany: function() {
                    var array = arguments[0],
                        propertiesToPluck = _.rest(arguments, 1);
                    return _.map(array, function(item) {
                        return _.partial(_.pick, item).apply(null, propertiesToPluck);
                    });
                }
            });

            $.fn.whisperify = function() {
                this
                    .addClass('whisper-active')
                    .find('input').addClass('whisper-text').end()
                    .find('button').addClass('btn-whisper').text( LJ.text_source["ch_button_whisper"][ LJ.app_language ] );
                return this;
            };

            $.fn.normalify = function() {
                this
                    .removeClass('whisper-active')
                    .find('input').removeClass('whisper-text').end()
                    .find('button').removeClass('btn-whisper').text( LJ.text_source["ch_button_send"][ LJ.app_language ] );
                return this;
            };


        },
        initAjaxSetup: function() {

            $.ajaxSetup({
                error: function(xhr) {
                    LJ.fn.handleServerError(xhr);
                },
                complete: function() {
                    setTimeout(function() {
                        LJ.fn.hideLoaders();
                    }, LJ.ui.artificialDelay);
                }
            });

        },
        handleDomEvents: function() {

            LJ.fn.handleDomEvents_Globals();
            LJ.fn.handleDomEvents_Landing();
            LJ.fn.handleDomEvents_UI();
            LJ.fn.handleDomEvents_Profile();
            LJ.fn.handleDomEvents_Settings();
            LJ.fn.handleDomEvents_Mapviews();
            LJ.fn.handleDomEvents_Requests();

            LJ.fn.handleDomEventsChat();
            LJ.fn.handleDomEventsCreate();
            LJ.fn.handleDomEventsFilters();
            LJ.fn.handleDomEventsGroups();
            LJ.fn.handleDomEventsPreview();
            LJ.fn.handleDomEventsTabview();
            LJ.fn.handleDomEventsMap();
            LJ.fn.handleDomEventsSettings();

        },
        initPusherConnection: function( token ) {

            LJ.pusher = new Pusher(window.pusher_app_id, {
                encrypted: true,
                authEndpoint: '/auth/pusher',
                auth: {
                    headers: {
                        "x-access-token": token
                    } // @48723
                }
            });

            LJ.state.connected = false;
            LJ.pusher.connection.bind('state_change', function( states ) {

                LJ.fn.log('Pusher state is now: ' + states.current, 1);

                if ( states.current == 'connecting' ){
                    // This is a reconnection case
                    if( LJ.state.connected == true ){
                        LJ.fn.handleReconnection();
                    }
                }

                if (states.current == 'disconnected'){
                    
                }

                if (states.current == 'unavailable'){
                    
                }

                if( states.current == 'connected' ){
                    if( LJ.state.connected == true ){
                        LJ.fn.reconnectUser();
                    } else {
                        LJ.fn.log('Setting stated as : connected', 1 );
                        LJ.state.connected = true;
                    }
                }

            });


        },
        initStaticImages: function() {

            $('.loaderWrap').html('');

            LJ.$main_loader = $.cloudinary.image(LJ.cloudinary.loaders.main.id, LJ.cloudinary.loaders.main.params);
            LJ.$main_loader.appendTo( $('.loaderWrap') );

            LJ.$mobile_loader = $.cloudinary.image(LJ.cloudinary.loaders.mobile.id, LJ.cloudinary.loaders.mobile.params);
            LJ.$mobile_loader.appendTo( $('.m-loaderWrap') );

            LJ.$main_loader_curtain = $.cloudinary.image( LJ.cloudinary.loaders.main_curtain.id, LJ.cloudinary.loaders.main_curtain.params );
            /* Dynamically cloned and appened */

            LJ.$bar_loader = $.cloudinary.image(LJ.cloudinary.loaders.bar.id, LJ.cloudinary.loaders.bar.params);
            /* Dynamically cloned and appended */

            LJ.$spinner_loader = $.cloudinary.image(LJ.cloudinary.loaders.spinner.id, LJ.cloudinary.loaders.spinner.params);
            /* Dynamically cloned and appended */

            LJ.$spinner_loader_2 = $.cloudinary.image(LJ.cloudinary.loaders.spinner_2.id, LJ.cloudinary.loaders.spinner_2.params);
            /* Dynamically cloned and appended */

            LJ.$curtain_loader = $.cloudinary.image(LJ.cloudinary.loaders.curtain.id, LJ.cloudinary.loaders.curtain.params);
            /* Dynamically cloned and appended */


        },
        fetchAndSyncFriends: function( callback ) {

            LJ.fn.GraphAPI('/me/friends', function(res) {

                var fb_friends     = res.data;
                var fb_friends_ids = _.pluck(res.data, 'id');

                var data = {
                    'userId'         : LJ.user._id,
                    'fb_friends_ids' : fb_friends_ids
                };

                var cb = {
                    'success' : callback,
                    'error'   : LJ.fn.handleServerError
                };

                LJ.fn.say('me/fetch-and-sync-friends', data, cb);


            });

        },
        fetchCloudinaryTags: function( callback ){

            var data = {
                userId: LJ.user._id
            };

            var cb = {
                success : callback,
                error   : LJ.fn.handleServerError
            };

            LJ.fn.say('me/cloudinary-tags', data, cb);

        },
        handleFetchCloudinaryTags: function( data ){

            // Refresh every uplaod tag every 45min 
            // They become outdated every 1 hour
            var refresh_delay = 1000 * 60 * 45;
            var tags = data.cloudinary_tags;

            LJ.fn.setupCloudinary( tags );
            LJ.fn.refreshCloudinary( refresh_delay );

        },
        refreshCloudinary: function( delay ){

            LJ.fn.timeout( delay, function(){
                LJ.fn.fetchCloudinaryTags(function( res ){
                    LJ.fn.handleFetchCloudinaryTags( res );
                    LJ.fn.refreshCloudinary( delay );
                });
            });

        },
        initLayout: function( settings ){

            LJ.fn.log('initializing layout...', 1);
            // Google Places to browse the map 
            var options = {};
            LJ.google_places_autocomplete_filters = new google.maps.places.SearchBox( 
                document.getElementById('moveAround'), options 
            );

            LJ.google_places_autocomplete_filters.addListener('places_changed', function(){

                var place = LJ.google_places_autocomplete_filters.getPlaces()[0];
                var bounds = LJ.google_places_autocomplete_filters.getBounds();

                if( !place.geometry ) return;

                 if( place.geometry.viewport ){
                    LJ.map.fitBounds( place.geometry.viewport );
                 } else if( place.geometry.location ){
                    LJ.map.panTo( place.geometry.location );
                    LJ.map.setZoom(14);
                 }
            });

            // Init Mapview element 
            LJ.fn.initMapview();

            // Show limited mode on mobile 
            $('.m-warning').removeClass('none');

            // Force hide the preview
            $('.row-preview').css({ display: 'none' });

            // Set notification panels 
            LJ.$body.append( LJ.fn.renderNotificationsPanel() );
            LJ.fn.handleDomEvents_Notifications();
            LJ.jsp_api_notifications = $('.notifications-panel__wrapper').jScrollPane().data('jsp');


            // Filter date for events 
            $('.filters-date').append( LJ.fn.renderDatesInFilter );

            // $('.filter-mixity').html(LJ.fn.renderMixityInFilters(LJ.settings.app.mixity));
            //  $('.filter-agerange').html( LJ.fn.renderAgerangeInFilters( LJ.settings.app.agerange ));
            $('#no').html('').html( LJ.tpl.noResults );


            // Profile View 
            //$('.row-subheader').find('span').text( LJ.user._id );
            $('.row-name').find('input').val (LJ.user.name );
            $('.row-age').find('input').val( LJ.user.age );
            $('.row-job').find('input').val( LJ.user.job );
            LJ.fn.addItemToInput({ inp: '#country', html: LJ.fn.renderItemInInput_Country( LJ.user.country_code ) });

            // Settings View 
            _.keys( LJ.user.app_preferences ).forEach(function( key ) {
                _.keys(LJ.user.app_preferences[key]).forEach(function( sub_key ) {
                    var value = LJ.user.app_preferences[ key ][ sub_key ];
                    $('.row-select[data-propid="' + sub_key + '"][data-selectid="' + value + '"]').addClass('selected');
                });
            });

            $('#email_contact').val( LJ.user.contact_email );


            // Mise à jour des images placeholders 
            $('.picture-wrap').html( LJ.fn.renderProfilePicturesWraps );
            var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder.id, LJ.cloudinary.placeholder.params );
            $('.picture').prepend( $placeholder );

            // Update de toutes les images 
            for( var i = 0; i < LJ.user.pictures.length; i++ ){
                LJ.user.pictures[ i ].scope = ['profile'];
                LJ.fn.replaceImage( LJ.user.pictures[ i ] );
            }

            LJ.fn.displayPictureHashtags();

            // ThumbHeader View 
            LJ.$thumbWrap.find('h2#thumbName').text( LJ.user.name );
            var d = LJ.cloudinary.displayParamsHeaderUser;

            var mainImg = LJ.fn.findMainImage();
            d.version = mainImg.img_version;

            var imgTag = $.cloudinary.image( mainImg.img_id, d );
            imgTag.addClass('left');

            LJ.$thumbWrap.find('.imgWrap').html('').html( imgTag );

            // Settings View 
            $('#newsletter').prop('checked', LJ.user.newsletter);
            $('#currentEmail').val( LJ.user.email );

            LJ.fn.log('...done', 1);
        },
        displayLayout: function() {

            LJ.fn.log('Displaying layout...', 1);

            // Header preparation
            $('.menu-item-active').removeClass('menu-item-active');
            $('#events').addClass('menu-item-active')
                .find('span').velocity({
                    opacity: [1, 0],
                    translateY: [0, -5]
                });

            function during_cb() {

                /* Landing Page View */
                $('#facebook_connect').remove();
                $('.hero-logo').remove();
                $('#landingWrap').remove();
                $('body > header').removeClass('none');
                
                $('body').css({
                    'background': 'none'
                });

                $('#mainWrap').css({
                    'background': 'url(/img/app/crossword.png)',
                    'display'   : 'block'
                });

                LJ.$body.trigger('display:layout:during');
                $('.progress_bar--landing').css({ width: '120%' });

                setTimeout(function(){
                    $('auto-login-message').velocity('transition.fadeOut');
                    $('.curtain').trigger('curtain:behindthescene:done');
                    $('.progress_bar--landing').velocity('transition.slideUpOut', { duration: 500 });
                }, 1200 );

            }

            function after_cb() {

                if( window.localStorage ){
                    window.localStorage.removeItem('reconn_data');
                }

                $('.auto-login-message').remove();

                $('#thumbWrap').velocity('transition.slideUpIn', {
                    duration: 1000
                });

                $('.row-events-filters').velocity( LJ.ui.slideUpInLight,{ 
                    display: 'flex',
                    duration: 500,
                    delay: 800
                });


                $('.menu-item').velocity({
                    opacity: [1, 0]
                }, {
                    display: 'inline-block',
                    duration: 800,
                    complete: function() {

                        // $('.menu-item').each(function(i, el) {
                        //     $(el).append('<span class="bubble filtered"></span>')
                        // });

                        if ( LJ.user.status == 'new'){
                            // Tour d'introduction
                            LJ.fn.initIntro();
                        }

                        LJ.$body.trigger('display:layout:after');

                    }
                });
            }

            LJ.fn.displayContent( '#eventsWrap', {

                during_cb: during_cb,
                after_cb: after_cb,
                mode: 'curtain',
                myWayIn: 'transition.slideDownIn',
                myWayOut: 'transition.slideUpOut',
                prev: 'revealed',
                delay: 1300

            });


        },
        handleFetchUserAndConfigurationSuccess: function( data ){

            LJ.fn.log('Fetching user and config success', 1);

            LJ.user = data.user;
            LJ.settings = data.settings;

            // Register to Pusher based on users channels 
            LJ.fn.subscribeToChannels( data.user );

            // Set all app ui elements specific to user session 
            LJ.fn.initLayout( data.settings );

            // Je sais plus trop cette fonction me soule! 
            LJ.fn.setLocalStoragePreferences();

            async.parallel([
                function( callback ){
                    // Update friends based on facebook activity on each connection 
                    LJ.fn.fetchAndSyncFriends(function( res ){
                        console.log(res);
                        // LJ.fn.handleFetchAndSyncFriends( res );
                        callback();
                    });

                },
                function( callback ){
                    // Fetch signed cloudinary upload tags
                    LJ.fn.fetchCloudinaryTags(function( res ){
                        LJ.fn.handleFetchCloudinaryTags( res );
                        callback();
                    });

                },
                function( callback ){
                    // Fetch and display all events on map 
                    LJ.fn.fetchEvents(function( err, res ){
                        LJ.fn.warn( err, 1);
                        LJ.fn.handleFetchEvents( err, res );
                        callback();
                    });

                },
                function( callback ){
                    // Fetch all parties 
                    LJ.fn.fetchParties(function( err, res ){
                        LJ.fn.warn( err, 1 );
                        LJ.fn.handleFetchParties( err, res );
                        callback();
                    });
                }, 
                function( callback ){
                    // Fetch and display my events on map */
                    LJ.fn.fetchMyEvents(function( err, res ){
                        LJ.fn.warn( err, 1 );
                        LJ.fn.handleFetchMyEvents( err, res );
                        callback(); 
                    });
                    
                }], function( err, results ){

                    if( err ){
                        return LJ.fn.warn('Error initializing the app : ' + err, 1);
                    }

                    // Rendu sur la map quand toutes les données en cache
                    // Display Google Map upon which to render event markers 
                    LJ.$body.on('display:layout:during', function(){
                        LJ.fn.initMap();
                        LJ.fn.displayEventsMarkers( LJ.cache.events );
                        LJ.fn.displayPartyMarkers_Events( LJ.cache.events );
                        LJ.fn.displayPartyMarkers_Parties( LJ.cache.parties );
                    });

                    // Admin scripts. Every com is secured serverside 
                    if( LJ.user.access.indexOf('admin') != -1 ){
                        LJ.fn.log('Starting admin script', 1);
                        LJ.fn.initAdminMode();
                    }

                    // Init notifications
                    LJ.fn.initNotifications();
                    
                    LJ.fn.displayLayout();                    

                });


                // Convenience, out of tests 
                LJ.fn.api('get', 'users', function(err, users) {
                    LJ.cache.users = users;
                });

        },
        handleReconnection: function(){

            LJ.fn.warn('Reconnecting user...', 1);
            LJ.reconnected_started_at = new Date();

            if( $('.curtain').css('opacity') != 0 ){
                return;
            }

            $('.curtain')
                .html('')
                .html(
                    '<div class="super-centered none reconnect-message">'
                        + LJ.text_source["app_reconnect"][ LJ.app_language ]
                    + '</div>'
                )
                .velocity('transition.fadeIn', {
                duration: 500,
                complete: function(){

                    $(this)
                        .find('.reconnect-message')
                        .velocity('transition.fadeIn', {
                            duration: 500
                        });

                    $(this)
                        .velocity({ opacity: [0.82,1]}, {
                            duration: 300
                        });
                        
                }
            });

        },
        // Test function
        simReco: function( time_offline ){
            LJ.fn.handleReconnection();
            LJ.fn.timeout( time_offline, function(){
                LJ.fn.reconnectUser();
            });
        },
        reconnectUser: function(){

            // UI considerations
            var delay = 3500 - ( (new Date()) - LJ.reconnected_started_at );

            LJ.fn.timeout( delay, function(){
                LJ.fn.log('Launching reconnection process', 1);

                 $('.curtain')
                        .velocity({ opacity: [1,0.82]}, {
                            duration: 500
                        });

                $('.reconnect-message').velocity('transition.fadeOut', {
                    duration: 500,
                    complete: function(){

                        var preferences = {
                            facebook_id : LJ.user.facebook_id,
                            long_lived_tk: LJ.user.facebook_access_token.long_lived,
                            tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
                        };

                        window.localStorage.setItem("reconn_data", JSON.stringify( preferences )); 
                        document.location = "/home";

                        }
                });


            });

        },
        resetAppData: function(){

        },
        log: function( msg, level ){

            level = level || 3;

            if( msg && level < LJ.log_level ){
                console.log( msg )
            }
        },
        warn: function( msg, level ){
            
            level = level || 3;

            if( msg && level < LJ.log_level ){
                console.warn( msg )
            }

        },
        timeout: function(ms, cb, p2) {
            setTimeout(function() {
                cb(p2);
            }, ms)
        }       


    }); //end LJ




