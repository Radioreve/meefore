
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminSocketEvents: function(){

			LJ.fn.on('fetch app data success', function( appData ){

				$('#onlineUsers > div').text( appData.onlineUsers.length );

			});

			LJ.fn.on('fetch last signup success', function( usersArray ){

				var L = usersArray.length,
					html = '';
				for( var i =0; i < L; i++)
				{
					html += LJ.fn.renderUser( {user: usersArray[i], wrap: 'adminWrap', myClass :'match'});
				}
				$('#lastRegisteredUsers').html( html );

			});

			LJ.fn.on('user connected', function(){ $('#onlineUsers > div').text( parseInt( $('#onlineUsers > div').text() ) + 1 ) });
			LJ.fn.on('user disconnected', function(){ $('#onlineUsers > div').text( parseInt( $('#onlineUsers > div').text() ) - 1 ) });

		},
		handleAdminDomEvents: function(){

			Mousetrap.bind('mod+m', function(e) {
				LJ.fn.toggleAdminPanel();
			});

		},
		initAdminInterface: function(){


			var html = '<div id="adminPanel">'
							+'<div id="liveTrack">'
								+'<div id="onlineUsers" class="wrap">'
									+'<div>25</div>'
									+'<span>users online</span>'
								+'</div>'
								+'<div id="lastRegisteredUsers" class="wrap">'									
									
								+'</div>'
							+'</div>'
						+'</div>';

			$('#adminPanelWrap').append( html );

		},
		fetchAppData: function(){

			LJ.params.socket.emit('fetch app data', LJ.user._id );

		},
		toggleAdminPanel: function(){

			var $panel = $('#adminPanelWrap');

			if( $panel.css('opacity') == 0 )
				return $panel.velocity('transition.fadeIn', { duration: 150 });

			$panel.velocity('transition.fadeOut', { duration: 150 });

		}


	});
