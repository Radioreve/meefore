
	window.LJ.before = _.merge( window.LJ.before || {}, {

		processRequest: function( before_id ){

			return LJ.ui.getModalItemIds()
				.then(function( item_ids ){

					var d = LJ.static.renderStaticImage('search_loader')
					$( d ).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
						duration: 400
					});
					
					item_ids.push( LJ.user.facebook_id );
					return LJ.api.requestParticipation( before_id, item_ids );

				})
				.then(function( exposed ){
					return LJ.ui.hideModal();

				})
				.catch(function(e){
					LJ.wlog(e);
					return LJ.before.handleRequestError( e, before_id );

				});

		},
		handleRequest: function(){

        	LJ.log('Handling request, waiting for friend ids...');

        	var before_id = $( this ).closest('[data-before-id]').attr('data-before-id');

			LJ.ui.showModal({
				"title"			: LJ.lang.sayCheers(),
				"type"      	: "request",
				"search_input"	: true,
				"jsp_body" 	    : true,
				"attributes"	: [{ name: "item-id", val: before_id }],
				"subtitle"		: LJ.text('modal_request_subtitle'),
				"body"  		: LJ.friends.renderFriendsInModal(),
				"max_items"     : (LJ.app_settings.app.max_group - 1),
				"min_items"     : LJ.app_settings.app.min_group,
				"footer" 		: "<button class='x--bombed'>"+ LJ.text("modal_request_btn") +"</button>",
			})
			.then(function(){
				LJ.ui.refreshModalState();
				return LJ.before.processRequest( before_id );

			});


        },
        handleRequestError: function( err, before_id ){

        	var err_id  = err.err_id;
        	var err_msg = null;

			if( err_id == "missing_parameter" ){
				LJ.wlog('Missing parameter...!');

			}
			if( err_id == "already_there" ){
				//var profiles = LJ.friends.getFriendsProfiles( _.map( err.already_there, 'member_id') );
				//var names    = _.map( profiles, 'name' );
				//var formatted_names = LJ.renderMultipleNames( names );
				_.map( err.already_there, 'member_id').forEach(function( member_id ){
					LJ.ui.noSelectModalRow( member_id, LJ.text('be_request_already_there'));
				});

				$('.modal')
					.removeClass('x--pending')
                    .addClass('x--disabled')
					.find('.modal__search-loader').hide();
					
				return LJ.before.processRequest( before_id );

			}
			if( err_msg ){
				LJ.ui.showToast( err_msg ,'error' );

			}

			LJ.ui.hideModal();

        },
        handleClickOnRequestPending: function(){

        	LJ.ui.showToast( LJ.text('to_request_pending') );

        },
        handleClickOnRequestAccepted: function(){

        	LJ.log('Redirecting to chat...');
            var $self = $( this );

            var before_id = $self.closest('.be-inview').attr('data-before-id');
            var chat_id   = LJ.before.getChannelItem( before_id ).chat_id;

            if( LJ.chat.getChatState() == "hidden" ){
                LJ.chat.showChatWrap();
            }

            LJ.chat.hideChatInview();
            LJ.chat.activateChat( chat_id );
            LJ.chat.showChatInview( chat_id );
            LJ.chat.refreshChatJsp( chat_id );

        }

	});