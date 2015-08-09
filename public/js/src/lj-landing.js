
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		initLandingPage: function(){

        	var data = [
        		{
        			'name':'Rue de lappe',
        			'hashtags': ["bastille","monop'","roquette"]
        		},
        		{
        			'name':'Hôtel de ville',
        			'hashtags': ['concerts',"bhv","crowd"],
        		},
        		{
        			'name':'Les quais de seine',
        			'hashtags': ['pakibière',"sunset","wine"]
        		},
        		{
        			'name':'Event Facebook',
        			'hashtags':['projetX','peutêtre','whatever']
        		},
        		{
        			'name':'La concrete',
        			'hashtags':['after','after','after','md','after']
        		},
        		{
        			'name':'Rue princesse',
        			'hashtags':[ 'lasoif','odéon','bedford','pousseaucrime']
        		},
        		{
        			'name':'Grands boulevards',
        			'hashtags':['étranger(e)s','help','me','out']
        		},
        		{
        			'name':'Westeros',
        			'hashtags':['danaerys','is','coming']
        		}
        	]

        	var names     = _.pluck( data, 'name' ),
        		hashtags  = _.pluck( data, 'hashtags' ),
        		maxLength = names.length,
        		i 		  = 0;  

        	$('html').css({ 'overflow': 'hidden' });
        	$('.hero-img').first()
        				  .addClass('active')
        				  .waitForImages(function(){

	        	$('.curtain').velocity('transition.fadeOut', { duration: 1000 });
	            $('.typed-text').typed({
	                strings: names,
	                typeSpeed: 200, 
	                backDelay: 4000,
	                loop:true,
	                preStringTyped: function(){

	                	/* Display text */
	                	var hashtags = data[i].hashtags, html = '';
	                	for( var j = 0; j < hashtags.length; j++){
	                		html +='<div class="hashtag">#'+hashtags[j]+'</div>';
	                	}
	                	$('.landing-hashtags').html( $(html) );
	                	$('.hashtag').velocity('transition.fadeIn',
	                		{ delay:1000,display:'inline-block', duration:2500
	                	}).delay( data[i].name.length * 250 ).velocity('transition.fadeOut', {duration:1000});

	                	/* Zoom in image */
	                	if( i == 0)
	                		return $('.hero-img.active').removeClass('scaled');

	                },
	                onStringTyped: function(){
	                	i == maxLength-1 ? i=0 : i++;
	                	setTimeout( function(){
	                		if( LJ.state.loggingIn ){
	                			$('.hero-img.active').removeClass('active').addClass('scaled');
	                			$('html').css({'overflow':'auto'});
	                			return 
	                		} 
	                		$('.curtain').velocity('transition.fadeIn', {
	                			duration: 1200, 
	                			complete: function(){ 
	                				$('.hero-img.active').removeClass('active').addClass('scaled');
	                				$('.hero-img.img-'+i).addClass('active');
	                				setTimeout(function(){ $('.hero-img.img-'+i).removeClass('scaled');
	                					$('.curtain').velocity('transition.fadeOut', {
	                						duration:1500
	                					});
	                				 }, 50 )
	                			}
	             			});
	                	}, 3500 ); 
	                }
	            });
			});

		}

	});