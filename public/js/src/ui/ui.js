
window.LJ.ui = _.merge( window.LJ.ui || {}, {

	$window	    : $(window),
	$body 		: $('body'),

	jsp: {},

	show_curtain_duration	: 2000,
	hide_curtain_duration	: 2000,

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
		LJ.ui.$body.on('keydown', '.modal-search__input input', LJ.ui.filterModalResults );

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
	updatePageTitle: function( title ){

		document.title = title;
		
	},
	getScrollRatio: function(){

		var s = $( window ).scrollTop(),
		    d = $( document ).height(),
		    c = $( window ).height();

		return scrollPercent = (s / (d-c));

	},
	makeLoaderHtml: function( opts ){

		opts = opts || {
			type: "spinner"
		};

		if( opts.type == "spinner" ){
			return '<div class="loader spin"'
		}

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
			var color = o.theme == "light" ? 'rgba(255,255,255,' : 'rgba(19,19,19,';

			$curtain = $('<div class="curtain"></div>');
			$curtain.hide().css({ 'background': color + alpha + ')' }).appendTo( LJ.ui.$body );

		}

		if( o.sticky || o.stick ){
			$curtain.addClass('curtain--sticky');
		}

		return LJ.promise(function( resolve, reject ){

			if( already_there ){
				return resolve();
			}

			$('.curtain').velocity('fadeIn', {
				display  : 'flex',
				duration : o.duration || LJ.ui.show_curtain_duration,
				complete : function(){

					var $curtain = $( this );

					$curtain.click(function(e){

						if( !$(e.target).hasClass('curtain') ) return;

						if( $curtain.hasClass('curtain--sticky') ){
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

		loader_id = loader_id || 'no_id';
		$( LJ.static.renderStaticImage('main_loader') )
				 .attr('data-loaderid', loader_id)
				 .appendTo('body')
				 .show();
				 
				 //.velocity('fadeIn', { duration: 400 });

	},
	hideLoader: function( loader_id ){

		loader_id = loader_id || 'no_id';
		LJ.static.getLoader( loader_id ).remove();

				// .velocity('fadeOut', {
				// 	duration : 250,
				// 	complete : function(){
				// 		$( this ).remove();
				// 	}
				// });

	},
	render: function( html ){

		html = Array.isArray( html ) ? html.join('') : html;
		
		var $html = $( html );
		LJ.lang.translate( $html );
		LJ.pictures.applyFilterlay( $html );
		
		var template = '';
		$html.each(function( i, el ){
			template += $( el ).prop('outerHTML');
		});

		return template;

	},
	turnToJsp: function( element, options ){
		return LJ.promise(function(resolve, reject){

			if( !options.jsp_id ){
				LJ.wlog('Setting jsp without jsp_id');
			}

			LJ.delay(100).then(function(){ 

				$(element).jScrollPane();

				if( options.handlers ){
					options.handlers.forEach(function( h ){
						$(element).bind( h.event_name, h.callback );
					});
				}

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
					'<div class="disconnected__icon x--round-icon">',
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
				duration: 500,
				complete: function(){
					$( this ).remove();
					LJ.ui.handleReconnection();
				}
			})
		}

		LJ.wlog('Handling loss of internet connection');
		LJ.ui.reconnected_started_at = new Date();

		LJ.ui.showCurtain({ opacity: 0.95, duration: 500, sticky: true })
			.then(function(){

				$('.curtain').velocity({
					opacity: [ LJ.ui.reconnection_curtain_alpha, 1 ]}, {
                    duration: 300
                });

				$( LJ.ui.renderSessionDisconnected() )
					.hide()
					.appendTo('.curtain')
					.velocity('shradeIn', {
						duration: 500,
						display: 'flex'
					});

			});
	},
	activateHtmlScroll: function(){

		var opts = { "overflow": "auto" };

		if( LJ.isMobileMode() ){
			opts.position = "static";
			opts.width    = "100%";
			opts.height   = "100%";
		}

		$('html').css( opts );

	},
	deactivateHtmlScroll: function(){

		var opts = { "overflow": "hidden" };

		if( LJ.isMobileMode() ){
			opts.position = "fixed";
			opts.width    = "100%";
			opts.height   = "100%";
		}

		$('html').css( opts );

	},
	reconnectUser: function(){

        var delay = 3500 - ( (new Date()) - LJ.ui.reconnected_started_at );

        LJ.delay( delay )
        	.then( LJ.ui.shadeModal )
        	.then(function(){

	        	LJ.log('Launching reconnection process', 1);

                LJ.store.set("reconnecting", true); 
                document.location = "/home";

                });
	},
	adjustWrapperHeight: function( $w ){

			var height = $( window ).height() - LJ.ui.adjust_top;
			$w.css({ height: height });

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

			var d   = options.duration;
			var fit = options.fit || true;

			if( fit ){
				LJ.ui.adjustWrapperHeight( $wrap );
			}

			[ $wrap, $wrap.children() ].forEach(function( $el, i ){
				$el.css({ display: 'flex', 'opacity': 0 })
					.velocity('shradeIn', {
					duration: ( d*i*1.1 ),
					display : 'flex',
					delay   : ( d*0.6*i )
				});
			});

			return LJ.promise(function( resolve, reject ){
				return LJ.delay( d*0.6 + d*1.1 ).then( resolve );
			});

		}


});






	LJ.ui.simReco = function( time_offline ){
		LJ.ui.handleReconnection();
		LJ.delay( time_offline )
			.then( LJ.ui.reconnectUser );
	}




