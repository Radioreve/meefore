		
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_modal_duration: 450,
		hide_modal_duration: 450,
		show_modal_delay   : 250,
		hide_modal_delay   : 250,

		facebook_img_min_width: 200,
		facebook_img_max_width: 300,

		showModalAndFetch: function( options ){
			return LJ.promise(function( resolve, reject ){
				LJ.Promise.all([
					options.fetchPromise(),
					LJ.ui.showModal( _.extend(options, {show_loader: true}) )
				]).then(function( results ){
					resolve( results[0] );
				}).catch(reject);

			})

		},	
		showModal: function( options ){
			return LJ.promise(function( resolve, reject ){

				options = options || {};

				var $modal = $( LJ.ui.renderModal( options ) );

				LJ.ui.showCurtain({ duration: 500, opacity: .75 })

				$modal.hide()
					  .appendTo( $('.curtain') )
					  .velocity('bounceInQuick', {
					  	delay: LJ.ui.show_modal_delay,
					  	display: 'flex',
					  	duration: LJ.ui.show_modal_duration,
					  	complete: function(){
					  		return resolve();
					  	}
					  })
					  .on('click', '.modal__close', LJ.ui.hideModal )

			});
		},
		hideModal: function(){
			
			$('.modal').velocity('bounceOut', {
				duration: LJ.ui.hide_modal_duration
			});

			$('.curtain').velocity('fadeOut', {
				duration: LJ.ui.hide_modal_duration,
				delay: LJ.ui.hide_modal_delay,
				complete: function(){
					$(this).remove();
				}
			})

		},
		shadeModal: function(){
			return LJ.promise(function( resolve, reject ){

				$('.modal').velocity('bounceOut', {
					duration: 600,
					display : 'none'
				});

				LJ.delay(300)
					.then(function(){
						$('.curtain')
							.css({ 'transition': 'all ease-in-out .6s' })
							.css({ 'background': 'rgba(19,19,19,1) '});
					})
					.then(function(){
						return LJ.delay(600)
					})
					.then(function(){
						$('.curtain')
							.css({ 'transition': 'none' });
						resolve();
					})

			});
		},
		renderModal: function( options ){

			var modifier  = '--' + options.type;

			if( !options.body ){
				body_html = '';
			} else {
				body_html = '<section class="modal-body">' + options.body + '</section>';
			}

			if( options.show_loader ){
				body_html = '<section class="modal-body">' + LJ.static.renderStaticImage('modal_loader') + '</section>';
			}

			var attributes = [];
			if( options.attributes ){
				options.attributes.forEach(function( attr_object ){
					attributes.push('data-' + attr_object.name  + '="' + attr_object.val + '"');
				});
			}
			attributes = attributes.join(' ');

			return [

				'<div class="modal ' + modifier + '" ' + attributes + '>',
					'<header class="modal-header">',
						'<div class="modal__close">',
							LJ.ui.renderIcon('cancel'),
						'</div>',
						'<div class="modal__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>',
					'<div class="modal-subheader">',
						options.subtitle,
					'</div>',
					body_html,
					'<footer class="modal-footer">',
						options.footer,
					'</footer>',
				'</div>'

			].join('');

		}

	});






	testModal = function(){
		LJ.ui.showModal({
			"title": "Félicitations !",
			"subtitle": "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"body": "Then there goes the body...",
			"footer": "<button class='--rounded'><i class='icon icon-check'></i></button>"
		});
	};

	testModalFetch = function(){

		LJ.ui.showModalAndFetch({

			"type"			: "facebook",
			"title"			: "Félicitations fetch!",
			"subtitle"		: "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"footer"		: "<button class='--rounded'><i class='icon icon-plus'></i></button>",

			"fetchPromise"	: LJ.facebook.fetchProfilePictures

		}).then(function( results ){
			console.log('Call went thru!');
			
			var html = [];
			results.data.forEach(function( picture_object ){
				picture_object.images.forEach(function( image_object ){
					if( image_object.width > LJ.ui.facebook_img_min_width && image_object.width < LJ.ui.facebook_img_max_width ){
						html.push( LJ.facebook.renderPicture( image_object.source ) );
					}
				});
			});

			$('.modal-body').append( html.join('') )
							.find('.modal__loader')
							.velocity('bounceOut', {
								duration: 500,
								delay: 1000,
								complete: function(){
									$(this).siblings()
										   .velocity('bounceInQuick', {
										   		display: 'block'
										   });
								}
							})

		});

	}