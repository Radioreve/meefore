
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{
    renderChatLine: function( options ){
      
      if( !options )
          return console.error('Cant render chatline without opts'); 

      var html        = '';
      var msg         = options.msg;
      var name        = options.name;
      var img_id      = options.img_id;
      var img_vs      = options.img_vs;
      var sent_at     = options.sent_at;
      var facebook_id = options.facebook_id;
      var me          = (facebook_id == LJ.user.facebook_id || options.force_me ) ? 'me' : '';

      var display_params = _.merge( LJ.cloudinary.events.chat.params, { version: img_vs } );
      var img_tag      = $.cloudinary.image( img_id, display_params ).prop('outerHTML');

      var mmt = moment( new Date( sent_at ) );
      var sent_at_html = mmt.dayOfYear() == moment().dayOfYear() ?
                         mmt.format('HH') + 'h' + mmt.format('mm') :
                         mmt.format('DD/MM');

      if( options.whisper_to ){
        var whisperto = 'data-whisperto="' + options.whisper_to + '"'
      }

      html  +=    '<div class="event-accepted-chat-message ' + me +'" data-authorid="' + facebook_id + '" data-authorname="' + name + '" '+ whisperto + '>'
                  + img_tag
                  + '<div data-sent-at = " ' + mmt.unix() + '" class="event-accepted-chat-sent-at">' + sent_at_html + '</div>'
                  + '<div class="event-accepted-chat-text">'    + msg          + '</div>'
                + '</div>'

      return html;

    },
    renderChatLine_Bot: function( message ){
      
      if( !message )
          return console.error('Il manque le message');

      var html        = '';
      var msg         = message;
      var name        = LJ.bot_profile.name;
      var img_id      = LJ.bot_profile.img_id;
      var img_vs      = LJ.bot_profile.img_vs;
      var sent_at     = new Date()
      var facebook_id = LJ.bot_profile.facebook_id;

      var display_params = _.merge( LJ.cloudinary.events.chat.params, { version: img_vs } );
      var img_tag      = $.cloudinary.image( img_id, display_params ).prop('outerHTML');

      var mmt = moment( new Date( sent_at ) );
      var sent_at_html = mmt.dayOfYear() == moment().dayOfYear() ?
                         mmt.format('HH') + 'h' + mmt.format('mm') :
                         mmt.format('DD/MM');

      html += '<div class="event-accepted-chat-message bot" data-authorid="' + facebook_id + '" data-authorname="' + name +'" >'
                  + img_tag
                  + '<div class="event-accepted-chat-sent-at">' + sent_at_html + '</div>'
                  + '<div class="event-accepted-chat-text">'    + msg          + '</div>'
                + '</div>';

      return html;

    },
    renderEventPreview_Default: function(){

      var html = '<div class="event-preview">'
                   + '<div data-lid="e_prevew_default_text" class="event-preview-default">Aucun meefore n\'est prévu pour cette soirée. Soyez le premier à en proposer un. </div>'
                   + '<button  data-lid="e_preview_first_to_create" class="theme-btn btn-preview btn-create-event slow-down-3">Proposer un meefore pour cette soirée</div>'
                + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      
      return html.prop('outerHTML');

    },
    renderEventPreview_User: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button  data-lid="e_preview_participate" class="theme-btn btn-preview btn-requestin slow-down-3">Participer</div>'
      });

    },
    renderEventPreview_MemberAccepted: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button data-lid="e_preview_chat" class="theme-btn btn-preview btn-jumpto slow-down-3">Discuter</div>'
      });

    },
    renderEventPreview_MemberPending: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button data-lid="e_preview_pending" class="theme-btn btn-preview btn-jumpto slow-down-3">En attente</div>'
      });

    },
    renderEventPreview_Host: function( evt ){

      return LJ.fn.renderEventPreview( evt, {
        request_html: '<button data-lid="e_preview_manage" class="theme-btn btn-preview btn-jumpto slow-down-3">Organiser</div>'
      });

    },
    renderEventPreview: function( evt, options ){

      var options = options || {};
      var hosts_pictures_html, details_html, hosts_names = []

      /* Hosts pictures */
      hosts_pictures_html = '<div class="event-preview-hosts">';
      evt.hosts.forEach(function( host ){

        var display_params = LJ.cloudinary.events.map.hosts.params;
            display_params.version = LJ.fn.findMainImage( host ).img_version;

        var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
        
        var country = '<div class="user-flag"><span class="flag-icon flag-icon-' + host.country_code + '"></span></div>';
        hosts_pictures_html += '<div class="event-preview-host-picture" data-userid="' + host.facebook_id + '">' + img_tag + country +'</div>'

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

      // var ambiance_html = '<div class="event-preview-ambiance nonei">';
      // evt.ambiance.forEach(function( hashtag ){
      //   if( hashtag == '' ) return;
      //   ambiance_html += '<span class="event-preview-ambiance-hashtag">#</span><span class="event-preview-ambiance-name">' + LJ.fn.hashtagify(hashtag) + '</span>';
      // });
      // ambiance_html += '</div>';

      var date_html = '<div class="preview-date">'
                        + '<div class="preview-date-month">' + moment.monthsShort( moment( evt.begins_at ).month() ) + '</div>'
                        + '<div class="preview-date-day">' + moment( evt.begins_at ).format('DD/MM') + '</div>'
                    + '</div>';

      /* Request html */
      var request_html = options.request_html;

      details_html = '<div class="event-preview-details">'
                      + '<span class="preview-type">Meefore</span> '
                      + '<div class="event-preview-address"><i class="icon icon-location"></i>' + evt.address.place_name + ', ' + evt.address.city_name + '</div>'
                      + '<div class="event-preview-hosts-names"><i class="icon icon-users"></i>' + hosts_names.join('')    + '</div>'
                      // + ambiance_html
                    +'</div>';

      var html = '<div class="event-preview" data-eventid="' + evt._id + '">'
                    + date_html
                    + hosts_pictures_html
                    + details_html
                    + request_html
                + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      
      return html.prop('outerHTML');

    },
    renderPartyPreview_Event: function( party, options ){

      var options = options || {}; 

      var n = 0;
      LJ.cache.events.forEach(function( evt ){
        if( evt.party.address.place_id === party.address.place_id ){
          n++;
        }
      });


       details_html = '<div class="party-preview-details">'
                      + '<div class="party-preview-icon"><i class="icon party-icon icon-glass"></i></div>'
                      + '<div class="party-preview-place-name">' + party.address.place_name + ', ' + party.address.city_name + '</div>'
                      + '<div class="party-preview-details--sub">'
                        + '<div data-lid="e_preview_planned" class="party-preview-place-type"></div>'
                      + '</div>'
                    +'</div>';

      var html = '<div class="party-preview " data-placeid="' + party.address.place_id + '">'
                  //  + hosts_pictures_html
                    + details_html
                    // + '<button class="theme-btn btn-preview btn-requestin slow-down-3">Proposer un meefore</div>'
                + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      
      return html.prop('outerHTML').replace('%n', n );

    },
    renderPartyPreview_Party: function( party, options ){

      var options = options || {}; 

      var date_html = '<div class="preview-date">'
                        + '<div class="preview-date-month">' + moment.monthsShort( moment( party.begins_at ).month() ) + '</div>'
                        + '<div class="preview-date-day">' + moment( party.begins_at ).format('DD/MM') + '</div>'
                    + '</div>';

      var party_type = party.type;

       details_html = '<div class="party-preview-details">'
                      + '<div class="party-preview-picture" style="background-image:url(' + party.picture_url + ')"></div>'
                      + '<div class="party-preview-place-name">' + party.name + ',<br> ' + party.address.place_name + '</div>'
                      + '<div class="party-preview-details--sub">'
                        + '<div class="party-preview-place-type">Organisé par  ' + party.hosted_by + '</div>'
                        + '<div class="party-preview-attendees">' + party.attendees + ' personnes attendues</div>'
                      + '</div>'
                    +'</div>';

      var html = '<div class="party-preview " data-placeid="' + party.address.place_id + '">'
                  //  + hosts_pictures_html
                    + date_html
                    + details_html
                    // + '<button class="theme-btn btn-preview btn-requestin slow-down-3">Proposer un meefore</div>'
                + '</div>';

      return html;

    },
    renderMixityInFilters: function( mixity_arr ){

      // var html = '';
      //     mixity_arr.forEach(function(mixity){
      //       if( mixity.id != 'whatever' )
      //         html += '<div class="event-filter event-mixity slow-down-3" data-selectid="' + mixity.id + '">' + mixity.display + '</div>'
      //     });
      //   return html;

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
      var display_params = _.merge( params, { version: main_image.img_version } );
      var img_tag        = $.cloudinary.image( main_image.img_id, display_params ).prop('outerHTML');

      return img_tag;

    },
    renderEventSettings: function( evt ){

      var settings_options = [];
      ['open','suspended', 'canceled'].forEach(function( status ){
        var active = evt.status == status ? 'active' : '';
        settings_options.push(' data-status="' + status + '" class="event-settings-group-action ' + active + '" >');
      });

      var settings_html = [
          '<div class="event-inview-settings etiquette">',
            '<div class="event-settings-group settings-group-status">',
              '<div data-lid="ch_settings_status_label" class="event-settings-group-name">Statut du meefore</div>',
              '<div' + settings_options[0] + '<i class="icon icon-toggle-on"></i><span data-lid="ch_settings_status_open">Ouvert</span></div>',
              '<div' + settings_options[1] + '<i class="icon icon-toggle-off"></i><span data-lid="ch_settings_status_suspended">Suspendu/Complet</span></div>',
              '<div' + settings_options[2] + '<i class="icon icon-trash-empty"></i><span data-lid="ch_settings_status_canceled">Annulé</span></div>',
            '</div>',
            '<div class="event-settings-group settings-group-buttons">',
              '<button data-lid="ch_button_update" class="theme-btn btn-validate">Mettre à jour</button>',
              '<button data-lid="ch_button_cancel" class="theme-btn btn-cancel">Annuler</button>',
            '</div>',
          '</div>'
      ].join('');

      return settings_html;

    },
    renderUserInGroup: function( user, img_tag ){

      var country = '<div class="user-flag"><span class="flag-icon flag-icon-' + user.country_code + '"></span></div>';

      var html =  '<div class="event-accepted-user-state offline"></div>'
                      + '<div class="event-accepted-user-picture">' + img_tag + country +'</div>'
                      + '<div class="event-accepted-user-name">'    + user.name   + '</div>'
                      + '<div class="event-accepted-user-age">'     + user.age    + ' ans</div>'

      return html;

    },
    renderHostsGroup: function( hosts ){

      var hosts_html = '<div class="event-accepted-users-group" data-status="hosts" data-groupid="hosts">'
                            + '<div data-lid="ch_hosts" class="event-accepted-group-name">Organisateurs</div>';

      hosts.forEach(function( member ){

      var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
      hosts_html += '<div class="event-accepted-user" data-userid="'+member.facebook_id+'">'
                        + LJ.fn.renderUserInGroup( member, img_tag )
                      + '</div>';
      });

      hosts_html += '</div>';

      hosts_html = $(hosts_html);
      LJ.fn.setAppLanguage( LJ.app_language, hosts_html );

      return hosts_html.prop('outerHTML');


    },
    renderHostsGroupWithCog: function( hosts ){

      var hosts_html = '<div class="event-accepted-users-group" data-status="hosts" data-groupid="hosts">'
                            + '<i class="icon icon-event-settings icon-cog"></i>'
                            + '<div data-lid="ch_hosts" class="event-accepted-group-name">Organisateurs</div>';

      hosts.forEach(function( member ){

      var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
      hosts_html += '<div class="event-accepted-user" data-userid="'+member.facebook_id+'">'
                        + LJ.fn.renderUserInGroup( member, img_tag )
                      + '</div>';
      });

      hosts_html += '</div>';

      hosts_html = $(hosts_html);
      LJ.fn.setAppLanguage( LJ.app_language, hosts_html );

      return hosts_html.prop('outerHTML');

    },
    renderUsersGroup: function( group ){

      var group_members_facebook_id =  group.members_facebook_id;

      var mygroup  = group_members_facebook_id.indexOf( LJ.user.facebook_id ) != -1 ? 'mygroup' : '';
      var group_id = LJ.fn.makeGroupId( group_members_facebook_id );

      var user_group_html = '<div class="event-accepted-users-group ' + mygroup + '" data-status="' + group.status + '" data-groupid="' + group_id + '">'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user" data-userid="' + member.facebook_id + '">'
                          + LJ.fn.renderUserInGroup( member, img_tag )
                        + '</div>';
      });


      user_group_html += '</div>';

      return user_group_html;

    },
    renderUsersGroupWithToggle: function( group ){

     var group_id = LJ.fn.makeGroupId( _.pluck( group.members, 'facebook_id' ) );

     var toggle_mode = group.status == 'accepted' ? 'on' : 'off';

     var user_group_html = '<div class="event-accepted-users-group none" data-status="' + group.status + '" data-groupid="' + group_id + '">'
                            + '<i class="icon icon-toggle icon-toggle-' + toggle_mode + '"></i>'
                            + '<div class="event-accepted-group-name">' + group.name + '</div>';

      group.members.forEach(function( member ){

        var img_tag = LJ.fn.renderUserImgTag( member, LJ.cloudinary.events.group.params );
        user_group_html += '<div class="event-accepted-user" data-userid="' + member.facebook_id + '">'
                          + LJ.fn.renderUserInGroup( member, img_tag )
                        + '</div>';
      });


      user_group_html += '</div>';

      return user_group_html;

    },
    renderEventInview_Host: function( evt ){

      var html = '', hosts_html = '', groups_html = '', chatgroups_html = '', chat_wrap_html = '';

      var hosts_html = LJ.fn.renderHostsGroupWithCog( evt.hosts );

      // Render all group on the left panel, filtered by click on chatgroup after
      evt.groups.forEach(function( group ){
        groups_html += LJ.fn.renderUsersGroupWithToggle( group );
      });

      // Render chatgroup on the top 
      chatgroups_html += LJ.fn.renderChatGroup_Host();
      evt.groups.forEach(function( group, i ){
        chatgroups_html += LJ.fn.renderChatGroup_Group( group );
      });
      
      // Render a specific chat with chatid per group 
      chat_wrap_html += LJ.fn.renderChatWrap_Host_Host( evt._id );
      evt.groups.forEach(function( group, i ){
        chat_wrap_html += LJ.fn.renderChatWrap_Host_Group( evt._id, group );
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
                  + '<div class="backtomap"><i class="icon icon-minus"></i></div>'
                + '</div>'
                + LJ.fn.renderEventSettings( evt );

            + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatGroup_Group: function( group ){

      var html =  '<div class="event-accepted-chatgroup" data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '">'
                      + '<span>' + group.name + '</span>'
                      + '<span class="bubble none"></span>'
                   + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatGroup_Host: function(){

      var html =  '<div class="event-accepted-chatgroup" data-groupid="hosts" >'
                      + '<span data-lid="ch_hosts" > Organisateurs </span>'
                      + '<span class="bubble none"></span>'
                   + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
     renderChatWrap_Host_Host: function( event_id ){

      var html = '<div class="event-accepted-chat-wrap none" data-groupid="hosts" data-chatid="' + LJ.fn.makeChatId({ event_id:event_id, group_id: "hosts" }) + '">'
                        + '<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Host_Host()
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input data-lid="ch_placeholder" type="text" />'
                        + '<button data-lid="ch_button_send" class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatWrap_Host_Group: function( event_id, group ){

      var html = '<div class="event-accepted-chat-wrap none"'
                  + 'data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '"' 
                  + 'data-chatid="' + LJ.fn.makeChatId({ event_id: event_id, group_id: LJ.fn.makeGroupId( group.members_facebook_id ) }) + '">'
                    +'<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Host_Group( group )
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input type="text"/>'
                        + '<button data-lid="ch_button_send" class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatWrap_Group_Group: function( event_id, group ){

      var html = '<div class="event-accepted-chat-wrap none"'
                  + 'data-groupid="' + LJ.fn.makeGroupId( group.members_facebook_id ) + '"' 
                  + 'data-chatid="' + LJ.fn.makeChatId({ event_id: event_id, group_id: LJ.fn.makeGroupId( group.members_facebook_id ) }) + '">'
                    +'<div class="event-accepted-chat-messages">'
                        + LJ.fn.renderChatWrapNotification_Group_Group()
                      + '</div>'
                      + '<div class="event-accepted-chat-typing">'
                        + '<div class="readby" data-names=""></div>'
                        + '<input type="text"/>'
                        + '<button data-lid="ch_button_send" class="theme-btn">Envoyer</button>'
                      + '</div>'
                  + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatWrapNotification_Host_Host: function( ){

      var html = '<div data-lid="ch_first_msg_host_channel" class="super-centered event-accepted-notification-message">'
                          + 'Votre évènement a été créé avec succès.'
                          + '<br>'
                          + 'Vous pouvez discuter ici avec vos amis organisateurs en toute tranquilité. Ce chat '
                          + 'est reservé aux organisateurs.'
                        + '</div>';

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatWrapNotification_Host_Group: function( group ){

      var html = '<div class="super-centered event-accepted-notification-message"><div>'
                          + group.name 
                          + ' <span data-lid="ch_first_msg_host">a demandé à rejoindre votre meefore : </span></div>' 
                          + '<div class="event-accepted-group-message">' + group.message + '</div>'
                          + '<button data-lid="ch_request_validate" class="theme-btn btn-validate-group">Accepter ce groupe</button>'
                        + '</div>'
      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');

    },
    renderChatWrapNotification_Group_Group: function(){

      var html =  '<div data-lid="ch_first_msg_group" class="super-centered event-accepted-notification-message">'
                        + 'Votre demande a bien a été envoyée' 
                        + '<br>'
                        + 'Dès que l\'un des organisateurs vous aura accepté, vous aurez accès à la discussion.'
                      + '</div>'

      html = $(html);
      LJ.fn.setAppLanguage( LJ.app_language, html )
      return html.prop('outerHTML');
                      
    },
    renderEventTabview: function( evt ){


      var html = '<div class="event-accepted-tabview slow-down-3" data-eventid="' + evt._id + '">'
                      + '<i class="icon icon-tabview icon-accepted icon-chat"></i>'
                      + '<i class="icon icon-tabview icon-hosting icon-mindset"></i>'
                      + '<i class="icon icon-tabview icon-kicked icon-ellipsis"></i>'
                      + '<i class="icon icon-tabview icon-pending icon-ellipsis"></i>'
                      + '<span class="tabview-date-day">' + moment( evt.begins_at ).format('DD/MM') + '</span>'
                      + '<span class="tabview-place">' + evt.address.place_name + '</span>'
                      + '<span class="bubble none"></span>'
                  + '</div>';

      return html;

    },
    renderEventInview_User: function( evt ){

    var html = '', hosts_html = '', groups_html = '', chatgroups_html = '', chat_wrap_html = '', status = '';


      var hosts_html = LJ.fn.renderHostsGroup( evt.hosts );
      
      evt.groups.forEach(function( group ){

        if( group.members_facebook_id.indexOf( LJ.user.facebook_id ) != -1 ){

          groups_html += LJ.fn.renderUsersGroup( group );
          chatgroups_html += LJ.fn.renderChatGroup_Group( group );
          chat_wrap_html += LJ.fn.renderChatWrap_Group_Group( evt._id, group );
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
                  + '<div class="backtomap"><i class="icon icon-minus"></i></div>'
                + '</div>'
            + '</div>';

        return html;
    },
    renderEventInview_Intro: function( evt ){

    var html = '', hosts_html = '', groups_html = '', chatgroups_html = '', chat_wrap_html = '', status = '';

      var hosts_html = LJ.fn.renderHostsGroup( evt.hosts );
      var group = evt.groups[0];
      
        // groups_html += LJ.fn.renderUsersGroup( group );
        status = "accepted";

     

      var chat_wrap_html = '<div class="event-accepted-chat-wrap"'
                            + 'data-groupid=""' 
                            + 'data-chatid="chat-intro">'
                              +'<div class="event-accepted-chat-messages">'
                                  + LJ.fn.renderChatWrapNotification_Group_Group()
                                + '</div>'
                                + '<div class="event-accepted-chat-typing">'
                                  + '<div class="readby" data-names=""></div>'
                                  + '<input type="text"/>'
                                  + '<button data-lid="ch_button_send" class="theme-btn">Envoyer</button>'
                                + '</div>'
                            + '</div>';

      var chatgroups_html =  '<div class="event-accepted-chatgroup active" data-groupid="">'
                              + '<span>Intro</span>'
                              + '<span class="bubble none"></span>'
                           + '</div>';

      html += '<div data-eventid="' + evt._id + '" data-status="' + status + '" class="event-inview-intro row-events-accepted-inview" >'
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

        html = $(html);
        LJ.fn.setAppLanguage( LJ.app_language, html );
        return html.prop('outerHTML');
    },
    renderEventRequestIn: function( event_id ){

      var html = [

            '<div id="requestIn" data-eventid="'+event_id+'">',
                '<div class="row-input row-input-lg">',
                  '<div data-lid="e_request_title" class="modal-title">Demande de participation </div>',
                '</div>',
                 '<div class="row-input row-input-lg etiquette row-requestin-group-members">',
                  '<label data-lid="e_request_group_members" class="label label-lg" for="ri-groupmembers"></label>',
                  '<input data-lid="e_request_group_members_placeholder" id="ri-groupmembers type="text" placeholder="Choisissez les personnes avec qui vous comptez sortir"/>',
                '</div>',
                '<div class="row-input row-input-lg etiquette row-requestin-group-name">',
                  '<label data-lid="e_request_group_name" class="label label-lg" for="ri-groupname"></label>',
                  '<input data-lid="e_request_group_name_placeholder" id="ri-groupname" type="text" placeholder="Sera affiché dans le chat"/>',
                '</div>',
                 '<div class="row-input row-input-lg etiquette row-requestin-group-message">',
                  '<label data-lid="e_request_group_message" class="label label-lg" for="ri-groupmessage"></label>',
                  '<input data-lid="e_request_group_message_placeholder" id="ri-groupmessage" type="text" placeholder="Pourquoi faire un meefore avec vous et pas un autre groupe ?"/>',
                '</div>',
                '<div class="row-buttons visible">',
                  '<button data-lid="e_request_button_cancel" class="theme-btn btn-large btn-cancel right">Annuler</button>',
                  '<button data-lid="e_request_button_validate" class="theme-btn btn-large btn-validate btn-validate-modal right">Rejoindre ce meefore</button>',
                '</div>', 
            '</div>'

          ];

          html = $( html.join('') );
          LJ.fn.setAppLanguage( LJ.app_language, html )
          
          return html.prop('outerHTML');


    },
    renderItemInInput: function( str ){

       var html =  '<div class="rem-click item">'
                            + '<div class="item-name">' + str + '</div>'
                        +'</div>'

        return html;

    },
    renderItemInInput_Country: function( code ){

      code = code.toLowerCase();

      var html = '<div class="item item-country">'
                  + '<i class="flag-icon flag-icon-' + code + '"></i>'
                  + '<div data-lid="country_' + code +'" class="item-name">' + LJ.text_source[ "country_" + code ][ LJ.app_language ] + '</div>'
                + '</div>';
                
      return html;

    },
    renderItemInInput_GroupName: function( str ){

        var html = '<div class="rem-click item">'
                        + '<i class="icon icon-group-name icon-mindset"></i>'
                        + '<div class="item-name">' + str + '</div>'
                    +'</div>'

        return html;

    },
    renderItemInInput_GroupMessage: function( str ){

        var html = '<div class="rem-click item">'
                        + '<i class="icon icon-group-message icon-chat-1"></i>'
                        + '<div class="item-name">' + str + '</div>'
                    +'</div>'

        return html;

    },
    renderDatesInFilter: function(){

        var html = '';

        for( var i = 0; i < 6; i++ ){
          var date_l = moment.weekdaysShort( moment().add( i, 'day' ).day() );
          var date_n = moment().add( i, 'day' ).format('DD/MM');
          var date_id = moment().add( i, 'day' ).format('DD/MM/YYYY'); 
                  
          html += ['<div class="filter-date-item" data-dateid="' + date_id + '">',
                        '<span class="filter-date-item-weekday">' + date_l + '</span>',
                        '<span class="filter-date-item-numbday">' + date_n + '</span>',
                      '</div>'].join('');

          }

          return html;

    }
       
        
        

});