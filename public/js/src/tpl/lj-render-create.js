
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderCreateEvent: function( options ){

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
                mixity.forEach(function(mixity,i){
                  var selected = '';
                  if( i == 0 ){
                    var selected = 'selected';
                  }
                  mixity_html += '<div class="row-select mixity ' + selected + '" data-selectid="' + mixity.id + ' ">'
                                      +'<i class="icon icon-mixity icon-' + mixity.icon_code + '"></i>'
                                      + mixity.display
                                    +'</div>';
                  });

              var html = '<div id="createEvent" class="">'
        
                        +'<div class="row-input row-input-lg">'
                         +'<div class="modal-title">Proposer un before </div>'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-friends">'
                          +'<label class="label label-lg" for="cr-friends">Organisateurs</label>'
                          +'<input class="" id="cr-friends" type="text" placeholder="Sélectionne parmis tes amis ( 3 max )">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-date">'
                          +'<label class="label " for="cr-date">Date du before</label>'
                          +'<input class="" readonly data-select="datepicker" id="cr-date" type="text" placeholder="Quel jour?">'
                        +'</div>'

                         +'<div class="row-input row-input-md etiquette row-create-hour">'
                          +'<label class="label " for="cr-hour">Heure du before</label>'
                          +'<input class="" readonly id="cr-hour" type="text" placeholder="Quel heure?">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-before-place">'
                          +'<label class="label " for="cr-before-place">Lieu du before</label>'
                          +'<input id="cr-before-place" type="text" placeholder="Quel quartier?">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-party-place">'
                          +'<label class="label label-lg" for="cr-party-place">Lieu de la soirée</label>'
                          +'<input id="cr-party-place" type="text" placeholder="Après le before, on enchaîne où ?">'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-ambiance">'
                          +'<label class="label label-lg" for="cr-ambiance">Ambiance</label>'
                          +'<input class"" id="cr-ambiance" type="text" placeholder="Hashtag ton before ( 5 max )">'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-age">'
                          +'<label class="label label-lg" for="cr-age">Âge souhaité</label>'
                          +'<div class="row-select-wrap agerange-wrap">'
                                + agerange_html
                          +'</div>'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-mixity">'
                          +'<label class="label label-lg" for="cr-mixity">Type d\'invités</label>'
                          +'<div class="row-select-wrap mixity-wrap">'
                                + mixity_html
                          +'</div>'
                        +'</div>'


                        +'<div class="row-buttons visible">'
                            +'<button class="theme-btn btn-large btn-cancel right">Annuler</button>'
                            +'<button class="theme-btn btn-large btn-validate right">Créer un before</button>'
                        +'</div>' 

                      +'</div>'

                      return html;
        },
        renderMeInInput: function(){

          var friend = LJ.user;

          /* Rendering friend thumb image */
            var img_id  = LJ.fn.findMainImage( friend ).img_id,
            img_version = LJ.fn.findMainImage( friend ).img_version;

            var display_options         = LJ.cloudinary.create.friends.params;
            display_options.img_version = img_version;

            var image_tag_friend = $.cloudinary.image( img_id, display_options ).removeClass('none').prop('outerHTML');
          
            var html =  '<label class="friend me" data-id="'+friend.facebook_id+'">'
                            + image_tag_friend
                            + '<div class="friend-name">' + friend.name + '</div>'
                        +'</label>'

            return html;


        },
        renderFriendInInput: function( friend ){

            /* Rendering friend thumb image */
            var img_id  = LJ.fn.findMainImage( friend ).img_id,
            img_version = LJ.fn.findMainImage( friend ).img_version;

            var display_options         = LJ.cloudinary.create.friends.params;
            display_options.img_version = img_version;

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
        renderBeforePlaceInCreate: function( place ){

            var place = LJ.fn.findPlaceAttributes( place );

            var html = '<div class="rem-click before-place" data-placeid="' + place.place_id + '" data-place-lat="' + place.lat + '" data-place-lng="' + place.lng + '">'
                            + '<i class="icon icon-before-place icon-location"></i>'
                            + '<div class="before-place-name"><span>' + place.place_name +'</span>,<span class="locality"> ' + place.city + ' </span></div>'
                        +'</div>'

            return html;

        },
        renderPartyPlaceInCreate: function( place ){

            var place = LJ.fn.findPlaceAttributes( place );

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
                            + '<div class="hour-name">' + hour + 'H' + min + '</div>'
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

	});