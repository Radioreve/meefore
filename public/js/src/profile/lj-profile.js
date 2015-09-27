
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEvents_Profile: function(){

			LJ.$body.on('click', '.row-informations .row-input', function(){

				var $edit_btn = $('.row-informations').find('i.icon-edit');

				if( $edit_btn.hasClass('active') )return; 
				$edit_btn.click(); 

			});

			$('.modal-container').on('click','.modal-thumb-picture', function(){

				var $self = $(this);

				if( $self.hasClass('active') )
					return;

				if( $self.attr('src').split('/').slice(-1)[0] == 'placeholder_picture')
					return 

				var img_place = $self.attr('img-place');
				$('.modal-thumb-picture, .modal-user-picture-hashtag').removeClass('active');
				$self.add( $('.modal-user-picture-hashtag[img-place="'+ img_place +'"]') ).addClass('active');

				var img_version = $self.attr('img_version');

				$('.modal-main-picture').removeClass('active');
				$('.modal-main-picture[img_version="'+img_version+'"]').addClass('active');

			});

			$('.modal-container').on('click', '.facebook-image-item', function(){

				var $self = $(this);

				if( $self.hasClass('active') ){
					$self.removeClass('active');
					$('.modal-container').find('.btn-validate').addClass('btn-validating');
				} else {
					$('.facebook-image-item').removeClass('active')
					$('.modal-container').find('.btn-validate').removeClass('btn-validating');
					$self.addClass('active');
				}

			});

			$('.modal-container').on('click', '.btn-cancel', LJ.fn.hideModal );

			$('.modal-container').on('click', '.btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				if( $('.facebook-image-item.active').length != 1 )
					return;

				$self.addClass('btn-validating');

				var url = $('.facebook-image-item.active').find('img').attr('src');
				var img_place = $self.parents('.modal-container-body').children().last().attr('data-img-place');

				LJ.fn.hideModal();

				LJ.fn.updatePictureWithUrl({
						userId    : LJ.user._id,
						img_id    : LJ.user._id + '--' + img_place,  // id_pattern 
						url       : url,
						img_place : img_place
        			}, function( err, data ){

					if( err ){
						return LJ.fn.handleServerError("L'upload avec Facebook a échoué.");
					}

					LJ.fn.handleServerSuccess("Vos photos ont été mises à jour");

					LJ.fn.replaceImage({
						img_id      : data.img_id,
						img_version : data.img_version,
						img_place   : img_place,
						scope       : ['profile']
					});

				});
				
			});

			LJ.$body.on('mouseover', '#createEvent', function(){
				$('.search-results-places').addClass('open');
			});

			LJ.$body.on('change-user-xp', LJ.fn.updateUserXp );

			LJ.$body.on('click', '.upload-facebook', function(){
				
				var img_place = $(this).parents('.picture').data('img_place');
				LJ.fn.displayInModal({
					url:'/me/photos/uploaded',
					source:'facebook',
					starting_width: 500,
					max_height: 500,
					render_cb: LJ.fn.renderFacebookUploadedPictures,
					error_cb: LJ.fn.renderFacebookUploadedPicturesNone,
					custom_data: [{ key: 'img-place', val: img_place }]
				});

			});

			LJ.$body.on('click', '.row-informations .btn-validate', function(){
				if( $(this).hasClass('btn-validating') )
					return;
				$(this).addClass('btn-validating');
				LJ.fn.updateProfile();
			});

			/* Généric ui update of selectable inputs */
			LJ.$body.on('click', '.row-select', function(){
				var $self = $(this);
				if( !$self.parents('.row-select-daddy').hasClass('editing') )
					return ;

				var $selectedType = $self.parents('.row-select-wrap');
				$selectedType.find('.row-select.modified').removeClass('modified');
				$self.addClass('modified');
			
			});


			/* Activate modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit:not(.active)', function(){ 

				var $self = $(this);
				var $daddy = $self.parents('.row-select-daddy');

				$self.addClass('active');
				$daddy.addClass('editing');
				
				$daddy
					.find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('input:not(.readonly)').attr('readonly', false)
					.end().find('.row-input')
					.each( function( i, el ){
						var current_val = $(el).find('input').val(),
					    	current_select_id = $(el).find('.row-select.selected').attr('data-selectid'),
					    	restore_arr = [ current_val, current_select_id ];
					    	restore_arr.forEach(function( val ){
					    		if( val != undefined )
					    			$(el).attr('data-restore', val );
					    	});
					});

				$daddy.find('.row-select.selected').removeClass('selected').addClass('modified');
			});

			/* Cancel ugoing modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit.active, .row-select-daddy .btn-cancel', function(){

				var $daddy = $(this).parents('.row-select-daddy');

				$daddy
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('input').attr('readonly',true)
					.end().find('.row-buttons').hide()
					.end().find('.modified').removeClass('modified')
					.end().find('[data-restore]')
					.each(function( i, el ){
						var val = $(el).attr('data-restore')
						$(el).find('input').val( val )
							 .end()
							 .find('[data-selectid="'+val+'"]').addClass('selected');						
					});

			});
			

			LJ.$body.on('click', '.row-pictures .icon-edit:not(.active)', function(){

				var $self = $(this);
				$self.addClass('active').parents('.row-pictures').addClass('editing');

				$('.row-pictures')
					.find('.picture-hashtag input').attr('readonly', false)
					.end().find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('.picture-edit, .row-pictures .row-buttons').velocity('transition.fadeIn',{ duration: 600 });

			});


			LJ.$body.on('mouseenter', ".row-pictures:not('.editing') .picture", function(){
				if( LJ.state.uploadingImage ) return;
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeIn', { duration: 260 });
			});


			LJ.$body.on('mouseleave', ".row-pictures:not('.editing') .picture", function(){
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeOut', { duration: 260 });
			});


			LJ.$body.on('click', '.row-pictures .icon-edit.active, .row-pictures .btn-cancel', function(){

				$('.row-pictures')
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('.selected').removeClass('selected')
					.end().find('.picture-hashtag input').attr('readonly',true)
					.end().find('.picture-edit').velocity('transition.fadeOut', { duration: 600 })
					.end().find('.row-buttons').hide();
				return;

			});

			LJ.$body.on('click', '.picture-edit i', function(){

				var $self = $(this);

				if( $self.hasClass('selected') )
					return $self.removeClass('selected');

				if( $self.hasClass('icon-main') ){
					$('.icon-main').removeClass('selected');
					$self.siblings('.icon-delete').removeClass('selected');
					$self.addClass('selected');
					return;
				}

				if( $self.hasClass('icon-delete') ){
					$self.siblings('.icon-main').removeClass('selected');
					$self.addClass('selected');
				}

			});


			LJ.$body.on('focusout', '.picture-hashtag input', function(){
				$(this).val( LJ.fn.hashtagify( $(this).val() ));
			});


			LJ.$body.on('click', '.row-pictures .btn-validate', function(){
				
				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				var updatedPictures  = [],
					$newMainPicture  = $('.icon-main.selected').parents('.picture'),
					$deletedPictures = $('.icon-trash-empty.selected').parents('.picture');
					$hashtagPictures = $('.picture');
					
					$deletedPictures.each(function( i, el ){
						var $el = $( el ),
							picture = { 
								img_place: $el.data('img_place'),
								action: "delete"
							};
							updatedPictures.push( picture );
					});

					$newMainPicture.each(function( i, el ){
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "mainify"
							};
							updatedPictures.push( picture );
					});

					$hashtagPictures.each(function( i, el ){
						var new_hashtag = $('.picture[data-img_place="'+i+'"]').find('.picture-hashtag').find('input').val();
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "hashtag",
								new_hashtag: LJ.fn.hashtagify( new_hashtag )
							};
							updatedPictures.push( picture );
					});

				if( updatedPictures.length == 0 ){
					return LJ.fn.toastMsg( LJ.text_source["to_noupload_necessary"][ LJ.app_language ], "error" );
				}

				csl('Emitting update pictures (all)');
				$self.addClass('btn-validating');

				var eventName = 'me/update-pictures',
					data = { userId: LJ.user._id, updatedPictures: updatedPictures },
					cb = {
						success: LJ.fn.handleUpdatePicturesSuccess						
					};

				LJ.fn.showLoaders();
				LJ.fn.say( eventName, data, cb );

			});



		},
		initCloudinary: function( cloudTags ){

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			//LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			if( cloudTags.length != $('.upload_form').length )
				return LJ.fn.toastMsg('Inconsistence data', 'error');

			$('.upload_form').each(function(i,el){
				$(el).html('').append( cloudTags[i] );
			});

			$('.cloudinary-fileupload')

				.click( function(e){

					if( LJ.state.uploadingImage ){
						e.preventDefault();
						LJ.fn.toastMsg( LJ.text_source["to_upload_singlepic"][ LJ.app_language ], "info" );
						return;
					}

					LJ.state.uploadingimg_id      = $(this).parents('.picture').data('img_id');
					LJ.state.uploadingimg_version = $(this).parents('.picture').data('img_version');
					LJ.state.uploadingimg_place   = $(this).parents('.picture').data('img_place');
				})

				.bind('fileuploadstart', function(){

					LJ.state.uploadingImage = true;
					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

					LJ.state.uploadingImage = false;

					var img_id      = data.result.public_id;
					var img_version = data.result.version;
					var img_place   = LJ.state.uploadingimg_place;

                    var eventName = 'me/update-picture',
                    	data = {
                    				_id              : LJ.user._id,
									img_id           : img_id,
									img_version      : img_version,
									img_place        : img_place
								}
						, cb = {
							success: function( data ){
								sleep( LJ.ui.artificialDelay, function(){
									$('.progress_bar').velocity('transition.slideUpOut', {
									 	duration: 400,
									 	complete: function(){
									 		$(this).css({ width: '0%' })
									 			   .velocity('transition.slideUpIn');
										} 
									});

									LJ.fn.toastMsg( LJ.text_source["to_upload_pic_success"][ LJ.app_language ], 'info');

									var user = data.user;

									// Mise à jour interne sinon plein d'update sur la même photo bug
									var pic = _.find( LJ.user.pictures, function(el){
										return el.img_place == img_place;
									});
									pic.img_version = img_version;
									var scope = pic.is_main ? ['profile','thumb'] : ['profile'];

	  								LJ.fn.replaceImage({
	  									img_id: img_id, 
	  									img_version: img_version,
	  									img_place: img_place,
	  									scope: scope
	  								});
	  								
	  							});
							},
							error: function( xhr ){
								delog('Error saving image identifiers to the base');
							}
						};

						LJ.fn.showLoaders();
						// no_header : cloudinary wont let us add custom header
						LJ.fn.say( eventName, data, cb );

  				}).cloudinary_fileupload();
  				

		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				$container    = $('.row-informations')
				name  		  = $container.find('.row-name input').val(),
				age   		  = $container.find('.row-age input').val(),
				job			  = $container.find('.row-job input').val(),
				drink 		  = $container.find('.drink.modified').attr('data-selectid'),
				mood          = $container.find('.mood.modified').attr('data-selectid');

			if( LJ.user.status == 'new' )
				LJ.user.status = 'idle';

			var profile = {
				userId		  : _id,
				age 		  : age,
				name 		  : name,
				job           : job,
				drink 		  : drink,
				mood          : mood,
				status        : LJ.user.status
			};
				csl('Emitting update profile');

			var eventName = 'me/update-profile',
				data = profile
				, cb = {
					success: LJ.fn.handleUpdateProfileSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.showLoaders();
				LJ.fn.say( eventName, data, cb );


		},
		handleUpdateProfileSuccess: function( data ){

			csl('update profile success received, user is : \n' + JSON.stringify( data.user, null, 4 ) );
			var user = data.user;

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-informations').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				$('#thumbName').text( user.name );
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-informations');
		
			});


		},
		handleUpdateSettingsUxSuccess: function( data ){

			csl('update settings ux success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-ux').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.setLocalStoragePreferences();
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-ux');
		
			});


		},
		handleUpdateSettingsMailingListsSuccess: function( data ){

			csl('update settings mailing lists success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-notifications').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-notifications');
		
			});


		},
		displayPictureHashtags: function(){

        	for( var i = 0; i < LJ.user.pictures.length; i ++ ){
				var hashtag = LJ.user.pictures[i].hashtag;
				$('.picture-hashtag').eq(i).find('input').val(hashtag);        		
        	}


        },
        handleUpdatePicturesSuccess: function( data ){

	        setTimeout(function(){ 

				LJ.user.pictures = data.pictures;
				var currentimg_place = $('.main-picture').data('img_place');

				$('.row-pictures').find('.icon-edit').click();

				$('.btn-validating').removeClass('btn-validating');
				$('.icon.selected').removeClass('selected');

				/* Changement de la main picture et update du header associé */
				var mainImg = LJ.fn.findMainImage();
				if( currentimg_place != mainImg.img_place ){
					$('.main-picture').removeClass('main-picture');
					$('.picture[data-img_place="'+mainImg.img_place+'"]').addClass('main-picture');
					mainImg.scope = ['thumb'];
					LJ.fn.replaceImage( mainImg );
				}

				/* Mise à jour temps réelle des nouvelles photos */
				for( var i = 0; i < LJ.user.pictures.length; i++){
					LJ.user.pictures[i].scope = ['profile'];
					if( $('.picture[data-img_place="'+i+'"]').attr('data-img_version') != LJ.user.pictures[i].img_version )
					LJ.fn.replaceImage( LJ.user.pictures[i] );
				}

				/* Mise à jour des hashtags*/
				LJ.fn.displayPictureHashtags();

				LJ.fn.handleServerSuccess('Vos photos ont été mises à jour');
	        	
	        }, LJ.ui.artificialDelay );

        },
        /* Permet de remplacer les images du profile*/
		replaceImage: function( options ){

			var img_id      = options.img_id,
				img_version = options.img_version,
				img_place   = options.img_place,
				scope       = options.scope;

			if( scope.indexOf('profile') != -1 )
			{
				var $element = $('.picture').eq( img_place ),
					display_settings = LJ.cloudinary.profile.me.params;

				if( display_settings == undefined ){
					return console.error("Options d'affichage manquantes");
				}

				display_settings.version = img_version;

				/* En cas de photos identiques, prend celle la plus à gauche avec .first()*/
				var $previousImg = $element.find('img'),
					$newImg      = $.cloudinary.image( img_id, display_settings );

					$newImg.addClass('mainPicture').addClass('none');
					$previousImg.parent().prepend( $newImg )
								.find('.picture-upload').velocity('transition.fadeOut', { duration: 250 });
	 													
					$previousImg.velocity('transition.fadeOut', { 
						duration: 600,
						complete: function(){
							$newImg.velocity('transition.fadeIn', { duration: 700, complete: function(){} });
							$newImg.parent().attr('data-img_id', img_id );
							$newImg.parent().attr('data-img_version', img_version );
							$previousImg.remove();
						} 
					});
			}

			if( scope.indexOf('thumb') != -1 )
			{
				display_settings = LJ.cloudinary.displayParamsHeaderUser;
				display_settings.version = img_version;

				var previousImg = $('#thumbWrap').find('img'),
					newImg      = $.cloudinary.image( img_id, display_settings );
					newImg.addClass('none');

					$('#thumbWrap .imgWrap').prepend( newImg );

					previousImg.fadeOut(700, function(){
						$(this).remove();
						newImg.fadeIn(700);
					});
			}

		},
		updatePictureWithUrl: function( options, callback ){

			var eventName = 'me/update-picture-fb',
				data = options,
				cb = {
					success: function( data ){
						callback( null, data );
					},
					error: function( xhr ){
						callback( xhr, null );
					}
				};

			LJ.fn.showLoaders();
			LJ.fn.say( eventName, data, cb );

		},
		setLocalStoragePreferences: function(){

			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem('preferences', JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem('preferences');
			}

		},
		handleFetchAndSyncFriends: function( data ){

			var friends = data.friends;
			LJ.user.friends = friends;

			if( friends.length == 0 )
				return; 

			var html = '';
			friends.forEach( function( friend ){
				html += LJ.fn.renderFriendInProfile( friend );
			});

			$('.row-friends').find('.row-body').html( html );

		}

	});