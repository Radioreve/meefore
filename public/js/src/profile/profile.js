
	window.LJ.profile = _.merge( window.LJ.profile || {}, {

		$profile:   $('.menu-section.--profile'),
		$pictures:  $('.pictures'),
		$thumbnail: $('.app-thumbnail'),

		init: function( resolve, reject ){
			return LJ.promise(function( resolve, reject ){
				
				LJ.api.fetchMe()
					.then( LJ.log("User profile fetched"))
					.then( LJ.profile.setMyInformations )
					.then( LJ.profile.setMyThumbnail )
					.then( LJ.profile.setMyPictures )
					.then( LJ.profile.setMyHashtags )
					.then( LJ.pictures.init )
					.then( LJ.settings.init )
					.then( LJ.profile.handleDomEvents )
					.then( LJ.search.initFilters )
					.then( LJ.seek.activatePlacesInProfile )
					.then( resolve )

			});

		},
		setMyInformations: function(){

			$('#me__name').val( LJ.user.name );
			$('#me__job').val( LJ.user.job );
			$('#me__ideal-night').val( LJ.user.ideal_night );
			$('#me__location').val( LJ.user.location.place_name );
			$('#me__country').val( LJ.text_source["country_" + LJ.user.country_code ][ LJ.lang.getAppLang() ]);

			// Set age restrictions
			$('#me__age').val( LJ.user.age )
				 .attr('max', LJ.app_settings.app.max_age )
				 .attr('min', LJ.app_settings.app.min_age );

				
		},
		setMyThumbnail: function(){

			$('.thumbnail__name').text( LJ.user.name );


		},
		setMyHashtags: function(){

			LJ.user.pictures.forEach(function( picture, i ){
				var hashtag = picture.hashtag;
				$('.picture').eq( i ).find('.picture__hashtag input').val( hashtag );
			});

		},
		setMyPictures: function(){

			// Thumbnail picture
			var main_pic = LJ.findMainPic();
			LJ.profile.$thumbnail.find('img').replaceWith( LJ.pictures.makeImgHtml( main_pic.img_id, main_pic.img_version, 'me-thumbnail') );

			// Profile pictures
			var html = [];
			LJ.user.pictures.forEach(function( pic ){
				html.push( LJ.profile.renderPicture( pic ) );
			});
			LJ.profile.$pictures.append( html.join('') );

		},
		handleDomEvents: function(){

			LJ.profile.$profile.on('click', 'input, textarea, .edit',   LJ.profile.activateInput );
			LJ.profile.$profile.on('click', '.action__cancel',   		LJ.profile.deactivateInput );
			LJ.profile.$profile.on('click', '.action__validate', 		LJ.profile.updateProfile );

		},
		handleApiError: function( err ){

			var err_ns    = err.namespace;
			var err_data  = err.err_id;
			var call_id   = err.call_id

			if( err.namespace == 'update_profile_base' ){
				$('[data-callid="' + call_id + '"]').removeClass('--validating'); 
				LJ.ui.showToast('La mise à jour na pas été effectuée', 'error');
				return;
			}

		},
		activateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') || $block.hasClass('--no-edit') ){
				return;
			} else {
				$block.addClass('--active'); 
			}

			$input.attr( 'readonly', false );

			$block.find('.action')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	display: 'flex'
				  });

			$block.find('.edit')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.attr('data-restore', $input.val() );

		},
		deactivateInput: function( element ){

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.hasClass('--active') ){
				$block.removeClass('--active').removeClass('--validating');
			} else {
				return;
			}

			$input.attr( 'readonly', true );

			$block.find('.action')
				  .velocity('bounceOut', {
				  	duration: LJ.ui.action_hide_duration,
				  	display: 'none'
				  });

			$block.find('.edit')
				  .velocity('bounceInQuick', {
				  	duration: LJ.ui.action_show_duration,
				  	delay: 400,
				  	display: 'flex'
				  });

			var former_value = $block.attr('data-restore');
			if( former_value != null ){
				$input.val( former_value );
				$block.attr( 'data-restore', null );
			}

		},
		updateProfile: function( element ){

			var update = {};

			var $self;
			if( element instanceof jQuery ){
				$self = element;
			} else if( typeof element == 'string' ){
				$self = $( element );
			} else {
				$self = $( this );
			}

			var $block = $self.closest('.me-item');
			var $input = $block.find('input, textarea');

			if( $block.length == 0 || !$block.hasClass('--active') || $block.hasClass('--validating') ){
				return LJ.wlog('Not calling the api');
			}

			if( $input.val() == $block.attr('data-restore') ){
				LJ.profile.deactivateInput.call( this, element );
				return LJ.wlog('Not calling the api (same value)');
			}

			var new_value = $block.find('input,textarea').val();
			var attribute = $block.attr('data-param');
			var call_id = LJ.generateId();

			update[ attribute ] = new_value;
			update[ 'call_id' ] = call_id;

			// Location is a specific case.
			if( attribute == "location" ){

				if( !LJ.seek.profile_places.getPlace() ) return;				
				
				$block.attr('data-store', LJ.seek.profile_places.getPlace().formatted_address );		
				update.location = {
					place_name : LJ.seek.profile_places.getPlace().formatted_address,
					place_id   : LJ.seek.profile_places.getPlace().place_id,
					lat 	   : LJ.seek.profile_places.getPlace().geometry.location.lat(),
					lng 	   : LJ.seek.profile_places.getPlace().geometry.location.lng()
				};
			}

			$block.attr( 'data-callid', call_id ).addClass('--validating');
			
			LJ.log('Updating profile...');
			LJ.api.updateProfile( update )
				  .then( LJ.profile.handleUpdateProfileSuccess, LJ.profile.handleApiError );

		},
		handleUpdateProfileSuccess: function( exposed ){

			LJ.ui.showToast( LJ.text('to_profile_update_success') );

			$('.thumbnail__name').text( exposed.user.name );

			var $block  = $('.me-item[data-callid="' + exposed.call_id + '"]');
			var $input  = $block.find('input, textarea');
			var $action = $block.find('.action');

			// For location attribute specificity
			if( $block.attr('data-store') ){
				$input.val( $block.attr('data-store') );
			}

			$block.attr('data-restore', null );
			LJ.profile.deactivateInput( $input );
			

		},
		renderPicture: function( pic ){

			var img_html = LJ.pictures.makeImgHtml( pic.img_id, pic.img_version, "me" );
			var main     = pic.is_main ? '--main' : '';
			return LJ.ui.render([

				'<div class="picture ' + main + '" data-img-place="' + pic.img_place + '" data-img-id="' + pic.img_id + '" data-img-vs="' + pic.img_version + '">',
		            img_html,
		            '<div class="picture__ribbon-main" data-lid="picture_main_label"></div>',
		            '<div class="picture__progress-bar">',
		            	'<div class="picture__progress-bar-bg"></div>',
		            '</div>',
		            '<div class="picture-icon">',
		            	LJ.ui.renderIcon('upload', 	 	 ['picture__icon', '--upload-desktop']),
		            	LJ.ui.renderIcon('facebook', 	 ['picture__icon', '--upload-facebook']),
		            	LJ.ui.renderIcon('main-picture', ['picture__icon', '--mainify']),
		            	LJ.ui.renderIcon('trash', 		 ['picture__icon', '--trash']),
		            '</div>',
		            '<div class="picture__hashtag hashtag">',
		            	'<span class="hashtag__hash">#</span>',
		            	'<input readonly type="text" placeholder="hashtag">',
		            	'<div class="hashtag-action">',
			            	'<div class="hashtag__action-validate">',
			            		LJ.ui.renderIcon('check'),
			            	'</div>',
			            	'<div class="hashtag__action-cancel">',
			            		LJ.ui.renderIcon('cancel'),
			            	'</div>',
		            	'</div>',
		            '</div>',
	          '</div>'

			].join(''));

		}
	});









































