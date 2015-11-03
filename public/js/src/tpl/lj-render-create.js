
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderCreateEvent: function( options ){

          var options = options || {};
          
          var agerange = options.agerange,
              mixity   = options.mixity;

            var agerange_html = '',
                mixity_html   = '';

            /*    agerange.forEach(function(agerange,i){
                  var selected = '';
                  if( i == 0 ){
                    var selected = 'selected';
                  }
                  agerange_html += '<div class="row-select agerange ' + selected + '" data-selectid="' + agerange.id + ' ">'
                                      +'<i class="icon icon-agerange icon-' + agerange.icon_code + '"></i>'
                                      + agerange.display
                                    +'</div>';
                });
*/
                // mixity.forEach(function(mixity,i){
                //   var selected = '';
                //   if( i == 0 ){
                //     var selected = 'selected';
                //   }
                //   mixity_html += '<div class="row-select mixity ' + selected + '" data-selectid="' + mixity.id + ' ">'
                //                       +'<i class="icon icon-mixity icon-' + mixity.icon_code + '"></i>'
                //                       + mixity.display
                //                     +'</div>';
                //   });

              var html = '<div id="createEvent" class="">'
        
                        +'<div class="row-input row-input-lg">'
                         +'<div data-lid="e_create_title" class="modal-title">Proposer un meefore</div>'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-friends">'
                          +'<label data-lid="e_create_hosts" class="label label-lg" for="cr-friends">Organisateurs</label>'
                          +'<input data-lid="e_create_hosts_placeholder" class="" id="cr-friends" type="text" placeholder="Sélectionne parmis tes amis ( 3 max )">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-date">'
                          +'<label data-lid="e_create_begins_at" class="label " for="cr-date">Date du before</label>'
                          +'<input data-lid="e_create_begins_at_placeholder" class="" readonly data-select="datepicker" id="cr-date" type="text" placeholder="Quel jour?">'
                        +'</div>'

                         +'<div class="row-input row-input-md etiquette row-create-hour">'
                          +'<label data-lid="e_create_hour" class="label" for="cr-hour">Heure du before</label>'
                          +'<input data-lid="e_create_hour_placeholder" class="" readonly id="cr-hour" type="text" placeholder="Quel heure?">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-before-place">'
                          +'<label data-lid="e_create_address" class="label" for="cr-before-place">Lieu du meefore</label>'
                          +'<input data-lid="e_create_address_placeholder" id="cr-before-place" type="text" placeholder="Quel quartier?">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-party-place">'
                          +'<label data-lid="e_create_party" class="label label-lg" for="cr-party-place">Lieu de la soirée</label>'
                          +'<input data-lid="e_create_party_placeholder" id="cr-party-place" type="text" placeholder="Après le before, on enchaîne où ?">'
                        +'</div>'

                        // +'<div class="row-input row-input-lg etiquette row-create-ambiance">'
                        //   +'<label data-lid="e_create_ambiance" class="label label-lg" for="cr-ambiance">Ambiance</label>'
                        //   +'<input data-lid="e_create_ambiance_placeholder" class"" id="cr-ambiance" type="text" maxlength="40" placeholder="Hashtag ton before ( 5 max )">'
                        // +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-age">'
                          +'<label data-lid="e_create_agerange" class="label label-lg" for="cr-age">Âge souhaité</label>'
                          +'<div class="row-select-wrap agerange-wrap">'
                          + '<input class="" id="cr-agerange" type="range" min="' + LJ.settings.app.agerange_min + '" max="' + LJ.settings.app.agerange_max + '">'
                          +'</div>'
                        +'</div>'

                        // +'<div class="row-input row-input-lg etiquette row-create-mixity">'
                        //   +'<label data-lid="e_create_guests_type" class="label label-lg" for="cr-mixity">Type d\'invités</label>'
                        //   +'<div class="row-select-wrap mixity-wrap">'
                        //         + mixity_html
                        //   +'</div>'
                        // +'</div>'


                        +'<div class="row-buttons visible">'
                            +'<button data-lid="e_create_button_cancel" class="theme-btn btn-large btn-cancel right">Annuler</button>'
                            +'<button data-lid="e_create_button_validate" class="theme-btn btn-large btn-validate right">Créer un before</button>'
                        +'</div>' 

                      +'</div>'

                      html = $(html);
                      LJ.fn.setAppLanguage( LJ.app_language, $(html) )

                      return html.prop('outerHTML');
        },
        renderMeInInput: function(){

          var friend = LJ.user;

          /* Rendering friend thumb image */
            var img_id  = LJ.fn.findMainImage( friend ).img_id,
            img_version = LJ.fn.findMainImage( friend ).img_version;

            var display_options         = LJ.cloudinary.create.friends.params;
            display_options.version = img_version;

            var image_tag_friend = $.cloudinary.image( img_id, display_options ).removeClass('none').prop('outerHTML');
          
            var html =  '<div class="friend me" data-id="'+friend.facebook_id+'">'
                            + image_tag_friend
                            + '<div class="friend-name">' + friend.name + '</div>'
                        +'</div>'

            return html;


        },
        renderFriendInInput: function( friend ){

            /* Rendering friend thumb image */
            var img_id  = LJ.fn.findMainImage( friend ).img_id,
            img_version = LJ.fn.findMainImage( friend ).img_version;

            var display_options         = LJ.cloudinary.create.friends.params;
            display_options.version = img_version;

            var image_tag_friend = $.cloudinary.image( img_id, display_options ).removeClass('none').prop('outerHTML');
            var image_tag_loader = LJ.$bar_loader.clone().addClass('friend-loader').prop('outerHTML');

            var html =  '<div class="rem-click friend" data-id="'+friend.facebook_id+'">'
                            + image_tag_friend
                            + image_tag_loader
                            + '<div class="friend-name">' + friend.name + '</div>'
                        +'</div>'

            return html;


        },
        renderAmbianceInCreate: function( hashtag ){

            var html =  '<div class="rem-click ambiance">'
                            + '<div class="ambiance-hashtag">#</div>'
                            + '<div class="ambiance-name">' + hashtag + '</div>'
                        +'</div>'

            return html;
        },
        renderDefaultItem: function( string ){

           var html = ['<div class="rem-click default">',
                       '<div class="default-icon">#</div>',
                       '<div class="item-name default-name">' + string + '</div>',
                        '</div>'
                      ].join('');

            return html;

        },
        renderBeforePlaceInCreate: function( place ){

            var place = LJ.fn.findPlaceAttributes( place );

            if( !place ){
              return console.warn('No place object to render');
            }

            var html = '<div class="rem-click before-place" data-placeid="' + place.place_id + '" data-place-lat="' + place.lat + '" data-place-lng="' + place.lng + '">'
                            + '<i class="icon icon-before-place icon-location"></i>'
                            + '<div class="before-place-name"><span>' + place.place_name +'</span>,<span class="locality"> ' + place.city + ' </span></div>'
                        +'</div>'

            return html;

        },
        renderPartyPlaceInCreate: function( place ){

            var place = LJ.fn.findPlaceAttributes( place );

             if( !place ){
              return console.warn('No place object to render');
            }

            var html = '<div class="rem-click party-place" data-placeid="' + place.place_id + '" data-place-lat="' + place.lat + '" data-place-lng="' + place.lng + '">'
                            + '<i class="icon icon-before-place icon-location"></i>'
                            + '<div class="party-place-name"><span>' + place.place_name +'</span>,<span class="locality"> ' + place.city + ' </span></div>'
                        +'</div>'

            return html;

        },
        renderDateInCreate: function( date ){

            var html =  '<div class="rem-click date">'
                            + '<i class="icon icon-date icon-clock"></i>'
                            + '<div class="date-name">' + date + '</div>'
                        +'</div>'

            return html;
        },
        renderHourInCreate: function( hour, min ){

            var html =  '<div class="rem-click hour hour-fix">'
                            + '<i class="icon icon-date icon-clock"></i>'
                            + '<div class="hour-name">'
                             + '<span class="date-hour">' + hour + '</span>'
                             + 'H'
                             + '<span class="date-min">' + min + '</span></div>'
                        +'</div>'

            return html;
        },
        renderHourPicker: function( opts ){

          var hour_range = opts.hour_range;
          var min_range  = opts.min_range;

          var hours_html = '<div class="hp-hour">' + LJ.fn.formatHourAndMin( opts.default_hour[0] ) + '</div>'
          var min_html   = '<div class="hp-min">' + LJ.fn.formatHourAndMin( opts.default_hour[1] ) + '</div>'

          var html = [

            '<div class="hp-main">',
              '<div class="hp-layer">',
                '<div class="hp-upndown hp-upndown-left">',
                  '<i class="hp-icon hp-icon-up icon-up-dir"></i>',
                  '<i class="hp-icon hp-icon-down icon-down-dir"></i>',
                '</div>',
                '<div class="hp-hourwrap">',
                  hours_html,
                '</div>',
                '<div class="hp-spliter">',
                  opts.spliter,
                '</div>',
                '<div class="hp-minwrap">',
                  min_html,
                '</div>',
                '<div class="hp-upndown hp-upndown-right">',
                  '<i class="hp-icon hp-icon-up icon-up-dir"></i>',
                  '<i class="hp-icon hp-icon-down icon-down-dir"></i>',
                '</div>',
              '</div>',
            '</div>'

          ].join('');

          return html;

        },
        formatHourAndMin: function( hour ){
          if( hour < 10 ){
            return '0'+hour;
          } else {
            return ''+hour;
          }
        },
        renderCreatePartyBtn: function(){

            var html = [
                '<div class="row-events-filters-group filters-create-party">',
                    '<button class="theme-btn btn-create-party right">',
                        '<i class="icon icon-users"></i>',
                        '<span data-lid="e_create_party_button">Soirée partenaire</span>',
                    '</button>',
                '</div>'].join('');

            return html;

        },
        renderCreateParty: function( options ){

          var party_types = options.party_types;

            var party_types_html = '';
            party_types.forEach(function( type, i ){
              var selected = '';
              if( i == 0 ){
                var selected = 'selected';
              }
              party_types_html += '<div class="row-select party-type ' + selected + '" data-selectid="' + type.id + ' ">'
                                  +'<i class="icon icon-party-type icon-' + type.icon_code + '"></i>'
                                  + type.display
                                +'</div>';
              });

            var html = '<div id="createParty" class="">'
        
                +'<div class="row-input row-input-lg">'
                 +'<div class="modal-title">Proposer une soirée</div>'
                +'</div>'

                // Nom de la soirée
                +'<div class="row-input row-input-md etiquette row-create-party-name">'
                  +'<label class="label label-lg" for="cr-party-name">Nom de la soirée</label>'
                  +'<input class="" id="pa-name" type="text" placeholder="Nom de la soirée">'
                +'</div>'

                // Nom de l'organisation
                +'<div class="row-input row-input-md etiquette row-create-party-hosted-by">'
                  +'<label class="label label-lg" for="pa-hosted-by">Organisé par..</label>'
                  +'<input class="" id="pa-hosted-by" type="text" placeholder="Le Violondingue...">'
                +'</div>'

                  // Heure de début
                 +'<div class="row-input row-input-md etiquette row-create-party-hour-begin">'
                  +'<label class="label" for="pa-hour-begin">Heure de début</label>'
                  +'<input class="" id="pa-hour-begin" maxlength="5" minlength="5" type="text" placeholder="20h30">'
                +'</div>'

                // Heure de fin
                 +'<div class="row-input row-input-md etiquette row-create-party-hour-end">'
                  +'<label class="label" for="pa-hour-end">Heure de fin</label>'
                  +'<input class="" id="pa-hour-end"  maxlength="5" minlength="5" type="text" placeholder="6h00">'
                +'</div>'

                // Jour de la soirée
                +'<div class="row-input row-input-md etiquette row-create-party-date">'
                  +'<label class="label " for="pa-day">Date de la soirée</label>'
                  +'<input class="" id="pa-day"  maxlength="10" minlength="10" type="text" placeholder="24/12/2015">'
                +'</div>'

                // Nombre de personnes attendues
                +'<div class="row-input row-input-md etiquette row-create-party-attendees">'
                  +'<label class="label label-lg" for="pa-attendees">Taille de la soirée</label>'
                  +'<div class="row-select-wrap attendees-wrap">'
                  + '<input class="" id="pa-attendees" type="range">'
                  +'</div>'
                +'</div>'

                // Addresse de la soirée
                +'<div class="row-input row-input-lg etiquette row-create-party-place">'
                  +'<label class="label" for="pa-address">Lieu de la soirée</label>'
                  +'<input id="pa-address" type="text" placeholder="Quel endroit?">'
                +'</div>'

                // Lien de la photo (url)
                +'<div class="row-input row-input-lg etiquette row-create-party-picture">'
                  +'<label class="label " for="pa-picture">Photo URL</label>'
                  +'<input class="" id="pa-picture" type="text" placeholder="http://...">'
                +'</div>'

                // URL de la soirée 
                +'<div class="row-input row-input-lg etiquette row-create-party-link">'
                  +'<label class="label label-lg" for="pa-link">URL</label>'
                  +'<input class"" id="pa-link" type="text" placeholder="Lien externe ( http://... )">'
                +'</div>'


                // Type de soirée (pour la pin)
                +'<div class="row-input row-input-lg etiquette row-create-party-type">'
                  +'<label class="label label-lg" for="pa-type">Type de soirée</label>'
                  +'<div class="row-select-wrap party-type-wrap">'
                        + party_types_html
                  +'</div>'
                +'</div>'

                +'<div class="row-buttons visible">'
                    +'<button class="theme-btn btn-large btn-cancel right">Annuler</button>'
                    +'<button class="theme-btn btn-large btn-validate right">Créer une soirée</button>'
                +'</div>' 

              +'</div>'

                return html;
        }


	});