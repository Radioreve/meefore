
	window.LJ.api = _.merge( window.LJ.api || {}, {

		app_token_url 			  : '/auth/facebook',
		me_url		  			  : '/api/v1/me',
		update_profile_url  	  : '/me/update-profile',
		upload_picture_dt		  : '/me/update-picture-client',
		upload_picture_fb		  : '/me/update-picture-url',
		update_pictures_url		  : '/me/update-pictures',
		fetch_cloudinary_tags_url : '/me/cloudinary-tags',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				return resolve();

			});
		},
		get: function( url, data ){	
			LJ.log('Calling the api [get]');
			return LJ.promise(function( resolve, reject ){

				if( LJ.user.facebook_id && data ){
					data.facebook_id = LJ.user.facebook_id;
				}

				var call_started = new Date();

				$.ajax({

					method: 'get',
					dataType: 'json',
					data: data,
					url: url,
					beforeSend: function( req ){
                    	req.setRequestHeader('x-access-token', LJ.app_token );
                	},
					success: function( data ){
						setTimeout(function(){
							return resolve( data );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
					},
					error: function( err ){
						setTimeout(function( err ){
							var err = err.responseJSON;
							if( Array.isArray( err ) ){
								return reject({ err: err.errors[0], call_id: err.call_id });
							} else {
								return reject( err );
							}
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ), err );
					}

				});

			});
		},
		post: function( url, data ){
			LJ.log('Calling the api [post]');
			return LJ.promise(function( resolve, reject ){

				if( LJ.user.facebook_id ){
					data.facebook_id = LJ.user.facebook_id;
				}

				var call_started = new Date();

				$.ajax({

					method: 'post',
					data: data,
					dataType: 'json',
					url: url,
					beforeSend: function( req ){
	                    req.setRequestHeader('x-access-token', LJ.app_token );
	                },
					success: function( data ){
						setTimeout(function(){
							return resolve( data );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
					},
					error: function( err ){
						setTimeout(function( err ){
							console.log(err);
							var err = err.responseJSON;
							if( Array.isArray( err ) ){
								return reject({ err: err.errors[0], call_id: err.call_id });
							} else {
								return reject( err );
							}
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ), err );
					}

				});

			});
		},
		fetchAppToken: function( facebook_profile ){

			LJ.log('Fetching app token...');
			facebook_profile = facebook_profile || LJ.facebook_profile;
			
			return LJ.api.post( LJ.api.app_token_url, {
					facebook_profile: facebook_profile,
					facebook_id: facebook_profile.id // server compliance
				}).then(function( data ){
					LJ.app_token = data.app_token;
			});

		},
		fetchMe: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.me_url )
					  .then(function( exposed ){
							LJ.user     = exposed.me;
							LJ.settings = exposed.settings
					  		return resolve();
					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		updateProfile: function( data ){

			// Needed to keep track of parallel api calls and matching loaders
			var loader_id = LJ.generateId();
			LJ.ui.showLoader( loader_id );

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_profile_url, data )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  }).then(function(){
					  	LJ.ui.hideLoader( loader_id );
					  });
			});
		},
		fetchCloudinaryTags: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_cloudinary_tags_url )
					  .then(function( exposed ){
					  	if( exposed.cloudinary_tags ){
							return resolve( exposed.cloudinary_tags );
					  	} else {
					  		LJ.wlog('The server didnt respond with expected cloudinary_tags object' );
					  	}
					  }, function( err ){
					  	return reject( err );
					  });

			});

		},
		uploadNewPicture: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.upload_picture_dt, update )
					  .then(function( exposed ){
					  	if( exposed.new_picture ){
					  		return resolve( exposed.new_picture )
					  	} else {
					  		LJ.wlog('The server didnt respond with expected new_picture object' );
					  	}
					  }, function( err ){
					  	return reject( err );
					  });

			});
		},
		updatePicture: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_pictures_url, update )
					  .then(function( exposed ){
					  	if( exposed.pictures ){
					  		return resolve({ pictures: exposed.pictures, call_id: exposed.call_id });
					  	} else {
					  		LJ.wlog('The server didnt respond with expected pictures object');
					  	}
					  }, function( err ){
					  	return reject( err );
					  });

			});
		}	

	});