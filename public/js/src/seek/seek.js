	
	window.LJ.seek = _.merge( window.LJ.seek || {}, {

		init: function(){

			return LJ.seek.activatePlacesInProfile()

				.then(function(){
					return LJ.delay( 100 );

				})
				.then(function(){
					return LJ.seek.activatePlacesInMap()
					
				})
				.then(function(){
					return LJ.delay( 100 );

				})
				.then(function(){
					return LJ.seek.activatePlacesInCreateBefore();

				});


		},
		activatePlacesInProfile: function(){	

			var input = document.getElementById('me__location');
			var options = { types: ['(cities)'] };

			// To be able to isolate him from other place containers laters
			LJ.seek.profile_places = new google.maps.places.Autocomplete( input, options );
			return LJ.delay( 100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-profile-places').addClass('js-alreadyhere');
				return;
			});


		},
		activatePlacesInFirstLogin: function(){

			var input = document.getElementById('init-location__input');
			var options = { types: ['(cities)'] };

			// To be able to isolate him from other place containers laters
			LJ.seek.login_places = new google.maps.places.Autocomplete( input, options );
			return LJ.delay( 100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-login-places').addClass('js-alreadyhere');
				return;
			});

		},
		activatePlacesInMap: function(){

			var input = document.getElementById('map-browser-input');
			var options = {}; // { types: ['(cities)'] };

			// To be able to isolate him from other place containers laters
			LJ.seek.map_browser_places = new google.maps.places.Autocomplete( input, options );
			return LJ.delay( 100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-map-browser-places').addClass('js-alreadyhere');
				return;
			});


		},
		activatePlacesInCreateBefore: function(){

			var input = $('.be-create-row.--location input')[0];
			var options = {};


			// To be able to isolate him from other place containers laters
			LJ.seek.be_create = new google.maps.places.Autocomplete( input, options );
			return LJ.delay( 100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-be-create').addClass('js-alreadyhere');
				return;
			});

		}



	});