
	window.LJ.shared = _.merge( window.LJ.shared || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.shared.handleDomEvents();
				resolve();

			});

		},
		handleDomEvents: function(){

			$('.menu-item.--shared').one('click', LJ.shared.handleShareClicked );

		},
		handleShareClicked: function(){


			var $loader = $( LJ.static.renderStaticImage('menu_loader') );

			$('.shared').html('');

			$loader.addClass('none')
				   .appendTo('.shared')
				   .velocity('bounceInQuick', {
				   	delay: 125,
				   	duration: 500,
				   	display: 'block'
				   });

			LJ.shared.fetchSharedItems();

		},	
		fetchSharedItems: function(){

			LJ.api.fetchMeShared()
				  .then( LJ.shared.handleFetchMeSharedSuccess, LJ.shared.handleFetchMeSharedError );



		},
		handleFetchMeSharedSuccess: function( expose ){

			var shared = expose.shared;

			LJ.shared.setSharedItems( shared );

		},
		setSharedItems: function( shared ){

			var html = '';
			shared.sort();

			var shared_by = _.filter( shared, function( sh ){
				return sh.share_type == "shared_by"; 
			});

			var shared_profiles = _.filter( shared_by, function( sh ){
				return sh.target_type == "user";
			});

			var shared_before = _.filter( shared_by, function( sh ){
				return sh.target_type == "before";
			});

			var facebook_ids = _.pluck( shared_profiles, 'target_id' );
			LJ.api.fetchUsers( facebook_ids )
				.then(function( res ){

					var html = [];
					if( res.length == 0 ){

						html.push( LJ.shared.renderShareItem__Empty() );

					} else {
						res.forEach(function( r ){

							var user = r.user;
							var sh   = _.find( shared_profiles, function( sh ){
								return sh.target_id == user.facebook_id;
							});

							html.push (LJ.shared.renderShareItem__User( sh, user ) );

						});
						
					}

					$('.shared')
						.html( html.join('') )
						.children()
						.velocity('fadeIn', {
							duration: 250,
							display: 'flex'
						});

				});

		},		
		handleFetchMeSharedError: function(){

			LJ.elog('Error fetching shared :/');

		},
		renderShareItem__Empty: function(){

			return LJ.ui.render([

				'<div class="empty">',
					'<div class="empty__icon --round-icon">',
						'<i class="icon icon-telescope"></i>',
					'</div>',
					'<div class="empty__title">',
						'<h2 data-lid="empty_shared_title"></h2>',
					'</div>',
					'<div class="empty__subtitle">',
						'<p data-lid="empty_shared_subtitle"></p>',
					'</div>',
				'</div>'

				].join(''));

		},
		renderShareItem__User: function( shared_object, target, shared_by ){

			var sh 	   = shared_object;
			var target = target;
			var friend = _.find( LJ.user.friends, function(f){ return f.facebook_id == shared_by; });


			var formatted_date = LJ.renderDate( sh.shared_at );
			var img_html       = LJ.pictures.makeImgHtml( target.img_id, target.img_vs, 'menu-row' );

			return LJ.ui.render([

				'<div class="shared__item" data-target-id="' + sh.target_id + '" data-target-type="' + sh.target_type + '">',
					'<div class="row-date date">' + formatted_date + '</div>',
					'<div class="row-pic">',
						'<div class="row-pic__image">' + img_html + '</div>',
						'<div class="row-pic__icon --round-icon"><i class="icon icon-forward"></i></div>',
					'</div>',
					'<div class="row-body">',
						'<div class="row-body__title">',
							'<h2>' + target.name + ', <span class="row-body__age">' + target.age + '</span></h2>',
						'</div>',
						'<div class="row-body__subtitle">',
							'<div class="row-body__icon --round-icon"><i class="icon icon-pricetag"></i></div>',
							'<h4>' + LJ.text('shared_item_subtitle').replace('%name', 'Anonymous monkey' ).replace('%type', LJ.text('w_profile') ).capitalize() + '</h4>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));

		}

	});