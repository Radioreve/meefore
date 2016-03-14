	
	
	window.LJ.autologin = _.merge( window.LJ.autologin || {}, {

		init: function(){

			return LJ.promise(function( resolve ){

				return reject('Long lived tk found but will expire soon, refresh is needed.');

				var ls = window.localStorage;
				if( !ls ||  (!ls.getItem('preferences') && !ls.getItem('reconn_data') ) ){
					return reject('No local data available, initializing lp...');
				}


				var preferences = JSON.parse( ls.getItem('preferences') );
				var reconn_data = JSON.parse( ls.getItem('reconn_data') );

				if( reconn_data ){
					return resolve('Reconnecting user from previous loss of connexion...');
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

				return resolve('Init data ok, auto logging in...');
							
			});
		},
		startLogin: function(){
			return LJ.promise(function( resolve, reject ){
				console.log('Starting login...');
				resolve();
			});

		},
		startLanding: function(){
			return LJ.promise(function( resolve, reject ){
				console.log('Starting landing...');
				LJ.ui.hideCurtain({ duration: 500 })
			});
		}

	});


