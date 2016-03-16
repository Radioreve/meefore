
window.LJ.facebook = _.merge( window.LJ.facebook || {}, {

	required_permissions: ['public_profile', 'email', 'user_friends', 'user_photos'],
	profile_url: '/me?fields=id,email,name,link,locale,gender',

	init: function(){

		LJ.Promise.resolve()
				  .then( LJ.facebook.startFacebookSdk );
		
	},
	startFacebookSdk: function(){

		FB.init({
			appId: window.facebook_app_id,
			xfbml: true, // parse social plugins on this page
			version: 'v2.5' // use version 2.5
		});

	},
	fetchFacebookToken: function(){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook token...');
			FB.login(function( res ){

				if( res.status == 'not_authorized' ){
					return reject( Error("User didnt let Facebook access informations") )
				}

				if( res.status == 'connected' ){
					var access_token = res.authResponse.accessToken;
					console.log('Short lived access token : ' + access_token.substring(0,20) + '.....');
					return resolve( res.authResponse.accessToken );
				}

			}, { scope: LJ.facebook.required_permissions } );
		});

	},
	fetchFacebookProfile: function( facebook_token ){
		return LJ.promise(function( resolve, reject ){

			LJ.log('Fetching facebook profile...');
			FB.api( LJ.facebook.profile_url, function( facebookProfile ){
				// Surcharge profile with access_token for server processing;
				facebookProfile.access_token = facebook_token;
				// Store it for reconnexion purposes
				LJ.facebook_profile = facebookProfile;
				return resolve( facebookProfile );

			});

		});

	},
	fetchMe: function(){

	}

});