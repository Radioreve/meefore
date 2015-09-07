
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{
    renderChatLine: function( options ){
      
      if( !options )
          return; 

      var html        = '';
      var msg         = options.msg;
      var name        = options.name;
      var img_id      = options.img_id;
      var img_vs      = options.img_vs;
      var sent_at     = options.sent_at;
      var facebook_id = options.facebook_id;
      var me          = facebook_id == LJ.user.facebook_id ? 'me' : '';

      var display_params = _.merge( LJ.cloudinary.events.chat.params, { img_version: img_vs } );
      var img_tag      = $.cloudinary.image( img_id, display_params ).prop('outerHTML');

      var mmt = moment( new Date( sent_at ) );
      var sent_at_html = mmt.dayOfYear() == moment().dayOfYear() ?
                         mmt.format('HH') + 'h' + mmt.format('mm') :
                         mmt.format('DD/MM');

      html += '<div class="event-accepted-chat-message ' + me +'" data-authorid="' + options.facebook_id + '" data-authorname="' + name +'" >'
                  + img_tag
                  + '<div class="event-accepted-chat-sent-at">' + sent_at_html + '</div>'
                  + '<div class="event-accepted-chat-text">'    + msg          + '</div>'
                + '</div>';

      return html;

    },
    renderEventPreview_User: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button class="theme-btn btn-preview btn-requestin slow-down-3">Participer</div>'
      });

    },
    renderEventPreview_Member: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button class="theme-btn btn-preview btn-jumpto slow-down-3">Ouvrir</div>'
      });

    },
    renderEventPreview_Host: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button class="theme-btn btn-preview btn-jumpto slow-down-3">Ouvrir</div>'
      });

    },
    renderEventPreview: function( evt, options ){

      var options = options || {};
      var hosts_pictures_html, details_html, hosts_names = []

      /* Hosts pictures */
      hosts_pictures_html = '<div class="event-preview-hosts">';
      evt.hosts.forEach(function( host ){

        var display_params = _.merge( LJ.cloudinary.events.map.hosts.params, { img_version: LJ.fn.findMainImage( host ).img_version } );
        var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
        hosts_pictures_html += '<div class="event-preview-host-picture" data-fbid="'+host.facebook_id+'">' + img_tag +'</div>'

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
      var request_html = options.request_html;

      details_html = '<div class="event-preview-details">'
                      + '<div class="event-preview-address">Rdv '     + evt.address.place_name + ', le '+ moment( evt.begins_at ).format('DD/MM')+'</div>'
                      + '<div class="event-preview-hosts-names">' + hosts_names.join('')    + '</div>'
                    +'</div>';

      var html = '<div class="event-preview etiquette slow-down-3" data-eventid="' + evt._id + '">'
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
              html += '<div class="event-filter event-mixity slow-down-3" data-selectid="' + mixity.id + '">' + mixity.display + '</div>'
          });
        return html;

    },
    renderAgerangeInFilters: function( agerange_arr ){

      var html = '';
          agerange_arr.forEach(function(agerange){
            if( agerange.id != 'whatever' )
              html += '<div class="event-filter event-agerange slow-down-3" data-selectid="' + agerange.id + '">' + agerange.display + '</div>'
          });
        return html;

    },
    renderUserImgTag: function( user, params ){

      var main_image     = LJ.fn.findMainImage( user );
      var display_params = _.merge( params, { img_version: main_image.img_version } );
      var img_tag        = $.cloudinary.image( main_image.img_id, display_params ).prop('outerHTML');

      return img_tag;

    },
    renderEventSettings: function( evt ){

      var settings_options = [];
      ['open','suspended', 'canceled'].forEach(function( status ){
        var active = evt.status == status ? 'active' : '';
        settings_options.push('<div data-status="'+status+'" class="event-settings-group-action '+active+'" >');
      });

      var settings_html = [
          '<div class="event-inview-settings etiquette">',
            '<div class="event-settings-group settings-group-status">',
              '<div class="event-settings-group-name">Status de l\'évènement</div>',
              settings_options[0] + 'Ouvert</div>',
              settings_options[1] + 'Suspendu/Complet</div>',
              settings_options[2] + 'Annulé</div>',
            '</div>',
            '<div class="event-settings-group">',
              '<button class="theme-btn btn-validate">Mettre à jour</button>',
              '<button class="theme-btn btn-cancel">Annuler</button>',
            '</div>',
          '</div>'
      ].join('');

      return settings_html;

    },
    renderHostsGroup: function( hosts ){

      var hosts_html = '<div class="event-accepted-users-group" data-status="hosts" data-groupid="hosts">'
                            + '<div class="event-accepted-group-name">Organisateurs</div>';

      hosts.forEach(function( member ){

      var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
      hosts_html += '<div class="event-accepted-user" data-userid="'+member.facebook_id+'">'
                        + '<div class="event-accepted-user-age">'     + member.age    + '</div>'
                        + '<div class="event-accepted-user-picture">' + img_tag       + '</div>'
                        + '<div class="event-accepted-user-name">'    + member.name   + '</div>'
                        + '<div class="event-accepted-user-hashtag">' + member.drink  + '</div>'
                      + '</div>';
      });

      hosts_html += '</div>';

      return hosts_html;

    },
    renderHostsGroupWithCog: function( hosts ){

      var hosts_html = '<div class="event-accepted-users-group" data-status="hosts" data-groupid="hosts">'
                            + '<i class="icon icon-event-settings icon-cog"></i>'
                            + '<div class="event-accepted-group-name">Organisateurs</div>';

      hosts.forEach(function( member ){

      var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
      hosts_html += '<div class="event-accepted-user" data-userid="'+member.facebook_id+'">'
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

      var group_members_facebook_id =  _.pluck( group.members, 'facebook_id' );

      var mygroup  = group_members_facebook_id.indexOf( LJ.user.facebook_id ) != -1 ? 'mygroup' : '';
      var group_id = LJ.fn.makeGroupId( group_members_facebook_id );

      var user_group_html = '<div class="event-accepted-users-group '+mygroup+'" data-status="'+group.status+'" data-groupid="'+group_id+'">'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user" data-userid="' + member.facebook_id + '">'
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

     var group_id = LJ.fn.makeGroupId( _.pluck( group.members, 'facebook_id' ) );

     var toggle_mode = group.status == 'accepted' ? 'on' : 'off';

     var user_group_html = '<div class="event-accepted-users-group none" data-status="'+group.status+'" data-groupid="'+group_id+'">'
                            + '<i class="icon icon-toggle icon-toggle-'+toggle_mode+'"></i>'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user" data-userid="'+member.facebook_id+'">'
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

      var html = '', hosts_html = '', groups_html = '', chatgroups_html = '', chat_wrap_html = '';

      var hosts_html = LJ.fn.renderHostsGroupWithCog( evt.hosts );

      /* Render all group on the left panel, filtered by click on chatgroup after */
      evt.groups.forEach(function( group ){
        groups_html += LJ.fn.renderUsersGroupWithToggle( group );
      });

      /* Render chatgroup on the top */
      chatgroups_html += LJ.fn.renderChatGroup_Host();
      evt.groups.forEach(function( group, i ){
        chatgroups_html += LJ.fn.renderChatGroup_Group( group );
      });
      /* Render a specific chat with chatid per group */
      chat_wrap_html += LJ.fn.renderChatWrap_Host_Host( evt._id );
      evt.groups.forEach(function( group, i ){
        chat_wrap_html += LJ.fn.renderChatWrap_Group_Host( evt._id, group );
      });

      html += '<div data-eventid="' + evt._id + '"class="row-events-accepted-inview" data-status="hosted">'
                + '<div class="event-accepted-inview">'
                  + '<div class="event-accepted-users">'
                    + hosts_html
                    + groups_html
                  + '</div>'
                  + '<div class="event-accepted-chat">'
                    + '<div class="event-accepted-chatgroups">'
                      + chatgroups_html
                    + '</div>'
                    + '<div class="event-accepted-chatwraps">'       
                      + chat_wrap_html
                    + '</div>'
                  + '</div>'
                + '</div>'
                + LJ.fn.renderEventSettings( evt );

            + '</div>';

        return html;

    },
    renderChatGroup_Group: function( group ){

      var html =  '<div class="event-accepted-chatgroup" data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '">'
                      + group.name
                   + '</div>';
      return html;

    },
    renderChatGroup_Host: function(){

      var html =  '<div class="event-accepted-chatgroup" data-groupid="hosts" >'
                      + 'Organisateurs'
                   + '</div>';
      return html;

    },
     renderChatWrap_Host_Host: function( event_id ){

      var html = '<div class="event-accepted-chat-wrap none" data-groupid="hosts" data-chatid="' + LJ.fn.makeChatId({ event_id:event_id, group_id: "hosts" }) + '">'
                        + '<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Host_Host()
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input type="text"/>'
                        + '<button class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';
      return html;

    },
    renderChatWrap_Host_Group: function( event_id, group ){

      var html = '<div class="event-accepted-chat-wrap none"'
                  + 'data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '"' 
                  + 'data-chatid="' + LJ.fn.makeChatId({ event_id: event_id, group_id: LJ.fn.makeGroupId( group.members_facebook_id ) }) + '">'
                    +'<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Host_Group( group.name )
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input type="text"/>'
                        + '<button class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';
      return html;

    },
    renderChatWrap_Group_Host: function( event_id, group ){

      var html = '<div class="event-accepted-chat-wrap none"'
                  + 'data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '"' 
                  + 'data-chatid="' + LJ.fn.makeChatId({ event_id: event_id, group_id: LJ.fn.makeGroupId( group.members_facebook_id ) }) + '">'
                    +'<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Group_Host()
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input type="text"/>'
                        + '<button class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';
      return html;
    },
    renderChatWrapNotification_Host_Host: function( ){

      var html = '<div class="super-centered event-accepted-notification-message">'
                          + 'Votre évènement a été créé avec succès'
                          + '<br>'
                          + 'Vous pouvez discuter ici avec vos amis organisateurs en toute tranquilité. Ce chat '
                          + 'est reservé aux organisateurs.'
                        + '</div>';
      return html;

    },
    renderChatWrapNotification_Host_Group: function( group_name ){

      var html = '<div class="super-centered event-accepted-notification-message">'
                          + group_name 
                          + '<br>'
                          + 'ont demandé à rejoindre votre before. Ils n\ront pas encore envoyé de message'
                        + '</div>'
      return html;

    },
    renderChatWrapNotification_Group_Host: function(){

      var html =  '<div class="super-centered event-accepted-notification-message">'
                        + 'Votre demande a bien a été envoyée' 
                        + '<br>'
                        + 'Dès que l\'un des organisateurs vous aura accepté, vous aurez accès à la discussion.'
                      + '</div>'
      return html;

    },
    renderEventTabview: function( evt ){

      var html = '<div class="event-accepted-tabview slow-down-3" data-eventid="'+evt._id+'">'+ evt.address.place_name +'</div>';
      return html;

    },
    renderEventInview_User: function( evt ){

    var html = '', hosts_html = '', groups_html = '', chatgroups_html = '', chat_wrap_html = '', status = '';


      var hosts_html = LJ.fn.renderHostsGroup( evt.hosts );
      
      evt.groups.forEach(function( group ){

        if( group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1 ){

          groups_html += LJ.fn.renderUsersGroup( group );
          chatgroups_html += LJ.fn.renderChatGroup_Group( group );
          chat_wrap_html += LJ.fn.renderChatWrap_Group_Host( evt._id, group );
          status  = group.status;

        }       
      });


      html += '<div data-eventid="' + evt._id + '" data-status="' + status + '" class="row-events-accepted-inview" >'
                + '<div class="event-accepted-inview">'
                  + '<div class="event-accepted-users">'
                    + hosts_html
                    + groups_html
                  + '</div>'
                  + '<div class="event-accepted-chat">'
                      + '<div class="event-accepted-chatgroups">'
                        + chatgroups_html
                      + '</div>'
                      + '<div class="event-accepted-chatwraps">'       
                        + chat_wrap_html
                      + '</div>'
                  + '</div>'
                + '</div>'
            + '</div>';

        return html;
    },
    renderEventRequestIn: function( event_id ){

      var html = [

            '<div id="requestIn" data-eventid="'+event_id+'">',
                '<div class="row-input row-input-lg">',
                  '<div class="modal-title">Demande de participation </div>',
                '</div>',
                '<div class="row-input row-input-lg etiquette row-requestin-group-name">',
                  '<label class="label label-lg" for="ri-groupname">Nom du groupe</label>',
                  '<input id="ri-groupname" type="text" placeholder="Sera affiché dans le chat"/>',
                '</div>',
                 '<div class="row-input row-input-lg etiquette row-requestin-group-members">',
                  '<label class="label label-lg" for="ri-groupmembers">Groupe de soirée</label>',
                  '<input id="ri-groupmembers type="text" placeholder="Choisissez les personnes avec qui vous comptez sortir"/>',
                '</div>',
                 '<div class="row-input row-input-lg etiquette row-requestin-group-message">',
                  '<label class="label label-lg" for="ri-groupmessage">Message</label>',
                  '<input id="ri-groupmessage" type="text" placeholder="Pourquoi faire un before avec vous et pas un autre groupe ?"/>',
                '</div>',
                '<div class="row-buttons visible">',
                  '<button class="theme-btn btn-large btn-cancel right">Annuler</button>',
                  '<button class="theme-btn btn-large btn-validate right">Rejoindre ce before</button>',
                '</div>', 
            '</div>'

          ];

      return html.join('');

    },
    renderItemInInput: function( str ){

        var html =  '<div class="rem-click item">'
                            + '<div class="item-name">' + str + '</div>'
                        +'</div>'

        return html;

    }
       
        
        

});