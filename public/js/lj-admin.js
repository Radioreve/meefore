
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminEvents: function(){

			LJ.params.socket.on('fetch app data success', function( data ){

				/* Display data */

			});

		},
		initAdminInterface: function(){



		},
		fetchAppData: function(){

			LJ.params.socket.emit('fetch app data', LJ.user._id );

		}


	});
