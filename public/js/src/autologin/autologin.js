	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			return LJ.promise(function( resolve, reject ){

				var ls = window.localStorage;
				if( !ls ||  (!ls.getItem('preferences') && !ls.getItem('reconn_data') ) ){
					return reject('No local data available, initializing lp...');
				}

				var preferences = JSON.parse( ls.getItem('preferences') );
				var reconn_data = JSON.parse( ls.getItem('reconn_data') );

				if( reconn_data ){
					LJ.log('Reconnecting user from previous loss of connexion...');
					LJ.login.data.access_token = reconn_data.long_lived_tk;
					ls.removeItem('reconn_data');
					return resolve();
				}

				tk_valid_until = preferences.tk_valid_until;
				long_lived_tk  = preferences.long_lived_tk;

				if( !tk_valid_until || !long_lived_tk ){
					return reject('Missing init preference param, initializing lp...');
				}

				if( moment( new Date(tk_valid_until) ) < moment() ){
					return reject('Long lived tk found but has expired, initializing lp...');
				} 


				var current_tk_valid_until = moment( new Date(tk_valid_until) );
				var now  = moment();

				var diff = current_tk_valid_until.diff( now, 'd' );
				if( diff < 30 ) {
					return reject('Long lived tk found but will expire soon, refresh is needed.');
				}

				LJ.log('Init data ok, auto logging in...');
				LJ.login.data.access_token = long_lived_tk;
				resolve( long_lived_tk );
							
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


