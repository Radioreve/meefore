
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        clearPendingState: function(){

            LJ.fn.hideLoaders();
            $('.btn-validating').removeClass('btn-validating');

        },  
		parseError: function( xhr ){
			
			var res = xhr && xhr.responseText && JSON.parse( xhr.responseText );

            if( !res ){
                return LJ.fn.warn('Cannot parse error',2);
            }

			var errors    = res.errors;
			var namespace = res.namespace;

			if( !errors || !namespace ){
				return LJ.fn.warn('Cannot construct error, errors or namespace object missing',2);
            }

			return res;

		},
		handleApiError: function( err ){

            console.error('api error, see raw res for explicit details');

            var res = LJ.fn.parseError(err);
            LJ.fn.log(res);

            for( var i = 0; i < res.errors.length; i++ ){
                if( res.errors[i].data ){
                    return LJ.fn.displayError( res.namespace, res.errors[i].data );
                }
            }

            return LJ.fn.displayError( res.namespace, res.errors[0] );

        },
        displayError: function( namespace, err_data ){
			
        	if( !namespace )
        		return console.error('Cant handle error without a namespace');

			var handlers = {
                "update_profile": LJ.fn.handleErrorUpdateProfile,
				"create_event"  : LJ.fn.handleErrorMessageCreateEvent,
                "create_place"  : LJ.fn.handleErrorMessageCreatePlace,
                "request_event" : LJ.fn.handleErrorMessageRequest,
                "event_status"  : LJ.fn.handleErrorMessageEventStatus,
                "chat_fetch"    : LJ.fn.handleErrorChatFetch,
                "chat_message"  : LJ.fn.handleErrorChatMessage,
                "chat_readby"   : LJ.fn.handleErrorChatReadby,
                "pusher_auth"   : LJ.fn.handleErrorPusherAuth
			};

			return handlers[ namespace ]( err_data );
        	
        },
        handleErrorMessageCreateEvent: function( err_data ){


        	if( err_data.err_id == 'missing_parameter' ){
        		var message = LJ.text_source["err_create_mp_" + err_data.parameter][ LJ.app_language ];
        		return LJ.fn.replaceModalTitle( message );
        	}

            if( err_data.err_id == 'n_hosts' || err_data.err_id == 'array_too_long' ){
                var message = LJ.text_source["err_create_n_hosts"] && LJ.text_source["err_create_n_hosts"][ LJ.app_language ] || LJ.text_source["err_create_mp_default"][ LJ.app_language ];
                return LJ.fn.replaceModalTitle( message.replace('%min', LJ.settings.app.min_hosts ).replace('%max', LJ.settings.app.max_hosts ));
            }

            // static errors
        	if( err_data.err_id == 'already_hosting' ){
        		if( err_data.host_names[0] === LJ.user.name ){
                    var message = LJ.text_source["err_create_already_hosting_me"][ LJ.app_language ];
                } else {
                    var message = LJ.text_source["err_create_already_hosting_other"][ LJ.app_language ].replace('%s', err_data.host_names[0] );
                }
                return LJ.fn.replaceModalTitle( message );   
        	}

            var message =  LJ.text_source["err_create_" + err_data.err_id] && LJ.text_source["err_create_" + err_data.err_id][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
        	return LJ.fn.replaceModalTitle( message );

        },
        handleErrorMessageCreatePlace: function( err_data ){

            if( err_data.err_id == 'missing_parameter' ){
                var message = "Il manque un paramètre";
                return LJ.fn.replaceModalTitle( message );
            }

            if( err_data.err_id == 'place_already_there' ){
                var message = "Cette adresse correspond déjà à un établissement référencé";
                return LJ.fn.replaceModalTitle( message );
            }

        },
        handleErrorUpdateProfile: function( err_data ){

            if( !err_data || !err_data.err_id ){
                return LJ.fn.handleUnexpectedError();
            }

            if( err_data.err_id == 'age_no_int' ){
                var message = LJ.text_source["err_update_profile_age"][ LJ.app_language ];
                return LJ.fn.toastMsg( message, "error" );
            }

            if( err_data.err_id == 'mainify_placeholder' ){
                var message = LJ.text_source["err_update_profile_mainify_placeholder"][ LJ.app_language ];
                return LJ.fn.toastMsg( message, "error" );
            }


        },
        handleErrorMessageRequest: function( err_data ){


            if( err_data.err_id == 'missing_parameter' ){
                var message = LJ.text_source["err_request_mp_" + err_data.parameter] && LJ.text_source["err_request_mp_" + err_data.parameter][ LJ.app_language ] || LJ.text_source["err_request_mp_default"][ LJ.app_language ]
                return LJ.fn.replaceModalTitle( message );
            }

            if( err_data.err_id == 'n_group' ){
                var message = LJ.text_source["err_request_n_group"][ LJ.app_language ];
                return LJ.fn.replaceModalTitle( message.replace('%min', LJ.settings.app.min_group ).replace('%max', LJ.settings.app.max_group ) );
            }

            // dynamic errors (from database)
            if( err_data.err_id == 'already_there' ){

                var member = err_data.already_there[0];
                var who_msg  = member.id  === LJ.user.facebook_id ?
                                    LJ.text_source["err_request_already_there_me"][ LJ.app_language ] :
                                    LJ.text_source["err_request_already_there_other"][ LJ.app_language ]
                                    .replace('%s', _.find( LJ.user.friends, function(friend){
                                        return friend.facebook_id == member.id; 
                                    }).name );

                var role_msg = member.role === 'host' ?
                               LJ.text_source["err_request_already_there_role_host"][ LJ.app_language ] :
                               LJ.text_source["err_request_already_there_role_asker"][ LJ.app_language ];

                var message = who_msg + LJ.text_source["err_request_already_there"][ LJ.app_language ] + role_msg;
                return LJ.fn.replaceModalTitle( message );
            }

            if( err_data.err_id == 'name_bad_length' ){
                var message = LJ.text_source['err_request_name_bad_length'][ LJ.app_language ];
                return LJ.fn.replaceModalTitle( message.replace('%min', err_data.min ).replace('%max', err_data.max ) );
            }

            if( err_data.err_id == 'message_bad_length' ){
                var message = LJ.text_source['err_request_message_bad_length'][ LJ.app_language ];
                return LJ.fn.replaceModalTitle( message.replace('%min', err_data.min ).replace('%max', err_data.max ) );
            }

            var message =  LJ.text_source["err_request_" + err_data.err_id][ LJ.app_language ] && LJ.text_source["err_request_" + err_data.err_id][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.replaceModalTitle( message );


        },
        handleErrorMessageEventStatus: function( err_data ){

            LJ.fn.clearPendingState();
            LJ.fn.toastMsg( LJ.text_source["to_default_error"][ LJ.app_language ], 'error');

        },
        handleErrorChatMessage: function( err_data ){

            var message = LJ.text_source["err_chat_" + err_data.err_id ] && LJ.text_source["err_chat_" + err_data.err_id ][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.toastMsg( message, "error" );

        },
        handleErrorChatFetch: function( err_data ){

            var message = LJ.text_source["err_chat_" + err_data.err_id ] && LJ.text_source["err_chat_" + err_data.err_id ][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.toastMsg( message, "error" );

        },
        handleErrorChatReadby: function( err_data ){

            var message = LJ.text_source["err_chat_" + err_data.err_id ] && LJ.text_source["err_chat_" + err_data.err_id ][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.toastMsg( message, "error" );

        },
        handleErrorPusherAuth: function( err_data ){

            var message =  LJ.text_source["err_pusher_" + err_data.err_id ] && LJ.text_source["err_pusher_" + err_data.err_id ][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.warn( message );

        },
        handleUnexpectedError: function(){

            LJ.fn.clearPendingState();

            LJ.fn.warn('Handling unexpected error...', 1);

            $('.curtain')
                .html('')
                .html(
                    '<div class="super-centered none unexpected-error-message">'
                        + LJ.text_source["err_unexpected_message"][ LJ.app_language ]
                    + '</div>'
                )
                .velocity('transition.fadeIn', {
                duration: 500,
                complete: function(){

                    $(this)
                        .find('.unexpected-error-message')
                        .velocity('transition.fadeIn', {
                            duration: 500
                        });

                    $(this)
                        .velocity({ opacity: [0.82,1]}, {
                            duration: 300
                        });

                    $(this).click(function(){
                        $(this).velocity('transition.fadeOut',{
                            duration: 500,
                            complete: function(){
                                $(this).html('');
                            }
                        })
                    })
                        
                }
            });


        }

	});