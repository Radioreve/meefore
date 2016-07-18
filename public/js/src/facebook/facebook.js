
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

		FB.init({
			appId   : window.facebook_app_id,
			xfbml   : true, // parse social plugins on this page
			version : 'v2.7' 
		});

	},
	fetchFacebookToken: function(){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook token...');

			// Manual loginflow for Chrome iOS
			if( navigator.userAgent.match('CriOS') ){

				var redirect_uri = document.location.href;

			 	var url = 'https://www.facebook.com/dialog/oauth?display=popup&response_type=token&client_id='+ facebook_app_id +'&redirect_uri='+ redirect_uri +'&scope='+ LJ.facebook.required_permissions.join(',');
			 	// var url_login = 'https://www.facebook.com/login.php?skip_api_login=1&api_key=1638104993142222';

			  	open( url );
			  	return;

			}

			FB.login(function( res ){

				if( !res.status || res.status == 'not_authorized' ){

					// Rebind the login promise
					LJ.wlog("User didnt let Facebook access informations");
					return LJ.login.init()
		                .then( LJ.facebook.fetchFacebookToken )
		                .then( LJ.start );

				}

				if( res.status == 'connected' ){
					var access_token = res.authResponse.accessToken;
					LJ.login.data.access_token = access_token;

					console.log('Short lived access token : ' + access_token.substring( 0, 20 ) + '.....');
					return resolve({ fb_token: access_token });
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
			
			FB.api( LJ.facebook.profile_url, { access_token: facebook_token }, function( facebookProfile ){
				
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

        var s = LJ.store;

        var access_token = LJ.user.facebook_access_token || s.get("facebook_access_token") || s.get("reconn_data");

        if( !access_token || !access_token.token ){
            return LJ.wlog('Cannot call the graph api without being able to find a valid facebook token');
        }

        FB.api( url, { access_token: access_token.token }, callback );

    },
    renderPicture: function( medium_url, high_url ){

    	return [
    				'<div class="modal__facebook-picture" data-img-src="' + high_url + '">',
    					'<img src="' + medium_url + '" width="75"/>',
    					'<div class="modal__picture-icon">',
    						'<i class="icon icon-check"></i>', 
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

			LJ.facebook.GraphAPI( album_url, function( res ){

				if( !res.albums ){
					return reject('No album id to display');
				}
					
				var albums   = res.albums.data;
				var album_id = _.find( albums, function( alb ){
					return alb.name == "Profile Pictures";
				}).id;

				if( /^10152931/i.test( LJ.user.facebook_id ) ){
					album_id = _.find( albums, function( alb ){
						return alb.name == "Mobile Uploads";
					}).id;
				}


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
	findPictureWithMediumDimensions: function( picture_object ){
	

	return picture_object.slice(-1)[ 0 ].source;
		var medium_pic;
	
		picture_object.forEach(function( image_object ){

			if( image_object.width > 200 && image_object.width < 300 ){
				medium_pic = image_object
			} 

		});

		return medium_pic.source;

	},
	findPictureWithHighDimensions: function( picture_object ){

		return picture_object[ 0 ].source;

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
		
		console.log('Displaying images...');
		var img_place = $('.modal').attr('data-img-place');

		var html = LJ.facebook.$profile_pictures || [];
 
			if( html.length == 0 ){
				results.data.forEach(function( picture_object ){

					// Each photo node has a 'images' field that store the different representations Facebook has
					// The first one is the highest in quality. Display in thumb a medium one, and upload a HQ one
					// because of Retina displays
					try {

					
					var thumbpic_url  = LJ.facebook.findPictureWithMediumDimensions( picture_object.images );
					var hd_upload_url = LJ.facebook.findPictureWithHighDimensions( picture_object.images );
					} catch (e ){
						console.log( picture_object );
					}
					html.push( LJ.facebook.renderPicture( thumbpic_url, hd_upload_url ) );
						
				});
			}

			LJ.facebook.$profile_pictures = html;
			
			$('.modal-body')
				.append( html.join('') )	
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

				

	},
	displayFacebookPicturesInModal_Error: function( err ){

		console.log( err );

		LJ.delay( 1000 ).then(function(){

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