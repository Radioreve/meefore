
	window.LJ.api = _.merge( window.LJ.api || {}, {

		app_token_url 		: '/auth/facebook',
		me_url		  		: '/api/v1/me',
		update_profile_url  : '/me/update-profile',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				return resolve();

			});
		},
		get: function( url, data ){	
			return LJ.promise(function( resolve, reject ){

				if( LJ.user.facebook_id ){
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
						setTimeout(function(){
							return reject( err.responseJSON );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
					}

				});

			});
		},
		post: function( url, data ){
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
						setTimeout(function(){
							return reject( err.responseJSON );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
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
		}

	});