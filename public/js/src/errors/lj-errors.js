
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

        	var missing_parameter_messages = {
        		"hosts_facebook_id"	: "Il faut être au moins 2 pour organiser un before",
        		"ambiance"		 	: "Il manque des hashtag",
        		"scheduled_party"	: "Et la soirée, ça se passe où ?",
        		"address" 		 	: "Il va nous manquer l'addresse :/ ",
        		"begins_at" 		: "Il va nous manquer la date ",
        		"default"			: "Une des valeurs semble manquer" 
        	};

        	if( err_data.err_id == 'missing_parameter' ){
        		message = missing_parameter_messages[err_data.parameter || 'default' ];
        		return LJ.fn.replaceModalTitle( message );
        	}

            // static errors
        	if( err_data.err_id == 'already_hosting' ){
        		var already_hosting_message = err_data.host_names[0] === LJ.user.name ? 'Tu organises ' :  err_data.host_names[0] + ' organise ';
        		already_hosting_message += 'déjà un before ce jour là';
        	}

            // dynamic errors (from database)
        	var err_id_messages = {
        		unknown 		: "Une erreur inconnue s'est produite",
        		twin_hosts		: "Tous les organisateurs doivent être différents",
        		time_travel		: "Les retours vers le futur ne sont pas possibles",
        		ghost_hosts		: "Des organisateurs sont inconnus de meefore",
        		already_hosting	: already_hosting_message
        	};

        	return LJ.fn.replaceModalTitle( err_id_messages[ err_data.err_id || 'unknown'] );

        },
        handleErrorMessageRequest: function( err_data ){

                var missing_parameter_messages = {
                "members_facebook_id"   : "Il faut être au moins 2 pour rejoindre un before",
                "name"                  : "En manque d'inspiration ? Un petit effort! ",
                "message"               : "Un message de bienvenue est indispensable!",
                "default"               : "Une des valeurs semble manquer"
            };

            // static errors
            if( err_data.err_id == 'missing_parameter' ){
                message = missing_parameter_messages[err_data.parameter || 'default' ];
                return LJ.fn.replaceModalTitle( message );
            }

            // dynamic errors (from database)
            if( err_data.err_id == 'already_there' ){
                var member = err_data.already_there[0];
                var role_msg = member.role === 'host' ? 'qu\'organisateur!' : 'que participant!';
                var who_msg  = member.id   === LJ.user.facebook_id ? 'Tu es ' : _.find( LJ.user.friends, function(friend){ return friend.facebook_id == member.id; }).name +' est ';
                var already_there_message = who_msg + ' déjà présent en tant ' + role_msg;
            }

            var err_id_messages = {
                unknown             : "Une erreur inconnue s'est produite",
                name_bad_pattern    : "Le nom ne peut contenir que chiffres lettres et ponctuation",
                message_bad_pattern : "Le message ne peut contenir que chiffres lettres et ponctuation",
                name_bad_length     : "Le nom doit avoir entre "+ err_data.min+" et "+ err_data.max+" charactères",
                message_bad_length  : "Le message doit avoir entre "+ err_data.min+" et "+ err_data.max+" charactères",
                ghost_members       : "Des members sont inconnus de meefore",
                event_not_open      : "Les organisateurs ont suspendu momentanément l'évènement",
                already_there       : already_there_message
            };

            return LJ.fn.replaceModalTitle( err_id_messages[ err_data.err_id || 'unknown'] );

        },
        handleErrorMessageEventStatus: function( err_data ){

            LJ.fn.hideLoaders();
            LJ.fn.toastMsg('Une erreur est survenue', 'error');
            $('.btn-validating').removeClass('btn-validating');

        },
        handleErrorChatMessage: function( err_data ){

            var err_id_messages = {
                unknown            : "Une erreur inconnue s'est produite suite à l'envoie du message"
            };

            return LJ.fn.toastMsg( err_id_messages[ err_data.err_id ] || err_id_messages["unknown"], "error" );

        },
        handleErrorChatFetch: function( err_data ){

            var err_id_messages = {
                unknown            : "Une erreur inconnue s'est produite",
                unauthorized_group : "Vous n'êtes pas autorisé à participer à cette discussion!",
                unauthorized_fetch : "Vous n'êtes pas autorisé à demander les messages de cette discussion",
                unauthorized_admin : "Vous n'êtes pas autorisé à participer à cette discussion! (admin)",
                missing_parameter  : "Il manque un paramètre pour envoyer le message"
            };

            return LJ.fn.toastMsg( err_id_messages[ err_data.err_id ] || err_id_messages["unknown"], "error" );

        },
        handleErrorChatReadby: function( err_data ){

            var err_id_messages = {
                unknown            : "Une erreur inconnue s'est produite à la lecture du message"
            };

            return LJ.fn.toastMsg( err_id_messages[ err_data.err_id ] || err_id_messages["unknown"], "error" );

        },
        handleErrorPusherAuth: function( err_data ){

            var err_id_messages = {
                unknown      : "Une erreur inconnue s'est produite lors de l'authentification à Pusher",
                unauthorized : "Cannot join the channel (access denied, auth failed)"
            };

            return console.warn( err_id_messages[ err_data.err_id ] || err_id_messages["unknown"] );

        }

	});