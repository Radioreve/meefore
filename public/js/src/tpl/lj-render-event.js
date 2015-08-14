
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{

		renderEvent: function( e ){

      var hosts_pictures_html, begins_at_html, mixity_html, agerange_html, scheduled_party_html, address_html, ambiance_html, button_html;

      /* Host images */
      hosts_pictures_html = '<div class="event-hosts">';
      e.hosts.forEach(function( host ){

        var display_params = _.merge( LJ.cloudinary.events.hosts.params, { img_version: LJ.fn.findMainImage( host ).img_version } );
        var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
        hosts_pictures_html += '<div class="event-host-picture" data-fbid="'+host.facebook_id+'">' + img_tag +'</div>'

      });
      hosts_pictures_html += '</div>';

      /* Begin date */
      begins_at_html = '<div class="event-begins-at">' + moment( e.begins_at ).format('DD/MM') + '</div>';

      /* Address */
      address_html = '<div class="event-body-wrap event-address-wrap">'
                    + '<div class="event-address-intro"></div>'
                    + '<div class="event-address" data-placeid="'+e.address.place_id+'">'
                            + '<div class="event-address-street">' + e.address.street_name + ', </div>'
                            + '<div class="event-address-city">'   + e.address.city_name + '</div>'
                      +'</div>'
                    + '</div>';

      /* Ambiance */
      ambiance_html = '<div class="event-wrap">'
      e.ambiance.forEach(function( ambiance ){
        ambiance_html += '<div class="event-ambiance">'
                       + '<div class="event-ambiance-hashtag">#</div>'
                       + '<div class="event-ambiance-name">' + ambiance + '</div>'
        ambiance_html += '</div>';
      });
      ambiance_html += '</div>';

      /* Agerange & Mixity */
      var mixity   = _.find( LJ.settings.app.mixity,   function( el ){ return el.id == e.mixity;   });
      var agerange = _.find( LJ.settings.app.agerange, function( el ){ return el.id == e.agerange; });

      mixity_and_agerange_html = '<div class="event-body-wrap">'
                                    + '<div class="event-mixity" data-mixityid="' + e.mixity         +'">'
                                       + '<i class="icon icon-mixity-event icon-' + mixity.icon_code +'"></i>'
                                       + '<div class="event-mixity-name">'        + mixity.display +'</div>' 
                                    + '</div>'
                                    + '<div class="event-spliter">, </div>'
                                    + '<div class="event-agerange" data-agerangeid="' + e.agerange + '">'
                                       //+ '<i class="icon icon-agerange-event icon-'   + agerange.icon_code + '"></i>'
                                       + '<div class="event-agerange-name">'          + agerange.display + '</div>'
                                    + '</div>'
                               + '</div>';

      /* Scheduled party */
      scheduled_party_html = '<div class="event-body-wrap event-scheduled-party" data-placeid="' + e.scheduled_party._id     +'">'
                                + '<div class="event-scheduled-party-name">'     + e.scheduled_party.name    +'</div>'
                                + '<div class="event-spliter">, </div>'
                                + '<div class="event-scheduled-party-address">'  + e.scheduled_party.address +'</div>'
                                + '<div class="event-scheduled-party-type">'     + e.scheduled_party.type    +'</div>' 
                             +'</div>';

      button_html = '<div class="event-button-wrap">'
                      +'<button class="theme-btn">Participer</div>'
                    +'</div>';

      var html = '<div class="event-item-wrap etiquette"><div class="event-item-sublayer"><div class="event-item">'
                      + '<div class="event-head">'
                        + '<div class="event-hosts-intro">Proposé par</div>'
                        + hosts_pictures_html
                        + begins_at_html
                      + '</div>'
                      + '<div class="event-body">'
                          + address_html
                          + mixity_and_agerange_html 
                          + scheduled_party_html
                          + ambiance_html
                          + button_html
                      + '</div>'
                  +'</div></div></div>';

      return html;

		}
       
        
        

});