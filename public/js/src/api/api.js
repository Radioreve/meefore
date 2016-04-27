
	window.LJ.api = _.merge( window.LJ.api || {}, {

		app_token_url 			  	 : '/auth/facebook',
		me_url		  			  	 : '/api/v1/me',
		me_friends				 	 : '/me/friends',
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
		delete_my_account_url        : '/me/delete',
		fetch_more_users_url 		 : '/api/v1/users.more',
		share_url 					 : '/api/v1/share',
		distinct_countries_url 		 : '/api/v1/users.countries',
		event_hosts_ids_url          : '/api/v1/events/event_id/hosts',
		create_before_url 			 : '/api/v1/events',
		fetch_nearest_before_url     : '/api/v1/events.nearest',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				return resolve();

			});
		},
		get: function( url, data ){	
			// LJ.log('Calling the api [get]');
			return LJ.promise(function( resolve, reject ){

				if( LJ.user && LJ.user.facebook_id && data ){
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
								LJ.cacheUser( data.user );
							}
							return resolve( data );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
					},
					error: function( err ){

						setTimeout(function( err ){
							var err = err.responseJSON;
							var formatted_err = LJ.api.makeFormattedError( err );
							
							return reject( formatted_err );

	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ), err );
					}

				});

			});
		},
		post: function( url, data ){
			// LJ.log('Calling the api [post]');
			var data = data || {};
			return LJ.promise(function( resolve, reject ){

				if( LJ.user && LJ.user.facebook_id ){
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
								LJ.cacheUser( data.user );
							}
							return resolve( data );
	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ) );
					},
					error: function( err ){
						setTimeout(function( err ){

							var err = err.responseJSON; 
							var formatted_err = LJ.api.makeFormattedError( err );

							return reject( formatted_err );

	                    }, LJ.ui.minimum_api_delay - ( new Date() - call_started ), err );
					}

				});

			});
		},
		makeFormattedError: function( err ){

			var formatted_err = {};

			if( err.namespace ){
				formatted_err.namespace = err.namespace;
			}

			if( err.call_id ){
				formatted_err.call_id = err.call_id;
			}

			if( Array.isArray( err.errors ) ){
				formatted_err = _.merge( formatted_err, err.errors[0].data || err.errors[0] );
			} else {
				formatted_err = _.merge( formatted_err, err.errors.data || err.errors );
			}

			return formatted_err;

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
							LJ.cacheUser( exposed.me );
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
		fetchMeFriends: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.me_friends )
					  .then(function( exposed ){
					  	return resolve( exposed.friends );
					  }, function( err ){
					  	return reject( err );
					  });

			});

		},
		syncMeFriends: function( friend_ids ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.me_friends, { friend_ids: friend_ids })
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
		// Fetch a random amount of users that is not already fetched (not in facebook_ids array)
		fetchMoreUsers: function( facebook_ids, filters ){
			return  LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.fetch_more_users_url, { facebook_ids: facebook_ids || [], filters: filters })
					.then(function( exposed ){
						if( exposed.users ){
							return resolve({ users_count: exposed.users_count, users: exposed.users, call_id: exposed.call_id }); 
						} else {
							LJ.wlog('The server didnt respond with the expected users object');
						}
					}, function( err ){
						return reject( err );
					});

			});
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
		},
		deleteMyAccount: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.delete_my_account_url )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					});

			});
		},
		shareWithFriends: function( opt ){
			return LJ.promise(function( resolve, reject ){

				if( ! (opt.target_type && opt.shared_with && opt.target_id ) ){
					LJ.wlog('Missing parameters, not calling the api');
					return reject();
				}

				LJ.api.post( LJ.api.share_url, opt )

					.then(function( exposed ){
						return resolve( exposed );

					}, function( err ){
						return reject( err );

					});

			});
		},
		fetchBefores: function(){
			return LJ.promise(function( resolve, reject ){

				resolve();

			});
		},
		fetchDistinctCountries: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.distinct_countries_url )
					.then(function( exposed ){

						if( exposed.countries ){
							return resolve( exposed.countries );

						} else {
							LJ.wlog('The server didnt respond with the expected countries object');

						}
					}, function( err ){
						return reject( err );

					});

			});
		},
		createBefore: function( before ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.create_before_url, before )
					.then(function( exposed ){
						
						if( exposed.before ){
							return resolve( exposed.before );

						} else {
							LJ.wlog('The server didnt respond with the expected before object');

						}
					}, function( err ){
						return reject( err );

					});

			});
		},
		fetchNearestBefores: function( latlng, options ){
			return LJ.promise(function( resolve, reject ){

				var request = _.extend({}, { latlng: latlng }, options );

				LJ.api.get( LJ.api.fetch_nearest_before_url, request )
					.then(function( exposed ){

						if( exposed.befores ){
							return resolve( exposed.befores );

						} else {
							LJ.wlog('The server didnt respond with the expected before collection');

						}

					}, function( err ){
						return reject( err );

					});

			});
		}

	});