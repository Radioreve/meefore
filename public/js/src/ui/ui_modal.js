
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_modal_duration: 350,
		hide_modal_duration: 350, 
		show_modal_delay   : 200,
		hide_modal_delay   : 100,

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
					  .velocity('shradeIn', {
					  	delay: LJ.ui.show_modal_delay,
					  	display: 'flex',
					  	duration: LJ.ui.show_modal_duration,
					  	complete: function(){

					  		if( options.jsp_body ){
					  			$('.modal-body').jScrollPane();
					  		}

					  		if( options.search_input ){
					  			var item_id = $('.modal').attr('data-item-id');
					  			$('.modal-item[data-item-id="' + item_id + '"]').remove();
					  		}

					  		return resolve();
					  	}
					  })
					  .on('click', '.modal__close', LJ.ui.hideModal )

			});
		},
		hideModal: function(){
			return LJ.promise(function( resolve, reject ){

				$('.modal').velocity('shradeOut', {
					duration: LJ.ui.hide_modal_duration
				});

				$('.curtain').velocity('fadeOut', {
					duration: LJ.ui.hide_modal_duration,
					delay: LJ.ui.hide_modal_delay,
					complete: function(){
						$(this).remove();
						resolve();
					}
				});
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
			if( options.max_items ){
				attributes.push('data-max-items="'+ options.max_items +'"' );
			}
			attributes = attributes.join(' ');

			var search_input_html = '';
			var disabled = '';
			if( options.search_input ){
				disabled = '--disabled';
				search_input_html = LJ.ui.renderModalSearchInput();
			}

			var footer_html = [
				'<footer class="modal-footer">',
					options.footer,
				'</footer>'
			].join('');

			if( options.no_footer ){
				footer_html = '';
			}

			return [

				'<div class="modal ' + modifier + ' ' + disabled + '" ' + attributes + '>',
					'<header class="modal-header">',
						'<div class="modal__close">',
							'<i class="icon icon-cross-fat"></i>',
						'</div>',
						'<div class="modal__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>',
					'<div class="modal-subheader">',
						options.subtitle,
					'</div>',
					search_input_html,
					body_html,
					footer_html,
				'</div>'

			].join('');

		},
		renderModalSearchInput: function(){

			return LJ.ui.render([
					'<div class="modal-search__input">',
						'<input data-lid="modal_search_input_placeholder" />',
					'</div>'
				].join(''));

		},
		filterModalResults: function(){
			
			
			LJ.delay( 100 ).then(function(){
				
				
				var $modal = $('.modal');
				var $input = $modal.find('.modal-search__input input');
				var text   = $input.val().toLowerCase();

				if( text == '' ){
					return $('.modal-item').removeClass('nonei');
				}

				$('.modal-item:not(.--selected):not([data-name^="' + text + '"])')
					.addClass('nonei');

				$('.modal-item:not(.--selected)[data-name^="' + text + '"]')
					.removeClass('nonei');
					
				});	
							
		},
		handleModalItemClicked: function(){

			var $s = $(this);
			
			if( $s.hasClass('--noselect') ){
				return;
			}
			
			var max = $('.modal').attr('data-max-items');
			if( max && $('.modal-item.--selected').length == parseInt( max ) && !$s.hasClass('--selected') ){
				return LJ.wlog('Already max items');
			}

			var $modal = $('.modal');
			var $el = $('.friend-modal:not(.--selected)').first();

			$s.toggleClass('--selected').insertBefore( $el );

			if( $('.modal-item.--selected').length == 0 ){
				$modal.addClass('--disabled');
			} else {
				$modal.removeClass('--disabled');
			}
			$('.modal-search__input input').val('');
			
			LJ.ui.filterModalResults();

		},
		getModalItemIds: function( max ){
			return LJ.promise(function( resolve, reject ){

				if( !$('.modal').hasClass('js-listeners-attached') ){
					$('.modal').addClass('js-listeners-attached');
					$('.modal-item').click( LJ.ui.handleModalItemClicked );
				}

				$('.modal__close').click( reject );
				$('.modal-footer button').click(function(){

					var $modal = $('.modal');
					if( $modal.hasClass('--disabled') ){
						return;
					} else {
						$modal.addClass('--pending');
					}

					var item_ids = [];
					$('.modal-item.--selected').each(function( i, itm ){
						item_ids.push( $(itm).attr('data-item-id') );
					});
					
					resolve( item_ids );

				});


			});

		},
		noSelectModalRow: function( item_id, message ){
			
			var $item = $('.modal-item[data-item-id="'+ item_id +'"]');

			$item.find('.item-modal__noselect').remove(); // clear
			$item.removeClass('--selected')
				 .addClass('--noselect')
				 .append('<span class="item-modal__noselect">'+ message +'</span>');


		},
		cancelify: function( opts ){

			if( opts.$wrap.length == 0 ) return;

			LJ.ui.shadeify( opts.$wrap, 400 );

			var html = [ '<div class="ui-overlay__message">',
				opts.message_html,
			'</div>' ].join('');

			$( html ).hide()
					 .appendTo( opts.$wrap )
					 .velocity('shradeIn', {
					 	duration : 400,
					 	delay    : 350,
					 	display  : 'flex'
					 });

			LJ.delay( opts.duration || 5000 ).then(function(){
				if( typeof opts.callback == "function" ){
					opts.callback();
				}
			});

		},
		shadeify: function( $wrap, duration, theme ){

			var theme = theme || "dark";
			var final_opacity = theme == "dark" ? 0.7 : 1;

			$('<div class="ui-overlay ui-overlay--'+ theme +'"></div>')
				.css({ 'opacity': 0 })
				.appendTo( $wrap )
				.velocity({ opacity: [ final_opacity, 0 ] }, {
					duration : duration,
					display  : 'flex'
				});

		},
		synchronify: function( opts ){

			return LJ.promise(function( resolve, reject ){

				if( opts.$wrap.length == 0 ){
					return reject("No $wrapper element was found");
				};

				LJ.ui.shadeify( opts.$wrap, 400, 'light' );

				var content = '<div class="ui-overlay__message">' + opts.message_html + '</div>';
				var loader  = LJ.static.renderStaticImage('slide_loader');

				$('<div class="ui-synchronify">'+ content + loader + '</div>')
						 .hide()
						 .appendTo( opts.$wrap )
						 .velocity('shradeIn', {
						 	duration : 400,
						 	delay    : 350,
						 	display  : 'flex'
						 });

				LJ.delay( 400 ).then( resolve );
				
			});

		},
		desynchronify: function( opts ){

			if( opts.$wrap.length == 0 ){
				return LJ.warn("No $wrapper element was found");
			};

			$( opts.$wrap.find('.ui-overlay, .ui-synchronify') )
				.velocity('fadeOut', {
					duration : 350,
					complete : function(){
						$( this ).remove();
					}
				})


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
							.velocity('shradeOut', {
								duration: 500,
								delay: 1000,
								complete: function(){
									$(this).siblings()
										   .velocity('shradeIn', {
										   		display: 'block'
										   });
								}
							})

		});

	}