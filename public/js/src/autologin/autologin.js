	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			return LJ.promise(function( resolve, reject ){

				if( document.location.hash == "#1" ){
					LJ.log('Logging in with test user Victoriale...');
					var tk = 'CAAXR2Qo4lc4BAPiMRUTQITCZAAJj651bZBnHAQEjBUqYdlqxDTmoBlhfiYjODd5M2mCmDNkCa34l1ZAewhIuVQzRnbSTCIIu4XHjW8Y3yAtj9hckaY9zHuhqp6YKtSNe8DDPFPUN77ZA17ZAWtghTs5pF0j6bJE48kAlY8kUgbGWZBfiXhwLdyhLatE9wMK9sZD';
					return resolve( tk );
				}

				if( document.location.hash == "#2" ){
					LJ.log('Logging in with test user Angelah...');
					var tk = 'EAAXR2Qo4lc4BADaXgJQ42ojvzlKcgU4f6rfyaSpVK14ZABheWIkQnZAfHaRDrq40QpafTf7bWa9W3jReclU3D904pTEwz5wJ7ZB93xOIYBBYUIrSUuiewZBWVBQCZBHnKBcDCTkPt5J3IdgKohC2At9PQbPRwNq0ZD';
					return resolve( tk );
				}

				if( document.location.hash == "#3" ){
					LJ.log('Logging in with test user Davida...');
					var tk = 'EAAXR2Qo4lc4BAMRzoOWoksFT356nRgJlU1pZBgNrX86FcWBpTRLXTJjznQjEBngLuca4IuqVB1T6Yg5u5FdqvoSZBfvNJZBxJRIRx2mkKF4cl3pBVVwJrskxfjU3j7wM9OvB5PvSBOU2wEYZCOqBC6coVCLS1eAZD';
					return resolve( tk );
				}

				// Quick reference to the local store
				var s = LJ.store;

				if( !s.get('facebook_access_token') ){
					return reject('No local data available, initializing lp...');
				}

				var facebook_access_token = s.get('facebook_access_token');

				var token      = facebook_access_token.token;
				var expires_at = facebook_access_token.expires_at;

				if( !token || !expires_at ){
					return reject('Missing init preference param, initializing lp...');
				}

				if( moment( expires_at ) < moment() ){
					return reject('Facebook token found but has expired, initializing lp...');
				} 

				var remaining_days  = moment( expires_at ).diff( moment(), 'd' );
				if( remaining_days < 30 ) {
					return reject('Facebook token found but will expire soon, refresh is needed.');
				}

				// Unexpected error
				if( s.get('reconnecting') && !token ){
					return reject('User trying to reconnect but missing token from local store (unexpected)');
				}

				// Check if the app is trying to reconnect him 
				if( s.get('reconnecting') && token ){
					LJ.log('Reconnecting user from previous loss of connexion...');
					s.remove('reconnecting');
					return resolve( token );
				}

				if( s.get("autologin") == "no" ){
					return reject("Autologin isnt activated, initializing lp...");
				}

				LJ.log('Init data ok, auto logging in...');
				resolve( token );
							
			});
		},
		startLogin: function( facebook_token ){
			return LJ.promise(function( resolve, reject ){
				LJ.log('Starting login...');
				LJ.start( facebook_token );
			});

		},
		startLanding: function( message ){
			return LJ.promise(function( resolve, reject ){
				LJ.log( message );
				LJ.log('Starting landing...');
				LJ.ui.hideCurtain({ duration: 500 })
			});
		}

	});


