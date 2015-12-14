
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		isEmail: function( email ){

			return /^.+@.+\..+$/.test( email ) 

		},
		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		fetchMe: function(){

			LJ.fn.api('get','me', { 
				//no data
			}, function( err, me ){

				if( err )
					return console.error('Couldnt refresh profile state : ' + err );

				LJ.user = me;

			});

		},
		adjustChatPaneById: function( options ){

			var options = options || {};

			var event_id = options.event_id;
			var group_id = options.group_id;

			var chat_id = LJ.fn.makeChatId({ event_id: event_id, group_id: group_id });

			var jsp_chat = LJ.jsp_api[ event_id ].chats[ chat_id ];
			var jsp_users = LJ.jsp_api[ event_id ].users;

			setTimeout(function(){
					
				if( !jsp_chat || !jsp_users ){
					LJ.fn.warn('Couldnt find jsp api');
					return
				}

				// Reinitialize users panel
				jsp_users.reinitialise();

				if( options.stick_to_content ){

					LJ.fn.log('Sticking to content');
					jsp_chat.reinitialise();
					var $elem = $('.jsp-glue').first();
					jsp_chat.scrollToElement( $elem, true );
					jsp_chat.scrollToY( jsp_chat.getContentPositionY() + 5 ); // perfectionnist 
					$elem.removeClass('jsp-glue');
					return;

				}

				// If user is almost at the bottom of chat or is at the very top
				if( jsp_chat.getPercentScrolledY() > 0.75 || jsp_chat.getPercentScrolledY() == 0 ){

					LJ.fn.log('Scrolling to bottom');
					jsp_chat.reinitialise();
					jsp_chat.scrollToBottom();
					return;
					
				} 

				LJ.fn.log('Staying where we are');
				// Default, renitialise without scrollingToBottom
				// For prevent users browsing history to be disturbed by auto scroll to bottom
				jsp_chat.reinitialise();
			

			}, 50 );

		},
		adjustAllChatPanes: function( options ){

			var options = options || {};

			setTimeout(function(){

				_.keys( LJ.jsp_api ).forEach(function( event_id ){

					// Always scroll users to the top, to show admins first
					var jsp_event = LJ.jsp_api[ event_id ];

					jsp_event.users.reinitialise();
					//jsp_event.users.scrollToTop();

					_.keys( jsp_event.chats ).forEach(function( chat_id ){

						var jsp = LJ.jsp_api[ event_id ].chats[ chat_id ];
							
						if( !jsp )
							return

						if( options.stick_to_content ){

							LJ.fn.log('Sticking to content');
							jsp.reinitialise();
							var $elem = $('.jsp-glue').first();
							jsp.scrollToElement( $elem, true );
							jsp.scrollToY( jsp.getContentPositionY() + 5 ); // perfectionnist 
							$elem.removeClass('jsp-glue');
							return;

						}

						// If user is almost at the bottom of chat or is at the very top
						if( jsp.getPercentScrolledY() > 0.75 || jsp.getPercentScrolledY() == 0	){

							LJ.fn.log('Scrolling to bottom');
							jsp.reinitialise();
							jsp.scrollToBottom();
							return;
							
						} 

						LJ.fn.log('Staying where we are');
						// Default, renitialise without scrollingToBottom
						// For prevent users browing history to be distrubed by auto scroll to bottom
						jsp.reinitialise();
					

					});
				});

			}, 150 );

		},
		adjustAllInputsWidth: function( container ){

			var $container = $(container);
			var ui_offset = 20;

			// Find largest label
			var labels = $container.find('label');
			var labels_array = [];
			labels.each( function( i, el ){
				labels_array.push({
					$label      : $(el),
					outer_width : $(el).outerWidth(true),
					width       : $(el).width()
				});
			});

			var largest_label = _.max( labels_array, function( itm ){
				return itm.width;
			});

			$container.find('label').each( function( i, label ){

				LJ.fn.log('Largest label is : ' + largest_label.width );
				var $label = $(label);
				var $inp   = $label.siblings('*:not( .etiquette, [type="number"], .item)');

				if( $label.hasClass('adjusted-once') ){
					return;
				}

				$label.addClass('adjusted-once');

				var parent_width = $label.parent().width(); // width which children are positionned in

				$label.css({ width: largest_label.width + ui_offset }); 
				$inp.css({ width: parent_width - largest_label.outer_width - ui_offset }); /* Mega hack needed cause of display:inline-block added whitespace */
				$inp.children('input').css({ width:'100%' });
			});
			
		},
		shortenString: function( options ){ //useless

			var options = options || {};

			if( !options.str && typeof( options.str ) != 'string' )
				return LJ.fn.log('Invalid input for shorten string fn');

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
				LJ.fn.log('Sug found');
				var current_offset = parseInt( $sug.css('left').split('px')[0] );
				$sug.css({ left: current_offset + $self.outerWidth(true) });
			}

			$self.remove();
			

		},
		addItemToInput: function( options ){

			var options = options || {};

			if( !options.html || typeof( options.html ) != 'string' )
				return LJ.fn.log('Invalid html for prepend item fn');

			var $input = $( options.inp );
			var $html = $( options.html );

			if( options.typeahead ){
				$input = $input.parents('.twitter-typeahead');
			}

			$html.hide().insertBefore( $input );
			options.class_names && $html.addClass( options.class_names );

			var item_id = $html.attr('data-id');
			if( $('.rem-click[data-id="' + item_id + '"]').length > 1 ){
				//LJ.fn.log('Removing due to same id');
				return $html.remove();
			}

			if( $html.siblings('.rem-click').length > options.max - 1){
				//LJ.fn.log('Removing due to overflow');
				return $html.remove();
			}

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

			LJ.fn.log(place);

			if( !place.address_components ){
				return LJ.fn.warn('Couldnt find address_components');	
			} 

			var compo = place.address_components,
                locality = '',
                place_name = '';

                compo.forEach(function( el ){

                	if( !el.types ) return;

                    if( el.types.indexOf('neighborhood') != -1 )
                        place_name = el.long_name;

                    if( place.formatted_address )
                    	place_name = place.formatted_address.split(',')[0];

                    if( el.types.indexOf('route') != -1 )
                        place_name = el.long_name;

                    if( el.types.indexOf('locality') != -1 )
                        locality = el.long_name;

                    if( place.name )
                    	place_name = place.name
                    

                });

            if( place_name === '' ){
              place_name = place.name;
            }

            if( locality === '' ){
              locality = 'Earth';
            }
				  
          return {
				place_id   : place.place_id,
				place_name : place_name,
				city       : locality,
				lat        : place.geometry.location.lat(),
				lng        : place.geometry.location.lng()
          };

		},
		addPlaceToInput: function( place, input_id ){

			if( !place.place_id ){
				return LJ.fn.warn('No place_id found, cant add item');
			}

			var $input = $('#'+input_id),
				place = place;

			$input.val('');
			$input.hide();

			var $place = $input.siblings('div');
			if( $place.length != 0 ){
				$place.remove();
				// $input.show();
			}

			var $html = $( LJ.fn.renderPartyPlaceInCreate( place ) );			
				$html.hide().insertBefore( $input );
				$html.show();

		},
		addDateToInput: function( date_str, input_id ){

			var $input = $('#' + input_id),
				date = moment( date_str, 'DD/MM/YY' );
			
			$input.val('');
			
			if( $('.date').length != 0 ){
				LJ.fn.removeDateToInput();
			} 

			var msg = date.day() == moment().day() ? "Tout à l'heure !" : "Une belle journée ";
			$input.attr('placeholder', msg );
			
			var $html = $( LJ.fn.renderDateInCreate( date_str ) );
				$html.hide().insertBefore( $input );
				$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
				$html.show();

			LJ.pikaday.hide();

		},
		addHourToInput: function( hour, min ){

			var $input = $('#cr-hour');
			var msg    = 'Une belle heure';

			$input.val('');

			if( $('.hour').length != 0 ){
				LJ.fn.removeHourToInput();
			}

			var h = parseInt( hour );
			if( h == 18 ){
				msg = 'Afterwork!';
			}
			if( h == 19 ){
				msg = 'Apéro';
			}
			if( h == 21 ){
				msg = 'Before time';
			}
			if( h == 23 ){
				msg = 'Ambiance...';
			}

			$input.attr('placeholder', msg);

			var $html = $( LJ.fn.renderHourInCreate( hour, min ) );
				$html.hide().insertBefore( $input );
				$input.css({ width: $input.outerWidth() - $html.outerWidth(true) });
				$html.show();

		},
		hashtagify: function( str ){
			
			var hashtag_parts = [];
				str.toLowerCase().trim().split(/[\s_-]/).forEach(function( el, i ){
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
			
			if( user.main_picture ){
				return user.main_picture
			};
			
			
			var index = _.findIndex( user.pictures, function( el ){
				return el.is_main == ( true || "true" );
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
		removeHourToInput: function(){

			var $input = $('#cr-hour'),
				$hour  = $('.hour');

			$input.css({ width: $input.outerWidth() + $hour.outerWidth(true) })
			$('.hour').remove();
			$('.hp-main').show();

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
        say: function( eventName, data, options, cb ){

        	var url = '/' + eventName;

        	if( typeof options.success == 'function' )
        		cb = options;

        	$.ajax({
        		method:'POST',
        		url:url,
        		dataType:'json',
        		data: data,
        		beforeSend: function( req ){

        			if( options.no_header ){
        				return
        			} else {
						req.setRequestHeader('x-access-token', LJ.accessToken );
        			}

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
        	LJ.fn.log('Success!');
        },
        handleErrorDefault: function( data ){
        	LJ.fn.log('Error!');
        },
        GraphAPI: function( url, callback, opts ){

			var ls = window.localStorage;

			var access_token = ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.long_lived ) 
							 || ( ls.preferences && JSON.parse( ls.preferences ).long_lived_tk )
							 || ( ls.reconn_data && JSON.parse( ls.reconn_data ).long_lived_tk )

			if( !access_token ){
				LJ.fn.warn('Calling graph api without being able to find a valid long lived token', 1 );
			}

			FB.api( url, { access_token: access_token }, callback );

		},
		iHost: function( hosts_facebook_id ){

			if( !hosts_facebook_id ){
				return console.error('Cant host an event that doesnt exist!');
			}

			return hosts_facebook_id.indexOf( LJ.user.facebook_id ) != -1 ;

		},
		iGroup: function( members_facebook_id ){

			if( !members_facebook_id ){
				return console.error('Cant belong to a group that doesnt exist!');
			}

			return members_facebook_id.indexOf( LJ.user.facebook_id ) != -1;
		},
		iStatus: function( event_id ){

			var evt = _.find( LJ.cache.events, function( evt ){
				return evt._id == event_id;
			});

			if( !evt ){
				return LJ.fn.warn('Couldnt find event in cache with id : ' + event_id );
			}

			var status = null;
			evt.groups.forEach(function( group ){

				if( LJ.fn.iGroup( group.members_facebook_id ) ){
					status = group.status;
				}

			});

			if( LJ.fn.iHost( _.pluck( evt.hosts, 'facebook_id') )){
				status = 'hosting';
			}

			return status

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
				beforeSend: function( req ){
					req.setRequestHeader('x-access-token', LJ.accessToken );
        		},
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
		getToken: function(){
			return LJ.accessToken;
		},
		defaultApiCompleteCallback: function(){

			// LJ.fn.log('api call completed');
		},
		handleServerSuccess: function( msg, selector ){

        	setTimeout( function(){ 

		        if( msg ){
		        	LJ.fn.toastMsg( msg, 'info');
		        }

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

        	if( typeof(msg) != 'string' ){
        		msg = JSON.parse( msg.responseText ).msg;
        	}

        	if( typeof(msg) != 'string' ){
        		return LJ.fn.toastMsg('Erreur interne','error');
        	}

        	var ms = ms || 500;
        	setTimeout( function(){ 
        	
	        	LJ.fn.toastMsg( msg, 'error');
				$('.validating').removeClass('validating');
				$('.btn-validating').removeClass('btn-validating');
				$('.asking').removeClass('asking');
				$('.pending').removeClass('pending');

			}, ms );

        },
        makeGroupId: function( group_ids ){

        	if( !Array.isArray( group_ids ) || group_ids.length < 2 )
        		return console.error('Cant make group id, not proper array &| length ');
        	
        	return group_ids.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) }).join('.');

        },
        makeChatId: function( options ){
        	
        	var event_id = options.event_id;
        	var group_id = options.group_id;

        	if( !event_id || !group_id ){
        		LJ.fn.log(event_id); LJ.fn.log(group_id);
        		return console.error('Cant make chat id, missing parameter ')
        	}

        	return event_id + '-' + group_id;
        },
        getGroupById: function( evt, group_id ){

        	return  _.find( evt.groups, function( group ){ return group.group_id == group_id; });

        },
        findMyGroupIdFromDom: function( child ){

        var group_id = $( child ).parents('.row-events-accepted-inview')
					     .find('.event-accepted-user[data-userid="'+LJ.user.facebook_id+'"]')
					     .parents('.event-accepted-users-group').attr('data-groupid');

		return group_id;


        },
        findMyGroupIdFromEvent: function( evt ){

        	var group_id = null;

        	evt.groups.forEach(function( group ){

        		if( group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1 )
        			group_id = group.group_id;

        	});

        	return group_id;

        },
        filterUser: function( user ){
        	return _.pick( user, 
        		[
        			'facebook_id',
					'facebook_url', 
					'signup_date', 
					'age', 
					'gender', 
					'job', 
					'name', 
					'drink', 
					'mood', 
					'pictures'
        		]);
        },
        roughSizeOfObject: function( object ) {

		    var objectList = [];
		    var stack = [ object ];
		    var bytes = 0;

		    while ( stack.length ) {
		        var value = stack.pop();

		        if ( typeof value === 'boolean' ) {
		            bytes += 4;
		        }
		        else if ( typeof value === 'string' ) {
		            bytes += value.length * 2;
		        }
		        else if ( typeof value === 'number' ) {
		            bytes += 8;
		        }
		        else if
		        (
		            typeof value === 'object'
		            && objectList.indexOf( value ) === -1
		        )
		        {
		            objectList.push( value );

		            for( var i in value ) {
		                stack.push( value[ i ] );
		            }
		        }
		    }
		    return bytes;
		},
		countUnreadMessages: function(){

			var messages = [];
			$('.row-events-accepted-inview .bubble').each(function( i, bubble ){
				messages.push( parseInt(  $(bubble).text() || 0 ) );
			});

			var n = 0;
			messages.forEach(function( n_count ){
				n += n_count;
			});

			return n

		},
		updateEventCache: function( new_event ){

			var cached_event =_.find( LJ.cache.events, function( evt ){
				return ( evt._id === new_event._id || evt._id == new_event.event_id );
			});

			if( !cached_event ){
				LJ.fn.log('Adding event in cache since not found');
				LJ.cache.events.push( new_event );
			} else {
				// LJ.fn.log('Event found in cache, updating it');
				cached_event = _.merge( cached_event, new_event );
			}

			return cached_event;


		},
		formatRequestInInputs: function(){

			var $input = $('.row-requestin-group-name').find('input');
            var $item  = $('.row-requestin-group-name').find('.item');
            if( $input.val().trim().length != 0 ){
                $item.remove();
                LJ.fn.addItemToInput({ 
                    html: LJ.fn.renderItemInInput_GroupName( $input.val() ),
                    inp: '#ri-groupname',
                    max: 1
                });
                $input.val('');
            }

            var $input = $('.row-requestin-group-message').find('input');
            var $item  = $('.row-requestin-group-message').find('.item');
            if( $input.val().trim().length != 0 ){
                $item.remove();
                LJ.fn.addItemToInput({ 
                    html: LJ.fn.renderItemInInput_GroupMessage( $input.val() ),
                    inp: '#ri-groupmessage',
                    max: LJ.settings.app.max_ambiance
                });
                $input.val('');
            }

		},
		formatCreateEventInputs: function(){

			// Ambiance hashtags
			// var $input = $('.row-create-ambiance').find('input');
   //          var $item  = $('.row-create-ambiance').find('.item');

   //          if( $input.val().trim().length == 0 ) return;

   //              LJ.fn.addItemToInput({ 
   //                  html: LJ.fn.renderAmbianceInCreate( $input.val() ),
   //                  inp: '#cr-ambiance',
   //                  max: 5
   //              });
   //              $input.val('');

		},
		adjustAllTabviews: function(){

			var elements_width = 0;
			var $tabviews = $('.row-events-accepted-tabview');
			var n_tabviews = $('.event-accepted-tabview').length;
			var fix_width  = 23;
			var max_width = $tabviews.width() - n_tabviews * fix_width;
			var new_width = parseInt( max_width / n_tabviews ) > 200 ? 200 : parseInt( max_width / n_tabviews );
			
			$('.event-accepted-tabview').css({
				width: new_width
			});

			$('.tabview-date-day, .tabview-place').css({
				left: '-' + n_tabviews + 'px'
			});

			$tabviews
				.children().each(function( i, el ){
					$( el ).css({
						'z-index': 999 - i
					});
				});
		},
		selectFirstResult: function( $pac, callback ){

		    var first_result = $pac.find('.pac-item:first').text();

		    var geocoder = new google.maps.Geocoder();
		    geocoder.geocode({ "address": first_result }, function( results, status ){
		        if( status == google.maps.GeocoderStatus.OK ){
		        	return callback( null, results[0] );
		        } else {
		        	return callback( "Error calling the geocode api" );
		        }
		    });   

		},
		getEvent: function( event_id ){

			var evt = _.find( LJ.cache.events, function( el ){
                 return el._id == event_id 
             });

            if( !evt ){
                return LJ.fn.warn('Couldnt find event...')
            } else {
                return evt;
            }
            
		},
		isElementInViewport: function(el) {

            var rect = el[0].getBoundingClientRect();
            return ( rect.top >= 0 && rect.left >= 0 && rect.bottom <=  $(window).height() && rect.right <= $(window).width() );
    	}


	});