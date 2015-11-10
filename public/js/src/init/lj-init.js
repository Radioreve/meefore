function sleep(ms, cb, p2) {
    setTimeout(function() {
        cb(p2);
    }, ms)
}

function look(json) {
    return JSON.stringify(json, null, '\t');
}

window.csl = function(msg) {
    delog(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {},

    {   

        init: function(o) {

            if( o.debug ){
                LJ.state.debug = true;
            }

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
            LJ.fn.handleDomEvents_Search();
            LJ.fn.handleDomEvents_Settings();

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

            LJ.pusher.connection.bind('state_change', function(states) {
                csl('Pusher state is noww : ' + states.current);

                if ((states.current == 'connecting') && LJ.state.connected );{
                    LJ.fn.handleDisconnection();
                }

                if (states.current == 'disconnected'){
                    LJ.fn.toastMsg("Vous avez été déconnecté.", 'error', true);
                }

                if (states.current == 'unavailable'){
                    LJ.fn.toastMsg("Le service n'est pas disponible actuellement, essayez de relancer l'application ultérieurement", 'error', true);
                }

            });


        },
        initStaticImages: function() {

            LJ.$main_loader = $.cloudinary.image(LJ.cloudinary.loaders.main.id, LJ.cloudinary.loaders.main.params);
            LJ.$main_loader.appendTo($('.loaderWrap'));

            LJ.$mobile_loader = $.cloudinary.image(LJ.cloudinary.loaders.mobile.id, LJ.cloudinary.loaders.mobile.params);
            LJ.$mobile_loader.appendTo($('.m-loaderWrap'));

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
        fetchAndSyncFriends: function(callback) {

            LJ.fn.GraphAPI('/me/friends', function(res) {

                var fb_friends     = res.data;
                var fb_friends_ids = _.pluck(res.data, 'id');

                var data = {
                    userId         : LJ.user._id,
                    fb_friends_ids : fb_friends_ids
                };

                var cb = {
                    success : callback,
                    error   : LJ.fn.handleServerError
                };

                LJ.fn.say('me/fetch-and-sync-friends', data, cb);

            });

        },
        initLayout: function( settings ){

            console.log('initializing layout...');
            /* Google Places to browse the map */
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

            /* Mise à jour du profile des filters */
            $('.mood-wrap').html( LJ.fn.renderMoodInProfile( LJ.settings.app.mood ));
            $('.drink-wrap').html( LJ.fn.renderDrinkInProfile( LJ.settings.app.drink ));

            /* Filter date for events */
            $('.filters-date').append( LJ.fn.renderDatesInFilter );

            // $('.filter-mixity').html(LJ.fn.renderMixityInFilters(LJ.settings.app.mixity));
            //  $('.filter-agerange').html( LJ.fn.renderAgerangeInFilters( LJ.settings.app.agerange ));
            $('#no').html('').append( LJ.tpl.noResults );


            /* Profile View */
            //$('.row-subheader').find('span').text( LJ.user._id );
            $('.row-name').find('input').val (LJ.user.name );
            $('.row-age').find('input').val( LJ.user.age );
            $('.row-job').find('input').val( LJ.user.job );
            LJ.fn.addItemToInput({ inp: '#country', html: LJ.fn.renderItemInInput_Country( LJ.user.country_code ) });
            $('.drink[data-selectid="' + LJ.user.drink + '"]').addClass('selected');
            $('.mood[data-selectid="' + LJ.user.mood + '"]').addClass('selected');

            /* Settings View */
            _.keys( LJ.user.app_preferences ).forEach(function( key ) {
                _.keys(LJ.user.app_preferences[key]).forEach(function( sub_key ) {
                    var value = LJ.user.app_preferences[ key ][ sub_key ];
                    $('.row-select[data-propid="' + sub_key + '"][data-selectid="' + value + '"]').addClass('selected');
                });
            });

            $('#email_contact').val( LJ.user.contact_email );


            /* Mise à jour des images placeholders */
            $('.picture-wrap').html( LJ.fn.renderProfilePicturesWraps );
            var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder.id, LJ.cloudinary.placeholder.params );
            $('.picture').prepend( $placeholder );

            /* Update de toutes les images */
            for( var i = 0; i < LJ.user.pictures.length; i++ ){
                LJ.user.pictures[ i ].scope = ['profile'];
                LJ.fn.replaceImage( LJ.user.pictures[ i ] );
            }

            LJ.fn.displayPictureHashtags();

            /* ThumbHeader View */
            LJ.$thumbWrap.find('h2#thumbName').text( LJ.user.name );
            var d = LJ.cloudinary.displayParamsHeaderUser;

            var mainImg = LJ.fn.findMainImage();
            d.version = mainImg.img_version;

            var imgTag = $.cloudinary.image( mainImg.img_id, d );
            imgTag.addClass('left');

            LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

            /* Settings View */
            $('#newsletter').prop('checked', LJ.user.newsletter);
            $('#currentEmail').val( LJ.user.email );

            console.log('...done');
        },
        displayLayout: function() {

            /* L'user était déjà connecté */
            if (LJ.state.connected){
                return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
            }

            LJ.state.connected = true;

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
                    $('.auto-login-msg').velocity('transition.fadeOut');
                    $('.curtain').trigger('curtain:behindthescene:done');
                    $('.progress_bar--landing').velocity('transition.slideUpOut', { duration: 500 });
                }, 1200 );

            }

            function after_cb() {

                $('#thumbWrap').velocity('transition.slideUpIn', {
                    duration: 1000
                });

                $('.row-events-filters').velocity( LJ.ui.slideUpInLight,{ 
                    display: 'flex',
                    duration: 800,
                    delay: 800
                });


                $('.menu-item').velocity({
                    opacity: [1, 0]
                }, {
                    display: 'inline-block',
                    duration: 800,
                    complete: function() {

                        $('.menu-item').each(function(i, el) {
                            $(el).append('<span class="bubble filtered"></span>')
                        });

                        if ( LJ.user.status == 'new'){
                            LJ.fn.initIntro();
                        }

                        if (LJ.user.friends.length == 0){
                            LJ.fn.toastMsg( LJ.text_source["to_init_no_friends"][ LJ.app_language ], "info");
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

            delog('Fetching user and config success');

            LJ.user = data.user;
            LJ.settings = data.settings;

            // Register to Pusher based on users channels 
            LJ.fn.subscribeToChannels( data.user );

            // Set all app ui elements specific to user session 
            LJ.fn.initLayout( data.settings );

            // Je sais plus trop cette fonction me soule! 
            LJ.fn.setLocalStoragePreferences();

            // Init cloudinary fileupload with inputs 
            LJ.fn.initCloudinary( data.cloudinary_tags );

            
            async.parallel([
                function( callback ){
                    // Update friends based on facebook activity on each connection 
                    LJ.fn.fetchAndSyncFriends(function( err, res ){
                        console.log(err);
                        LJ.fn.handleFetchAndSyncFriends( err, res );
                        callback();
                    });

                },
                function( callback ){
                    // Fetch and display all events on map 
                    LJ.fn.fetchEvents(function( err, res ){
                        console.log(err);
                        LJ.fn.handleFetchEvents( err, res );
                        callback();
                    });

                },
                function( callback ){
                    // Fetch all parties 
                    LJ.fn.fetchParties(function( err, res ){
                        console.log( err );
                        LJ.fn.handleFetchParties( err, res );
                        callback();
                    });
                }, 
                function( callback ){
                    // Fetch and display my events on map */
                    LJ.fn.fetchMyEvents(function( err, res ){
                        console.log(err);
                        LJ.fn.handleFetchMyEvents( err, res );
                        callback(); 
                    });
                    
                }], function( err, results ){

                    if( err ){
                        return console.warn('Error initializing the app : ' + err );
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
                        console.log('Starting admin script');
                        LJ.fn.initParty();
                    }
                    
                    LJ.fn.displayLayout();                    

                });


                // Convenience, out of tests 
                LJ.fn.api('get', 'users', function(err, users) {
                    LJ.cache.users = users;
                });

        },
        handleDisconnection: function(){

            
            
        }


    }); //end LJ

$('document').ready(function() {

    var initFB = function( time ) {

        if( typeof FB === 'undefined' ){
            return sleep( time, initFB )
        }

        FB.init({
            appId: window.facebook_app_id,
            xfbml: true, // parse social plugins on this page
            version: 'v2.5' // use version 2.5
        });

        LJ.fn.init({
            debug   : true,
            country : 'fr'
        });

        csl('Application ready!');
    }

    initFB( 300 );

});


function delog(msg) {
    if (LJ.state.debug)
        console.log(msg);
}



