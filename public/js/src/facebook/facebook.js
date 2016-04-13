
window.LJ.facebook = _.merge( window.LJ.facebook || {}, {

	required_permissions : ['public_profile', 'email', 'user_friends', 'user_photos'],

	friends_url			 : '/me/friends',
	profile_url			 : '/me?fields=id,email,name,link,locale,gender',
	album_url  			 : '/me?fields=albums{name,id}',
	album_pictures_url   : '{{album_id}}/photos?fields=images',

	init: function(){

		LJ.facebook.startFacebookSdk();
		
	},
	startFacebookSdk: function(){

		console.log('Init FB');
		FB.init({
			appId: window.facebook_app_id,
			xfbml: true, // parse social plugins on this page
			version: 'v2.5' // use version 2.5
		});

	},
	fetchFacebookToken: function(){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook token...');
			FB.login(function( res ){

				if( res.status == 'not_authorized' ){
					return reject( Error("User didnt let Facebook access informations") )
				}

				if( res.status == 'connected' ){
					var access_token = res.authResponse.accessToken;
					LJ.login.data.access_token = access_token;

					console.log('Short lived access token : ' + access_token.substring(0,20) + '.....');
					return resolve( access_token );
				}

			}, { scope: LJ.facebook.required_permissions } );
		});

	},
	fetchMe: function(){

	},
	fetchFriends: function(){
		return LJ.promise(function( resolve, reject ){

			LJ.facebook.GraphAPI( LJ.facebook.friends_url, function( res ){

				if( res.err ){
					return reject( err );
				}

				var fb_friends  = res.data;
                var friend_ids  = _.pluck( fb_friends, 'id' );

                var data = {
                    'friend_ids' : friend_ids
                };

                resolve( data );

			});

		});
	},
	fetchFacebookProfile: function( facebook_token ){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook profile...');

			var options = {};
			if( LJ.login.data.access_token ){
				options.access_token = LJ.login.data.access_token;
			}
			
			FB.api( LJ.facebook.profile_url, options, function( facebookProfile ){

				// Surcharge profile with access_token for server processing;
				var access_token = LJ.login.data.access_token || facebook_token;
				
				LJ.log('Surcharing profile object with token : ' + access_token );
				facebookProfile.access_token = access_token;

				// Store it for reconnexion purposes
				LJ.facebook_profile = facebookProfile;

				if( facebookProfile.error ){
					return reject( facebookProfile.error );
				} else {
					return resolve( facebookProfile );
				}
			});

		});

	},
	GraphAPI: function( url, callback, opts ){

        var ls = window.localStorage;

        var access_token = ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.long_lived ) 
                         || ( ls.preferences && JSON.parse( ls.preferences ).long_lived_tk )
                         || ( ls.reconn_data && JSON.parse( ls.reconn_data ).long_lived_tk )
                         || ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.short_lived )

        if( !access_token ){
            LJ.wlog('Calling graph api without being able to find a valid long lived token');
        }

        FB.api( url, { access_token: access_token }, callback );

    },
    renderPicture: function( src ){

    	return [
    				'<div class="modal__facebook-picture" data-img-src="' + src + '">',
    					'<img src="' + src + '" width="75"/>',
    					'<div class="modal__picture-icon">',
    						LJ.ui.renderIcon('check'), 
    					'</div>', 
    				'</div>'
    	].join('');

    },
    fetchPictures: function( album_id ){
    	return LJ.promise(function( resolve, reject ){

 			LJ.facebook.GraphAPI( LJ.facebook.album_pictures_url.replace( '{{album_id}}', album_id ), function( res ){
		
 				if( !res || res.error ){
 					return reject( res.error );
 				} else {
 					return resolve( res );
 				}

 			});

    	});
    },
    fetchProfilePictures: function(){
		return LJ.facebook.fetchProfilePicturesAlbumId().then( LJ.facebook.fetchPictures );
    },
	fetchProfilePicturesAlbumId: function( next_page ){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook profile picture album id...');

			var album_url = next_page || LJ.facebook.album_url;
			var album_id  = null;

			LJ.facebook.GraphAPI( album_url, function(res){

				if( !res.albums ){
					return reject('No album id to display');
				}

				var albums = res.albums.data;
				albums.forEach(function( album ){

					if( album.name == "Profile Pictures" ){
						album_id = album.id;
					}

				});

				if( !album_id && res.albums.paging && res.albums.paging.cursor && res.albums.paging.cursor.next ){

					var next = res.albums.paging.cursor.next;

					LJ.log('Didnt find on first page, trying with next page : ' + next );
					return LJ.facebook.fetchProfilePicturesAlbumId( next );
				}

				if( !album_id && res.albums.paging && res.albums.paging.cursor && !res.albums.paging.cursor.next ){
					return reject('Couldnt find album id, no next page to browse' );
				}

				LJ.log('Album id found, ' + album_id );
				return resolve( album_id );

			});

		});

	},
	hasPictureRightDimensions: function( image_object ){

		if( image_object.width > LJ.ui.facebook_img_min_width && image_object.width < LJ.ui.facebook_img_max_width ){
			return true;
		} else {
			return false;
		}

	},
	showFacebookPicturesInModal: function( img_place ){

		LJ.ui.showModalAndFetch({

			"type"			: "facebook",
			"title"			: LJ.text("mod_facebook_pictures_title"),
			"subtitle"		: LJ.text("mod_facebook_pictures_subtitle"),
			"footer"		: "<button class='--rounded'>" + LJ.ui.renderIcon('check') + "</button>",
			"attributes"	: [{ name: "img-place", val: img_place }],

			"fetchPromise"	: LJ.facebook.fetchProfilePictures

		})
		.then( LJ.facebook.displayFacebookPicturesInModal )
		.catch( LJ.facebook.displayFacebookPicturesInModal_Error );
			

	},
	displayFacebookPicturesInModal: function( results ){

		var img_place = $('.modal').attr('data-img-place');

		var html = LJ.facebook.$profile_pictures || [];

			if( html.length == 0 ){
				results.data.forEach(function( picture_object ){
					picture_object.images.forEach(function( image_object ){
						if( LJ.facebook.hasPictureRightDimensions( image_object )){
							html.push( LJ.facebook.renderPicture( image_object.source ) );
						}
					});
				});
			}

			LJ.facebook.$profile_pictures = html;

			$('.modal-body')
				.append( html.join('') )
				.waitForImages(function(){
					$(this)
						.find('.modal__loader')
						.velocity('bounceOut', { duration: 500, delay: 500,
							complete: function(){

								$('.modal__facebook-picture')
									   .velocity('bounceInQuick', {
									   		display: 'block'
									   });

								LJ.ui.turnToJsp('.modal-body', {
									jsp_id: 'modal_facebook_pictures'
								});

							}
						});

				});

	},
	displayFacebookPicturesInModal_Error: function(){

		LJ.delay(1000).then(function(){

			$('.modal-body')
					.append('<div class="modal__loading-error none">' + LJ.text('modal_err_empty_fetch') + '</div>')

			$('.modal__loader')
			.velocity('bounceOut', { duration: 500, delay: 500,
				complete: function(){

					$('.modal-body').find('.modal__loading-error').velocity('bounceInQuick', {
						display: 'block'
					});

				}
			});

		});


	},
	showModalSendMessageToFriends: function(){

		FB.ui({
			method: 'send',
			link: 'http://www.meefore.com'
		});

	}

});