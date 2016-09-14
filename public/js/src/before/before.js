
	window.LJ.before = _.merge( window.LJ.before || {}, {

		fetched_befores: [],
		switch_view_duration: 1000,
		render_mode_active : null,
		render_mode_primary: "hive",
		render_mode_secondary: "flat",


		init: function(){
			
			LJ.before.addCreateBefore();
			LJ.before.handleDomEvents();
			LJ.before.handleAppEvents();

			return LJ.before.fetchNearestBefores__UserLocation()
					.then(function(){
						return LJ.before.initCreateBefore();
					});

		},
		handleDomEvents: function(){

			LJ.ui.$body.on('click', '.js-create-before', LJ.before.handleShowCreateBefore );
			LJ.ui.$body.on('click', '.be-create__close', LJ.before.handleHideCreateBefore );
			LJ.ui.$body.on('click', '.be-create.x--ready .be-create__button', LJ.before.handleCreateBefore );
			LJ.ui.$body.on('click', '.be-inview .user-row', LJ.before.handleClickOnUserRow );
			LJ.ui.$body.on('click', '.js-cancel-before', LJ.before.handleCancelBefore );
			LJ.ui.$body.on('click', '.slide.x--before .js-show-options', LJ.before.showBeforeOptions );
			LJ.ui.$body.on('click', '.js-request', LJ.before.handleRequest );
			LJ.ui.$body.on('click', '.js-request-pending', LJ.before.handleClickOnRequestPending );
			LJ.ui.$body.on('click', '.js-request-accepted', LJ.before.handleClickOnRequestAccepted );
			LJ.ui.$body.on('click', '.js-show-profile', LJ.before.handleShowUserProfile );
			LJ.ui.$body.on('click', '.js-switch-mode', LJ.before.handleSwitchInviewMode );
			LJ.ui.$body.on('click', '.js-add-hashtag', LJ.before.handleAddHashtag );

		},
		handleAppEvents: function(){

			LJ.on("login:complete", LJ.before.handleLoginComplete );
			LJ.on("show:slide", LJ.before.handleShowSlide );
			LJ.on("hide:slide", LJ.before.handleHideSlide );

		},
		handleLoginComplete: function(){

			LJ.delay( 250 ).then(function(){
				LJ.before.showCreateBeforeBtn("bounceInQuick");
				LJ.map.refreshCreateBtnState();

			});

		},
		resetBeforeInviewAction: function(){

			var new_top = $('.be-inview').height() - $('.be-action').height() - $('.be-inview').offset().top;
			$('.be-action').css({ 'top': new_top });

		},
		handleShowSlide: function(){
			LJ.before.hideCreateBeforeBtn();

		},
		handleHideSlide: function(){

			if( $('.slide').length == 1 ){
				LJ.before.showCreateBeforeBtn();
			}

		},
		handleAddHashtag: function(){

			var $s = $('.be-create-row.x--hashtags input');
			
			LJ.before.addHashtag();
			$s.val('');
			LJ.before.validateInputs();
			LJ.delay( 100 ).then(function(){
				$s.focus();
			});

		},
		initCreateBefore: function(){

		 	LJ.before.initHostsPicker();
		 	LJ.before.initHashtagsPicker();

		 	return LJ.seek.activatePlacesInCreateBefore()
		 			.then(function(){
					 	LJ.before.initPlacePicker();
					 	return;
		 			});

		},
		handleShowCreateBefore: function(){

			LJ.before.showCreateBefore();
			LJ.before.hideCreateBeforeBtn();

		},
		handleHideCreateBefore: function(){

			LJ.before.hideCreateBefore();
			LJ.before.showCreateBeforeBtn();

		},
		findById: function( before_id ){

			var bfr = _.find( LJ.before.fetched_befores, function( b ){
				return b._id == before_id;
			});

			return bfr;

		},
		findMyGroup: function( before ){

			var g = _.find( before.groups, function( g ){
				return g.members.indexOf( LJ.user.facebook_id ) != -1;
			});

			return g;

		},
		handleClickOnUserRow: function(){

			var facebook_id = $(this).attr('data-facebook-id');
			LJ.profile_user.showUserProfile( facebook_id );

		},
		showCreateBeforeBtn: function( effect ){

			$('.map__icon.x--create-before').velocity( effect || "slideUpIn", { duration: 400, display: 'flex' });

		},
		hideCreateBeforeBtn: function(){

			if( LJ.isMobileMode() ) return;

			$('.map__icon.x--create-before').velocity('slideDownOut', { duration: 400, display: 'none' });

		},
		fetchBefores: function(){

			LJ.log('Fetching befores...');
			return LJ.api.fetchBefores();

		},
		fetchNearestBefores__UserLocation: function( max_distance ){

			var latlng = LJ.user.location;
			return LJ.before.fetchNearestBefores( latlng, max_distance );

		},
		fetchNearestBefores__MapCenter: function( max_distance ){

			var latlng = {
				lat: LJ.meemap.center.lat(),
				lng: LJ.meemap.center.lng()
			};

			return LJ.before.fetchNearestBefores( latlng, max_distance );


		},
		refreshNearestBefores: function( max_distance ){

			LJ.before.fetchNearestBefores__MapCenter( max_distance )
				.then(function( befores ){
					return LJ.before.displayBeforeMarkers( befores );

				});

		},
		fetchNearestBefores: function( latlng, max_distance ){

			max_distance = max_distance || null;

			return LJ.api.fetchNearestBefores( latlng, max_distance )
					.then(function( befores ){
						LJ.before.fetched_befores = befores;
						return befores;

					});

		},
		getMyBefore: function(){

			return _.find( LJ.before.fetched_befores, function( bfr ){
                return bfr.hosts.indexOf( LJ.user.facebook_id ) != -1;
            });

		},
		setPicturesSizes: function( $content ){
			
			var $pictures = $content.find('.be-pictures__pic');
			var n_pics 	  = $pictures.length;

			var left_step = Object.create({
				2: 50, 3: 33.333333, 4: 25 }
			)[ n_pics ];

			var shadolay = Object.create({
				 2: { opacity : 0,   right: 0 },
				 3: { opacity : 0.5, right: 33.33333 },
				 4: { opacity : 1,   right: 50 } 
			})[ n_pics ];

			$pictures.each(function( i, pic ){

				var $p = $( pic );

				$p.css({ 'width'  : '50%' })
				  .css({ 'z-index': i + 1 })
				  .css({ 'left'   : (i * left_step)+'%' })

				$p.find('.be-pictures__shadolay')
				  .css({ 'right'  : shadolay.right+'%' })
				  .css({ 'opacity': shadolay.opacity })

			});


        },
        fetchBeforeAndHosts: function( before_id ){

        	var before_ref;
        	return LJ.api.fetchBefore( before_id )
        			.then(function( before ){
        				before_ref = before;
        				var host_ids = before.hosts;
        				return LJ.api.fetchUsers( host_ids );

        			})
        			.then(function( expose ){
        				expose.before = before_ref;
        				return expose;
        			});

        },
        handleCloseBeforeInview: function(){

        	LJ.map.deactivateMarker();
        	LJ.map.refreshMarkers();

        },
        hideBeforeInview: function(){

        	LJ.ui.hideSlide({ type: 'before' });

        },
        fetchAndShowBeforeInview: function( before_id ){
			
			var before;

        	return LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.before.fetchBeforeAndHosts,
				"promise_arg"   : before_id,

				"complete"      : LJ.before.handleCloseBeforeInview,
				"errHandler"    : LJ.before.handleShowBeforeInviewError

			})
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				before        = expose.before;
				return LJ.before.renderBeforeInview( before, host_profiles );
				
			})
			.then(function( before_html ){
				$container = $('.slide.x--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				LJ.before.refreshBeforeInviewAction();
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( before );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );
				LJ.emit("show_before_inview:complete");		

			});


        },
        handleShowBeforeInviewError: function( err ){

        	if( err.err_id == "ghost_before" ){
        		LJ.before.ghostifyBeforeInview();
        	}

        },
        ghostifyBeforeInview: function(){

        	var duration      = 400;
        	var $before_ghost = $( LJ.before.renderBeforeGhost() );

        	$('.slide.x--before')
        		.find('.slide__loader')
        		.velocity('shradeOut', {
        			duration: duration,
        			complete: function(){
        				$( this ).remove();
        			}
        		});

        	$before_ghost
        		.hide()
        		.appendTo( $('.slide-body') )
        		.velocity('shradeIn', {
        			duration: duration,
        			delay   : duration,
        			display : 'flex'
        		});

        },
        renderBeforeGhost: function(){

        	return LJ.ui.render([

        		'<div class="slide-ghost">',
        			'<div class="slide-ghost__icon x--round-icon">',
        				'<i class="icon icon-search-light"></i>',
        			'</div>',
        			'<div class="slide-ghost__title">',
        				'<span data-lid="be_ghost_title"></span>',
        			'</div>',
        			'<div class="slide-ghost__subtitle">',
        				'<span data-lid="be_ghost_subtitle"></span>',
        			'</div>',
        			'<div class="slide-ghost__action">',
        				'<button data-lid="be_ghost_btn" class="slide__close"></button>',
        			'</div>',
        		'</div>'

        	].join(''));

        },
        showMyBefore: function(){

        	var bfr = _.find( LJ.user.befores, function( bfr ){
        		return bfr.status == "hosting";
        	});

        	before_id = bfr ? bfr.before_id : null;

			LJ.before.fetchAndShowBeforeInview( before_id );       
			LJ.map.activateMarker( before_id ); 	

        },
        showBeforeInview: function( before ){

			var host_ids  = before.hosts;

			var host_profiles;
			var $container;
			var $content;

        	return LJ.ui.showSlideAndFetch({

				"type"			: "before",

				"fetchPromise"	: LJ.api.fetchUsers,
				"promise_arg"   : host_ids,

				"complete"      : LJ.before.handleCloseBeforeInview,
				"errHandler"    : LJ.before.handleShowBeforeInviewError

			}) 
			.then(function( expose ){	
				host_profiles = _.map( expose, 'user' );
				return LJ.before.renderBeforeInview( before, host_profiles );

			})
			.then(function( before_html ){
				$container = $('.slide.x--before').find('.slide-body');
				LJ.before.addBefore( before_html, $container );
				LJ.before.refreshBeforeInviewAction();
				$content = $container.children(':not(.slide__loader)');

			})
			.then(function(){
				return LJ.ui.shradeOut( $container.find('.slide__loader'), LJ.ui.slide_hide_duration );

			})
			.then(function(){
				return LJ.before.processBeforePreDisplay( before );

			})
			.then(function(){
				LJ.ui.shradeIn( $content, LJ.profile_user.slide_show_duration );				
				LJ.emit("show_before_inview:complete");		

			});

            
        },
        processBeforePreDisplay: function( before ){

			var $w        = $('.be-inview[data-before-id="'+ before._id +'"]');
			var main_host = before.main_host;

        	// Dynamically render the size of the pictures to fit, with a shade
        	LJ.before.setPicturesSizes( $w );

        	// Make sure the host is always on top of the list
        	LJ.mainifyUserRow( $w, main_host );

        	// Set the ux preferences
        	LJ.settings.applyUxPreferences();

        	// Prepend and hide the content, so that jsp compute the right height
			$w.css({ 'opacity': 0 }).show();

			LJ.ui.turnToJsp( $w.find('.be-users'), {
				jsp_id: 'before_inview'
			});

			LJ.before.resetBeforeInviewAction();
			$('.slide').on('scroll',  _.throttle( LJ.before.resetBeforeInviewAction, 180 ) );

			// Little delay to give Jsp the time to act
			return LJ.delay( 100 )

        },
        addBefore: function( before_html, $container ){
        	return $container.append( before_html );

        },
        renderCreateBefore: function(){

            return LJ.ui.render([
                '<div class="map__icon x--round-icon x--create-before js-create-before">',
                    '<i class="icon icon-plus"></i>',
                '</div>'
                ].join(''));

        },
		renderBeforePictures: function( hosts ){

			var be_pictures = [];
			hosts.forEach(function( h ){

				var img_medium = LJ.pictures.makeImgHtml( h.img_id, h.img_vs, "user-before" );
				be_pictures.push([
					'<div class="be-pictures__pic js-filterlay">',
						'<div class="be-pictures__shadolay"></div>',
						img_medium,
					'</div>'
				].join(''));

			});

			return LJ.ui.render( be_pictures.join('') );

		},
		renderBeforeAddress: function( address ){
			return address.place_name;

		},
		renderBeforeInview: function( before, host_profiles ){

			LJ.before.active_before  = before;
			LJ.before.active_hosts   = host_profiles;

			LJ.before.render_mode_active = LJ.before.render_mode_primary;
			var renderFn = LJ.before.getRenderFn( LJ.before.render_mode_primary );

			return renderFn( before, host_profiles );

		},
		getBeforeInview: function( before_id ){

			return $('.be-inview');

		},	
		updateBeforeInview: function( opts ){

			opts = opts || {};

			if( opts.option_html ){
				LJ.before.getBeforeInview().find('.be-options').prepend( LJ.ui.render([opts.option_html]) );
			}

			if( opts.action_html ){
				LJ.before.getBeforeInview().find('.be-action').html( LJ.ui.render([opts.action_html]) );
			}

		},
		refreshBeforeInviewAction: function(){

			var update = {};
			var before = LJ.before.active_before;

			if( !before ){
				return LJ.log("Cannot refresh before inview action, no active before is set");
			}

			if( before.hosts.indexOf( LJ.user.facebook_id ) != -1 ){
        		// update.option_html = '<div class="be-options__option x--settings x--round-icon js-show-options"><i class="icon icon-cog-empty"></i></div>';

        		// var n_cheers = _.filter( LJ.cheers.fetched_cheers, function( ch ){
        		// 	return ch.before_id == before._id;
        		// }).length;

        		// var text = n_cheers == 0 ? LJ.text('be_check_cheers_zero') : LJ.text("be_check_cheers").replace('%n',n_cheers );
        		update.action_html = '<button class="check-cheers js-show-options"><i class="icon icon-cog-empty"></i></button>';

        	} else {
        		var my_before = _.find( LJ.user.befores, function( bfr ){
        			return bfr.before_id == before._id;
        		});

        		if( !my_before ){
        			update.action_html = '<button class="x--round-icon js-request"><i class="icon icon-meedrink"></i></button>';
        			
        		} else {
        			if( my_before.status == "pending" ){
        				update.action_html = '<button class="x--round-icon x--pending js-request-pending"><i class="icon icon-pending"></i></button>';

        			} else {
        				update.action_html = '<button class="x--round-icon x--accepted js-request-accepted"><i class="icon icon-chat-bubble-duo"></i></button>';

        			}
        		}

        	}

        	LJ.before.updateBeforeInview( update );

		},	
		getRenderFn: function( mode ){

			var mode = mode || LJ.before.render_mode_active || LJ.before.render_mode_primary;

			if( mode == "hive" ){
				return LJ.before.renderBeforeInviewHive;
			}

			if( mode == "flat" ){
				return LJ.before.renderBeforeInviewFlat;
			}

			if( mode == "rows" ){
				return LJ.before.renderBeforeInviewRows;
			}

		},	
		switchBeforeInview: function( mode ){

			var renderFn = LJ.before.getRenderFn( mode );
		
			$( renderFn( LJ.before.active_before, LJ.before.active_hosts ) )
				.css({ 'display': 'flex' })
				.replaceAll('.be-inview');

			LJ.before.refreshBeforeInviewAction();
			LJ.before.resetBeforeInviewAction();
			$('.slide').on('scroll',  _.throttle( LJ.before.resetBeforeInviewAction, 180 ) );


		},
		renderBeforeInviewHive: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}
		
			var usernames   = LJ.renderMultipleNames( _.map( hosts, 'name') );
			var be_addr     = LJ.text("w_before").capitalize() + ' ' + LJ.before.renderBeforeAddress( before.address );

			var be_pictures = LJ.pictures.makeHiveHtml( hosts, "user-before",{
				class_names : [ "js-show-profile" ],
				attach_data : [ "facebook_id" ]
			});

			var be_hashtags = _.map( before.hashtags, function( hash, i ){
				return [
					'<div class="be-inview__hashtag x--'+ LJ.randomInt( 1, 8 ) +'">',
						'<span class="hash"><i class="icon icon-hashtag"></i></span>',
						'<span class="value">'+ LJ.hashtagify( hash ) +'</span>',
					'</div>'
				].join('');
			}).join('')
 
			return LJ.ui.render([

				'<div class="be-inview x--hive" data-before-id="'+ before._id +'">',
					'<div class="be-content">',
						'<div class="be-usernames">',
							'<span>'+ usernames +'</span>',
						'</div>',
				        '<div class="be-inview-address">',
				          '<div class="be-inview-address__address">',
				          	'<div class="be-inview-address__icon x--round-icon">',
				          		'<i class="icon icon-location-empty"></i>',
				          	'</div>',
				            '<span>'+ be_addr +'</span>',
				          '</div>',
				        '</div>',
				        '<div class="be-inview-hashtags">',
				        	be_hashtags,
				        '</div>',
			            '<div class="be-options">',
			              '<div class="be-options__option x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
			            '</div>',
				      	'<div class="be-pictures">',
				           be_pictures,
				        '</div>',
					'</div>',
			        '<div class="be-action">',
			        '</div>',
		      	'</div>'

			].join(''));

		},
		renderUserFlat: function( user ){

			var n = user.name;
			var a = user.age;
			var i = user.facebook_id;
			var c = user.cc;
			var g = user.g;
			var j = user.job;

			var img_html = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, 'user-flat');

			return LJ.ui.render([

				'<div class="user-flat" data-facebook-id="'+ i +'">',
		            '<div class="flat-user__pic js-show-profile js-filterlay">',
		            	img_html,
		            '</div>',
		           '<div class="flat-user-body">',
		               '<div class="flat-user__h1">',
		            	  '<span class="flat-user__gender user-gender js-user-gender x--'+ g +'"></span>',
		                  '<span class="flat-user__name">'+ n +'</span>',
			              '<span class="flat-user__country js-user-country"><i class="flag-icon flag-icon-'+ c +'"></i></span>',
			              '<span class="user-online js-user-online" data-facebook-id="'+ i +'"></span>',
		               '</div>',
		               '<div class="flat-user__h2">',
		                  '<span class="flat-user__age age">'+ a +'</span>',
	                  	  '<span class="comma">-</span>',
	               		  '<span class="flat-user__job">'+ j +'</span>',
		               '</div>',
		           '</div>',
		            '<div class="flat-user-actions">',
		            '</div>',
	          '</div>'

			]);

		},
		renderBeforeInviewFlat: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}
			
			var flat_users = [ '<div class="flat-users">' ];
			hosts.forEach(function( h ){
				flat_users.push( LJ.before.renderUserFlat( h ) );
			});
			flat_users.push( '</div>' );
 
			return LJ.ui.render([

				'<div class="be-inview x--flat" data-before-id="'+ before._id +'">',
					'<div class="be-options">',
			          	'<div class="be-options__option x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
			        '</div>',
					flat_users.join(''),
					'<div class="be-action">',
					'</div>',
		      	'</div>'

			]);

		},
		renderBeforeInviewRows: function( before, hosts, options ){

			options = options || [];

			if( !before || !hosts ){
				return LJ.wlog('Cannot render before without before object and hosts profiles');
			}

			var be_pictures = LJ.before.renderBeforePictures( hosts );
			var user_rows   = LJ.renderUserRows( hosts );

			var be_addr = LJ.before.renderBeforeAddress( before.address );
 
			return LJ.ui.render([

				'<div class="be-inview" data-before-id="'+ before._id +'">',
					'<div class="be-content">',
				      	'<div class="be-pictures">',
				          '<div class="be-options">',
				          	'<div class="be-options__option x--switch x--round-icon js-switch-mode"><i class="icon icon-switch-empty"></i></div>',
				          '</div>',
				          be_pictures,
				        '</div>',
				        '<div class="be-inview-address">',
				          '<div class="be-inview-address__address">',
				            '<span>'+ be_addr +'</span>',
				          '</div>',
				        '</div>',
				        '<div class="be-users">',
				        	user_rows,
				        '</div>',
					'</div>',
			        '<div class="be-action">',
			        '</div>',
		      	'</div>'

			]);

		},
		handleCancelBefore: function(){

			var $s = $( this );

			var before_id  = $s.closest('.slide').find('[data-before-id]').attr('data-before-id');
			var new_status = "canceled";

			LJ.ui.showLoader("canceling_before");

			LJ.api.changeBeforeStatus( before_id, new_status )
				.then(function( before ){
					LJ.log("Before canceled success, waiting for push response...");
				})
				.catch(function( err ){
					LJ.wlog(err);

				});

		},
		removeFetchedBefore: function( before_id ){

			_.remove( LJ.before.fetched_befores, function( bfr ){
				return bfr._id == before_id;
			});

		},
		removeBeforeItem: function( before_id ){

			_.remove( LJ.user.befores, function( bfr ){
				return bfr.before_id == before_id;
			});

		},
		removeChannelItemBefore: function( before_id ){

			_.remove( LJ.user.channels, function( chan ){
				return chan.before_id == before_id;
			});

		},
		renderBeforeOptions: function(){

			return LJ.ui.render([

				'<div class="ioptions__actions">',
					'<div class="ioptions__action-message">',
						'<span data-lid="slide_overlay_before_message"></span>',
					'</div>',
					'<div class="ioptions__action x--cancel js-cancel-before">',
						'<span data-lid="slide_overlay_before_cancel"></span>',
					'</div>',
					'<div class="ioptions__action x--back js-ioptions-close">',
						'<span data-lid="slide_overlay_back"></span>',
					'</div>',
				'</div>'

				].join(''));

		},
		showBeforeOptions: function(){

			var $wrap = $('.slide.x--before');

			if( $wrap.length != 1 ){
				return LJ.wlog('Cannot uniquely identify the wrapper');
			}

			LJ.ui.showSlideOverlay( LJ.before.renderBeforeOptions() );

		},
		showChatOptions: function(){

			var duration = LJ.ui.show_slide_duration;

			$('.chat-inview-options').velocity('fadeIn', {
				display : 'flex',
				duration: duration
			});

			$( LJ.chat.renderChatOptions() )
				.hide()
				.appendTo( $('.chat-inview-options') )
				.velocity('shradeIn', {
					duration: duration,
					display: 'flex',
					delay: duration/2,
					complete: function(){
						$( this ).find('.js-close-overlay')
							   .on('click', LJ.ui.hideSlideOverlay );
					}
				});

		},
		getBefore: function( before_id ){
			return LJ.promise(function( resolve, reject ){

				var before = _.find( LJ.before.fetched_befores, function( bfr ){
					return bfr._id == before_id;
				});

				if( before ){
					resolve( before );
				} else {
					return LJ.api.fetchBefore( before_id )
						.then(function( before ){
							LJ.before.fetched_befores.push( before );
							resolve( before );
						})
						.catch(function( err ){
							reject( err );
						});
				}

			});
		},
		getBeforeItem: function( before_id ){

			return _.find( LJ.user.befores, function( bfr ){
				return bfr.before_id == before_id;
			});

		},
		updateBeforeItem: function( before_id, opts ){

			var before_item  = LJ.before.getBeforeItem( before_id );
			
			before_item	     = _.merge( before_item, opts );

		},
		getChannelItem( before_id ){

			return _.find( LJ.user.channels, function( chan ){
				return chan.before_id == before_id;
			});
		},
		cancelifyBeforeInview: function(){

			LJ.ui.cancelify({

				"$wrap"        : $('.slide.x--before'),
				"duration"     : 8000,
				"message_html" : "<span>" + LJ.text("before_just_canceled") + "</span>",
				"callback"     : function(){
					LJ.ui.hideSlide({ type: 'before' });
					LJ.before.showCreateBeforeBtn();
				}

			});

		},
		handleSwitchInviewMode: function(){

			LJ.before.render_mode_active = ( LJ.before.render_mode_active == LJ.before.render_mode_primary ) ?
										     LJ.before.render_mode_secondary : 
										     LJ.before.render_mode_primary;
						
			LJ.before.switchBeforeInview( LJ.before.render_mode_active );

		},
		handleShowUserProfile: function(){

			var $s = $( this );
			var facebook_id = $s.closest('[data-facebook-id]').attr('data-facebook-id');

			LJ.profile_user.showUserProfile( facebook_id );


		},
		addBeforeItem: function( before_item ){

			LJ.user.befores.push( before_item );

		}

	});