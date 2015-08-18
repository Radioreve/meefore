
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderCreateEvent: function( options ){

          var agerange = options.agerange,
              mixity   = options.mixity;

            var agerange_html = '',
                mixity_html   = '';

                agerange.forEach(function(agerange,i){
                  var selected = '';
                  if( i == 0 ){
                    var selected = 'selected';
                  }
                  agerange_html += '<div class="row-select agerange ' + selected + '" data-selectid="' + agerange.id + ' ">'
                                      +'<i class="icon icon-agerange icon-' + agerange.icon_code + '"></i>'
                                      + agerange.display
                                    +'</div>';
                });

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
        
                        //+'<div class="row-create">'
                         // +'<h2>La prochaine soirée, elle commence chez toi !</h2>'
                       // +'</div>'
                        +'<div class="row-title-sub">'
                          +'Tous les befores rapportent 500pts lorsqu\'ils donnent lieu à une vraie rencontre'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-hosts">'
                          +'<label class="label label-lg" for="cr-hosts">Organisateurs</label>'
                          +'<input class="need-sanitize" id="cr-hosts" type="text" placeholder="Sélectionne parmis tes amis ( 3 max )">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-date">'
                          +'<label class="label " for="cr-date">Date du before</label>'
                          +'<input class="need-sanitize" readonly data-select="datepicker" id="cr-date" type="text" placeholder="Quel jour?">'
                        +'</div>'

                        +'<div class="row-input row-input-md etiquette row-create-before-place">'
                          +'<label class="label " for="cr-before-place">Lieu du before</label>'
                          +'<input id="cr-before-place" type="text" placeholder="Quel quartier?">'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-ambiance">'
                          +'<label class="label label-lg" for="cr-ambiance">Ambiance</label>'
                          +'<input class"need-sanitize" id="cr-ambiance" type="text" placeholder="Hashtag ton before ( 5 max )">'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-age">'
                          +'<label class="label label-lg" for="cr-age">Âge souhaité</label>'
                          +'<div class="row-select-wrap agerange-wrap">'
                                + agerange_html
                          +'</div>'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-mixity">'
                          +'<label class="label label-lg" for="cr-mixity">Invités</label>'
                          +'<div class="row-select-wrap mixity-wrap">'
                                + mixity_html
                          +'</div>'
                        +'</div>'

                        +'<div class="row-input row-input-lg etiquette row-create-party-place">'
                          +'<label class="label label-lg" for="cr-party-place">Soirée prévue</label>'
                          +'<input id="cr-party-place" type="text" placeholder="Après le before, on enchaîne où ?">'
                          //+'<div class="row-select-description etiquette">Aide nous à connaître ton état d\'esprit</div>'
                        +'</div>'

                        +'<div class="row-buttons visible">'
                            +'<button class="theme-btn btn-cancel right">Annuler</button>'
                            +'<button class="theme-btn btn-validate right">Créer!</button>'
                        +'</div>' 

                      +'</div>'

                      return html;
        },
        renderFriendInCreate: function( friend ){

            /* Rendering friend thumb image */
            var img_id          = LJ.fn.findMainImage( friend ).img_id,
                img_version     = LJ.fn.findMainImage( friend ).img_version,
                display_options = LJ.cloudinary.create.friends.params;
                display_options.img_version = img_version;

            var image_tag_friend = $.cloudinary.image( img_id, display_options ).prop('outerHTML');
            var image_tag_loader = LJ.$bar_loader.clone().addClass('host-loader').prop('outerHTML');

            var html =  '<div class="rem-click host" data-id="'+friend.facebook_id+'">'
                            + image_tag_friend
                            + image_tag_loader
                            + '<div class="host-name">' + friend.name + '</div>'
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

            var compo = place.address_components,
                locality = '',
                main_place = '';

                compo.forEach(function( el ){

                    if( el.types && el.types.indexOf('neighborhood') != -1 )
                        main_place = el.long_name;

                    if( el.types && el.types.indexOf('route') != -1 )
                        main_place = el.long_name;

                    if( el.types && el.types.indexOf('locality') != -1 )
                        locality = el.long_name;

                });

            if( main_place === '' )
              main_place = place.name;

            if( locality === '' )
              locality = '?'

            var html = '<div class="rem-click before-place" data-placeid="' + place.place_id + '">'
                            + '<i class="icon icon-before-place icon-location"></i>'
                            + '<div class="before-place-name"><span>'+ main_place +'</span>,<span class="locality"> ' + locality + ' </span></div>'
                        +'</div>'

            return html;

        },
        renderPartyPlaceInCreate: function( place ){

            var html = '<div class="rem-click party-place" data-placeid="' + place._id + '">'
                            + '<i class="icon icon-party-place icon-location"></i>'
                            + '<div class="party-place-name"><span>'+ place.name +'</span>,<span class="locality"> ' + place.type + ' </span></div>'
                        +'</div>'

            return html;

        },  
        renderDateInCreate: function( date ){

            var html =  '<div class="rem-click date">'
                            + '<i class="icon icon-date icon-clock"></i>'
                            + '<div class="date-name">' + date + '</div>'
                        +'</div>'

            return html;
        }

	});