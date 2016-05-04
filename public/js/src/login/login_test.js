
	window.LJ.login = _.merge( window.LJ.login || {}, {

		test: {
			connectWithVictoriale: function(){

				var facebook_id  = '102066130199795';
				var access_token = 'CAAXR2Qo4lc4BAPiMRUTQITCZAAJj651bZBnHAQEjBUqYdlqxDTmoBlhfiYjODd5M2mCmDNkCa34l1ZAewhIuVQzRnbSTCIIu4XHjW8Y3yAtj9hckaY9zHuhqp6YKtSNe8DDPFPUN77ZA17ZAWtghTs5pF0j6bJE48kAlY8kUgbGWZBfiXhwLdyhLatE9wMK9sZD';

				LJ.login.data.access_token = access_token;
				LJ.start( access_token );

			},
			connectWithAngelah: function(){

				var facebook_id  = '108070099597465';
				var access_token = 'EAAXR2Qo4lc4BADaXgJQ42ojvzlKcgU4f6rfyaSpVK14ZABheWIkQnZAfHaRDrq40QpafTf7bWa9W3jReclU3D904pTEwz5wJ7ZB93xOIYBBYUIrSUuiewZBWVBQCZBHnKBcDCTkPt5J3IdgKohC2At9PQbPRwNq0ZD';

				LJ.login.data.access_token = access_token;
				LJ.start( access_token );

			}
		}

	});