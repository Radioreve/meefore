
	window.LJ.before = _.merge( window.LJ.before || {}, {

		processRequest: function( before_id ){

			var members_profiles = null;
			var before_item      = null;
			var channel_item     = null;

			return LJ.ui.getModalItemIds()
				.then(function( item_ids ){
					var d = LJ.static.renderStaticImage('search_loader')
					$(d).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
						duration: 400
					});
					
					item_ids.push( LJ.user.facebook_id );
					return LJ.api.requestParticipation( before_id, item_ids );

				})
				.then(function( exposed ){
					before_item  = exposed.before_item;
					channel_item = exposed.channel_item;
					return LJ.ui.hideModal();

				})
				.then(function(){
					LJ.ui.showToast( LJ.text('to_before_request_success') );
					LJ.user.befores.push( before_item );
					LJ.before.pendifyBeforeInview( before_id );
					LJ.before.pendifyBeforeMarker( before_id );
					LJ.user.channels.push( channel_item );
					LJ.realtime.subscribeToChatChannel( channel_item.channel_all );
					LJ.realtime.subscribeToChatChannel( channel_item.channel_team );
					LJ.chat.addAndFetchOneChat( channel_item, {
						"row_insert_mode": "top"
					});
					
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
				"footer"		: "<button class='--rounded'><i class='icon icon-check'></i></button>"
			})
			.then(function(){
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
					.removeClass('--pending')
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

        },
        defaultifyBeforeInview: function( before_id ){

        	var $be = $('.be-inview[data-before-id="'+ before_id +'"]');

        	$be.find('.be-request button')
        		.velocity('shradeOut', {
        			duration: 300,
        			complete: function(){
        				var $new = $( LJ.before.renderBeforeInviewBtn__UserDefault() ).hide();
        				$(this).replaceWith( $new );
        				$new.velocity('shradeIn', { duration: 300, 'display': 'flex' });
        			}
        		});

        },
        pendifyBeforeInview: function( before_id ){

        	var $be = $('.be-inview[data-before-id="'+ before_id +'"]');

        	$be.find('.be-request button')
        		.velocity('shradeOut', {
        			duration: 300,
        			complete: function(){
        				var $new = $( LJ.before.renderBeforeInviewBtn__UserPending() ).hide();
        				$(this).replaceWith( $new );
        				$new.velocity('shradeIn', { duration: 300, 'display': 'flex' });
        			}
        		});

        },
        acceptifyBeforeInview: function( before_id ){

        	var $be = $('.be-inview[data-before-id="'+ before_id +'"]');

        	$be.find('.be-request button')
        		.velocity('shradeOut', {
        			duration: 300,
        			complete: function(){
        				var $new = $( LJ.before.renderBeforeInviewBtn__UserAccepted() ).hide();
        				$(this).replaceWith( $new );
        				$new.velocity('shradeIn', { duration: 300, 'display': 'flex' });
        			}
        		});

        },
        pendifyBeforeMarker: function( before_id ){

        	LJ.map.markers.forEach(function( mrk ){

        		if( mrk.marker_id == before_id ){
        			var icon = LJ.map.makeIcon( LJ.map.getBeforeMarkerUrlByType("pending") );
        			mrk.marker.setIcon( icon );

        		}

        	});

        },
        acceptifyBeforeMarker: function( before_id ){

        	LJ.map.markers.forEach(function( mrk ){

        		if( mrk.marker_id == before._id ){
        			var icon = LJ.map.makeIcon( LJ.map.getBeforeMarkerUrlByType("accepted") );
        			mrk.marker.setIcon( icon );
        			
        		}

        	});

        }

	});