		
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_slide_duration: 450,
		hide_slide_duration: 450,

		replace_slide_duration: 300,

		show_slide_delay   : 0,
		hide_slide_delay   : 250,

		facebook_img_min_width: 200,
		facebook_img_max_width: 300,

		slide_top: 58,

		showSlideAndFetch: function( options ){

			var uiPromise;
			if( $('.slide').length ){
				uiPromise = LJ.ui.replaceSlide
			} else {
				uiPromise = LJ.ui.showSlide
			}

			return LJ.promise(function( resolve, reject ){
				LJ.Promise.all([
					options.fetchPromise( options.promise_arg ),
					uiPromise( options )
				]).then(function( results ){
					resolve( results[0] );
				}, function( err ){
					console.log(err);
				});
			})

		},
		replaceSlide: function(){
			return LJ.promise(function( resolve, reject ){

				var $l = $('.slide').find('.slide__loader')
				
				$l.siblings().velocity('shradeOut', {
					duration : LJ.ui.replace_slide_duration,
					display  : 'none',
					complete: function(){
						$(this).remove();
						resolve();
					}
				});

				$l.velocity('shradeIn', {
					duration : LJ.ui.replace_slide_duration / 1.5,
					delay    : LJ.ui.replace_slide_duration
				})

			});
		},
		showSlide: function( options ){
			return LJ.promise(function( resolve, reject ){

				options = options || {};

				var $slide = $( LJ.ui.renderSlide( options ) );

				var height = $(window).height() - LJ.ui.slide_top;

				$slide
					  .hide()
					  .appendTo('body')
					  .css({ 'top': LJ.ui.slide_top, 'height': height })
					  .velocity('slideRightIn', {
					  	delay: LJ.ui.show_slide_delay,
					  	display: 'flex',
					  	duration: LJ.ui.show_slide_duration,
					  	complete: function(){
					  		return resolve();
					  	}
					  })
					  .on('click', '.slide__close', LJ.ui.hideSlide )

			});
		},
		hideSlide: function(){
			
			$('.slide').velocity('slideRightOut', {
				duration: LJ.ui.hide_slide_duration,
				complete: function(){
					$(this).remove();
				}
			});


		},
		renderSlide: function( options ){

			var body_html = options.body || LJ.static.renderStaticImage('slide_loader');
			var modifier  = '--' + options.type;

			var attributes = [];
			if( options.attributes ){
				options.attributes.forEach(function( attr_object ){
					attributes.push('data-' + attr_object.name  + '="' + attr_object.val + '"');
				});
			}
			attributes = attributes.join(' ');

			var header = '';
			if( options.title ){
				header = ['<header class="slide-header">',
						'<div class="slide__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>'
					].join('');
			}

			var subheader = '';
			if( options.subtitle ){
				subheader = ['<div class="slide-subheader">',
						options.subtitle,
					'</div>'
					].join('');
			}

			var footer = '';
			if( options.footer ){
				footer = ['<div class="slide-subheader">',
						options.subtitle,
					'</div>'
					].join('');
			}

			return [

				'<div class="slide ' + modifier + '" ' + attributes + '>',
					'<div class="slide__close --round-icon">',
						LJ.ui.renderIcon('cancel'),
					'</div>',
					header,
					subheader,
					'<section class="slide-body">',
						body_html,
					'</section>',
					footer,
				'</div>'

			].join('');

		}

	});




	testSlide = function(){
		LJ.ui.showSlide({
			"title": "Félicitations !",
			"subtitle": "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"body": "Then there goes the body...",
			"footer": "<button class='--rounded'><i class='icon icon-check'></i></button>"
		});
	};

	testSlideFetch = function(){

		LJ.profile_user.showUserProfile( LJ.user.facebook_id );

	}