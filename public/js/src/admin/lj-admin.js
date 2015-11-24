
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		initAdminMode: function(){

			// Render dom elements,
			LJ.fn.renderDomElements_Admin();

			// Bind handlers
			LJ.fn.handleDomEvents_Admin();

		},
		renderDomElements_Admin: function(){
            
            $( LJ.fn.renderAdminPanel() )
                .appendTo( LJ.$body )
                .hide();

			$('.admin-parties')
                .append( LJ.fn.renderCreatePartyBtn );

            $('.admin-places')
                .append( LJ.fn.renderSearchPlacesBtn )
                .append( LJ.fn.renderCreatePlaceBtn );


		},
		handleDomEvents_Admin: function(){

            Mousetrap.bind('mod+m', function(e) {
                console.log('toggled');
                LJ.fn.toggleAdminPanel();

            });

			LJ.$body.on('click', '.admin-parties__btn', function(){
				LJ.fn.displayCreateParty();
			});

            LJ.$body.on('click', '.admin-places__btn', function(){
                LJ.fn.displayCreatePlace();
            });

			LJ.$body.on('focusout', '#createParty input[type="text"], .create-place input[type="text"]', function(){

				var $inp = $(this);
				var text = $inp.val();

				if( text.length < 2 ) return;

				LJ.fn.addItemToInput({
					html: LJ.fn.renderDefaultItem( text ),
					inp: this,
					max: 1
				});

				$inp.val('');

			});

			 LJ.$body.on('click', '.party-type', function(){

                var $self = $(this);
                $('.party-type').removeClass('selected');
                $self.addClass('selected');

            });

            LJ.$body.on('click', '.place-type', function(){

                var $self = $(this);
                $('.place-type').removeClass('selected');
                $self.addClass('selected');

            });

            LJ.$body.on('click', '#createParty .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                $(this).addClass('btn-validating');
                $('#createEvent').find('label').addClass('lighter');
                LJ.fn.showLoaders();
                LJ.fn.createParty();

            });

             LJ.$body.on('click', '.create-place .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                $(this).addClass('btn-validating');
                $('.create-place').find('label').addClass('lighter');
                LJ.fn.showLoaders();
                LJ.fn.createPlace();

            });


		},
		displayCreateParty: function(){

            LJ.fn.toggleAdminPanel();
            LJ.$body.one('click', '.modal-curtain', function(){
                LJ.fn.toggleAdminPanel();
            });

            LJ.fn.displayInModal({ 
                    source:'local',
                    starting_width: 600,
                    fix_height: -30,
                    custom_classes: ['text-left'],
                    render_cb: function(){
                        return LJ.fn.renderCreateParty({
                            party_types: LJ.settings.app.party_types
                        });
                    },
                    predisplay_cb: function(){

                        $('.row-events-map').hide();

                        /* Adjusting label & input width */
                        LJ.fn.adjustAllInputsWidth('#createParty');


                        /* Rangeslider */
                        $('#createParty').find('input[type="range"]').ionRangeSlider({

                            min           : LJ.settings.app.min_attendees,
                            max           : LJ.settings.app.max_attendees,
                            type          : "double",
                            min_interval  : 10,
                            drag_interval : true,
                            keyboard      : true,
                            from          : 50,
                            to            : 100,
                            max_postfix   : "+",
                            step 		  : 10
                        });

                        /* Google Places Autocomplete API */
                        LJ.fn.initGooglePlaces_CreateParty();

                    } 
                });
		},
        displayCreatePlace: function(){

            LJ.fn.toggleAdminPanel();
            LJ.$body.one('click', '.modal-curtain', function(){
                LJ.fn.toggleAdminPanel();
            });

            LJ.fn.displayInModal({ 
                    source:'local',
                    starting_width: 600,
                    fix_height: -30,
                    custom_classes: ['text-left'],
                    render_cb: function(){
                        return LJ.fn.renderCreatePlace({
                            place_types: LJ.settings.app.place_types
                        });
                    },
                    predisplay_cb: function(){

                        $('.row-events-map').hide();
   
                        /* Adjusting label & input width */
                        LJ.fn.adjustAllInputsWidth('.create-place');


                        /* Rangeslider */
                        $('.create-place').find('input[type="range"]').ionRangeSlider({

                            min           : 10,
                            max           : 500,
                            type          : "double",
                            min_interval  : 10,
                            drag_interval : true,
                            keyboard      : true,
                            from          : 50,
                            to            : 100,
                            max_postfix   : "+",
                            step          : 10
                        });

                        /* Google Places Autocomplete API */
                        LJ.fn.initGooglePlaces_CreatePlace();

                    } 
                });            

        },
        handleCreatePartySuccess: function( party ){

            LJ.fn.log('Party successfully created');
            LJ.cache.parties = LJ.cache.parties || [];
            LJ.cache.parties.push( party );

            LJ.fn.displayCurtain({ 

                behindTheScene: function(){

                    LJ.fn.hideModal();
                    LJ.fn.displayPartyMarker_Party( party );
                    LJ.map.panTo({ lat: party.address.lat, lng: party.address.lng });
                    LJ.map.setZoom( 15 );

                },
                static_delay: true,
                delay: 600,
                afterTheScene: function(){

                    LJ.fn.toastMsg( LJ.text_source["to_party_created_success"][ LJ.app_language ], 'info');

                }   
            });

        },
        handleCreatePlaceSuccess: function( place ){

            LJ.fn.log('Place successfully created');
            LJ.cache.places = LJ.cache.places || [];
            LJ.cache.places.push( place );

            LJ.fn.displayCurtain({ 

                behindTheScene: function(){

                    LJ.fn.hideModal();
                    // LJ.fn.displayPartyMarker_Party( party );
                    // LJ.map.panTo({ lat: party.address.lat, lng: party.address.lng });
                    // LJ.map.setZoom( 15 );

                },
                static_delay: true,
                delay: 600,
                afterTheScene: function(){                    

                    LJ.fn.toastMsg("L'établissement a été rajouté avec succès", 'info');
                    LJ.fn.toggleAdminPanel();
                    
                }   
            });

        },
        renderAdminPanel: function(){
            return LJ.fn.renderAdminElement('wrapper');
        },
        renderCreateParty: function( opts ){
            return LJ.fn.renderAdminElement('create_party_modal', opts );
        },
        renderCreatePlace: function( opts ){
            return LJ.fn.renderAdminElement('create_place_modal', opts );
        },
        renderCreatePlaceBtn: function(){
            return LJ.fn.renderAdminElement('create_place_btn');
        },
        renderCreatePartyBtn: function(){
            return LJ.fn.renderAdminElement('create_party_btn');
        },
        renderSearchPlacesBtn: function(){
            return LJ.fn.renderAdminElement('search_place_input');
        },
        toggleAdminPanel: function(){

            var $admin = $('.admin');
            var duration = 400;

            if( !$admin.length ){
                return LJ.fn.warn('Couldnt find admin panel',1);
            }

            if( $admin.hasClass('active') ){
                LJ.fn.log('Hiding admin panel', 1);
                $admin.removeClass('active')
                      .velocity('transition.slideLeftOut', { display: 'none', duration: duration });
            } else {
                LJ.fn.log('Showing admin panel', 1);
                $admin.addClass('active')
                      .velocity('transition.slideLeftIn', { display: 'flex', duration: duration });
            }


        },
        renderAdminElement: function( element, options ){

            var options = options || {};

            var html = [];

                if( element == "wrapper" ){

                    html = html.concat([
                        '<div class="admin">',
                            '<div class="admin-parties">',
                                '<div class="admin-parties__title">Soirées fixes</div>',
                            '</div>',
                            '<div class="admin-places">',
                                '<div class="admin-places__title">Clubs et bar dansants</div>',
                            '</div>',
                        '</div>'
                    ]);

                }

                if( element == 'create_party_btn' ){

                    html = html.concat([
                        '<button class="theme-btn admin-parties__btn">',
                            '<span data-lid="e_create_party_button">Ajouter soirée partenaire</span>',
                        '</button>'
                    ]);

                }


                if( element == 'create_place_btn' ){

                    html = html.concat([
                        '<button class="theme-btn admin-places__btn">',
                            '<span data-lid="e_create_party_button">Ajouter un lieu</span>',
                        '</button>'
                    ]);

                }


                if( element == 'search_place_input' ){

                    html = html.concat([
                        '<input type="text" placeholder="Le violondingue" class="admin-places__search-input"/>'
                    ]);

                }

                if( element == 'create_party_modal' ){

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

                    html = html.concat([ 
                        '<div id="createParty" class="">',
        
                            '<div class="row-input row-input-lg">',
                             '<div class="modal-title">Proposer une soirée</div>',
                            '</div>',

                            // Nom de la soirée
                            '<div class="row-input row-input-md etiquette row-create-party-name">',
                              '<label class="label label-lg" for="cr-party-name">Nom de la soirée</label>',
                              '<input class="" id="pa-name" type="text" placeholder="Nom de la soirée">',
                            '</div>',

                            // Nom de l'organisation
                            '<div class="row-input row-input-md etiquette row-create-party-hosted-by">',
                              '<label class="label label-lg" for="pa-hosted-by">Organisé par..</label>',
                              '<input class="" id="pa-hosted-by" type="text" placeholder="Le Violondingue...">',
                            '</div>',

                              // Heure de début
                             '<div class="row-input row-input-md etiquette row-create-party-hour-begin">',
                              '<label class="label" for="pa-hour-begin">Heure de début</label>',
                              '<input class="" id="pa-hour-begin" maxlength="5" minlength="5" type="text" placeholder="20h30">',
                            '</div>',

                            // Heure de fin
                             '<div class="row-input row-input-md etiquette row-create-party-hour-end">',
                              '<label class="label" for="pa-hour-end">Heure de fin</label>',
                              '<input class="" id="pa-hour-end"  maxlength="5" minlength="5" type="text" placeholder="6h00">',
                            '</div>',

                            // Jour de la soirée
                            '<div class="row-input row-input-md etiquette row-create-party-date">',
                              '<label class="label " for="pa-day">Date de la soirée</label>',
                              '<input class="" id="pa-day"  maxlength="10" minlength="10" type="text" placeholder="24/12/2015">',
                            '</div>',

                            // Nombre de personnes attendues
                            '<div class="row-input row-input-md etiquette row-create-party-attendees">',
                              '<label class="label label-lg" for="pa-attendees">Taille de la soirée</label>',
                              '<div class="row-select-wrap attendees-wrap">',
                               '<input class="" id="pa-attendees" type="range">',
                              '</div>',
                            '</div>',

                            // Addresse de la soirée
                            '<div class="row-input row-input-lg etiquette row-create-party-place">',
                              '<label class="label" for="pa-address">Lieu de la soirée</label>',
                              '<input id="pa-address" type="text" placeholder="Quel endroit?">',
                            '</div>',

                            // Lien de la photo (url)
                            '<div class="row-input row-input-lg etiquette row-create-party-picture">',
                              '<label class="label " for="pa-picture">Photo URL</label>',
                              '<input class="" id="pa-picture" type="text" placeholder="http://...">',
                            '</div>',

                            // URL de la soirée 
                            '<div class="row-input row-input-lg etiquette row-create-party-link">',
                              '<label class="label label-lg" for="pa-link">URL</label>',
                              '<input class"" id="pa-link" type="text" placeholder="Lien externe ( http://... )">',
                            '</div>',


                            // Type de soirée (pour la pin)
                            '<div class="row-input row-input-lg etiquette row-create-party-type">',
                              '<label class="label label-lg" for="pa-type">Type de soirée</label>',
                              '<div class="row-select-wrap party-type-wrap">',
                                     party_types_html,
                              '</div>',
                            '</div>',

                            '<div class="row-buttons row-buttons--modal visible">',
                                '<button class="theme-btn btn-large btn-cancel right">Annuler</button>',
                                '<button class="theme-btn btn-large btn-validate btn-validate-modal right">Créer une soirée</button>',
                            '</div>',

                        '</div>'
                    ]);

                }

                if( element == 'create_place_modal' ){

                    var place_types = options.place_types;
                    var place_types_html = '';

                    place_types.forEach(function( type, i ){
                      var selected = '';
                      if( i == 0 ){
                        var selected = 'selected';
                      }
                    place_types_html += '<div class="row-select place-type ' + selected + '" data-selectid="' + type.id + ' ">'
                                      +'<i class="icon icon-place-type icon-' + type.icon_code + '"></i>'
                                      + type.display
                                    +'</div>';
                    });

                    html = html.concat([ 
                        '<div class="create-place">',
        
                            '<div class="row-input row-input-lg">',
                             '<div class="modal-title">Ajouter un établissement</div>',
                            '</div>',

                           // Nom de l'établissement
                            '<div class="row-input row-input-lg etiquette create-place-name">',
                              '<label class="label label-lg">Nom de la soirée</label>',
                              '<input class="create-place-name__input" type="text" placeholder="Nom de l\'établissement">',
                            '</div>',

                            // Capacité de l'établissement
                            '<div class="row-input row-input-lg etiquette create-place-capacity">',
                              '<label class="label label-lg">Capacité</label>',
                              '<div class="row-select-wrap create-place-capacity-wrap">',
                               '<input class="create-place-capacity-wrap__input" type="range">',
                              '</div>',
                            '</div>',

                            // Addresse de l'établissement
                            '<div class="row-input row-input-lg etiquette create-place-address">',
                              '<label for="pl-address" class="label">Addresse</label>',
                              '<input id="pl-address" class="create-place-address_input" type="text" placeholder="Quel endroit?">',
                            '</div>',

                            // Link du website
                            '<div class="row-input row-input-lg etiquette create-place-link">',
                              '<label class="label">Lien</label>',
                              '<input class="create-place-link__input" type="text" placeholder="http://...">',
                            '</div>',

                            // Type de soirée (pour la pin)
                            '<div class="row-input row-input-lg etiquette create-place-type">',
                              '<label class="label label-lg" >Type</label>',
                              '<div class="row-select-wrap create-place-type-wrap">',
                                     place_types_html,
                              '</div>',
                            '</div>',

                            '<div class="row-buttons row-buttons--modal visible">',
                                '<button class="theme-btn btn-large btn-cancel right">Annuler</button>',
                                '<button class="theme-btn btn-large btn-validate btn-validate-modal right">Ajouter</button>',
                            '</div>',
                        '</div>'
                    ]);

                }


            return html.join('');


        }


	});