
	window.LJ.meepass = _.merge( window.LJ.meepass || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.meepass.handleDomEvents();
				resolve();
			});


		},
		handleDomEvents: function(){

			$('.menu-section.--meepass').on('click', '.segment__part', LJ.meepass.refreshSegmentView );
			$('.menu-item.--meepass').one('click', LJ.meepass.handleMeepassClicked );

		},
		refreshSegmentView: function(){

			var $seg = $(this);
			var link = $seg.attr('data-link');

			if( $seg.hasClass('--active') ) return;

			$seg.siblings().removeClass('--active');
			$seg.addClass('--active');

			$('.meepass__item').css({ display: 'none' });
			$('.meepass__item[data-link="' + link + '"]').css({ display: 'flex' });

		},
		handleMeepassClicked: function(){

			var $loader = $( LJ.static.renderStaticImage('menu_loader') );

			$('.meepass').html('');

			$loader.addClass('none')
				   .appendTo('.meepass')
				   .velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				   });

			LJ.meepass.fetchMeepassItems();

		},	
		fetchMeepassItems: function(){

			LJ.api.fetchMeMeepass()
				  .then( LJ.meepass.handleFetchMeMeepassSuccess, LJ.meepass.handleFetchMeMeepassError );


		},
		handleFetchMeMeepassSuccess: function( expose ){

			var meepass = expose.meepass;

			LJ.meepass.setMeepassItems( meepass );

		},
		setMeepassItems: function( meepass ){

			var html = '';
			meepass.sort();

			var facebook_ids = _.pluck( meepass, 'sent_by' ).concat( _.pluck( meepass, 'sent_to' ) ).filter( Boolean );

			LJ.api.fetchUsers( facebook_ids )
				.then(function( res ){

					meepass.forEach(function( mp ){

						for( var i=0; i<res.length; i++ ){

							var user = res[ i ].user;

							if( mp.sent_by == user.facebook_id ){
								 return html += LJ.meepass.renderMeepassItem__Received( mp, user );
							}

							if( mp.sent_to == user.facebook_id ){
								return html += LJ.meepass.renderMeepassItem__Sent( mp, user );
							}
						}
					});

					$('.meepass').html( html )
								 .find('[data-link="received"]')
								 .css({ display: 'flex' });

					$('.menu-section.--meepass')
								.find('.segment__part')
								.removeClass('--active')
								.first()
								.addClass('--active');

				});

		},		
		handleFetchMeMeepassError: function(){

			LJ.elog('Error fetching meepass :/');

		},
		renderMeepassItem__Received: function( meepass_object, target ){

			var mp 	   = meepass_object;
			var target = target;

			var formatted_date = LJ.renderDate( mp.sent_at );
			var img_html       = LJ.pictures.makeImgHtml( target.img_id, target.img_vs, 'menu-row' );

			return LJ.ui.render([

				'<div class="meepass__item" data-link="received" data-event-id="' + mp.target_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						'<div class="row-pic__icon --round-icon"><i class="icon icon-meepass"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + LJ.text('meepass_item_title_received').replace('%name', target.name) +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-location"></i></div>',
							'<h4>' + LJ.text('meepass_item_subtitle').replace('%date',  '22/04/16' ).capitalize() + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderMeepassItem__Sent: function( meepass_object, target, meepass_by ){

			var mp 	   = meepass_object;
			var target = target;

			var formatted_date = LJ.renderDate( mp.sent_at );
			var img_html       = LJ.pictures.makeImgHtml( target.img_id, target.img_vs, 'menu-row' );

			return LJ.ui.render([

				'<div class="meepass__item" data-link="sent" data-event-id="' + mp.target_id + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						'<div class="row-pic__icon --round-icon"><i class="icon icon-meepass"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + LJ.text('meepass_item_title_sent').replace('%name', target.name) +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-location"></i></div>',
							'<h4>' + LJ.text('meepass_item_subtitle').replace('%date',  '22/04/16' ).capitalize() + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});
		