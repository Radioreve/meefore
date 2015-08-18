
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

		},
    renderNearestEvent: function( evt ){

      var hosts_pictures_html, details_html, hosts_names = []

      /* Hosts pictures */
      hosts_pictures_html = '<div class="event-nearest-hosts">';
      evt.hosts.forEach(function( host ){

        var display_params = _.merge( LJ.cloudinary.events.map.hosts.params, { img_version: LJ.fn.findMainImage( host ).img_version } );
        var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
        hosts_pictures_html += '<div class="event-nearest-host-picture" data-fbid="'+host.facebook_id+'">' + img_tag +'</div>'

      });
      hosts_pictures_html += '</div>';

      /* Event details */
      evt.hosts.forEach(function( host, i ){
        if( i == 0 ){
          hosts_names.push( host.name );
        } else if( i == evt.hosts.length - 1 ){
          hosts_names.push( ' et ' + host.name );
        } else {
          hosts_names.push( ', ' +host.name );
        }
      });

      /* Request html */
      var request_html = '<button class="theme-btn btn-request-in slow-down-3">Participer</div>';

      details_html = '<div class="event-nearest-details">'
                      + '<div class="event-nearest-address">Rdv '     + evt.address.street_name + ', le '+ moment( evt.begins_at ).format('DD/MM')+'</div>'
                      + '<div class="event-nearest-hosts-names">' + hosts_names.join('')    + '</div>'
                    +'</div>';

      var html = '<div class="event-nearest etiquette slow-down-3" data-eventid="' + evt._id + '">'
                    + hosts_pictures_html
                    + details_html
                    + request_html
                + '</div>';

      return html;

    },
    renderMixityInFilters: function( mixity_arr ){

      var html = '';
          mixity_arr.forEach(function(mixity){
            if( mixity.id != 'whatever' )
              html += '<div class="event-filter event-mixity" data-selectid="' + mixity.id + '">' + mixity.display + '</div>'
          });
        return html;

    },
    renderAgerangeInFilters: function( agerange_arr ){

      var html = '';
          agerange_arr.forEach(function(agerange){
            if( agerange.id != 'whatever' )
              html += '<div class="event-filter event-agerange" data-selectid="' + agerange.id + '">' + agerange.display + '</div>'
          });
        return html;

    },
    renderEventPreview: function( evt ){

      var ambiance_html = '', hosts_html = '', details_html = '', request_html = '';

      /* Ambiance */
      evt.ambiance.forEach(function( hashtag ){
        ambiance_html += '<div class="event-preview-ambiance"><div class="event-preview-hashtag">#</div>' + hashtag + '</div>';
      });

      /* Hosts */
      evt.hosts.forEach(function( host ){
        var display_params = _.merge( LJ.cloudinary.events.preview.hosts.params, { img_version: LJ.fn.findMainImage( host ).img_version } );
        var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
        hosts_html += '<div class="event-preview-host">'
                      + '<div class="event-preview-host-picture">' + img_tag    + '</div>'
                      + '<div class="event-preview-host-name">'    + host.name  + '</div>'
                      + '<div class="event-preview-host-age">'     + host.age   + ' ans</div>'
                   + '</div>';
      });

      /* Details */
      details_html += '<div class="event-preview-timeanddate">'
                      //+ evt.address.street_name
                      + '<i class="icon icon-preview icon-clock"></i>'
                      + moment( evt.begins_at ).format('dddd DD/MM')
                   +'</div>';

      /* Request */
      request_html += '<button class="theme-btn btn-request-in">Demander à participer</div>';

      var html = '';

          html += '<div class="event-preview">'
                  //  + '<div class="event-preview-details">'
                    //    + details_html
                    //+ '</div>'
                    + '<div class="event-preview-hosts">'
                        + hosts_html
                    + '</div>'
                    + '<div class="event-preview-ambiances">'
                        + ambiance_html
                    + '</div>'
                    + '<div class="event-preview-request">'
                        + request_html
                    + '</div>'
                + '</div>';

      return html;

    },
    renderEventInview: function( evt ){

    }
       
        
        

});