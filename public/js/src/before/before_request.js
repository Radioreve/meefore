
	window.LJ.before = _.merge( window.LJ.before || {}, {

		handleRequest: function(){

        	LJ.log('Handling request, waiting for friend ids...');

        	var target_id = $( this ).closest('[data-before-id]').attr('data-before-id');

			LJ.ui.showModal({
				"title"			: LJ.lang.sayCheers(),
				"type"      	: "request",
				"search_input"	: true,
				"jsp_body" 	    : true,
				"attributes"	: [{ name: "item-id", val: target_id }],
				"subtitle"		: LJ.text('modal_request_subtitle'),
				"body"  		: LJ.friends.renderFriendsInModal(),
				"footer"		: "<button class='--rounded'><i class='icon icon-check'></i></button>"
			})
			.then(function(){
				return LJ.ui.getModalItemIds();

			})
			.then(function( item_ids ){

				var d = LJ.static.renderStaticImage('search_loader')
				$(d).addClass('modal__search-loader').hide().appendTo('.modal').velocity('fadeIn', {
					duration: 400
				});

				return LJ.api.requestParticipation({
					before_id : before_id,
					members   : item_ids
				});

			})
			.then(function( exposed ){
				return LJ.ui.hideModal();

			})
			.then(function(){
				LJ.ui.showToast( LJ.text('to_before_request_success') );
			})
			.catch(function(e){
				LJ.wlog(e);
				LJ.before.handleRequestError(e);

			});


        },
        handleRequestError: function( err ){

        	var err_id = err.err_id;
			var err_msg = 'Une erreur s\'est produite';

			if( err_id == "missing_parameter" ){

				LJ.wlog('Missing parameter...!');

			}

			if( err_id == "already_hosting" ){
				
				var profiles = LJ.friends.getFriendsProfiles( err.host_ids );
				var names    = _.map( profiles, 'name' );
				var formatted_names = LJ.renderMultipleNames( names );

				if( err.host_ids.indexOf( LJ.user.facebook_id ) == -1 ){
					err_msg = LJ.text('err_be_create_already_hosting').replace('%names', formatted_names );

				} else {
					err_msg = LJ.text('err_be_create_already_hosting_me');
				}

			}

			LJ.ui.showToast( err_msg ,'error' );
			LJ.ui.hideModal();

        }

	});