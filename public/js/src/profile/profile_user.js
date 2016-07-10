	
	window.LJ.profile_user = _.merge( window.LJ.profile_user || {}, {

		slide_show_duration: 300,
		slide_hide_duration: 300,

		init: function(){
			
			LJ.profile_user.handleDomEvents();
			
		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.user-profile .user-pics__navigate', LJ.profile_user.handlePictureNavigation );
			LJ.ui.$body.on('click', '.thumbnail__picture', LJ.profile_user.showMyUserProfile );

		},
		handlePictureNavigation: function(){

			var $self = $(this);
			var $picture_activated = $('.user-pics__img.--active');

			if( $self.hasClass('--right') ){
				var $picture_to_activate = $picture_activated.next();
			} else {
				var $picture_to_activate = $picture_activated.prev();
			}

			var img_place_to_activate = $picture_to_activate.attr('data-img-place');

			if( !img_place_to_activate ) return; // user clicked too fast, i guess :) 
			LJ.profile_user.activatePicture( img_place_to_activate );

		},
		refreshNavigationArrow: function(){

			var n_pic    = $('.user-pics__img').length;
			var duration = 50;
			
			$('.user-pics__navigate.out').removeClass('out').velocity('fadeIn', { duration: duration, display: 'flex' });

			if( $('.user-pics__img').eq(n_pic - 1).hasClass('--active') ){
				$('.user-pics__navigate.--right').addClass('out').velocity('fadeOut', { duration: duration });
			} 

			if( $('.user-pics__img').eq( 0 ).hasClass('--active') ){
				return $('.user-pics__navigate.--left').addClass('out').velocity('fadeOut', { duration: duration });
			}

		},
		activatePicture: function( img_place ){

			var $picture_activated   = $('.user-pics__img.--active');
			var $picture_to_activate = $('.user-pics__img[data-img-place="' + img_place + '"]');

			if( $picture_activated.is( $picture_to_activate ) ){
				return LJ.log('Picture already activated, doing nuttin');
			}

			var start_opa_1 = $picture_to_activate.css('opacity');
			$picture_to_activate.addClass('--active').velocity({ opacity: [ 1, start_opa_1 ] }, {
				duration: 300
			});

			var start_opa_2 = $picture_activated.css('opacity');
			$picture_activated.removeClass('--active').velocity({ opacity: [ 0, start_opa_2 ] }, {
				duration: 300
			});

			LJ.profile_user.refreshNavigationArrow();


		},
		showMyUserProfile: function(){
			LJ.profile_user.showUserProfile( LJ.user.facebook_id );

		},
		showUserProfile: function( facebook_id ){

			var user;
			var $container;
			var $content;

			LJ.ui.showSlideAndFetch({

				"type"			: "profile",

				"fetchPromise"	: LJ.api.fetchUserProfile,
				"promise_arg"   : facebook_id,

				"errHandler"    : LJ.profile_user.handleShowUserProfileError

			})
			.then(function( expose ){				
				user = expose.user;
				return LJ.profile_user.renderUserProfile( user );

			})
			.then(function( user_html ){
				$container = $('.slide.--profile').find('.slide-body');
				LJ.profile_user.addUserProfile( user_html, $container );
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.profile_user.processProfileBeforeDisplay( $content );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				

			})

		},
		addUserProfile: function( user_html, $container ){
			return $container.append( user_html );

		},
		processProfileBeforeDisplay: function(){
			LJ.profile_user.activatePicture(0);

		},
		renderUserProfileImage: function( pic ){

			return [
					'<div class="user-pics__img"',
					'data-img-id="'    + pic.img_id + '"',
					'data-img-vs="'    + pic.img_version + '"',
					'data-img-place="' + pic.img_place + '">',
						LJ.pictures.makeImgHtml( pic.img_id, pic.img_version, 'user-profile' ),
					'</div>'
				].join('')

		},
		renderUserProfile: function( user ){

			// Dynamically translate country code into human readable country with associate flag
			var country_html = LJ.text( 'country_' + user.country_code ) + '<i class="flag-icon flag-icon-' + user.country_code + '"></i>';

			// Render the pictures block
			var pictures_html = [];
			user.pictures.forEach(function( pic ){

				// Only append picture if its not the placeholder one. In case the placeholder has changed 
				// on the server, make also a test on the name to make sure the string "placeholder" isnt in there"
				if( pic.img_id != LJ.app_settings.placeholder.img_id && !/placeholder/i.test( pic.img_id ) ){
					var pic_html = LJ.profile_user.renderUserProfileImage( pic );
					pictures_html.push( pic_html );
				}

			});
			pictures_html = pictures_html.join('');

			var job 		= user.job || LJ.text("w_na");
			var ideal_night = user.ideal_night || LJ.text("w_na");

			return LJ.ui.render([
				'<div class="user-profile" data-facebook-id="' + user.facebook_id + '">',
					'<div class="user-pics js-filterlay">',
						'<div class="user-pics__navigate --left --round-icon">',
							'<i class="icon icon-arrow-left"></i>',
						'</div>',
						'<div class="user-pics__navigate --right --round-icon">',
							'<i class="icon icon-arrow-right"></i>',
						'</div>',
						pictures_html,
					'</div>',
					'<div class="user-infos">',
						'<div class="user-actions">',
							// '<div class="user-actions__share --round-icon">',
							// 	'<i class="icon icon-forward"></i>',
							// '</div>',
							// '<div class="user-actions__meepass --round-icon">',
							// 	'<i class="icon icon-meepass"></i>',
							// '</div>',
						'</div>',
						'<div class="user-infos__item --base --'+ user.gender +'">',
							'<h2>' + user.name + '</h2>',
							'<span class="comma">,</span>',
							'<span>'+ user.age +'</span>',
						'</div>',
						// '<div class="user-infos__title">',
						// 	'<div class="user-infos__title-splitter"></div>',
						// 	'<label data-lid="user_profile_about"></label>',
						// 	'<div class="user-infos__title-splitter"></div>',
						// '</div>',
						// '<div class="user-infos__item --age">',
						// 	'<div class="user-infos__icon --round-icon">',
						// 		'<i class="icon icon-gift"></i>',
						// 	'</div>',
						// 	'<label>' + user.age + '</label>',
						// '</div>',
						'<div class="user-infos__item --job">',
							'<div class="user-infos__icon --round-icon">',
								'<i class="icon icon-education"></i>',
							'</div>',
							'<label>' + job + '</label>',
						'</div>',
						'<div class="user-infos__item --country">',
							'<div class="user-infos__icon --round-icon">',
								'<i class="icon icon-flag"></i>',
							'</div>',
							'<label>' + country_html + '</label>',
						'</div>',
						'<div class="user-infos__item --location">',
							'<div class="user-infos__icon --round-icon">',
								'<i class="icon icon-location-barred"></i>',
							'</div>',
							'<label>' + user.location.place_name.split(',').join('<span>') + '</span></label>',
						'</div>',
						'<div class="user-infos__title">',
							'<div class="user-infos__title-splitter"></div>',
							'<label data-lid="user_profile_ideal_night"></label>',
							'<div class="user-infos__title-splitter"></div>',
						'</div>',
						'<div class="user-infos__item --ideal-night">',
							'<div class="user-infos__icon --round-icon">',
								'<i class="icon icon-dj"></i>',
							'</div>',
							'<label>' + ideal_night + '</label>',
						'</div>',
					'</div>',
				'</div>'

				].join(''));


		},
		handleShowUserProfileError: function( err ){

        	if( err.err_id == "ghost_user" ){
        		LJ.profile_user.ghostifyUserProfile();
        	}

        },
		ghostifyUserProfile: function(){

        	var duration      = 400;
        	var $user_ghost = $( LJ.profile_user.renderUserProfileGhost() );

        	$('.slide.--profile')
        		.find('.slide__loader')
        		.velocity('shradeOut', {
        			duration: duration,
        			complete: function(){
        				$( this ).remove();
        			}
        		});

        	$user_ghost
        		.hide()
        		.appendTo( $('.slide-body') )
        		.velocity('shradeIn', {
        			duration: duration,
        			delay   : duration,
        			display : 'flex'
        		});

        },
        renderUserProfileGhost: function(){

        	return LJ.ui.render([

        		'<div class="slide-ghost">',
        			'<div class="slide-ghost__icon --round-icon">',
        				'<i class="icon icon-search-light"></i>',
        			'</div>',
        			'<div class="slide-ghost__title">',
        				'<span data-lid="profile_ghost_title"></span>',
        			'</div>',
        			'<div class="slide-ghost__subtitle">',
        				'<span data-lid="profile_ghost_subtitle"></span>',
        			'</div>',
        			'<div class="slide-ghost__action">',
        				'<button data-lid="profile_ghost_btn" class="slide__close"></button>',
        			'</div>',
        		'</div>'

        	].join(''));

        }

	});