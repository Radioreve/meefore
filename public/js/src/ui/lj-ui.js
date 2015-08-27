
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

			['#contact', '#profile', '#events', '#management', '#settings'].forEach(function(menuItem){

				$(menuItem).click(function(){

				$(menuItem).find('span.bubble').addClass('filtered').text('');
		
				  if( LJ.state.animatingContent || $(menuItem).hasClass('menu-item-active') || ($(menuItem).hasClass('disabled')) )
				  	return;

				  		LJ.state.animatingContent = true;
						
						var linkedContent = $(menuItem).data('linkedcontent');
						
						var indexActive = $('.menu-item-active').offset().left,
							indexTarget = $(menuItem).offset().left;

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
											   	$(menuItem).addClass('menu-item-active')
														   .find('span.underlay')
													   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
											   	} 
											});

						LJ.fn.displayContent( linkedContent, {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							prev:'revealed',
							duration: 320
						});
					
				  
				});
			});

			LJ.$body.on('click', '.event-accepted-tabview', function(){

				var $self = $(this);
				var event_id = $self.attr('data-eventid');
				var $inview_wrap_target = $('.row-events-accepted-inview[data-eventid="'+event_id+'"]');
				var evt = _.find( LJ.cache.events, function(el){ return el._id === event_id });
				var duration = 900;

				var opts = { transition_in : LJ.ui.slideUpInLight, transition_out: LJ.ui.slideDownOutLight };
				
				if( $self.hasClass('active') ){
					$inview_wrap_target.velocity('transition.fadeOut', { duration: 700 });
					$self.removeClass('active');
					return;
				}

				if( $('.event-accepted-tabview.active').length == 0 ){
					$self.addClass('active');
					$inview_wrap_target.velocity('transition.slideUpIn', { duration: 600 });
					LJ.fn.addEventPreview( evt, opts );
					LJ.fn.adjustAllChatPanes();
					return;
				}

				var current_event_id = $('.event-accepted-tabview.active').attr('data-eventid');
				var $inview_wrap_current = $('.row-events-accepted-inview[data-eventid="'+current_event_id+'"]');

				$('.event-accepted-tabview').removeClass('active');
				$self.addClass('active');
				
				$('.row-events-accepted-inview[data-eventid="'+current_event_id+'"]')
				.velocity('transition.slideUpOut', {
					duration: duration
				});

				LJ.fn.addEventPreview( evt, opts );

				setTimeout(function(){
					$inview_wrap_target.velocity('transition.slideUpIn', { duration: duration });
					LJ.fn.adjustAllChatPanes();
					return;
				}, 220 );


			});

		},
		displayContent: function( content, options ){
			
				options = options || {};

			if( !options.mode ){
				
				var prev = options.prev;			
				var $prev = $('.'+options.prev);

				$prev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 0 || 400,
					display: 'none',
					complete: function(){
						$prev.removeClass( prev )
						$(content).addClass( prev )
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 0 || 800,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
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
					behindTheScene: behindTheScene,
					afterTheScene : afterTheScene
				})
				
			} 


		},
		displayCurtain: function( opts ){

			var behindTheScene = opts.behindTheScene || function(){ delog('Behind the scene'); },
				afterTheScene  = opts.afterTheScene   || function(){ delog('after the scene');  },
				delay          = opts.delay    || 500,
				duration       = opts.duration || 800;

			var $curtain = $('.curtain');

			if( $curtain.css('opacity') != '0' || $curtain.css('display') != 'none' ){
				var init_duration = 10;
			}

				$curtain
				.velocity('transition.fadeIn',
				{ 
					duration: init_duration || duration, //simuler l'ouverture instantanée
				  	complete: behindTheScene 
				})
				.delay( delay )
				.velocity('transition.fadeOut',
				{	
					display : 'none',
					duration: duration,
					complete: afterTheScene
				});



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
				console.log('undefined');
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
				.velocity({ 'opacity': [0.4,0] });

			$('.modal-container')
				.find('.modal-container-body').html( LJ.$curtain_loader ).end()
				.css({'display':'block'})
				.velocity({ 'opacity': [1,0] });

			$('.curtain-loader').velocity('transition.fadeIn', { delay: 200, duration: 300});

		},
		hideModal: function(callback){

			$('.row-events-map').show();
			$('.modal-curtain')
				.velocity({ 'opacity': [0,0.4] }, { complete: function(){
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

					$content.waitForImages(function(){

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
				LJ.fn.GraphAPI( options.url, function(res){

					if( !res && !res.data ) {
						console.log('Error, cannot display photos from fb')
						console.log(res);
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
		bubbleUp: function( el, add ){

        	var $el = $(el);

        	//if( $el.hasClass('menu-item-active') ) return; 

        	var $bubble = $el.find('.bubble'),
        		n = $bubble.text() == 0 ? 0 : parseInt( $bubble.text() );

        	$bubble.removeClass('filtered');

        	var add = add || 1;

        		if( add > 99 ) 
        			return $bubble.text('99+');
				
        	return $bubble.text( n + add );

        },
       	displayUserProfile: function( facebook_id ){
			LJ.fn.displayInModal({ 
				url: '/api/v1/users/' + facebook_id,
				source: 'server',
				starting_width: 300,
				render_cb: LJ.fn.renderUserProfileInCurtain,
				error_cb: LJ.fn.renderUserProfileInCurtainNone
			});
			
		}

	});