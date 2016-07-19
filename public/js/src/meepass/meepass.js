
	window.LJ.meepass = _.merge( window.LJ.meepass || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.meepass.handleDomEvents();
				resolve();
			});


		},
		handleDomEvents: function(){

			$('.menu-section.x--meepass').on('click', '.segment__part', LJ.meepass.refreshSegmentView );
			$('.menu-item.x--meepass').one('click', LJ.meepass.handleMeepassClicked );
			LJ.ui.$body.on('click', '.js-send-meepass', LJ.meepass.handleSendMeepass );

		},
		refreshSegmentView: function(){

			var $seg = $(this);
			var link = $seg.attr('data-link');

			if( $seg.hasClass('x--active') ) return;

			$seg.siblings().removeClass('x--active');
			$seg.addClass('x--active');

			$('.meepass').children().css({ display: 'none' });
			$('.meepass [data-link="' + link + '"]').css({ display: 'flex' });

		},
		handleSendMeepass: function(){

			// User is hosting more than one event...
			if( 0 ){
				LJ.ui.showModal({
					"title"		: "Félicitations !",
					"subtitle"	: "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
					"body"  	: LJ.meepass.renderEventsInModal(),
					"footer"	: "<button class='x--rounded'><i class='icon icon-check'></i></button>"
				});

			} else {
				
				var event_id = '';
			//	LJ.meepass.sendMeepass()
			//		.then( LJ.meepass.handleSendMeepassSuccess )
			//		.catch( LJ.meepass.handleApiError );

			}

		},
		renderMeepassRibbon: function(){

			var n_meepass = LJ.user.meepass.length;

			return LJ.ui.render([

				'<div class="meepass-ribbon">',
					'<h2 data-lid="meepass_ribbon"></h2>',
				'</div>'

				].join('')).replace('%n', n_meepass );

		},
		sendMeepass: function(){
			
		},
		handleSendMeepassSuccess: function(){

		},
		handleApiError: function(){

		},
		renderEventsInModal: function(){

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

			var html = [];
			meepass.sort();

			var facebook_ids = _.pluck( meepass, 'sent_by' ).concat( _.pluck( meepass, 'sent_to' ) ).filter( Boolean );

			LJ.api.fetchUsers( facebook_ids )
				.then(function( res ){

					var no_meepass_received = true;
					var no_meepass_sent     = true;
					meepass.forEach(function( mp ){

						for( var i=0; i<res.length; i++ ){

							var user = res[ i ].user;

							if( mp.sent_by == user.facebook_id ){
								no_meepass_received = false;
								return html.push( LJ.meepass.renderMeepassItem__Received( mp, user ) );
							}

							if( mp.sent_to == user.facebook_id ){
								no_meepass_sent = false;
								return html.push( LJ.meepass.renderMeepassItem__Sent( mp, user ) );
							}
						}
					});

					if( no_meepass_sent ){
						html.push( LJ.meepass.renderMeepassItem__SentEmpty() );
					}

					if( no_meepass_received ){
						html.push( LJ.meepass.renderMeepassItem__ReceivedEmpty() );
					}

					$('.meepass').html( html.join('') )
								 .find('[data-link="received"]')
								 .velocity('fadeIn', {
									duration: 250,
									display: 'flex'
								});

					$('.menu-section.x--meepass')
								.find('.segment__part')
								.removeClass('x--active')
								.first()
								.addClass('x--active');

				});

		},		
		handleFetchMeMeepassError: function(){

			LJ.elog('Error fetching meepass :/');

		},
		renderMeepassItem__ReceivedEmpty: function(){

			return LJ.ui.render([

				'<div class="empty" data-link="received">',
					'<div class="empty__icon x--round-icon">',
						'<i class="icon icon-meepass"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_meepass_received_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_meepass_received_subtitle"></p>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderMeepassItem__SentEmpty: function(){

			return LJ.ui.render([

				'<div class="empty" data-link="sent">',
					'<div class="empty__icon x--round-icon">',
						'<i class="icon icon-meepass"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_meepass_sent_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_meepass_sent_subtitle"></p>',
					'</div>',
				'</div>'

				].join(''));

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
						'<div class="row-pic__icon x--round-icon"><i class="icon icon-meepass"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + LJ.text('meepass_item_title_received').replace('%name', target.name) +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-location"></i></div>',
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
						'<div class="row-pic__icon x--round-icon"><i class="icon icon-meepass"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + LJ.text('meepass_item_title_sent').replace('%name', target.name) +'</h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon x--round-icon"><i class="icon icon-location"></i></div>',
							'<h4>' + LJ.text('meepass_item_subtitle').replace('%date',  '22/04/16' ).capitalize() + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});
		