
	window.LJ.api = _.merge( window.LJ.api || {}, {

		fetched_users : [],
		fetched_users_full: [],

		app_token_url 			  	 	 	: '/auth/facebook',
		me_url		  			  	 	 	: '/api/v1/users/:user_id/self',
		me_friends				 	 	 	: '/api/v1/users/:user_id/friends',
		invite_code_url 			 	 	: '/api/v1/users/:user_id/invite-code',
		fetch_shared_url		  	 	 	: '/api/v1/users/:user_id/shared',
		fetch_meepass_url 		  	 	 	: '/api/v1/users/:user_id/meepass',
		fetch_cheers_url 		  	 	 	: '/api/v1/users/:user_id/cheers',
		fetch_user_url 	   	  	  	 	 	: '/api/v1/users/:user_id/core',
		fetch_user_profile_url    	 	 	: '/api/v1/users/:user_id/full',
		fetch_more_channels_url 	 	 	: '/api/v1/users/:user_id/channels',
		update_profile_url  	  	 	 	: '/api/v1/users/:user_id/update-profile',
		upload_picture_dt		  	 	 	: '/api/v1/users/:user_id/update-picture-client',
		upload_picture_fb		  	 	 	: '/api/v1/users/:user_id/update-picture-url',
		update_pictures_url		  	 	 	: '/api/v1/users/:user_id/update-pictures',
		fetch_cloudinary_tags_url 	 	 	: '/api/v1/users/:user_id/cloudinary-tags',
		update_settings_ux_url       	 	: '/api/v1/users/:user_id/update-settings-ux',
		update_settings_contact_url  	 	: '/api/v1/users/:user_id/update-settings-contact',
		update_settings_alerts_url 	 	 	: '/api/v1/users/:user_id/update-settings-alerts',
		update_settings_mailing_url  	 	: '/api/v1/users/:user_id/update-settings-mailinglists',
		mailchimp_status_url    	 	 	: '/api/v1/users/:user_id/mailchimp-status',
		delete_my_account_url        	 	: '/api/v1/users/:user_id/delete',
		get_online_users_url 		 	 	: '/api/v1/users/online',
		fetch_more_users_url 		 	 	: '/api/v1/users.more',
		share_url 					 	 	: '/api/v1/share',
		distinct_countries_url 		 	 	: '/api/v1/users.countries',
		create_before_url 			 	 	: '/api/v1/befores',
		fetch_nearest_before_url     	 	: '/api/v1/befores.nearest',
		fetch_before_url 		 	 	 	: '/api/v1/befores/:before_id',
		change_before_status_url 	 	 	: '/api/v1/befores/:before_id/status',
		before_request_url 			 	 	: '/api/v1/befores/:before_id/request',
		send_chat_message_url 	     	 	: '/api/v1/chats/:chat_id',
		fetch_chat_history_url 	 	 	 	: '/api/v1/chats/:chat_id',
		change_group_status_url		 	 	: '/api/v1/befores/:before_id/groups/:group_id/status',
		update_chat_seen_by_url 	 	 	: '/api/v1/chats/:chat_id/seen_by',
		update_before_seen_at_url 	 	 	: '/api/v1/befores/:before_id/seen_at',
		update_notifications_seen_at_url 	: '/api/v1/users/:user_id/notifications/seen_at',
		update_notifications_clicked_at_url : '/api/v1/users/:user_id/notifications/clicked_at',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				return resolve();

			});
		},
		ajax: function( url, method, data ){	
			return LJ.promise(function( resolve, reject ){

				LJ.log('['+method+'] ' + url);
				data = data || {};
				if( LJ.user && LJ.user.facebook_id ){
					data.facebook_id = LJ.user.facebook_id;
				}

				if( LJ.realtime.getSocketId() && data ){
					data.socket_id = LJ.realtime.getSocketId();
				}

				var call_started = new Date();

				$.ajax({

					method: method,
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
		get: function( url, data ){
			return LJ.api.ajax( url, 'get', data );
		},
		post: function( url, data ){
			return LJ.api.ajax( url, 'post', data );
			
		},	
		post2: function( url, data ){
			
			data = data || {};
			return LJ.promise(function( resolve, reject ){

				if( LJ.user && LJ.user.facebook_id ){
					data.facebook_id = LJ.user.facebook_id;
				}

				if( data && LJ.realtime.getSocketId() ){
					data.socket_id = LJ.realtime.getSocketId();
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

			if( err.error ){
				formatted_err = _.merge( formatted_err, err.error );

			} else {
				err = Array.isArray( err.errors ) ? err.errors[0] : err.errors;
				err = err.data ? err.data : err;
				formatted_err = _.merge( formatted_err, err );

			}

			return formatted_err;

		},
		fetchAppToken: function( access_token ){

			LJ.log('Fetching app token...');

			return LJ.api.post( LJ.api.app_token_url, {
					token: access_token

				}).then(function( data ){
					LJ.facebook_id = data.facebook_id
					LJ.app_token   = data.app_token;

			});

		},
		fetchMe: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.me_url.replace(':user_id', LJ.facebook_id ) )

					  .then(function( exposed ){
							LJ.cacheUser( exposed.me );
							LJ.app_settings = exposed.settings
							LJ.store.set("facebook_access_token", exposed.me.facebook_access_token );
					  		return resolve();

					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		fetchMeShared: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_shared_url.replace(':user_id', LJ.user.facebook_id ) )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  });
			});

		},
		fetchMeMeepass: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_meepass_url.replace(':user_id', LJ.user.facebook_id) )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		fetchMeCheers: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_cheers_url.replace(':user_id', LJ.user.facebook_id) )
					  .then(function( exposed ){
					  		return resolve( exposed );
					  }, function( err ){
					  		return reject( err );
					  });
			});
		},
		fetchMeFriends: function(){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.me_friends.replace(':user_id', LJ.user.facebook_id ))
					  .then(function( exposed ){
					  	return resolve( exposed );

					  }, function( err ){
					  	return reject( err );

					  });

			});

		},
		syncMeFriends: function( friend_ids ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.me_friends.replace(':user_id', LJ.user.facebook_id), { friend_ids: friend_ids })
					  .then(function( exposed ){
					  	return resolve( exposed );
					  }, function( err ){
					  	return reject( err );
					  });

			});

		},
		fetchUser: function( facebook_id ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_user_url.replace(':user_id', facebook_id ) )
					  .then(function( exposed ){
					  	if( exposed.user ){
					  		// Append the Facebook id, cause not present in cache 
					  		// for space (cost!) optimisation
					  		exposed.user.facebook_id = facebook_id;
					  	}
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

				LJ.api.get( LJ.api.fetch_user_profile_url.replace(':user_id', facebook_id ) )
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

				LJ.api.post( LJ.api.update_profile_url.replace(':user_id', LJ.user.facebook_id ), data )
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

				LJ.api.get( LJ.api.fetch_cloudinary_tags_url.replace(':user_id', LJ.user.facebook_id ) )
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

				LJ.api.post( LJ.api.upload_picture_dt.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.post( LJ.api.update_pictures_url.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.post( LJ.api.upload_picture_fb.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.post( LJ.api.update_settings_ux_url.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.post( LJ.api.update_settings_mailing_url.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.post( LJ.api.update_settings_alerts_url.replace(':user_id', LJ.user.facebook_id ), update )
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

				LJ.api.get( LJ.api.mailchimp_status_url.replace(':user_id', LJ.user.facebook_id ))
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		},
		updateInviteCode: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.invite_code_url.replace(':user_id', LJ.user.facebook_id ), update )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		},
		updateSettingsContact: function( update ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_settings_contact_url.replace(':user_id', LJ.user.facebook_id ), update )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					})

			});
		},
		deleteMyAccount: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.delete_my_account_url.replace(':user_id', LJ.user.facebook_id ) )
					.then(function( exposed ){
						return resolve( exposed );
					}, function( err ){
						return reject( err );
					});

			});
		},
		shareWithFriends: function( opt ){
			return LJ.promise(function( resolve, reject ){

				if( ! (opt.target_type && opt.shared_with && opt.user_id ) ){
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
		fetchBefore: function( before_id ){

			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_before_url.replace(':before_id', before_id ) )
					  .then(function( exposed ){
					  	return resolve( exposed.before );

					  }, function( err ){
					  	return reject( err );

					  });

			});

		},
		fetchBefores: function( before_ids ){

			var promises = [];
			before_ids.forEach(function( be_id ){
				promises.push( LJ.api.fetchBefore( be_id ) );
			});

			return LJ.Promise.all( promises );
							 

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
						
						if( exposed.before && exposed.before_item ){
							return resolve( exposed );

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
		},
		changeBeforeStatus: function( before_id, status ){

			if( ['open', 'suspended', 'canceled'].indexOf( status ) == -1 ){
				return LJ.wlog('Unsupported before status type');
			}

			var request = {
				status: status				
			};

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.change_before_status_url.replace(':before_id', before_id ), request )
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
		requestParticipation: function( before_id, members ){

			var request = {
				before_id : before_id,
				members   : members
			};

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.before_request_url.replace(':before_id', before_id), request )
					.then(function( exposed ){

						if( exposed.before_item && exposed.members_profiles ){
							return resolve( exposed );

						} else {
							LJ.wlog('The server didnt respond with the expected before object and/or members_profiles object');
						}

					}, function( err ){
						return reject( err );

					}) ;

			});

		},
		sendChatMessage: function( data ){

			if( !( data.message && data.chat_id && data.group_id && data.before_id ) ){
				return LJ.wlog('Cannot request the api without all required parameters');
			}

			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.send_chat_message_url.replace(':chat_id', data.chat_id ), data )
					.then(function( exposed ){
						resolve();

					}, function( err ){
						return reject( err );

					});

			});

		},
		fetchChatHistory: function( chat_id, opts ){

			// opts == sent_at (iso_string) & limit (number);
			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.fetch_chat_history_url.replace(':chat_id', chat_id ), opts )
					.then(function( exposed ){

						if( !exposed.messages ){
							return LJ.wlog('The server didnt respond with the expected messages object');

						} else {
							return resolve({
								messages : exposed.messages,
								seen_by  : exposed.seen_by
							});
						}

					}, function( err ){
						return reject( err );

					});

			});

		},
		changeGroupStatus: function( data ){
			return LJ.promise(function( resolve, reject ){

				var before_id   = data.before_id;
				var group_id    = data.group_id;
				var chat_id     = data.chat_id;
				var main_member = data.main_member;
				var status 	    = data.status;

				if( !( before_id && group_id && chat_id && main_member && status ) ){
					return LJ.wlog('Cannot call the api without required parameters');
				}

				var url = LJ.api.change_group_status_url.replace(':before_id', before_id ).replace(':group_id', group_id );
				LJ.api.post( url, data )
					.then(function( exposed ){
						return resolve();

					}, function( err ){
						return reject( err );
					});

				});
		},
		fetchMoreChannels: function( group_ids ){
			return LJ.promise(function( resolve, reject ){

				var url = LJ.api.fetch_more_channels_url.replace( ':user_id', LJ.user.facebook_id );
				LJ.api.post( url, { group_ids: group_ids })
					.then(function( exposed ){
						if( !exposed.channels ){
							return LJ.wlog('The server didnt respond with the expected channels parameter');
						} else {
							return resolve( exposed.channels );
						}
					}, function( err ){
						return reject( err );
					});

			});

		},
		fetchOnlineUsers: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.get( LJ.api.get_online_users_url )
					.then(function( exposed ){

						if( !exposed.online_users ){
							return LJ.wlog('The server didnt respond with the expected online_users parameter');
						} else {
							return resolve( exposed.online_users );
						}

					}, function( err ){
						return reject( err );
					});

			});
		},
		updateChatSeenBy: function( chat_id ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_chat_seen_by_url.replace( ':chat_id', chat_id ))
					.then(function( exposed ){
						return resolve( exposed );
						
					}, function( err ){
						return reject( err );
					})
			});


		},
		updateBeforeSeenAt: function( before_id ){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_before_seen_at_url.replace( ':before_id', before_id ) )
					.then(function( exposed ){
						return resolve( exposed );

					}, function( err ){
						return reject( err );

					});

			});
		},
		updateNotificationsSeenAt: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.api.post( LJ.api.update_notifications_seen_at_url.replace( ':user_id', LJ.user.facebook_id ) )
					.then(function( exposed ){
						return resolve( exposed );

					}, function( err ){
						return reject( err );

					});

			});
		},
		updateNotificationClickedAt: function( notification_id ){
			return LJ.promise(function( resolve, reject ){

				var data = { notification_id: notification_id };
				
				LJ.api.post( LJ.api.update_notifications_clicked_at_url.replace( ':user_id', LJ.user.facebook_id ), data )
					.then(function( exposed ){
						return resolve( exposed );

					}, function( err ){
						return reject( err );

					});

			});
		}

	});