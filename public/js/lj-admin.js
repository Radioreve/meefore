
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminMode: function(){

			LJ.myChannels['admin'] = LJ.pusher.subscribe('admin');
			LJ.fn.initAdminInterface();
			LJ.fn.handleAdminDomEvents();
			LJ.fn.fetchAppData();

			LJ.myChannels['admin'].bind('refresh-users-conn-states', function(data){
				console.log('Refreshing online users list');
				$('#onlineUsers > div').text( _.keys( data.onlineUsers ).length );
			});

		},
		fetchAppData: function(){

			var eventName = 'fetch-app-data',
				data = {},
				cb = {
					success: LJ.fn.handleFetchAppDataSuccess,
					error: function(xhr){ console.log('Error fetching [admin] mode'); }
				}

			LJ.fn.say( eventName, data, cb ); 

		},
		handleFetchAppDataSuccess: function( data ){
			

			/* Afficher les derniers users inscrits */
			var usersArray = data.lastRegisteredUsers;

			var L = usersArray.length,
				html = '';
			for( var i =0; i < L; i++){
				html += LJ.fn.renderUser( {user: usersArray[i], wrap: 'adminWrap', myClass :'match'});
			} 
			$('#lastRegisteredUsers').html( html );

		},
		handleAdminDomEvents: function(){

			Mousetrap.bind('mod+m', function(e) {
				LJ.fn.toggleAdminPanel();
			});

		},
		initAdminInterface: function(){

			var liveTrackHTML = '<div id="lastRegisteredWrap" class="adm-col">'
									+'<div id="onlineUsers" class="col-head wrap">'
										+'<div>0</div>'
										+'<span>users online</span>'
									+'</div>'
									+'<div id="lastRegisteredUsers" class="col-body wrap">'									
										
									+'</div>'
								+'</div>';

			var botsWrapHTML = '<div id="botsWrap" class="adm-col">'
									+'<div id="onlineBots" class="col-head wrap">'
										+'<div>0</div>'
										+'<span>bots online</span>'
									+'</div>'
									+'<div class="col-body">'
										//...
									+'</div>'
								+'</div>';

			var html = '<div id="adminPanel">'
							+ liveTrackHTML
							+ botsWrapHTML;
						+'</div>';


			$('#adminPanelWrap').append( html );

		},
		toggleAdminPanel: function(){

			var $panel = $('#adminPanelWrap');

			if( $panel.css('opacity') == 0 )
				return $panel.velocity('transition.fadeIn', { duration: 150 });

			$panel.velocity('transition.fadeOut', { duration: 150 });

		}


	});
