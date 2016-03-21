
window.LJ.facebook = _.merge( window.LJ.facebook || {}, {

	required_permissions : ['public_profile', 'email', 'user_friends', 'user_photos'],
	profile_url			 : '/me?fields=id,email,name,link,locale,gender',
	album_url  			 : '/me?fields=albums{name,id}',
	album_pictures_url   : '{{album_id}}/photos?fields=images',

	init: function(){

		LJ.Promise.resolve()
				  .then( LJ.facebook.startFacebookSdk );
		
	},
	startFacebookSdk: function(){

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
					console.log('Short lived access token : ' + access_token.substring(0,20) + '.....');
					return resolve( res.authResponse.accessToken );
				}

			}, { scope: LJ.facebook.required_permissions } );
		});

	},
	fetchFacebookProfile: function( facebook_token ){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook profile...');
			FB.api( LJ.facebook.profile_url, function( facebookProfile ){
				// Surcharge profile with access_token for server processing;
				facebookProfile.access_token = facebook_token;
				// Store it for reconnexion purposes
				LJ.facebook_profile = facebookProfile;
				return resolve( facebookProfile );

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

		}).then( LJ.facebook.displayFacebookPicturesInModal );
			

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

	}

});