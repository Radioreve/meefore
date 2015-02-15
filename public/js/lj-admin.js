
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminSocketEvents: function(){

			LJ.params.socket.on('fetch app data success', function( data ){

				/* Display data */

			});

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
								+'<div id="menuViewers" class="wrap">'									
										+'<div class="menuViewersRow"><div>Profile</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Search</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Events</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Create</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Manage</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Contact</div><div class="menuViewersBar"></div></div>'
										+'<div class="menuViewersRow"><div>Settings</div><div class="menuViewersBar"></div></div>'
									+'</div>'
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
