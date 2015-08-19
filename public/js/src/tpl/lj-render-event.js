
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{
    renderChatLine: function( options ){

      var html   = '';
      var msg    = options.msg;
      var author = options.author;
      var me     = author.facebook_id == LJ.user.facebook_id ? 'me' : '';

      var main_image     = LJ.fn.findMainImage( author );
      var display_params = _.merge( LJ.cloudinary.events.chat.params, { img_version: main_image.img_version } );
      var img_tag      = $.cloudinary.image( main_image.img_id, display_params ).prop('outerHTML');

      html += '<div class="event-accepted-chat-message ' + me + '" data-authorid="' + author.facebook_id + '" >'
                  + img_tag
                  + '<div class="event-accepted-chat-text">' + msg + '</div>'
                + '</div>';

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
    renderEventPreview_User: function( evt ){

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
    renderUserImgTag: function( user, params ){

      var main_image     = LJ.fn.findMainImage( user );
      var display_params = _.merge( params, { img_version: main_image.img_version } );
      var img_tag        = $.cloudinary.image( main_image.img_id, display_params ).prop('outerHTML');

      return img_tag;

    },
    renderEventInview_User: function( evt ){

      var html = '', hosts_html = '', groups_html = '';

      var hosts_html = LJ.fn.renderHostsGroup( evt.hosts );
      
      evt.groups.forEach(function( group ){
        groups_html += LJ.fn.renderUsersGroup( group );
      });

      html += '<div data-eventid="' + evt._id + '"class="row-events-accepted-inview">'
                + '<div class="event-accepted-inview">'
                  + '<div class="event-accepted-users">'
                    + hosts_html
                    + groups_html
                  + '</div>'
                  + '<div class="event-accepted-chat">'
                    + '<div class="event-accepted-chat-messages">'
                      + '<div class="super-centered event-accepted-notification-message">'
                        + 'Votre demande a bien a été envoyée' 
                        + '<br>'
                        + 'Dès que l\'un des organisateurs vous aura accepté, vous aurez accès à la discussion.'
                      + '</div>'
                    + '</div>'
                    + '<div class="event-accepted-chat-typing">'
                      + '<input type="text"/>'
                      + '<button class="theme-btn"></button>'
                    + '</div>'  
                  + '</div>'
                + '</div>'
            + '</div>';



    },
    renderHostsGroup: function( group ){

      var hosts_html = '<div class="event-accepted-users-group"><div class="event-accepted-group-name">Organisateurs</div>';
      hosts.members.forEach(function( member ){

      var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
      user_group_html += '<div class="event-accepted-user">'
                        + '<div class="event-accepted-user-age">'     + member.age    + '</div>'
                        + '<div class="event-accepted-user-picture">' + img_tag       + '</div>'
                        + '<div class="event-accepted-user-name">'    + member.name   + '</div>'
                        + '<div class="event-accepted-user-hashtag">' + member.drink  + '</div>'
                      + '</div>';
      });

      hosts_html += '</div>';

      return hosts_html;

    },
    renderUsersGroup: function( group ){

      var user_group_html = '<div class="event-accepted-users-group">'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user">'
                          + '<div class="event-accepted-user-age">'     + member.age    + '</div>'
                          + '<div class="event-accepted-user-picture">' + img_tag       + '</div>'
                          + '<div class="event-accepted-user-name">'    + member.name   + '</div>'
                          + '<div class="event-accepted-user-hashtag">' + member.drink  + '</div>'
                        + '</div>';
      });


      user_group_html += '</div>';

      return user_group_html;

    },
    renderUsersGroupWithToggle: function( group ){

     var user_group_html = '<div class="event-accepted-users-group">'
                            + '<i class="icon icon-toggle icon-toggle-off"></i>'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user">'
                          + '<div class="event-accepted-user-age">'     + member.age    + '</div>'
                          + '<div class="event-accepted-user-picture">' + img_tag       + '</div>'
                          + '<div class="event-accepted-user-name">'    + member.name   + '</div>'
                          + '<div class="event-accepted-user-hashtag">' + member.drink  + '</div>'
                        + '</div>';
      });


      user_group_html += '</div>';

      return user_group_html;

    },
    renderEventInview_Host: function( evt ){

      var html = '', hosts_html = '', groups_html = '';

      var hosts_html = LJ.fn.renderHostsGroup( evt.hosts );

      evt.groups.forEach(function( group ){
        groups_html += LJ.fn.renderUsersGroupWithToggle( group );
      });

      html += '<div data-eventid="' + evt._id + '"class="row-events-accepted-inview">'
                + '<div class="event-accepted-inview">'
                  + '<div class="event-accepted-users">'
                    + hosts_html
                    + groups_html
                  + '</div>'
                  + '<div class="event-accepted-chat">'
                    + '<div class="event-accepted-chat-messages">'
                      + '<div class="super-centered event-accepted-notification-message">'
                        + 'Votre évènement a bien été créé' 
                        + '<br>'
                        + 'En attendant que d\'autres membres demandent à venir faire la fête avec vous,'
                        + 'vous pouvez discuter avec les autres organisateurs"'
                      + '</div>'
                    + '</div>'
                    + '<div class="event-accepted-chat-typing">'
                      + '<input type="text"/>'
                      + '<button class="theme-btn"></button>'
                    + '</div>'  
                  + '</div>'
                + '</div>'
            + '</div>';

    }
       
        
        

});