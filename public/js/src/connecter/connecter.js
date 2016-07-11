
	window.LJ.connecter = _.merge( window.LJ.connecter || {}, {

		online_users: [],

		init: function(){

			if( LJ.app_mode == "dev" ){
				return LJ.log("Mode is 'dev', not initializing the connecter system");
			}
			
			LJ.connecter.refreshOnlineUsers();
			LJ.connecter.handleDomEvents();
			return;

		},
		handleDomEvents: function(){

		},
		getUserStatus: function( facebook_id ){

			return LJ.connecter.online_users.indexOf( facebook_id ) == -1 ? "offline" : "online";

		},
		refreshOnlineUsers: function(){

			LJ.log('Refreshing online users...');
			var thirty_seconds = 30000;

			LJ.api.fetchOnlineUsers()
				.then(function( online_users ){

					$('.js-user-online').removeClass('--online');
					LJ.connecter.online_users = online_users;
					online_users.forEach(function( facebook_id ){

						$('.js-user-online[data-facebook-id="'+ facebook_id +'"]').addClass('--online');

					});

				})
				.then(function(){
					return LJ.delay( thirty_seconds )

				})
				.then(function(){
					return LJ.connecter.refreshOnlineUsers();

				})

		}

	});