
	window.LJ.api = _.merge( window.LJ.api || {}, {

		app_token_url 			  	 : '/auth/facebook',
		me_url		  			  	 : '/api/v1/me',
		me_friends				  	 : '/me/friends',
		invite_code_url 			 : '/me/invite-code',
		fetch_shared_url		  	 : '/api/v1/users/:facebook_id/shared',
		fetch_meepass_url 		  	 : '/api/v1/users/:facebook_id/meepass',
		fetch_friends_url  		  	 : '/api/v1/users/:facebook_id/friends',
		fetch_user_url 	   	  	  	 : '/api/v1/users/:facebook_id/core',
		fetch_user_profile_url    	 : '/api/v1/users/:facebook_id/full',
		update_profile_url  	  	 : '/me/update-profile',
		upload_picture_dt		  	 : '/me/update-picture-client',
		upload_picture_fb		  	 : '/me/update-picture-url',
		update_pictures_url		  	 : '/me/update-pictures',
		fetch_cloudinary_tags_url 	 : '/me/cloudinary-tags',
		update_settings_ux_url       : '/me/update-settings-ux',
		update_settings_contact_url  : '/me/update-settings-contact',
		update_settings_alerts_url 	 : '/me/update-settings-alerts',
		update_settings_mailing_url  : '/me/update-settings-mailinglists',
		mailchimp_status_url    	 : '/api/v1/users/:facebook_id/mailchimp-status',

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
							if( data.user ){
								LJ.user = data.user;
							}
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
							if( data.user ){
								LJ.user = data.user;
							}
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
		handleErr: function( err_id ){

		},
		fetchAppToken: function( facebook_profile ){

			LJ.log('Fetching app token...');
			facebook_profile = facebook_profile || LJ.facebook_profile;
			
			return LJ.api.post( LJ.api.app_token_url, {
					facebook_profile : facebook_profile,
					facebook_id      : facebook_profile.id // server compliance
				}).then(function( data ){
					LJ.app_token = data.app_token;
			});

		},
		fetchMe: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.me_url )
					  .then(function( exposed ){
							LJ.user         = exposed.me;
							LJ.app_settings = exposed.settings
					  		return resolve();
					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		fetchMeShared: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_shared_url.replace(':facebook_id', LJ.user.facebook_id ) )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  });
			});

		},
		fetchMeMeepass: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_meepass_url.replace(':facebook_id', LJ.user.facebook_id) )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		fetchMeFriends: function( data ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.me_friends, data )
					  .then(function( exposed ){
					  	return resolve( exposed );
					  }, function( err ){
					  	return reject( err );
					  });

			});

		},
		fetchUser: function( facebook_id ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_user_url.replace(':facebook_id', facebook_id ) )
					  .then(function( exposed ){
					  	return resolve( exposed );
					  }, function( err ){
					  	return reject( err );
					  });

			});

		},
		fetchUsers: function( facebook_ids ){

			var promises = [];
			facebook_ids.forEach(function( fb_id ){
				promises.push( LJ.api.fetchUser( fb_id ) )
			});

			return LJ.Promise.all( promises );
							 

		},
		fetchUserProfile: function( facebook_id ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_user_profile_url.replace(':facebook_id', facebook_id ) )
					  .then(function( exposed ){
					  	return resolve( exposed );
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
		},
		uploadNewPictureUrl: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.upload_picture_fb, update )
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
		},
		updateSettingsUx: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_settings_ux_url, update )
					.then(function( exposed ){
						if( exposed.user && exposed.user.app_preferences ){
							return resolve({ app_preferences: exposed.user.app_preferences, call_id: exposed.call_id });
						} else {
							LJ.wlog('The server didnt respond with the expected settings object')
						}
					}, function( err ){
						return reject( err );
					});

			});
		},
		updateSettingsMailing: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_settings_mailing_url, update )
					.then(function( exposed ){
						if( exposed.user && exposed.user.app_preferences ){
							return resolve({ app_preferences: exposed.user.app_preferences, call_id: exposed.call_id });
						} else {
							LJ.wlog('The server didnt respond with the expected settings object')
						}
					}, function( err ){
						return reject( err );
					});

			});
		},
		updateSettingsAlerts: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_settings_alerts_url, update )
					.then(function( exposed ){
						if( exposed.user && exposed.user.app_preferences ){
							return resolve({ app_preferences: exposed.user.app_preferences, call_id: exposed.call_id });
						} else {
							LJ.wlog('The server didnt respond with the expected settings object')
						}
					}, function( err ){
						return reject( err );
					});

			});
		},
		getMailchimpStatus: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.mailchimp_status_url.replace(':facebook_id', LJ.user.facebook_id ))
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		},
		updateInviteCode: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.invite_code_url, update )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		},
		updateSettingsContact: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_settings_contact_url, update )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		}

	});