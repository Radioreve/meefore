
window.LJ.ui = _.merge( window.LJ.ui || {}, {

	$window	    : $(window),
	$body 		: $('body'),

	jsp: {},

	show_curtain_duration	: 2000,
	hide_curtain_duration	: 2000,
	minimum_api_delay		: 1000,

	action_show_duration: 400,
	action_hide_duration: 400,

	shrade_duration: 300,

	minimum_reconnection_delay: 3500,
	reconnection_curtain_alpha: 0.88,
	changelang_curtain_alpha: 0.92,

	scrolltop: 0,

	//Down
	slideDownInLight:  { opacity: [1, 0], translateY: [0, 10]   },
    slideDownOutLight:  { opacity: [0, 1], translateY: [10, 0]   },
    slideDownInVeryLight:  { opacity: [1, 0], translateY: [0, 7]   },
    slideDownOutVeryLight:  { opacity: [0, 1], translateY: [7, 0]   },
    //Up
    slideUpInLight: { opacity: [1, 0], translateY: [0, -10]   },
	slideUpOutLight: { opacity: [0, 1], translateY: [-10, 0]   },
    slideUpInVeryLight: { opacity: [1, 0], translateY: [0, -7]   },
	slideUpOutVeryLight: { opacity: [0, 1], translateY: [-7, 0]   },
    //Left
	slideLeftInLight:  { opacity: [1, 0], translateX: [0, -10]   },
	slideLeftOutLight:  { opacity: [0, 1], translateX: [-10, 0]   },
    slideLeftInVeryLight:  { opacity: [1, 0], translateX: [0, -7]   },
    slideLeftOutVeryLight:  { opacity: [0, 1], translateX: [-7, 0]   },
    //Right
    slideRightInLight: { opacity: [1, 0], translateX: [0, 10]   },
	slideRightOutLight: { opacity: [0, 1], translateX: [10, 0]   },
    slideRightInVeryLight: { opacity: [1, 0], translateX: [0, 7]   },
    slideRightOutVeryLight: { opacity: [0, 1], translateX: [7, 0]   },
	
	init: function(){

		LJ.ui.$window.scroll( LJ.ui.setScrollDirection );

	},
	getScrollDirection: function(){
		return LJ.ui.scroll_direction;
	},
	setScrollDirection: function(){

		var current_scrolltop = LJ.ui.$window.scrollTop();

		if( LJ.ui.scrolltop > current_scrolltop ){
			LJ.ui.scroll_direction = "up";
		} else {
			LJ.ui.scroll_direction = "down";
		}

		LJ.ui.scrolltop = LJ.ui.$window.scrollTop();


	},
	getScrollRatio: function(){

		var s = $(window).scrollTop(),
		    d = $(document).height(),
		    c = $(window).height();

		return scrollPercent = (s / (d-c));

	},
	showCurtain: function( o ){

		o = o || {};

		var already_there = false;

		var $curtain;
		if( $('.curtain').length > 0 ) {
			$curtain = $('.curtain');
			already_there = true;
		} else {
			var alpha = o.opacity || 1;
			$curtain = $('<div class="curtain"></div>')
						.hide().css({ 'background': 'rgba(19,19,19,' + alpha + ')' }).appendTo( LJ.ui.$body );
		}

		return LJ.promise(function( resolve, reject ){

			if( already_there ){
				return resolve();
			}

			$('.curtain').velocity('fadeIn', {
				display  : 'flex',
				duration : o.duration || LJ.ui.show_curtain_duration,
				complete : function(){

					var $curtain = $(this);

					$curtain.click(function(e){

						if( !$(e.target).hasClass('curtain') ) return;

						if( $curtain.hasClass('sticky') ){
							return LJ.wlog('Curtain is in sticky mode');
						}

						var $modalclose = $curtain.find('.modal__close');
						if( $modalclose.length > 0 ){
							return $modalclose.click();
						}

						LJ.ui.hideCurtain({
							duration: o.duration || LJ.ui.hide_curtain_duration
						});

					});

					resolve( $curtain );
				}
			});

		});
	},
	hideCurtain: function( o ){

		o = o || {};

		var duration = LJ.ui.hide_curtain_duration;
		if( o.duration ){
			duration = o.duration;
		}

		var delay = 0;
		if( o.delay ){
			delay = o.delay;
		}

		if( o.mode == "bounce" ){

			return LJ.promise(function( resolve, reject ){
				$('.curtain')
					.children()
					.velocity( "bounceOut", { duration: duration });

				$('.curtain').velocity('fadeOut', {
					duration: duration,
					delay: duration/2,
					complete: function(){
						$('.curtain').remove();
						resolve();
					}
				});

				});
		}

		return LJ.promise(function( resolve, reject ){
			$('.curtain').velocity( 'fadeOut', {
				duration : duration,
				delay    : delay,
				complete : function(){
					$('.curtain').remove();
					resolve();
				}
			});

		});
	},
	showLoader: function( loader_id ){

		$( LJ.static.renderStaticImage('main_loader') )
				 .attr('data-loaderid', loader_id)
				 .appendTo('body')
				 .velocity('fadeIn', { duration: 400 });

	},
	hideLoader: function( loader_id ){

		LJ.static.getLoader( loader_id )
				 .velocity('fadeOut', {
				 	duration : 250,
				 	complete : function(){
				 		$(this).remove();
				 	}
				 })

	},
	render: function( html ){

		var $html = $( html );
		LJ.lang.translate( $html );
		return $html.prop('outerHTML');

	},
	turnToJsp: function( element, options ){
		return LJ.promise(function(resolve, reject){

			if( !options.jsp_id ){
				LJ.wlog('Setting jsp without jsp_id');
			}

			LJ.delay(100).then(function(){ 

				$(element).jScrollPane();
				LJ.ui.jsp[ options.jsp_id ] = $(element).data('jsp');
				resolve();

			});
		});
	},
	renderIcon: function( icon_id, icon_classes ){

		var icon_class = icon_id;
		if( icon_classes && Array.isArray(icon_classes) ){
			icon_class += ' ' + icon_classes.join(' ');
		}

		return '<i class="icon icon-' + icon_class + '"></i>';
	},
	renderSessionDisconnected: function(){

		return LJ.ui.render([
				'<div class="disconnected">',
					'<div class="disconnected__icon --round-icon">',
						'<i class="icon icon-pending"></i>',
					'</div>',
					'<div class="disconnected__title">',
						'<h2 data-lid="disconnected_title"></h2>',
					'</div>',
					'<div class="disconnected__subtitle">',
						'<p data-lid="disconnected_subtitle"></p>',
					'</div>',
				'</div>'
			].join(''));

	},
	handleReconnection: function(){

		if( $('.curtain').length != 0 ){
			$('.curtain').velocity('fadeOut', {
				duration: 400,
				complete: function(){
					$( this ).remove();
					LJ.ui.handleReconnection();
				}
			})
		}

		LJ.wlog('Handling loss of internet connection');
		LJ.ui.reconnected_started_at = new Date();

		LJ.ui.showCurtain({ opacity: 1, duration: 400 })
			.then(function(){

				$('.curtain').velocity({
					opacity: [ LJ.ui.reconnection_curtain_alpha, 1 ]}, {
                    duration: 200
                });

				$( LJ.ui.renderSessionDisconnected() )
					.hide()
					.appendTo('.curtain')
					.velocity('fadeIn', {
						duration: 400,
						display: 'flex'
					});

			});
	},
	activateHtmlScroll: function(){
		$('html').css({ 'overflow': 'auto' });
	},
	deactivateHtmlScroll: function(){
		$('html').css({ 'overflow': 'hidden' });
	},
	reconnectUser: function(){

        var delay = 3500 - ( (new Date()) - LJ.ui.reconnected_started_at );

        LJ.delay( delay )
        	.then( LJ.ui.shadeModal )
        	.then(function(){

	        	LJ.log('Launching reconnection process', 1);
            	var preferences = {
                    facebook_id    : LJ.user.facebook_id,
                    long_lived_tk  : LJ.user.facebook_access_token.long_lived,
                    tk_valid_until : LJ.user.facebook_access_token.long_lived_valid_until
                };

                localStorage.setItem("reconn_data", JSON.stringify( preferences )); 
                document.location = "/home";

                });
	},
	shradeIn: function( $element, duration ){

		var duration = duration || LJ.ui.shrade_duration;

		return LJ.promise(function( resolve, reject ){

			$element.velocity('shradeIn', {
				duration : duration,
				display  : 'flex',
				complete : resolve
			});

		});

	},
	shradeOut: function( $element, duration ){

		var duration = duration || LJ.ui.shrade_duration;

		return LJ.promise(function( resolve, reject ){

			$element.velocity('shradeOut', {
				duration : duration,
				display  : 'none',
				complete : resolve
			});

		});

	},
	shradeAndStagger: function( $wrap, options ){

			var d = options.duration;

			var fit = options.fit || true;
			if( fit ){
				var height = $(window).height() - LJ.ui.slide_top;
				$wrap.css({ height: height });
			}

			[ $wrap, $wrap.children() ].forEach(function( $el, i ){
				$el.hide().velocity('shradeIn', {
					duration: ( d*i*1.1 ),
					display : 'flex',
					delay   : ( d*0.6*i )
				})
			});

			return LJ.promise(function( resolve, reject ){
				return LJ.delay( d*0.6 + d*1.1 );
			});

		}


});






	LJ.ui.testReco = function( time_offline ){
		LJ.ui.handleReconnection();
		LJ.delay( time_offline )
			.then( LJ.ui.reconnectUser );
	}






































	

