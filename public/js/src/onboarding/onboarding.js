
	
	window.LJ.onboarding = _.merge( window.LJ.onboarding || {}, {

        init: function(){

            LJ.onboarding.handleDomEvents();
            LJ.onboarding.handleAppEvents();

        },
        handleDomEvents: function(){

            $('body').on('click', '.js-onboard', LJ.onboarding.handleOnboarding );

        },
        handleAppEvents: function(){

            LJ.on("login:complete", LJ.onboarding.handleLoginComplete );

        },
        handleLoginComplete: function(){

            LJ.onboarding.showOnboarding("welcome_to_meefore");

        },
        handleOnboarding: function(){

            var $s     = $( this );
            var onb_id = $s.attr('data-onboarding-id');

            LJ.onboarding.showOnboarding( onb_id );

        },
        isOnboardingNecessary: function( onb_id ){

            if( LJ.app_settings.onboarding_ids.indexOf( onb_id ) == -1 ){
                LJ.wlog('This onboarding_id ('+ onb_id +') doesnt exist');
                return false;
            }

            // If the user has already seen the onboarding tips, dont show it again
            var seen_at = _.find( LJ.user.onboarding, function( onb ){
                return onb.onboarding_id == onb_id;
            }).seen_at;

            if( seen_at ){
                return false;
            }

           return true;

        },
        showOnboarding: function( onb_id ){
            
            if( !LJ.onboarding.isOnboardingNecessary( onb_id ) ){
                return;
            }

            LJ.log("Updating onboarding tips...");
            LJ.api.updateOnboarding( onb_id )
                .then(function(){
                    LJ.log("...success!");
                    LJ.onboarding.getOnboardingFn( onb_id )();

                })
                .catch(function( err ){
                    LJ.onboarding.handleApiError( err );

                });

        },
        getOnboardingFn: function( onb_id ){

            var onboardingFn;
            if( onb_id == "welcome_to_meefore" ){
               onboardingFn = LJ.onboarding.showWelcomeUser;
            }

            if( onb_id == "create_before" ){
                onboardingFn = LJ.onboarding.showHowToCreateBefore;
            }

            if( onb_id == "send_cheers" ){
                onboardingFn = LJ.onboarding.showHowToSendCheers;
            }

            if( onb_id == "check_settings" ){
                onboardingFn = LJ.onboarding.showHowToChangeSettings;
            }

            if( typeof onboardingFn != "function" ){
                return LJ.wlog('Unable to identify the onboarding fn to use');
            }

            return onboardingFn;

        },
        handleApiError: function( err ){

            LJ.wlog("Onboarding error");
            LJ.wlog( err );

        },
        showWelcomeUser: function(){

            LJ.log("Onboarding user : welcome");
            
            LJ.ui.showCurtain({
               duration : 400,
               opacity  : .75
            });

            LJ.delay( 200 )
                .then(function(){

                    $( LJ.onboarding.rendershowWelcomeUser() )
                        .appendTo('.curtain')
                        .velocity('shradeIn', {
                            duration : 500,
                            display  : 'flex'
                        });

                })
                .then(function(){

                    $('.curtain')
                        .find('.js-close-modal')
                        .on('click', function(){

                            $('.onb-welcome')
                                .velocity('bounceOut', {
                                    duration: 500
                                });

                            LJ.ui.hideCurtain({
                                duration : 500,
                                delay    : 350
                            });

                        });

                });

        },
        rendershowWelcomeUser: function(){

            return LJ.ui.render([

                '<div class="onb-welcome">',
                    '<div class="onb-welcome__icon x--round-icon">',
                        '<i class="icon icon-meedrink-empty"></i>',
                    '</div>',
                    '<div class="onb-welcome__title">',
                        '<span data-lid="onb_welcome_title" data-lpm="'+ LJ.user.name +'"></span>',
                    '</div>',
                    '<div class="onb-welcome__subtitle">',
                        '<span data-lid="onb_welcome_subtitle"></span>',
                    '</div>',
                    '<div class="onb-welcome__footer">',
                        '<button class="js-close-modal" data-lid="onb_welcome_btn"></button>',
                    '</div>',
                '</div>'

            ].join(''));

        },
        showHowToCreateBefore: function(){



        },
        showHowToSendCheers: function(){



        },
        showHowToChangeSettings: function(){



        }




    });