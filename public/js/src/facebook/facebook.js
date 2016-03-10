
	window.LJ.facebook = _.merge( window.LJ.facebook || {}, {

		init: function(){

			FB.init({
				appId: window.facebook_app_id,
				xfbml: true, // parse social plugins on this page
				version: 'v2.5' // use version 2.5
			});
			
		}

	});