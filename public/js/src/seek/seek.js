	
	window.LJ.seek = _.merge( window.LJ.seek || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

			});
		},
		activatePlacesInProfile: function(){	

			var input = document.getElementById('me__location');
			var options = { types: ['(cities)'] };

			LJ.seek.profile_places = new google.maps.places.Autocomplete( input, options );

			// To be able to isolate him from other place containers laters
			LJ.delay( LJ.randomInt(1,3)*100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-profile-places').addClass('js-alreadyhere');
			});


		},
		activatePlacesInFirstLogin: function(){

			var input = document.getElementById('init-location__input');
			var options = { types: ['(cities)'] };

			LJ.seek.login_places = new google.maps.places.Autocomplete( input, options );

			// To be able to isolate him from other place containers laters
			LJ.delay( LJ.randomInt(1,3)*100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-login-places').addClass('js-alreadyhere');
			});

		},
		activatePlacesInMap: function(){

			var input = document.getElementById('map-browser-input');
			var options = { types: ['(cities)'] };

			LJ.seek.map_browser_places = new google.maps.places.Autocomplete( input, options );

			// To be able to isolate him from other place containers laters
			LJ.delay( LJ.randomInt(1,3)*100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-map-browser-places').addClass('js-alreadyhere');
			});


		},
		activatePlacesInCreateBefore: function(){

			var input = $('.be-create-row.--location input')[0];
			var options = {};

			LJ.seek.be_create = new google.maps.places.Autocomplete( input, options );

			// To be able to isolate him from other place containers laters
			LJ.delay( LJ.randomInt(1,3)*100 ).then(function(){
				$('.pac-container:not(.js-alreadyhere)').addClass('seek-be-create').addClass('js-alreadyhere');
			});

		}



	});