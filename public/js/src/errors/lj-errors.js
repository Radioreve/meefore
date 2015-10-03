
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		parseError: function( xhr ){
			
			var res = xhr && xhr.responseText && JSON.parse( xhr.responseText );

			var errors    = res.errors;
			var namespace =  res.namespace;

			if( !errors || !namespace )
				return console.error('Couldnt parse the response from ajax call');

			return res;

		},
		handleApiError: function( err ){

            console.error('api error');

            var res = LJ.fn.parseError(err);
            console.log(res);

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
				"create_event"  : LJ.fn.handleErrorMessageCreateEvent,
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
        		var message = LJ.text_source["err_create_mp_" + err_data.err_parameter][ LJ.app_language ] && LJ.text_source["err_create_mp_" + err_data.err_parameter][ LJ.app_language ] || LJ.text_source["err_create_mp_default"][ LJ.app_language ]
        		return LJ.fn.replaceModalTitle( message );
        	}

            // static errors
        	if( err_data.err_id == 'already_hosting' ){
        		if( err_data.host_names[0] === LJ.user.name ){
                    var message = LJ.text_source["err_create_hosting_me"][ LJ.app_language ];
                } else {
                    var message = LJ.text_source["err_create_hosting_other"][ LJ.app_language ].replace('%s', err_data.host_names[0] );
                }
                return LJ.fn.replaceModalTitle( message );   
        	}

            var message =  LJ.text_source["err_create_" + err_data.err_id] && LJ.text_source["err_create_" + err_data.err_id][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
        	return LJ.fn.replaceModalTitle( message );

        },
        handleErrorMessageRequest: function( err_data ){


            if( err_data.err_id == 'missing_parameter' ){
                var message = LJ.text_source["err_request_mp_" + err_data.err_parameter] && LJ.text_source["err_request_mp_" + err_data.err_parameter][ LJ.app_language ] || LJ.text_source["err_request_mp_default"][ LJ.app_language ]
                return LJ.fn.replaceModalTitle( message );
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
                var message = LJ.text_source['err_request_name_bad_length'][ LJ.app_language ].replace('%min', err_data.min ).replace('%max', err_data.max );
                return LJ.fn.replaceModalTitle( message );
            }

            if( err_data.err_id == 'message_bad_length' ){
                var message = LJ.text_source['err_request_message_bad_length'][ LJ.app_language ].replace('%min', err_data.min ).replace('%max', err_data.max );
                return LJ.fn.replaceModalTitle( message );
            }

            var message =  LJ.text_source["err_request_" + err_data.err_id][ LJ.app_language ] && LJ.text_source["err_request_" + err_data.err_id][ LJ.app_language ] || LJ.text_source["err_unknown"][ LJ.app_language ];
            return LJ.fn.replaceModalTitle( message );


        },
        handleErrorMessageEventStatus: function( err_data ){

            LJ.fn.hideLoaders();
            LJ.fn.toastMsg( LJ.text_source["to_default_error"][ LJ.app_language ], 'error');
            $('.btn-validating').removeClass('btn-validating');

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
            return console.warn( message );

        }

	});