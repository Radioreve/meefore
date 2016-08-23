
	window.LJ.before = _.merge( window.LJ.before || {}, {

		initHostsPicker: function(){

			LJ.before.handleDomEvents__HostsPicker();

		},
		initPlacePicker: function(){

			LJ.before.handleDomEvents__PlacePicker();

		},
		initHashtagsPicker: function(){

			LJ.before.handleDomEvents__HashtagsPicker();

		},
		handleDomEvents__PlacePicker: function(){

			LJ.seek.be_create.addListener('place_changed', function(){

				var place = LJ.seek.be_create.getPlace();

				var place_id    = place.place_id;
				var place_name  = place.formatted_address;
				var lat 		= place.geometry.location.lat();
				var lng 		= place.geometry.location.lng();

				$('.be-create-row.x--location')
					.attr('data-place-id', place_id )
					.attr('data-place-name', place_name )
					.attr('data-lat', lat )
					.attr('data-lng', lng );

				$('.be-create-row.x--location').removeClass('x--unset');
				LJ.before.validateInputs();

			});

		},
		handleDomEvents__HostsPicker: function(){

			LJ.ui.$body.on('click', '.be-create-row.x--hosts', function(){

				LJ.ui.showModal({
					"type"      	: "be-create",
					"title"			: LJ.text('modal_be_create_title'),
					"subtitle"		: LJ.text('modal_be_create_subtitle'),
					"body"  		: LJ.friends.renderFriendsInModal(),
					"footer" 		: "<button class='x--bombed'>"+ LJ.text("modal_create_btn") +"</button>",
					"search_input"	: true,
					"max_items"     : (LJ.app_settings.app.max_hosts - 1),
					"min_items"     : LJ.app_settings.app.min_group,
					"jsp_body" 	    : true

				})
				.then(function(){
					LJ.ui.refreshModalState();
					return LJ.ui.getModalItemIds();

				})
				.then(function( facebook_ids ){
					LJ.before.addHostToInput( facebook_ids );
					LJ.before.refreshMedalImage( facebook_ids );
					LJ.before.validateInputs();
					return LJ.before.addHostsNames( facebook_ids );

				})
				.then(function(){
					return LJ.ui.hideModal();
				})
				.catch(function( e ){
					LJ.wlog(e);
					LJ.wlog('User has stopped selecting people');
				});

			});


		},
		refreshMedalImage: function( facebook_ids ){

			facebook_ids = facebook_ids || [];

			var users = [{
				img_id: LJ.findMainPic( LJ.user ).img_id,
				img_vs: LJ.findMainPic( LJ.user ).img_version
			}];

			var friends = _.filter( LJ.friends.fetched_friends, function( f ){
				return facebook_ids.indexOf( f.facebook_id ) != -1;
			});

			friends.forEach(function( f ){
				users.push({
					img_id: LJ.findMainPic( f ).img_id,
					img_vs: LJ.findMainPic( f ).img_version
				});
			});

			$('.medal-img').html( LJ.pictures.makeRosaceHtml( users, "user-medal" ) );

		},
		handleDomEvents__HashtagsPicker: function(){

			LJ.ui.$body.on('keydown', '.be-create-row.x--hashtags input', function( e ){

				var $s = $( this );
				var kc = LJ.getKeyname( e.keyCode || e.which );

				if( kc == "enter" || kc == "tab" ){
					LJ.before.handleAddHashtag();
				}

			});

		},
		addHashtag: function(){

			var n_hashes = $('.be-create__hashtag').length;

			if( n_hashes == LJ.app_settings.app.max_hashtags ){
				return;
			}

			var text = $('.be-create-row.x--hashtags input').val();

			$( LJ.before.renderHashtag( text ) )
				.hide()
				.appendTo('.be-create__hashtags')
				.velocity('bounceInQuick', {
					duration : 400,
					display  : 'flex'
				})
				.on('click', function(){
					$( this ).remove();
					LJ.before.validateInputs();
				});

		},
		renderHashtag: function( text ){

			return LJ.ui.render([

				'<div class="be-create__hashtag js-be-hashtag" data-rawvalue="'+ text +'">',
					'<span class="hash x--round-icon"><i class="icon icon-hashtag"></i></span>',
					'<span class="value">'+ LJ.hashtagify( text ) +'</span>',
				'</div>'

			]);

		},
		addHostToInput: function( hosts_facebook_id ){

			hosts_facebook_id = Array.isArray( hosts_facebook_id ) ? hosts_facebook_id : [ hosts_facebook_id ];

			$('.be-create-row.x--hosts')
				.attr('data-host-ids', hosts_facebook_id.join(',') );
				

		},
		addHostsNames: function( hosts_facebook_id ){

			var profiles = LJ.friends.getFriendsProfiles( hosts_facebook_id );
			// names = LJ.renderMultipleNames( _.concat( _.map( profiles, 'name' ), LJ.user.name ), {
			// 	lastify_user: LJ.user.name
			// });

			names = LJ.renderMultipleNames( _.concat( _.map( profiles, 'name' ), LJ.user.name ) );

			return $('.be-create-row.x--hosts').find('input').val( names );


		},
		validateInputs: function(){

			var $hashrow = $('.be-create-row.x--hashtags');
			var n_hashes = $('.be-create__hashtag').length;

			n_hashes == 0 ?
				$hashrow.addClass('x--unset') :
				$hashrow.removeClass('x--unset');

			n_hashes == LJ.app_settings.app.max_hashtags ?
				$hashrow.addClass('x--disabled').find('input').attr('readonly', true).attr('placeholder', LJ.app_settings.app.max_hashtags + ' hashtags maximum') :
				$hashrow.removeClass('x--disabled').find('input').attr('readonly', false).attr('placeholder', LJ.text('be_create_hashtags_placeholder') );


			var n_unset = $('.be-create-row.x--unset').length;
			if( n_unset == 0){
				$('.be-create').addClass('x--ready');
			} else {
				$('.be-create').removeClass('x--ready');
			}


		},
		showCreateBefore: function(){

			var $i = $('.map__icon.x--create-before');
			var $w = $('.be-create');
			var d  = LJ.search.filters_duration || 300;

			LJ.before.clearCreateBefore();
			LJ.before.addHostsNames([]);
			// LJ.ui.adjustWrapperHeight( $('.be-create') );

			if( LJ.isMobileMode() ){
				LJ.ui.deactivateHtmlScroll();
			}

			$i.velocity('shradeOut', {
				duration : d,
				display  : 'none'
			});

			LJ.delay( d )
				.then(function(){
					LJ.before.validateInputs();
					LJ.before.refreshMedalImage();
					return LJ.ui.shradeIn( $w, d );
				});


		},
		hideCreateBefore: function(){

			var $i  = $('.map__icon.x--create-before');
			var $w  = $('.be-create');
			var d   = LJ.search.filters_duration;

			$w.velocity('shradeOut', {
				duration : d,
				display  : 'none'
			});

			LJ.delay( d )
				.then(function(){
					LJ.ui.activateHtmlScroll();
					return LJ.ui.shradeIn( $i, d );
				});

		},
		hideCreateBeforeStraight: function(){

			var $i  = $('.map__icon.x--create-before');
			var $w  = $('.be-create');
			var d   = LJ.search.filters_duration;

			$w.hide();
			$i.css({ 'display': 'flex', 'opacity': 1 });


		},
		clearCreateBefore: function(){

			$('.be-create__loader').remove();
			$('.be-create').removeClass('x--pending').removeClass('x--ready');
			$('.be-create-row.x--hosts').find('input').val('');
			$('.be-create-row.x--location').addClass('x--unset').find('input').val('');
			$('.be-create-row.x--hashtags').addClass('x--unset').find('input').val('');
			$('.be-create-row.x--hashtags').find('.js-be-hashtag').remove();

		},
		readCreateAttributes: function(){

			var req = {};

			req.hosts_facebook_id = $('.be-create-row.x--hosts').attr('data-host-ids').split(',');
			req.hosts_facebook_id.push( LJ.user.facebook_id );

			// Filter out empty strings in case host is hosting alone 
			req.hosts_facebook_id = req.hosts_facebook_id.filter( Boolean );

			// Important! Timezone is only known by the client and used to uniquely identify his..
			// well, timezone, when updating multiple events every hours on the scheduler
			req.timezone = moment().utcOffset();

			req.address = {

				place_id   : $('.be-create-row.x--location').attr('data-place-id'),
				place_name : $('.be-create-row.x--location').attr('data-place-name'),
				lat 	   : $('.be-create-row.x--location').attr('data-lat'),
				lng 	   : $('.be-create-row.x--location').attr('data-lng')

			};

			req.hashtags = [];
			$('.js-be-hashtag').each(function( i, hashtag ){
				req.hashtags.push( LJ.hashtagify( $( hashtag ).attr('data-rawvalue') ) );
			});

			return req;

		},
		readAndCreateBefore: function(){

			var req = LJ.before.readCreateAttributes();

			if( !(req.hosts_facebook_id && req.timezone && req.address ) ){
				return LJ.wlog('Missing parameter in the req object : ' + JSON.stringify( req, null, 4 ));
			}

			return LJ.api.createBefore( req );


		},
		showCreateBeforeOverlay: function(){

			$('<div class="loader__overlay"></div>')
				.hide()
				.appendTo( $('.be-create') )
				.velocity('fadeIn', {
					duration: 500
				});

		},
		hideCreateBeforeOverlay: function(){

			$('.be-create')
				.find('.loader__overlay')
				.remove();

		},
		showCreateBeforeLoader: function(){

			$( LJ.static.renderStaticImage('be_create_loader') )
				.hide()
				.appendTo('.be-create')
				.show();

		},
		hideCreateBeforeLoader: function(){

			$('.be-create')
				.find('.be-create__loader')
				.remove();

		},
		pendifyCreateBefore: function(){

			$('.be-create').addClass('x--pending');
			LJ.before.showCreateBeforeOverlay();
			LJ.before.showCreateBeforeLoader();
			
			return;

		},
		dependifyCreateBefore: function(){

			$('.be-create').removeClass('x--pending');
			LJ.before.hideCreateBeforeLoader();
			LJ.before.hideCreateBeforeOverlay();

			return;

		},
		endCreateBefore: function( expose ){
			
			// Friendly loggin
			var before      = expose.before;
			var before_item = expose.before_item;

			// Ui update
			LJ.before.hideCreateBefore();
			LJ.delay( 1000 ).then(function(){

				LJ.before.dependifyCreateBefore();

			});

		},	
		handleCreateBefore: function(){

			LJ.log('Handling create before...');

			var ux_done    = LJ.before.pendifyCreateBefore();
			var be_created = LJ.before.readAndCreateBefore();

			LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
				var expose = res[ 0 ];

				return LJ.before.endCreateBefore( expose );

			})
			.catch(function( e ){
				LJ.before.handleCreateBeforeError(e);

			});

		},
		handleCreateBeforeError: function( err ){
			
			if( !err ){
				return LJ.wlog('Something went wrong, but no err object was provided');
			}

			var err_id = err.err_id;
			var err_msg = '';

			if( err_id == "missing_parameter" ){

				if( err.parameter == "hosts_facebook_id" ){
					err_msg = LJ.text('err_be_create_missing_hosts');

				}
				if( err.parameter == "begins_at" ){
					err_msg = LJ.text('err_be_create_missing_date');

				}
				if( err.parameter == "address" ){
					err_msg = LJ.text('err_be_create_missing_location');

				}
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
			LJ.before.dependifyCreateBefore();

		},
		addCreateBefore: function(){

			$( LJ.before.renderCreateBefore() ).hide().appendTo('body');

		},
		renderCreateBefore: function(){

			var img_id = LJ.findMainPic( LJ.user ).img_id;
			var img_vs = LJ.findMainPic( LJ.user ).img_version;

			var medal_html = [
				'<div class="medal x--'+ LJ.user.gender +'">',
					'<div class="medal-img">',
						// LJ.pictures.makeImgHtml( img_id, img_vs, "user-medal" ),
					'</div>',
					'<div class="medal-status x--hosting x--round-icon">',
						'<i class="icon icon-star"></i>',
					'</div>',
				'</div>'
			].join('');

			return LJ.ui.render([

				'<div class="be-create">',
			        '<div class="be-create__close">',
			          '<div class="icon icon-cross-fat"></div>',
			        '</div>',
			        '<div class="be-create__image x--round-icon">',
			        	medal_html,
			        '</div>',
			        '<div class="be-create__title">',
			          '<h1 data-lid="be_create_title"></h1>',
			        '</div>',
			        '<div class="be-create-row__subtitle">',
			          '<h2 data-lid="be_create_subtitle_hosts"></h2>',
			        '</div>',
			        '<div class="be-create-row x--hosts" data-host-ids="">',
			          '<div class="be-create__icon x--round-icon"><i class="icon icon-star-empty"></i></div>',
			          '<div class="be-create-row__input">',
			            '<input readonly data-lid="be_create_hosts_placeholder"/>',
			          '</div>',
			          // '<div class="be-create-row__explanations">',
			          //   '<div data-lid="be_create_hosts_explanations"></div>',
			          // '</div>',
			          '<div class="js-create-host-selected">',
			            // Will be used to know where append the selected users 
			          '</div>',
			        '</div>',
			        '<div class="be-create-row__subtitle">',
			          '<h2 data-lid="be_create_subtitle_before"></h2>',
			        '</div>',
			        '<div class="be-create-row x--location x--unset">',
			          '<div class="be-create__icon x--round-icon"><i class="icon icon-location-empty"></i></div>',
			          '<div class="be-create-row__input">',
			            '<input data-lid="be_create_location_placeholder" />',
			          '</div>',
			          '<div class="be-create-row__explanations">',
			            '<div data-lid="be_create_before_explanations"></div>',
			          '</div>',
			        '</div>',
			        '<div class="be-create-row__subtitle">',
			          '<h2 data-lid="be_create_subtitle_hashtags"></h2>',
			        '</div>',
			        '<div class="be-create-row x--hashtags x--unset">',
			          '<div class="be-create__icon x--round-icon"><i class="icon icon-hashtag-empty"></i></div>',
			          '<div class="be-create-row__input">',
			            '<input maxlength="15" data-lid="be_create_hashtags_placeholder" />',
			            '<div class="js-add-hashtag x--meedient x--round-icon x--mb">',
			            	'<i class="icon icon-plus"></i>',
			            '</div>',
			          '</div>',
			          '<div class="be-create__hashtags">',

			          '</div>',
			          // '<div class="be-create-row__explanations">',
			          //   '<div data-lid="be_create_hashtags_explanations"></div>',
			          // '</div>',
			        '</div>',
			        '<div class="be-create__button">',
			          '<button class="x--meedient" data-lid="be_create_button"></button>',
			        '</div>',
		      '</div>'

			].join(''));
		}



	});