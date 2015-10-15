
	
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        	initIntro: function(){


        	},
        	highlightElement: function( el, opts, callback ){

        		var $el = $(el);
        		if( $el.length == 0 || !$el.length ) return console.warn('Couldnt find element : ' + $el );

        		var default_opts = {
        			opacity: 0.5,
        			padding: 20
        		};

        		if( typeof opacity == "function" ){
        			callback = opacity;
        			opts  = default_opts;
        		} else {
        			opts = _.merge( default_opts, opts );
        		}

				var top    = $el.offset().top;
				var left   = $el.offset().left;
				var width  = $el.outerWidth();
				var height = $el.outerHeight();

				var base_style = {
					'position'   : 'absolute',
					'background' : 'rgba(0,0,0,' + opts.opacity + ')',
					'z-index'    : '100000000',
					'display'    : 'none'
				};

				var $curt_top    = $('<div class="lintro intro-curtain intro-curtain-top"></div>');
				var $curt_left   = $('<div class="lintro intro-curtain intro-curtain-left"></div>');
				var $curt_right  = $('<div class="lintro intro-curtain intro-curtain-right"></div>');
				var $curt_bottom = $('<div class="lintro intro-curtain intro-curtain-bottom"></div>');

				$curt_top.css({
					'width'  : '100%',
					'height' : top - opts.padding,
					'top'    : 0 
				});

				$curt_bottom.css({
					'width': '100%',
					'height': $(window).height() - ( top + height + opts.padding ),
					'top': window.scrollY + ( top + height ) + opts.padding,
				});

				$curt_left.css({
					'width': left - opts.padding,
					'height': height + 2*opts.padding,
					'top':  top - opts.padding 
				});

				$curt_right.css({
					'left': left + width + opts.padding,
					'width': $(window).width() - ( left + width + opts.padding),
					'height': height + 2*opts.padding,
					'top': top - opts.padding 
				});


				$curt_top
				  .add( $curt_bottom ).add( $curt_left ).add( $curt_right )
				  .appendTo('body')
				  .css( base_style )
				  .velocity('transition.fadeIn', {
				  	duration: 1000,
				  	display: 'block',
				  	complete: function(){
				  		$('.intro-curtain').one('click', function(){
				  			$('.lintro').velocity('transition.fadeOut',{
				  				duration: 800,
				  				complete: function(){
				  					$('.lintro').remove();
				  				}
				  			});
				  		});

				  		callback();
				  	}
				  });

        	}

               

	});