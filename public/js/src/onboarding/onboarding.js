
	
	window.LJ.onboarding = _.merge( window.LJ.onboarding || {}, {

        init: function(){

        },
        init2: function(){

        		LJ.intro_steps = [

        			{ 
                        id      : "init",
                        next_id : "intro_instructions",
                        mode    : "cover",
        			 	callback: function(){
                            var self = this;

        			 		LJ.fn.showWelcomeLintro();
        			 		LJ.map.setZoom(14);
                            // Clear preview to prevent problems when replaying tour
                            google.maps.event.trigger( LJ.map, 'click' );

                            // Make sure doest call on undefined values
                            LJ.event_markers = LJ.event_markers || [];
                            LJ.party_markers = LJ.party_markers || [];

        			 		LJ.event_markers.forEach(function(marker){
        			 			marker.marker.setOpacity(0);
        			 		});
        			 		LJ.party_markers.forEach(function(marker){
        			 			marker.marker.setOpacity(0);
        			 		});

        			 		$('.btn-welcome').click(function(){
			    				LJ.fn.lintroStep( self.next_id );
			    			});

			    			$('.welcome-skip').click(function(){
			    				LJ.fn.clearIntro();
			    				LJ.fn.endIntro(function(){
                                    LJ.fn.fetchFacebookPictureIntro();
			    				});
			    			});

                            var step_html = [
                                '<div class="lintro-next nonei" data-stepid="' + this.id + '" data-nextid="' + this.next_id + '">',
                                    // LJ.text_source["intro_next"][ LJ.app_language ],
                                    '>',
                                '</div>'
                            ].join('');

                            LJ.$body.append( step_html );

        			 	}
        			},
                    {
                        id          : "intro_instructions",
                        next_id     : "intro_1",
                        mode        : "area",
                        upper_el    : "#mainWrap",
                        upper_cover : true,
                        delay       : 1500,
                        text        : LJ.text_source["intro_instructions"][ LJ.app_language ],
                        callback  : function(){
                            LJ.fn.showTextLintro(this);
                        }
                    },
        			{ 
                        id         : "intro_1",
                        next_id    : "intro_2",
                        mode       : "area",
                        upper_el   : ".row-events-filters",
                        lower_el   : ".row-events-accepted-tabview",
                        text       : LJ.text_source["intro_text_1"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			},
        			{
                        id       : "intro_2",
                        next_id  : "intro_3",
                        mode     : "idem",
                        text     : LJ.text_source["intro_text_2"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.fn.displayEventMarker( LJ.intro.event_data, { cache: 'event_markers_intro', intro: true } );
        				}
        			},
        			{
                        id         : "intro_3",
                        next_id    : "intro_4",
                        mode       : "idem",
                        text       : LJ.text_source["intro_text_3"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.fn.displayPartyMarker_Party( LJ.intro.party_data, { cache: 'party_markers_intro', intro: true } );
        				}
        			},
        			{
                        id       : "intro_4",
                        next_id  : "intro_5",
                        duration : 5000,
                        mode     : "idem",
                        text     : LJ.text_source["intro_text_4"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
                            LJ.fn.displayPathToParty({ evt: LJ.intro.event_data });
        				}
        			},
        			{
                        id       : "intro_5",
                        next_id  : "intro_6",
                        mode     : "idem",
                        text     : LJ.text_source["intro_text_5"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);

        					LJ.intro.events_data.forEach(function( evt, i ){

        						var url = LJ.cloudinary.markers.base.open.url;

        						if( i == 0 || i == 2 ) url = LJ.cloudinary.markers.pending.open.url;
        						if( i == 1 || i == 3 ) url = LJ.cloudinary.markers.accepted.open.url;
        						if( i == 4 ) url = LJ.cloudinary.markers.base.full.url;

        						LJ.fn.displayEventMarker( evt,  { url: url, cache: 'event_markers_intro' } );

        					});

        					
                            LJ.intro.events_data.forEach(function( evt ){
                            	 LJ.fn.displayPathToParty({
			                        evt            : evt,
			                        stroke_opacity : 0.25,
			                        cache          : "half_active_paths"
			                    });
                            });
        				}
        			},
        			{
                        id       : "intro_6",
                        next_id  : "intro_10",
                        mode     : "idem",
                        text     : LJ.text_source["intro_text_6"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.event_markers_intro[0].marker.setIcon( LJ.cloudinary.markers.base_active.open.url );
        					LJ.party_markers_intro[0].marker.setIcon( LJ.cloudinary.markers.party_active.url );
        					LJ.fn.addEventMapview( LJ.intro.event_data, { marker: LJ.event_markers_intro[0].marker });
        					LJ.fn.addPartyMapview( LJ.intro.party_data, { marker: LJ.party_markers_intro[0].marker });
                            LJ.fn.timeout(1000, function(){ $('.btn-requestin').click(function(e){ e.stopPropagation(); }); })
                           
        				}
        			},
        			{
                        id         : "intro_7",
                        next_id    : "intro_8",
                        mode       : "element",
                        el         : ".event-preview",
                        text       : LJ.text_source["intro_text_7"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			// 
        			},
        			{
                        id         : "intro_8",
                        next_id    : "intro_9",
                        mode       : "element",
                        el         : ".party-preview",
                        text       : LJ.text_source["intro_text_8"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			// 
        			},
        			{
                        id         : "intro_9",
                        next_id    : "intro_10",
                        mode       : "element",
                        el         : ".btn-requestin",
                        text       : LJ.text_source["intro_text_9"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			},
        			{
                        id         : "intro_10",
                        next_id    : "intro_11",
                        mode       : "element",
                        el         : ".modal-container",
                        text       : LJ.text_source["intro_text_10"][ LJ.app_language ],
                        delay      : 1000,
        				callforward: function(){
        					LJ.fn.showRequestInModal('fake_intro_id');
        				},
        				callback: function(){
        					LJ.fn.showTextLintro(this);
                            $('.modal-container-body').find('*').each(function(i, el){
                                $(el).on('click', function(e){ e.stopPropagation(); });
                            });
                            LJ.fn.clearMapviews();
        				}
        			}, 
        			{
                        id         : "intro_11",
                        next_id    : "intro_15",
                        mode       : "element",
                        el         : ".row-requestin-group-members",
                        text       : LJ.text_source["intro_text_11"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			}, 
        			{
                        id         : "intro_12",
                        next_id    : "intro_13",
                        mode       : "area",
                        upper_el   : '.row-party-preview',
                        lower_el   : '.row-events-accepted-tabview',
                        text       : LJ.text_source["intro_text_12"][ LJ.app_language ],
                        text_align : "center",
                        delay      : 400,
        				callforward: function(){
        					$('.modal-curtain').click();
        				},
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.event_markers_intro.forEach(function( evt, i ){
        						if( i == 1 ) return;
        						evt.marker.setMap(null);
        					});
        					LJ.party_markers_intro[0].marker.setMap(null);
        					LJ.active_paths[0].setMap(null);
        					LJ.half_active_paths.forEach(function( path ){
        						path.setMap(null);
        					});

        				}
        			},
        			{
                        id         : "intro_13",
                        next_id    : "intro_14",
                        mode       : "idem",
                        text       : LJ.text_source["intro_text_13"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.event_markers_intro.forEach(function( evt, i ){
        						if( i == 1 ) return evt.marker.setIcon( LJ.cloudinary.markers.accepted.open.url );
        						evt.marker.setMap(null);
        					});
        				}
        			},
        			{
                        id         : "intro_13a",
                        next_id    : "intro_18",
                        mode       : "area",
                        upper_el   : '.row-events-filters',
                        lower_el   : '.row-events-accepted-tabview',
                        text       : LJ.text_source["intro_text_13a"][ LJ.app_language ],
                        callforward: function(){

                           // Clear preview
                            $('.row-events-accepted-inview').velocity('transition.slideDownOut', { duration: 400 }).removeClass('active');
                            $('.row-preview').velocity('transition.slideUpOut', { duration: 400, complete: function(){
                                $(this).children().remove();
                            }});
                            $('.event-tabview-intro').remove();

        					LJ.event_markers_intro.forEach(function( mrk, i ){
        						if( i == 1 ){
                                    mrk.marker.setIcon( LJ.cloudinary.markers.base.full.url );
                                    LJ.map.panTo( mrk.data.address );
                                    return;
                                }
        						mrk.marker.setMap(null); 
        					});

                        },
                        callback: function(){
                            LJ.fn.showTextLintro(this);
        				}
        			},
        			{
                        id         : "intro_14",
                        next_id    : "intro_15",
                        mode       : "area",
                        upper_el   : '.row-events-accepted-tabview',
                        text       : LJ.text_source["intro_text_14"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					$('.row-events-accepted-tabview')
        						.append( LJ.fn.renderEventTabview( LJ.intro.event_data ) )
        						.children().last()
        						.addClass('event-tabview-intro')
                                .on('click', function(e){ e.stopPropagation(); });
                                
        				}
        			},
        			{
                        id          : "intro_15",
                        next_id     : "intro_16",
                        mode        : "element",
                        el          : '.event-inview-intro',
                        delay       : '300',
                        upper_cover : true,
                        text        : LJ.text_source["intro_text_15"][ LJ.app_language ],
                        callforward: function(){
                            $('.modal-curtain').click();
                            LJ.fn.showIntroChatInview();
                        },
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        				}
        			},
        			{
                        id          : "intro_16",
                        next_id     : "intro_18",
                        delay       : 8000,
                        mode        : "idem",
                        // lower_el : '.row-events-accepted-tabview',
                        text        : LJ.text_source["intro_text_16"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					LJ.fn.showIntroChatTalk();
        				}
        			},
        			{
                        id          : "intro_17",
                        next_id     : "intro_18",
                        mode        : "element",
                        el          : '.event-accepted-chat-typing',
                        padding     : 20,
                        // lower_el : '.row-events-accepted-tabview',
                        text        : LJ.text_source["intro_text_17"][ LJ.app_language ],
        				callback: function(){
        					LJ.fn.showTextLintro(this);
        					setTimeout(function(){
        						LJ.fn.stageUserForWhisper( 'will', 'chat-intro' );
        						setTimeout(function(){
        							LJ.fn.stageUserForWhisper( 'sandy', 'chat-intro' );
        						}, 2500 );
        					}, 3500 );
        				}
        			},
        			{
                        id         : "intro_18",
                        mode       : "cover",
                        close_step : true,
        				callback: function(){

        					LJ.fn.showEndingLintro();
        					LJ.fn.clearIntro();

        					$('.btn-fillprofile').click(function(){
        						LJ.fn.endIntro(function(){
        							$('#profile').click();
        							LJ.fn.fetchFacebookPictureIntro();
        						});
        					});

        					$('.ending-skip').click(function(){
        						LJ.fn.endIntro(function(){
                                    LJ.fn.fetchFacebookPictureIntro();
        						});
        					});
        				}
        			}


        		];

        		LJ.fn.lintroStep( 'init' );


        	},
        	lintroStep: function( step_id ){

                var step = _.find( LJ.intro_steps, function( step ){
                    return step.id == step_id;
                });

                if( !step ) {
                    return LJ.fn.warn('Couldnt find matching step based on step_id : ' + step_id );
                }

                if( step == "end_intro" ){
                    return LJ.fn.endIntro( callback );
                }

                LJ.fn.highlightElement( step );

            },
            highlightElement: function( opts ){

                LJ.fn.log('Applying step : ' + opts.id );
                console.log( opts );

                if( typeof opts.callforward == 'function' ){
                    opts.callforward();
                    return setTimeout(function(){
                        delete opts.callforward;
                        LJ.fn.highlightElement( opts );
                    }, opts.delay );
                }


                var abort = false;
                if( opts.mode == "element" && ( !opts.el || !$(opts.el).length || $(opts.el).length == 0 ) ){
                    LJ.fn.warn('Couldnt find element : ' + $(opts.el), 1 );
                    abort = true;
                }
                if( opts.mode == "area" && ( !opts.upper_el && !opts.lower_el ) ){
                    LJ.fn.warn('Couldnt find all properties to highlight area', 1);
                    abort = true;
                }

                if( opts.mode == "cover" && !opts.callback ){
                    LJ.fn.warn('Didnt get any callback', 1);
                    abort = true;
                }

                if( abort ){
                    LJ.fn.warn('Aborting tour prematurely....', 1);
                    return LJ.fn.lintroStep('intro_18');
                }


                var default_opts = {
                    opacity: 0.85,
                    padding: 0
                };

                opts = _.merge( default_opts, opts );               

                var base_style = {
                    'position'   : 'absolute',
                    'background' : 'rgba(0,0,0,' + opts.opacity + ')',
                    'z-index'    : '10000',
                    'display'    : 'none'
                };

                var $curt_top    = $('<div class="lintro intro-curtain intro-curtain-top"></div>');
                var $curt_left   = $('<div class="lintro intro-curtain intro-curtain-left"></div>');
                var $curt_right  = $('<div class="lintro intro-curtain intro-curtain-right"></div>');
                var $curt_bottom = $('<div class="lintro intro-curtain intro-curtain-bottom"></div>');


                if( opts.close_step ){
                    $('.lintro-next').velocity('transition.fadeOut', { duration: 500, complete: function(){
                        $(this).remove();
                    } });
                }

				// if( opts.duration ){
				//   	LJ.intro_duration = window.setTimeout(function(){
				//   		 $('.lintro-next').click();
				//   	}, opts.duration*1.25 );
				//  }

				if( opts.mode == "idem" ){					
					if( typeof opts.callback == 'function' ){
						opts.callback();
						return;	
					}
				}

        		if( opts.mode == "element" ){

        			var $el = $( opts.el );

					var top    = $el.offset().top;
					var left   = $el.offset().left;
					var width  = $el.outerWidth();
					var height = $el.outerHeight();

					$curt_top.css({
						'width'  : '100%',
						'height' : top - opts.padding,
						'top'    : 0 
					});

					$curt_bottom.css({
                        'width'  : '100%',
                        'height' : $(window).height() - ( top + height + opts.padding ),
                        'top'    : window.scrollY + ( top + height ) + opts.padding,
					});

					$curt_left.css({
                        'width'  : left - opts.padding,
                        'height' : height + 2*opts.padding,
                        'top'    :  top - opts.padding 
					});

					$curt_right.css({
                        'left'   : left + width + opts.padding,
                        'width'  : $(window).width() - ( left + width + opts.padding),
                        'height' : height + 2*opts.padding,
                        'top'    : top - opts.padding 
					});
				}

				if( opts.mode == "area" ){

                    var upper_el_bottom_pose = $(opts.upper_el).offset().top + $(opts.upper_el).outerHeight();

					if( opts.lower_el ){
                        var lower_el_top_pose = $(opts.lower_el).offset().top;
					} else {
                        var lower_el_top_pose    = $(window).height();
                        var upper_el_bottom_pose = $(opts.upper_el).offset().top;
						if( opts.upper_cover ){
							upper_el_bottom_pose += $(opts.upper_el).outerHeight();
						}
					}

					$curt_right.css({ display: 'none'});
					$curt_left.css({ display: 'none'});

					$curt_top.css({
						'width' : '100%',
						'height': upper_el_bottom_pose - opts.padding,
						'top': 0
					});

					$curt_bottom.css({
						'width': '100%',
						'height': $(window).height() - lower_el_top_pose + opts.padding,
						'bottom': 0
					});
				}

				if( opts.mode == "cover" ){

					$curt_right.css({ display: 'none'});
					$curt_left.css({ display: 'none'});
					$curt_bottom.css({ display: 'none' });

					$curt_top.css({
						'width': '100%',
						'height': '100%',
						'top': 0
					});

				}

				// Clear everything 
				$('.lintro').velocity('transition.fadeOut', {
					duration: 700,
					complete: function(){
						$(this).remove();
					}
				});


				$curt_top
				  .add( $curt_bottom ).add( $curt_left ).add( $curt_right )
				  .appendTo('body')
				  .css( base_style )
				  .velocity('transition.fadeIn', {
				  	duration: 700,
				  	display: 'block',
				  	complete: function(){

				  		if( typeof opts.callback == 'function' ){
                            opts.callback();
                        }
				  	}
				  });


        	},
        	renderWelcome: function(){

        		var html = [
        			'<div class="welcome welcome-wrap super-centered">',
        				'<div class="welcome-header">',
        					'<h1 data-lid="intro_welcome_header" >Bienvenue sur le meilleur site de soirées au monde</h1>',
        				'</div>',
        				'<div data-lid="intro_welcome_subheader" class="welcome-subheader">',
        					'Nous avons préparé un petit tour sympa très rapide pour comprendre comment ça marche.',
        				'</div>',
        				'<button data-lid="intro_welcome_btn" class="theme-btn btn-welcome">Montrez-moi</button>',
        				'<div data-lid="intro_welcome_skip" class="welcome-skip">',
        					'Je sais déjà comment ça marche!',
        				'</div>',
        			'</div>'
        		].join('');

                html = $(html);
                LJ.fn.setAppLanguage( LJ.app_language, html )

                return html.prop('outerHTML');

        	},
        	showWelcomeLintro: function(){

    			$('.intro-curtain-top')
    				.append( LJ.fn.renderWelcome() ).children().velocity('transition.fadeIn', {
    				duration: 400 
    			});

        	},
        	renderEnding: function(){

        		var html = [
        			'<div class="welcome welcome-wrap super-centered">',
        				'<div class="welcome-header">',
        					'<h1 data-lid="intro_ending_header" >Et c\'est tout ! </h1>',
        				'</div>',
        				'<div data-lid="intro_ending_subheader" class="welcome-subheader">',
        					'Il ne vous reste plus qu\'à remplir votre profile et à en parler à vos amis. <br> A bientôt en soirée!',
        				'</div>',
        				'<button data-lid="intro_ending_btn" class="theme-btn btn-fillprofile">Mon profile</button>',
                        '<button data-lid="app_button_invite" class="theme-btn invite-friends"></button>',
        				'<div data-lid="intro_ending_skip" class="ending-skip">',
        					'Je remplirai mon profile plus tard...montrez-moi les soirées!',
        				'</div>',
        			'</div>'
        		].join('');

        		html = $(html);
                LJ.fn.setAppLanguage( LJ.app_language, html )

                return html.prop('outerHTML')

        	},
        	showEndingLintro: function(){

        		$('.intro-curtain-top')
    				.append( LJ.fn.renderEnding() ).children().velocity('transition.fadeIn', {
    				duration: 400 
    			});

        	},
        	showTextLintro: function( opts ){

        		if( $('.lintro-text').length != 0 ){
	        		$('.lintro-text').velocity('transition.fadeOut', {
	        			duration: 500,
	        			complete: function(){
	        				$('.lintro-text').remove();
	        				LJ.fn.showTextLintro( opts );
	        			}
	        		});
	        		return;
        		}

		  		$('.intro-curtain-top')
		  			.append('<div class="lintro-text super-centered none">' + opts.text + '</div>')
		  			.find('.lintro-text')
		  			.css({ 'text-align': opts.text_align || 'center' })
                    .append('<div class="lintro-exit transparent">Quitter le tour</div>')
		  			.velocity('transition.fadeIn', {
		  				duration: 500,
                        complete: function(){

                            var $wrap = $(this);

                            $wrap
                                .append('<div class="lintro-next none"><i class="icon icon-right"></i></div>')
                                .find('.lintro-next')
                                .velocity('transition.slideLeftIn', {
                                    duration: 500,
                                    delay: opts.delay || 500,
                                    display: 'inline-block',
                                    complete: function(){
                                        $(this)
                                            .attr('data-stepid', opts.id )
                                            .attr('data-nextid', opts.next_id )
                                            .one('click', function(){
                                                var next_id = $(this).attr('data-nextid');
                                                LJ.fn.lintroStep( next_id );
                                            });
                                    }
                                })

                            $wrap
                                .find('.lintro-exit')
                                .velocity('transition.fadeIn', {
                                    duration: 500,
                                    delay: opts.delay || 500,
                                    display: 'block',
                                    complete: function(){
                                        $(this)
                                            .one('click', function(){
                                                LJ.fn.lintroStep('intro_18');
                                            });
                                    }
                                })

                            
                        }
                    })


        	},
        	showIntroChatInview: function(){	

        		$('.event-tabview-intro').attr('data-status', 'accepted').addClass('active');
				$('.row-events-accepted-inview-wrapper').append( LJ.fn.renderEventInview_Intro( LJ.intro.event_data ) );

		        var adjusted_height = $( window ).outerHeight( true )  
                                      - $('.row-events-preview').innerHeight()
                                      - parseInt( $('.row-events-preview').css('top').split('px')[0] );

                $('.event-inview-intro')
                	.css({ height: adjusted_height })
                	.velocity('transition.fadeIn', {
                		duration: 500
                	})
                	.find('.offline').eq(0).removeClass('offline').addClass('online').end().end()
                	.find('.offline').eq(1).removeClass('offline').addClass('online').end().end()
                	.find('.offline').eq(2).removeClass('offline').addClass('online')

                // Remove all handlers for the demo chat
                $('.detailable').removeClass('detailable');
                $('.readby').off().find('button').on('click', function(e){
                    e.stopPropagation();
                });


        	},
        	showIntroChatTalk: function(){

        		var messages = [];
        		messages.push({
        			html: LJ.fn.renderChatLine_Bot( LJ.text_source["ch_bot_msg_group_accepted"][ LJ.app_language ] ),
        			delay: 3500
        		}, {
        			html: LJ.fn.renderChatLine( _.merge( LJ.intro.message_data_user_1, {
        				msg: LJ.text_source["intro_chat_1"][ LJ.app_language ], 
        				sent_at: new Date() }
        			)),
        			delay: 5500
        		}, {
        			html: LJ.fn.renderChatLine( _.merge( LJ.intro.message_data_user_1, {
        				msg: LJ.text_source["intro_chat_2"][ LJ.app_language ],
        				sent_at: new Date() }
        			)),
        			delay: 7500
        		}, {
        			html: LJ.fn.renderChatLine( _.merge( LJ.intro.message_data_user_2, {
        				msg: LJ.text_source["intro_chat_3"][ LJ.app_language ], 
        				sent_at: new Date() }
        			)),
        			delay: 9500
        		});

        		var $intro = $('.event-inview-intro');
        		messages.forEach(function( msg ){

        			setTimeout(function(){

        				if( $intro.find('.event-accepted-notification-message').length != 0 ){
        					$intro.find('.event-accepted-notification-message').remove();
        				}

        				$intro
        					.find('.event-accepted-chat-messages')
        					.append( msg.html )
        					.children().last()
        					.velocity('transition.fadeIn', { duration: 500 });

        			}, msg.delay );

        		});

        	},
        	endIntro: function(callback){

        		$('.lintro').velocity('transition.fadeOut', {
        			duration: 1000,
        			complete: function(){
        				$(this).remove();
        				if( typeof callback == "function" ){
        					callback();
        				}
        			}
        		});

        	},
        	clearIntro: function(){

        		// Clear what has been added
        		$('.event-inview-intro, .event-tabview-intro').velocity('transition.fadeOut', {
        			duration: 500,
        			complete: function(){
        				$(this).remove();
        			}
        		});

        		// Clear preview
        		google.maps.event.trigger( LJ.map, 'click' );

                if( LJ.event_markers_intro ){
            		LJ.event_markers_intro.forEach(function(marker){
            			marker.marker.setMap(null);
            		});
                }

                if( LJ.party_markers_intro ){
            		LJ.party_markers_intro.forEach(function(marker){
            			marker.marker.setMap(null);
            		});
                }

                if( LJ.event_markers ){
            		LJ.event_markers.forEach(function(marker){
    		 			marker.marker.setOpacity(1);
    		 		});
                }

                if( LJ.party_markers ){
    		 		LJ.party_markers.forEach(function(marker){
    		 			marker.marker.setOpacity(1);
    		 		});
                }

        	},
        	fetchFacebookPictureIntro: function(){

        		var img_place = 0;
                var img_id    = LJ.user._id + '--0'; //important 
                var userId    = LJ.user._id;
                var url       = 'https://graph.facebook.com/' + LJ.user.facebook_id + '/picture?width=320&height=320';

				LJ.fn.updatePictureWithUrl({

			                        userId    : LJ.user._id,
			                        url       : url,
			                        img_place : img_place,
			                        img_id    : img_id

				}, function( err, data ){

					if( err ){
					    return LJ.fn.handleServerError("La synchronisation avec Facebook a échouée.");
			                        }

					LJ.fn.handleServerSuccess();
					LJ.fn.toastMsg( LJ.text_source["to_welcome"][ LJ.app_language ],'info', 4000);

				$('#intro').remove();

				LJ.fn.replaceImage({
                    img_id      : data.img_id,
                    img_version : data.img_version,
                    img_place   : 0,
                    scope       : ['profile','thumb']
				});

                // Typically == LJ.user.pictures[0]
                var pic = _.find( LJ.user.pictures, function(el){
                        return el.is_main;
                    });

                pic.img_id      = data.img_id;
                pic.img_version = data.img_version;

				});

        	}

               

	});