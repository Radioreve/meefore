
	_.merge( window.LJ.fn || {}, {

		toggleNotificationsPanel: function(){

			var $notif = $('.notifications');

			if( $notif.hasClass('active') ){
				$notif.removeClass('active').hide();
			} else {
				$notif.addClass('active').show();
			}

		},
		renderNotificationsElement: function( element, options ){

			var html = [];

            if( element == "wrapper" ){

                html = html.concat([
                    '<div class="admin">',
                        '<div class="admin-parties">',
                            '<div class="admin-parties__title">Soirées fixes</div>',
                        '</div>',
                        '<div class="admin-places">',
                            '<div class="admin-places__title">Clubs et bar dansants</div>',
                        '</div>',
                    '</div>'
                ]);

            }

            return html.join('');

		}


	});