
	window.LJ.connecter = _.merge( window.LJ.connecter || {}, {

		online_users: [],

		init: function(){

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

			LJ.api.fetchOnlineUsers()
				.then(function( online_users ){

					$('.js-user-online').removeClass('--online');
					LJ.connecter.online_users = online_users;
					online_users.forEach(function( facebook_id ){

						$('.js-user-online[data-facebook-id="'+ facebook_id +'"]').addClass('--online');

					});

				});

		}

	});