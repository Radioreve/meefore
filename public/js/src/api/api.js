
	window.LJ.api = _.merge( window.LJ.api || {}, {

		app_token_url: '/auth/facebook',

		init: function(){
			return LJ.promise(function( resolve, reject ){

				resolve();

			});
		},
		fetchAppToken: function( facebook_profile ){

			LJ.log('Fetching app token...');
			facebook_profile = facebook_profile || LJ.facebook_profile;
			
			return LJ.api.post( LJ.api.app_token_url, {
				facebook_profile: facebook_profile
			});

		},
		get: function( url, data ){	
			return LJ.promise(function( resolve, reject ){

				$.ajax({

					method: 'get',
					dataType: 'json',
					data: data,
					url: url,
					success: function( data ){
						console.log(data);
						resolve();
					},
					error: function( err ){
						reject( Error(err) );
					}

				});

			});
		},
		post: function( url, data ){
			return LJ.promise(function( resolve, reject ){

				$.ajax({

					method: 'post',
					data: data,
					dataType: 'json',
					url: url,
					success: function( data ){
						console.log(data);
						resolve();
					},
					error: function( err ){
						reject( Error(err) );
					}

				});

			});
		}

	});