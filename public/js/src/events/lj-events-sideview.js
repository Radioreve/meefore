	
	window.LJ.param = _.merge( window.LJ.param || {

		// Param specific 

	});

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		testSideview: function(){

			console.log('Testing init sideview...');
			LJ.fn.initSideview();

			var html = '';
			LJ.cache.events.forEach(function(evt){
				html += LJ.fn.renderEventSideview_User( evt );
			});

			$('.js-sideview-events').append( html );


		},
		initSideview: function(){

			var wrap_html = LJ.fn.renderSideview_Wrap();
				
			$( wrap_html ).appendTo('body')
						  .velocity('transition.fadeIn', {
						  	duration: 500
						  });

		},
		handleDomEvents_Sideview: function(){



		},
		showSideview: function(){



		},
		hideSideview: function(){

		},
		toggleSideview: function(){

		}

	});	

	LJ.$body.on('display:layout:after', function(){
		// LJ.fn.timeout(1000, LJ.fn.testSideview );
	})