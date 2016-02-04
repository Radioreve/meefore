
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		translateView: function( html ){

			html = $(html);
			LJ.fn.setAppLanguage( LJ.app_language, html );
			return html.prop('outerHTML');

		},
		renderSideview_Wrap: function(){

			var html = [
				'<div class="sideview">',
					'<div class="sideview-party sideview-wrapper">',
						'<div class="sideview__header" data-lid="p_sideview_header"></div>',
						'<div class="sideview__body js-sideview-party">',
							LJ.fn.renderPartySideview_Default(),
						'</div>',
					'</div>',
					'<div class="sideview-divider"></div>',
					'<div class="sideview-event sideview-wrapper">',
						'<div class="sideview__header" data-lid="e_sideview_header""></div>',
						'<div class="sideview__body js-sideview-events"></div>',
					'</div>',
				'</div>'
			].join('');

			return LJ.fn.translateView( html ); 

		},
		renderEventSideview_Empty: function(){

			var html = [
					'<div data-lid="e_sideview_empty_text" class="sideview-event__empty-text">',
						'Aucun évènement...',
					'</div>'
			].join('');

			return LJ.fn.translateView( html );

		},
		renderEventSideview_User: function( evt ){

          return LJ.fn.renderEventSideview( evt, {
            request_html: '<button  data-lid="e_preview_participate" class="theme-btn btn-requestin sideview-action__btn">Participer</div>'
          });

        },
        renderEventSideview_MemberPending: function( evt ){

          return LJ.fn.renderEventSideview( evt, {
            request_html: '<button  data-lid="e_preview_pending" class="theme-btn btn-jumpto sideview-action__btn">Participer</div>'
          });

        },
        renderEventSideview_MemberAccepted: function( evt ){

          return LJ.fn.renderEventSideview( evt, {
            request_html: '<button  data-lid="e_preview_chat" class="theme-btn btn-jumpto sideview-action__btn">Participer</div>'
          });

        },
        renderEventSideview_Host: function( evt ){

          return LJ.fn.renderEventSideview( evt, {
            request_html: '<button  data-lid="e_preview_manage" class="theme-btn btn-jumpto sideview-action__btn">Participer</div>'
          });

        },
		renderEventSideview: function( evt, opts ){

			 //Hosts pictures 
          var hosts_pictures_html = '';

          hosts_pictures_html = '<div class="sideview-hosts">';
          evt.hosts.forEach(function( host ){

            var display_params = LJ.cloudinary.events.sideview.hosts.params;
                display_params.version = LJ.fn.findMainImage( host ).img_version;

            var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
            var country = '<div class="user-flag sideview-host__flag"><span class="flag-icon flag-icon-' + host.country_code + '"></span></div>';

            hosts_pictures_html += '<div class="sideview-host" data-userid="' + host.facebook_id + '">' 
                                  + img_tag + country 
                                +'</div>'

          });
          hosts_pictures_html += '</div>';


          // Context
          var context_html = '<div class="sideview-context">';

          // Address
          var address_html = '';
          address_html += '<div class="sideview-address sideview-context__element">'
                            + '<i class="sideview-address__icon icon icon-location sideview-context__icon"></i>'
                            + '<div class="sideview-address__name">'+evt.address.place_name+'</div>'
                          +'</div>';

          // Date
          // var date = moment( evt.begins_at ).format('DD/MM');
          var hour = moment( evt.begins_at ).format('HH/MM').replace('/', 'H');

          var date_html = ['<div class="sideview-date">',
                              '<div class="sideview-date__hour">'+ hour +'</div>',
                            '</div>'].join('');


          // Host names
          // var hosts_names_html = '<div class="sideview-hostnames sideview-context__element">';
          // evt.hosts.forEach(function( host ){ hosts_names_html += '<div class="sideview-hostnames__name">'+ host.name +'</div>'; });
          // hosts_names_html += '</div>';

          // context_html += hosts_names_html;

          context_html += address_html;
          context_html += '</div>';


          // Action buttons
          var action_html = ['<div class="sideview-action nonei">',
                              opts.request_html,
                             '</div>'].join('');

          // Main HTML
          var divider_html = '<div class="sideview__divider--md"></div>';

          var html = '<div class="sideview-event-item" data-eventid="'+evt._id+'">'
                      + hosts_pictures_html
                      + divider_html
                      + context_html
                      + date_html
                      + action_html
                     '</div>';

        	return LJ.fn.translateView( html );

		},
		renderPartySideview_Default: function(){

			var html = [
					'<div data-lid="p_sideview_default_text" class="sideview-party__default-text super-centered">',
					'</div>',
			].join('');

			return LJ.fn.translateView( html );
		}

	});