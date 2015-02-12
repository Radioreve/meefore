
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminEvents: function(){

			LJ.params.socket.on('fetch app data success', function( data ){

				/* Display data */

			});

		},
		handleAdminDomEvents: function(){

			Mousetrap.bind('shift+m', function(e) {
				LJ.fn.toggleAdminPanel();
			});

		},
		initAdminInterface: function(){

			var html = '';

			

		},
		fetchAppData: function(){

			LJ.params.socket.emit('fetch app data', LJ.user._id );

		},
		toggleAdminPanel: function(){

			var $panel = $('#adminPanel');

			if( $panel.css('opacity') == 0 )
				return $panel.velocity('transition.fadeIn', { duration: 150 });

			$panel.velocity('transition.fadeOut', { duration: 150 });

		}


	});
