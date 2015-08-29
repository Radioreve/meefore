
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		fetchMe: function(){

			LJ.fn.api('get','me', { 
				beforeSend: function(req){ 
					req.setRequestHeader('x-access-token', LJ.accessToken );
				}
			}, function( err, me ){

				if( err )
					return console.error('Couldnt refresh profile state : ' + err );

				LJ.user = me;

			});

		},
		getMaxWidthLabel: function(container){

			var labels = $(container).find('label');
			var widthArray = [];

			labels.each( function( i, el ){
				widthArray.push( $(el).innerWidth() );
			});

			var max = Math.max.apply( null, widthArray );
			//console.log('Maximum label width : ' + max );
			return max;
		},
		adjustAllChatPanes: function(){

			setTimeout(function(){

				_.keys( LJ.jsp_api ).forEach(function( key ){
					LJ.jsp_api[ key ].users.reinitialise();
					LJ.jsp_api[ key ].chats.reinitialise();
					LJ.jsp_api[ key ].chats.scrollToBottom();
				});
			}, 50 );

		},
		adjustAllInputsWidth: function(container){

			var $container = $(container);
			var max = LJ.fn.getMaxWidthLabel( container );

			$container.find('label').each( function( i, label ){

				var $label = $(label);
				var $inp = $label.siblings('*:not(.inspire, .etiquette, [type="number"])');

				var label_width = max;
				var label_full_width = $label.outerWidth(true);
				var parent_width = $label.parent().width();

				$label.css({ width: label_width });
				$inp.css({ width: parent_width - label_full_width - 50 }); /* Mega hack, security margin */
				$inp.children('input').css({ width:'100%' });
			});
			
		},
		shortenString: function( options ){ //useless

			var options = options || {};

			if( !options.str && typeof( options.str ) != 'string' )
				return console.log('Invalid input for shorten string fn');

			var str      = options.str,
				end_tpl  = options.end_tpl || '';
				max_char = options.max_char || 5;

			return str.substr( 0, max_char ) + end_tpl;
		},
		removeItemToInput: function( item ){

			var $self = $( item );
			var $input  = $self.siblings('input');

			$input.css({ width: $input.outerWidth() + $self.outerWidth(true) });

			var $sug = $self.parents('.row-input').find('.search-results-autocomplete');
			if( $sug.length != 0 ){
				delog('Sug found');
				var current_offset = parseInt( $sug.css('left').split('px')[0] );
				$sug.css({ left: current_offset + $self.outerWidth(true) });
			}

			$self.remove();
			

		},
		addItemToInput: function( options  ){

			var options = options || {};

			if( !options.html || typeof( options.html ) != 'string' )
				return console.log('Invalid html for prepend item fn');

			var $input = $(options.inp);
			var $html = $(options.html);

			// fucking important!
			$input.removeClass('autocompleted');

			$html.hide().insertBefore( $input );
			options.class_names && $html.addClass( options.class_names );

			var item_id = $html.attr('data-id');
			if( $('.rem-click[data-id="'+item_id+'"]').length > 1 ){
				//console.log('Removing due to same id');
				return $html.remove();
			}

			if( $html.siblings('.rem-click').length > options.max - 1){
				//console.log('Removing due to overflow');
				return $html.remove();
			}

			console.log( $html.outerWidth(true) );
			$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
			$html.show();

			/* If there are images to render, little smooth ux */
			if( $html.find('img').length != 0 ){
				$html.waitForImages(function(){
					$html.find('.friend-img').show()
					.end().find('.friend-loader').remove();
				});
			}

			/* Pour que les suggestions ne se décallent pas vers la droite */
			if( options.suggestions ){
				var $sug = $( options.suggestions );
				var current_offset = parseInt( $sug.css('left').split('px')[0] );
				$sug.css({ left: current_offset - $html.outerWidth(true) });
			}
		},
		findPlaceAttributes: function( place ){

			var compo = place.address_components,
                locality = '',
                place_name = '';

                compo.forEach(function( el ){

                    if( el.types && el.types.indexOf('neighborhood') != -1 )
                        place_name = el.long_name;

                    if( el.types && el.types.indexOf('route') != -1 )
                        place_name = el.long_name;

                    if( el.types && el.types.indexOf('locality') != -1 )
                        locality = el.long_name;

                });

            if( place_name === '' )
              place_name = place.name;

            if( locality === '' )
              locality = 'Earth';

          return {
          	place_id: place.place_id,
          	place_name: place_name,
          	city: locality,
          	lat: place.geometry.location.G,
          	lng: place.geometry.location.K
          };

		},
		addBeforePlaceToInput: function( place ){

			var $input = $('#cr-before-place'),
				place = place;

			$input.val('');
			$input.hide();

			if( $('.before-place').length != 0 )
				LJ.fn.removeBeforePlaceToInput();

			var $html = $( LJ.fn.renderBeforePlaceInCreate( place ) );			
				$html.hide().insertBefore( $input );
				$html.show();

		},
		removeBeforePlaceToInput: function( str ){

			var $input = $('#cr-before-place'),
				$place  = $('.before-place');

			$('.before-place').remove();
			$input.show();

		},
		addDateToInput: function( date_str ){

			var $input = $('#cr-date'),
				date = moment( date_str, 'DD/MM/YY' );
			
			$input.val('');
			
			if( $('.date').length != 0 ) 
				LJ.fn.removeDateToInput();

			var msg = date.day() == moment().day() ? "Tout à l'heure !" : "Une belle journée ";
			$input.attr('placeholder', msg );
			
			var $html = $( LJ.fn.renderDateInCreate( date_str ) );
				$html.hide().insertBefore( $input );
				$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
				$html.show();

			LJ.pikaday.hide();

		},
		hashtagify: function( str ){
			
			var hashtag_parts = [];
				str.trim().split(/[\s_-]/).forEach(function( el, i ){
					if( i == 0 ){
						hashtag_parts.push( el );
					} else {
						if( el != '') {
							var elm = el[0].toUpperCase() + el.substring(1);
							hashtag_parts.push( elm );
						}
					}
				});
				return hashtag_parts.join('');

		},
		findMainImage: function( user ){

			var user = user || LJ.user ;
			var index = _.findIndex( user.pictures, function( el ){
				return el.is_main == true;
			});

			return user.pictures[ index ];

		},
		removeDateToInput: function( str ){

			var $input = $('#cr-date'),
				$date  = $('.date');

			$input.css({ width: $input.outerWidth() + $date.outerWidth(true) })
			$('.date').remove();
			str && $input.val('').attr('placeholder', str);

		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		randomInt: function(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		},
		/*sayfn*/
        say: function( eventName, data, cb ){

        	var url = '/' + eventName;

        	$.ajax({
        		method:'POST',
        		url:url,
        		dataType:'json',
        		data: data,
        		beforeSend: function(req){
        			req.setRequestHeader('x-access-token', LJ.accessToken );
        			if( typeof( cb.beforeSend ) == 'function' ){
        				cb.beforeSend(); 
        			} else { LJ.fn.showLoaders(); }
        		},
        		success: function( data ){
        			if( typeof( cb.success ) == 'function' ) cb.success( data );
        		},
        		error: function( data ){
        			if( typeof( cb.error ) == 'function' ) return cb.error( data );
        			/* Default response to any HTTP error */
        			LJ.fn.handleServerError( JSON.parse( data.responseText ).msg );
        		}
        	});


        },
        handleSuccessDefault: function( data ){
        	delog('Success!');
        },
        handleErrorDefault: function( data ){
        	delog('Error!');
        },
        		GraphAPI: function( url, callback, opts ){

			var ls = window.localStorage;

			var access_token = ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.long_lived ) 
							|| ( ls.preferences && JSON.parse( ls.preferences ).long_lived_tk );
			FB.api( url, { access_token: access_token }, callback );

		},
		iHost: function( evt ){

			if( !evt )
				return console.error('Cant host an event that doesnt exist!');

			return _.pluck( evt.hosts, 'facebook_id' ).indexOf( LJ.user.facebook_id ) != -1 ;

		},
		iGroup: function( group ){

			if( !group )
				return console.error('Cant belong to a group that doesnt exist!');

			return group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1;
		},
		api: function( method, url, options, callback ){

			if( !callback && typeof(options) == 'function' ){
				callback = options;
				options = {};
			};

			var call_started = new Date();

			var data = _.merge( options.data || {}, { 
				socket_id   : LJ.pusher.connection.socket_id,
				facebook_id : LJ.user.facebook_id,
				token       : LJ.accessToken
			});

			$.ajax({
				method: method,
				url: '/api/v' + LJ.settings.api_version + '/' + url,
				data: data,
				beforeSend: options.beforeSend,
				success: function( data ){
					setTimeout(function(){
						callback( null, data );
					}, LJ.ui.minimum_loading_time*2 - ( new Date() - call_started ) );
				},
				error: function( xhr ){
					setTimeout(function(){
						callback( xhr, null );
					}, LJ.ui.minimum_loading_time*2 - ( new Date() - call_started ) );
				},
				complete: function(){
					setTimeout(function(){
						LJ.fn.defaultApiCompleteCallback();
					}, LJ.ui.minimum_loading_time*2 - ( new Date() - call_started ) );
				}
			})

		},
		defaultApiCompleteCallback: function(){

			// console.log('api call completed');
		},
		handleServerSuccess: function( msg, selector ){

        	setTimeout( function(){ 

		        if( msg )
		        	LJ.fn.toastMsg( msg, 'info');

		        var $container = $(selector);
		        $container.find('.selected').removeClass('selected')
				$container.find('.modified').removeClass('modified').addClass('selected')
				$container.find('.validating').removeClass('validating')
				$container.find('.validating-btn').removeClass('validating-btn')
				$container.find('.asking').removeClass('asking')
				$container.find('.pending').removeClass('pending');

        	}, LJ.ui.artificialDelay );

        },
        handleServerError: function( msg, ms ){

        	if( typeof(msg) != 'string' )
        		msg = JSON.parse( msg.responseText ).msg;

        	if( typeof(msg) != 'string' )
        		return LJ.fn.toastMsg('Erreur interne','error');

        	var ms = ms || 500;
        	setTimeout( function(){ 
        	
        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.btn-validating').removeClass('btn-validating');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');

			}, ms );

        },
        populateCreateEvent: function(){

        	var suggestion = LJ.user.friends[0];
        	LJ.fn.addItemToInput({ max: LJ.settings.app.max_hosts, inp: '#cr-friends', html: LJ.fn.renderFriendInInput( suggestion ), suggestions: '.search-results-friends' });

        	['helloWorld','likeYouCare','ThisIsIt'].forEach(function(hashtag){
        		LJ.fn.addItemToInput({ html: LJ.fn.renderAmbianceInCreate( hashtag ), inp: '#cr-ambiance', max: LJ.settings.app.max_ambiance });
        	});

        	var suggestion = { _id: '55c613b3eb8ced441405a3a6', type: 'bar', name: 'Le violondingue', adress: 'Near panthéon bitch!' }
        	LJ.fn.addItemToInput({ max: 1, inp: '#cr-party-place', html: LJ.fn.renderPartyPlaceInCreate(suggestion) });

        	var service = new google.maps.places.PlacesService(LJ.map);
        		service.getDetails({ placeId: "ChIJyYqjdNxx5kcRQLAaFrnkRlM"}, function(res){
        			LJ.fn.addBeforePlaceToInput( res );
        		});

        	LJ.fn.addDateToInput('29/08/15');

        },
        makeGroupId: function( group_ids ){

        	if( !Array.isArray( group_ids ) || group_ids.length < 2 )
        		return console.error('Cant make group id, not proper array &| length ');
        	
        	return group_ids.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) }).join('.');

        },
        getGroupById: function( evt, group_id ){

        	return  _.find( evt.groups, function(group){ return group.group_id == group_id; });

        },
        refreshEventStatusOnMap: function( evt ){

        	var marker = _.find( LJ.event_markers, function(el){ return el.id == evt._id; }).marker;

			if( evt.status == "open" ){
				marker.setOpacity(1);
				// marker.setIcon( LJ.cloudinary.markers.white_on_black );
			}
			
			if( evt.status == "suspended" ){
				marker.setOpacity(0.5);
				// marker.setIcon( LJ.cloudinary.markers.black_on_white );
			}
			
        }


	});