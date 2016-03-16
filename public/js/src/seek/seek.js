	
	window.LJ.seek = _.merge( window.LJ.seek || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){

			});
		},
		activatePlacesInProfile: function(){

			var input = document.getElementById('profile-me__location');
			var options = { types: ['(cities)'] };

			LJ.seek.profile_places = new google.maps.places.Autocomplete( input, options );

			// To be able to isolate him from other place containers laters
			$('.pac-container:not(.seek-profile-places)').addClass('.seek-profile-places');

		},
		activatePlacesInFirstLogin: function(){

		}



	});