window.LJ.fn = _.merge( window.LJ.fn || {}, {

	handleDomEvents_UI: function(){

		LJ.$logout.click(function(){
			LJ.user.app_preferences.ux.auto_login = 'no';
			LJ.fn.setLocalStoragePreferences();
			location.reload();

		});

		LJ.$body.on('click', '#thumbWrap img', function(){
			LJ.fn.displayUserProfile( LJ.user.facebook_id );
		});

		$('#search').click(function(){
			$(this).find('input').focus();
		});


		$('#search').mouseover(function(){

		});

		['#profile', '#events', '#settings'].forEach(function( menuItem ){

			var $menuItem = $( menuItem );

			$menuItem.click(function(){

			$menuItem.find('.bubble').addClass('filtered').text('');
	
			  if( LJ.state.freezing_ui || $menuItem.hasClass('menu-item-active') || ($menuItem.hasClass('disabled')) )
			  	return;

			  		LJ.state.freezing_ui = true;
					
					var linkedContent = $menuItem.data('linkedcontent');
					
					var indexActive = $('.menu-item-active').offset().left,
						indexTarget = $menuItem.offset().left;

					if( indexActive > indexTarget ){
						var myWayOut = LJ.ui.slideRightOutVeryLight || 'transition.slideRightOut' ; 
							myWayIn =  LJ.ui.slideLeftInLight || 'transition.slideLeftIn' ; 
					} else {
						var myWayOut = LJ.ui.slideLeftOutVeryLight || 'transition.slideLeftOut' ; 
							myWayIn =  LJ.ui.slideRightInLight || 'transition.slideRightIn' ; 
					}

					$('.menu-item-active').removeClass('menu-item-active')
										  .find('span.underlay')
										  .velocity({ opacity: [0, 1], translateY: [-2, 0]   },
										   { duration: 250,
										   complete: function(){
										   	$menuItem.addClass('menu-item-active')
													   .find('span.underlay')
												   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
										   	} 
										});

					var duration_time = 500;
					if( !$menuItem.is('#events') ){

						// LJ.fn.refreshMap();
						$('.row-events-accepted-tabview').velocity('transition.slideDownOut', { duration: duration_time });
						$('.row-events-accepted-inview.active').velocity('transition.slideDownOut', { duration: duration_time });
						$('.row-events-filters, .row-preview').velocity('transition.slideUpOut', { duration: duration_time });

					} else {

						$('.row-events-accepted-tabview').velocity('transition.slideUpIn', { duration: duration_time });
						$('.row-events-accepted-inview.active').velocity('transition.slideDownIn', { duration: duration_time });
						setTimeout(function(){
							$('.row-events-filters').velocity('transition.slideDownIn', { duration: duration_time, display: 'flex' });
							if( $('.row-preview').children().length > 0 ){
								$('.row-preview').velocity('transition.slideDownIn', { duration: duration_time, display: 'flex' });
							}
						}, 300 );
						
					}

					LJ.fn.displayContent( linkedContent, {
						myWayOut: myWayOut,
						myWayIn : myWayIn, 
						prev:'revealed',
						duration: 320
					});


				
			  
			});
		});

	},
	displayContent: function( content, options ){
		
			options = options || {};

		if( !options.mode ){
			
			var prev = options.prev;			
			var $prev = $('.'+options.prev);	

			$prev.velocity( options.myWayOut || 'transition.fadeOut', {	
				duration: options.duration || 0,
				display: 'none',
				complete: function(){
					$prev.removeClass( prev )
					$(content).addClass( prev )
						   .velocity( options.myWayIn || 'transition.fadeIn', {
						   	duration: 0 || 450,
						   	display:'block',
						   	complete: function(){
						   		LJ.state.freezing_ui = false;
						   		if(LJ.user.status === 'new'){
						   			//LJ.fn.toggleOverlay('high', LJ.tpl.charte );
						   		}
						   		options.after_cb && options.after_cb();
						   		LJ.fn.adjustAllInputsWidth( content );

						   	}
						   });
				}
			});
		}

		if( options.mode == 'curtain' ) {

			var prev = options.prev;			
			var $prev = $('.'+options.prev);
			
			var parallelTheScene = function(){
				if( options.parallel_cb ){
					options.parallel_cb();
				}
			};

			var behindTheScene = function(){

				options.during_cb();
				$prev.removeClass( prev );
				$(content).addClass( prev )
					   .show()
					   .css({'display':'block'});

			};

			var afterTheScene = function(){
				options.after_cb();
			}

			LJ.fn.displayCurtain({
				parallelTheScene : parallelTheScene,
				behindTheScene   : behindTheScene,
				afterTheScene    : afterTheScene,
				delay			 : options.delay,
				static_delay     : false
			});
			
		} 


	},
	displayCurtain: function( opts ){

		var opts = opts || {};

		var behindTheScene   = opts.behindTheScene   || function(){ LJ.fn.log('Behind the scene'); },
			afterTheScene    = opts.afterTheScene    || function(){ LJ.fn.log('after the scene');  },
			parallelTheScene = opts.parallelTheScene || function(){},

			delay          = opts.delay    || 500,
			static_delay   = opts.static_delay || false,
			show_duration  = opts.duration || 800;
			hide_duration  = opts.hide_duration || show_duration;



		var $curtain = $('.curtain');

		if( $curtain.css('opacity') != '0' || $curtain.css('display') != 'none' ){
			var init_duration = 10;
		}

			$curtain
			.velocity('transition.fadeIn',
			{ 
				duration: init_duration || show_duration, //simuler l'ouverture instantanée
			  	complete: function(){
			  		behindTheScene();
			  		if( static_delay ){
			  			setTimeout(function(){
			  				$curtain.trigger('curtain:behindthescene:done');
			  			}, delay );
			  		} else {
			  			// The curtain will fall down when behindTheScene has finished working
			  		}
			  	}
			})
			
			$curtain.one('curtain:behindthescene:done', function(){
				
				$(this)
				.velocity('transition.fadeOut',
				{	
					display : 'none',
					duration: hide_duration,
					complete: afterTheScene
				});

			});
			

			parallelTheScene();


	},
	toastMsg: function( msg, status, fixed ){

		var toastStatus, toast, tpl;

		if( status == 'error' ){
			    toastStatus = '.toastError',
				tpl = LJ.tpl.toastError;
		}
		if( status == 'info' ){
			    toastStatus = '.toastInfo',
				tpl = LJ.tpl.toastInfo;
		}
		if( status == 'success'){
			    toastStatus = '.toastSuccess',
				tpl = LJ.tpl.toastSuccess;
		}

		if( typeof status == 'undefined' ){
			toastStatus = '.toastInfo'; 
			tpl = LJ.tpl.toastInfo;
		}			

		if( $( '.toast' ).length === 0 )
		{
			$( tpl ).prependTo('#mainWrap');

			    toast = $( toastStatus );
				toastMsg = toast.find('.toastMsg');
				toastMsg.text( msg );

				toast.velocity('transition.slideDownIn', {
					duration: 600,
					complete: function(){

					  if( typeof(fixed) == 'string' )
					  	return

						toast.velocity('transition.slideUpOut', {
							duration:300,
							delay: fixed || 2000,
							complete: function(){
								toast.remove();
								if( LJ.msgQueue.length != 0 )
									LJ.fn.toastMsg( LJ.msgQueue[0].msg, LJ.msgQueue[0].type );
								    LJ.msgQueue.splice( 0, 1 ) //remove le premier élément
							}
							});						
					  }
				});
		}
		else
		{
			LJ.msgQueue.push({ msg: msg, type: status });
		}
	},
	replaceModalTitle: function( message, classes ){

		$('.modal-title').velocity( LJ.ui.slideUpOutLight, {
			complete: function(){
				$(this).text( message )
					.addClass( classes && classes.join(' ') )
					.velocity( LJ.ui.slideDownInLight );
			}
		});
						 

	},
	showLoaders: function(){

    	$( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

    },
    hideLoaders: function(){

        $( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

    },
    displayModal: function( callback ){
		
		$('.modal-curtain')
			.css({'display':'block'})
			.velocity({ 'opacity': [0.66,0] });

		$('.modal-container')
			.find('.modal-container-body').html( LJ.$curtain_loader ).end()
			.css({'display':'block'})
			.velocity({ 'opacity': [1,0] });

		$('.curtain-loader').velocity('transition.fadeIn', { delay: 200, duration: 300});

	},
	hideModal: function( callback ){

		$('.row-events-map').show();
		$('.modal-curtain')
			.velocity({ 'opacity': [0,0.66] }, { complete: function(){
				$('.modal-curtain').css({ display: 'none' }); }
		}).delay(500).velocity({
			complete: function(){
				typeof( callback ) == 'function' && callback();
			}
		})

		$('.modal-container')
			.velocity({ 'opacity': [0,1] }, { complete: function(){
				$('.modal-container').css({ display: 'none', height: 'auto', width: 'auto' });
				$(".modal-container-body *:not('.curtain-loader')").remove(); 
			}
		});

		$('.curtain-loader').hide();

	},
	displayInModal: function( options ){

		var options = options || {};

		var call_started = new Date();
		LJ.fn.displayModal();

		var eventName = 'display-content';

		$('.modal-container').css({ width: options.starting_width });
		$('.modal-container').on( eventName, function( e, data ){

			var content = data.html_data;
			var starts_in = LJ.ui.minimum_loading_time - ( new Date() - call_started );
			setTimeout(function(){
				
				var $content = $(content);

				options.custom_classes && options.custom_classes.forEach( function( class_itm ){
					$content.addClass( class_itm );
				});

				options.custom_data && options.custom_data.forEach(function( el ){
					$content.attr('data-'+el.key, el.val );
				}); 

				$content.hide().appendTo('.modal-container-body');

				$content.imagesLoaded(function(){


					$('.curtain-loader').velocity('transition.fadeOut', { duration: 300 });

					var old_height = $('.modal-container').innerHeight(),
						new_height = old_height + $('.modal-container-body > div').innerHeight() + ( options.fix_height || 0 );

					var old_width = options.starting_width,
						new_width = old_width + $('.modal-container-body > div').innerWidth();


					new_height = new_height > options.max_height ? options.max_height : new_height;

					var duration = new_height > 400 ? 450 : 300;

					$('.modal-container')
						.velocity({ height: [ new_height, old_height ], width: [ new_width, old_width ] }, { 
								duration: duration,
								complete: function(){
									$content.css({'display':'block','opacity':'0'});
									options.predisplay_cb && options.predisplay_cb();
									$content.velocity('transition.fadeIn');
								} 
						});
				});


			}, starts_in );

		});

		if( options.source === 'server' )
		{
			$.ajax({
				method:'GET',
				url: options.url,
				beforeSend: function( req ){
					req.setRequestHeader('x-access-token', LJ.accessToken );
				},
				success: function( data ){
					var html_data = options.render_cb( data );
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
				},
				error: function(){
					var html_data = options.error_cb();
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
				},
				complete: function(){
					$('.modal-container').unbind( eventName );
				}
			});
		}

		if( options.source === 'facebook' )
		{	
			LJ.fn.log('Calling Facebook graph api');
			LJ.fn.GraphAPI( options.url, function(res){

				if( !res && !res.data ) {
					LJ.fn.log('Error, cannot display photos from fb')
					LJ.fn.log(res);
					var html_data = options.error_cb();
				} else {
					var html_data = options.render_cb( res.data );
				}
				
				$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
				$('.modal-container').unbind( eventName );

			});
		}

		if( options.source === 'local' )
		{
			setTimeout( function(){

				var html_data = options.render_cb();
				$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
				$('.modal-container').unbind( eventName );

			}, LJ.ui.minimum_loading_time );
		}

	},
	bubbleUp: function( el, opts ){
		
		var opts = opts || {};

    	var $el = $(el);

    	if( !opts.stack ){
			if( $el.hasClass('active') ){
				return;
			}				
		}

    	var $bubble = $el.find('.bubble'),
    		n = $bubble.text().trim().length == 0 ? 0 : parseInt( $bubble.text() );

    	$bubble.removeClass('filtered').removeClass('none');

    	var add = opts.add || 1;

    		if( add > 99 ) 
    			return $bubble.text('99+');
		
		var set = opts.set || null;

		if( set == 0 )
			return $bubble.addClass('none').text('');

    	return $bubble.text( set || n + add );
		

    },
    bubbleUpMessage: function( chat_id ){

    	var event_id = chat_id.split('-')[0];
        var group_id = chat_id.split('-')[1];

        LJ.fn.bubbleUp('.row-events-accepted-inview[data-eventid="' + event_id + '"] \
            .event-accepted-chatgroup[data-groupid="' + group_id + '"]');

        // Update the tabview & page title
        LJ.fn.updateTabviewBubbles( event_id );

    },
    // Crawl all messages of each tabview for one event, and update the event tabview bubble
    // along with the page title if nmsg > 0;
    updateTabviewBubbles: function( event_id ){


    	var n_messages_unread = 0;

    	$('.row-events-accepted-inview[data-eventid="' + event_id + '"]')
    		.find('.event-accepted-chatgroup')
    		.each(function( i, chatgroup ){

    			var $chatgroup = $( chatgroup );

    			if( $chatgroup.hasClass('active') ){
    				$chatgroup.find('.bubble').addClass('none').text('');
    			} else {
    				n_messages_unread += parseInt( $chatgroup.find('.bubble').text() || 0 );
    			}

    		});

    	LJ.fn.bubbleUp('.event-accepted-tabview[data-eventid="' + event_id + '"]', {
			set   : n_messages_unread + '',
			stack : true 
    	});

    	if( n_messages_unread == 0 ){
    		document.title = LJ.page_default_title;
    	} else {
    		document.title =  n_messages_unread + "  message(s) - " + LJ.page_default_title;
    	}


    },
   	displayUserProfile: function( facebook_id ){

		LJ.fn.displayInModal({ 
			url: '/api/v1/users/' + facebook_id,
			source: 'server',
			starting_width: 300,
			render_cb: LJ.fn.renderUserProfileInCurtain,
			error_cb: LJ.fn.renderUserProfileInCurtainNone
		});
		
	},
	showLoadersInChat: function( $chat_wrap ){

	$chat_wrap.find('.event-accepted-chat-message').velocity({ opacity: [ 0.3, 1 ]});

        $('<div class="load-chat-history">Chargement des messages...</div>')
            .addClass('super-centered none')
            .appendTo( $chat_wrap )
            .velocity('transition.fadeIn', {
                duration: 400
            });

        LJ.$spinner_loader_2
            .clone()
            .addClass('super-centered none').css({ "width": "30px", "display": "none" })
            .appendTo( $chat_wrap )
            .velocity('transition.fadeIn',{
                duraton: 600
            });
	},
	stageUserForWhisper: function( facebook_id, chat_id ){

		var $chat_wrap = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');
		var $user_img  = $chat_wrap.find('.event-accepted-chat-message[data-authorid="' + facebook_id + '"] img');

		if( facebook_id == LJ.user.facebook_id ){
			return console.error('Cant whisper to himself');
		}

		if( $chat_wrap.length != 1 ){
			return console.error('Couldnt find chatwrap for whisper stage');
		}

		if( $user_img.length == 0 ){
			return console.error('Couldnt find img to clone for whisper stage');
		}

		// The img tag is already there as whisper
		if( $user_img.hasClass('whispering') ){

			LJ.fn.log('Already whispering, removing...');

			$user_img.removeClass('whispering');
			$chat_wrap.find('.img-input-whisper[data-authorid="' + facebook_id + '"]')
					  .velocity('transition.slideRightOut', { duration: 500, complete: function(){ 
					  	$(this).remove();
					  	LJ.fn.adjustAllWhisperOnInput( $chat_wrap );
					  } });
		} else {

			LJ.fn.log('First time whispering, adding...');

			$user_img.addClass('whispering')
			$user_img.first().clone().addClass('img-input-whisper').attr('data-authorid', facebook_id )
					 .appendTo( $chat_wrap.find('.event-accepted-chat-typing') )
					 .velocity('transition.slideLeftIn', { duration: 500 })
					 .click(function(){
					 	LJ.fn.stageUserForWhisper( facebook_id, chat_id );
					 });
					 LJ.fn.adjustAllWhisperOnInput( $chat_wrap );



		}


	},
	adjustAllWhisperOnInput: function( $chat_wrap ){

		var imgs = $chat_wrap.find('.img-input-whisper');

		if( imgs.length == 0 ){
			$chat_wrap.find('.event-accepted-chat-typing').normalify();
			// return;
		}
		if( imgs.length == 1 ){
			$chat_wrap.find('.event-accepted-chat-typing').whisperify();
			//return;
		}

		// Adjust imgs position
		var step = imgs.first().outerWidth( true ) - 5;
		imgs.each(function( i, img ){
			$( img ).css({ "left": ( i * step )+ 'px', "z-index": 10 + i });
		});

		// Adjust input padding
		var new_padding = imgs.length == 0 ? 10 : ( step * imgs.length - 5 );
		$chat_wrap.find('input').css({ "padding-left": new_padding + 'px'});

	},
	whisperifyChatMessages: function( chat_id ){

		var $chat_wrap = $('.event-accepted-chat-wrap[data-chatid="' + chat_id + '"]');

		if( $chat_wrap.length != 1 ){
			return LJ.fn.warn('Couldnt find one chatwrap based on id : ' + chat_id );
		}

		$chat_wrap
			.find('.event-accepted-chat-message')
			.each(function( i, chat ){

				var $chat = $(chat);

				if( $chat.attr('data-whisperto') == 'null' || !$chat.attr('data-whisperto') )
					return;
				
				LJ.fn.whisperify({
					whisper_to  : $chat.attr('data-whisperto').split(','),
					facebook_id : $chat.attr('data-authorid')
				})( $chat );

			});

	},
	updateTabviewIconStatus: function(){

		var $tabviews = $('.event-accepted-tabview');

		$tabviews.each(function( i, tab ){

			var event_id = $( tab ).attr('data-eventid');
			var status = LJ.fn.iStatus( event_id );
	    	var icon_status = "star"; // default in case nothing found

		    if( status == "accepted" ){
		    	icon_status = "chat";
		    }

		    if( status == "kicked" || status == "pending" ){
		    	icon_status = "ellipsis";
		    }

		    if( status == "hosting" ){
		    	icon_status = "star-1";
		    }

		    $( tab ).attr('data-status', status );

		});

	},
	displayLink: function( width ){

		var $link = $('.row-events-link');
		if( $link.length ){
			$link.remove();
		}

		$('<div class="row-events-link"></div>').insertAfter('.row-events-preview');
		var $link = $('.row-events-link');

		var $events_preview = $('.row-events-preview');
		var $party_preview  = $('.row-party-preview');

		var offset = $events_preview.outerWidth(true) - $events_preview.css('padding-right').split('px')[0];

		$link.css({ display: 'none', width: '0' })
			 .css({ left: offset, display: 'block' })
			 .css({ width: width || 300 });

	}


});