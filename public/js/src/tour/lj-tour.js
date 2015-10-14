
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		 initTour: function(){

        
        	var textProfile = "Tout commence par ton profile! Nom, âge, boisson préférée et c'est parti (1/3)";
        	var textEvents  = "Tous les before à venir sont visibles ici. Rien ne va? Propose en un! (2/3)";
        	var textSearch  = "Effectues des recherches à propos de n'importe quel membre (3/3)";

        	var html = '<ol id="intro">'
						+ '<li data-class="intro-item" data-id="profile">'+ textProfile +'</li>'
						+ '<li data-class="intro-item" data-id="events">' + textEvents  +'</li>'
						+ '<li data-class="intro-item" data-id="search">' + textSearch  +'</li>'
						+ '</ol>';

			$( html ).appendTo( $('body') );

			$('#intro').joyride({
				  'timer': 5500,                   
				  'nextButton': false,              
				  'tipAnimation': 'fade',           
				  'tipAnimationFadeSpeed': 1000,    
				  'postRideCallback': LJ.fn.handleTourEnded,      
				  'preStepCallback': LJ.fn.handleTourNextStep
			});

			$('.curtain').css({'display':'block'}).velocity({'opacity':[0.4,0]});
			$('.joyride-tip-guide').joyride('startTimer');

        },
        handleTourEnded: function(){

        	$('#profile').click();
        	$('.curtain').delay(700).velocity({opacity:[0,0.4]}, { 

        		complete:function(){ 
        			$('.curtain').css({'display':'none'});
                                
                                var img_place = 0;
                                var img_id    = LJ.cloudinary.placeholder.id;
                                var url       = 'https://graph.facebook.com/' + LJ.user.facebook_id + '/picture?width=180&height=180';

        			LJ.fn.updatePictureWithUrl({
        				userId: LJ.user._id,
        				url: url,
        				img_place: img_place,
                                        img_id: img_id
        			}, function( err, data ){

        				if( err ){
        				    return LJ.fn.handleServerError("La synchronisation avec Facebook a échouée.");
                                        }

        				LJ.fn.handleServerSuccess();
        				LJ.fn.toastMsg( LJ.text_source["to_welcome"][ LJ.app_language ],'info', 4000);

					$('#intro').remove();

					LJ.fn.replaceImage({
						img_id: data.img_id,
						img_version: data.img_version,
						img_place: 0,
						scope: ['profile','thumb']
					});

        			});
        	}});

        },
        handleTourNextStep: function(){
        	if( !LJ.state.touring )
        		return LJ.state.touring = true;
        	
        	$('.menu-item-active').next().click();

        }

	});