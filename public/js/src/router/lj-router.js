	
	// Needs to be loaded before lj-ui

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		initRouter: function(){

			// Reference
			var wl = window.location;

			// Routing table to map each url to a button to click
			LJ.router = {
				me: {
					elem: '#profile'
				},
				events: {
					elem     : '#events',
					callback : function(){

					}
				},
				settings: {
					elem: '#settings'
				}
			};

			LJ.$body.on('click', '[data-hash]', function(e){

				var $self = $(this);

				// Prevent trigger state visit on parents
				e.stopPropagation();

				// Move the url to the current hash state
				var hash = $self.attr('data-hash');
				wl.hash = '#' + hash;

			});

			$( window ).on('hashchange', function(){

				var hash   = wl.hash.split('#')[1]
				var target = LJ.router[ hash ].elem; 

				$( target ).click();

			});

		}

	});