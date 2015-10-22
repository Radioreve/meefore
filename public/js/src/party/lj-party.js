
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		initParty: function(){

			// Render dom elements,
			LJ.fn.renderDomElements_Party();

			// Bind handlers
			LJ.fn.handleDomEvents_Party();
		},
		renderDomElements_Party: function(){

			$('.row-events-filters').append( LJ.fn.renderCreatePartyBtn );


		},
		handleDomEvents_Party: function(){

			$('.row-events-filters')
				.find('.btn-create-party')
				.click(function(){

					LJ.fn.displayCreateParty();

			});

			LJ.$body.on('focusout', '#createParty input[type="text"]', function(){

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

            LJ.$body.on('click', '#createParty .btn-validate', function(){

                if( $(this).hasClass('btn-validating') ) return;

                $(this).addClass('btn-validating');
                $('#createEvent').find('label').addClass('lighter');
                LJ.fn.showLoaders();
                LJ.fn.createParty();

            });


		},
		displayCreateParty: function(){

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
        handleCreatePartySuccess: function( party ){

            delog('Party successfully created');
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

        }


	});