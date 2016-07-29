
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		msg_queue: [],
		$toast_info 	: '<div class="toast toast--info" class="none">'
								+ '</span><span class="toast__msg"></span>'
							+'</div>',
		$toast_error	: '<div class="toast toast--error" class="none">'
								+'</span><span class="toast__msg"></span>'
							+ '</div>',
		$toast_success	: '<div class="toast toast--success" class="none">'
								+'</span><span class="toast__msg"></span>'
							+ '</div>',

		showToast: function( msg, type, show_duration ){

			if([ 'success', 'info', 'error' ].indexOf( type ) == -1 ){
				type = 'success';
			}

			if( type == 'error' ){
				show_duration = 4000;
			}

			if( $( '.toast' ).length === 0 ){	
				var $toast = $( LJ.ui['$toast_' + type ] );

				$toast.appendTo( LJ.ui.$body )
						.css({ 'transform': 'translateX(-50%)!important'})
						.find('.toast__msg').text( msg );

				$toast.velocity('slideDownIn', {
					duration : 600,
					display  : 'flex',
					complete : function(){
						
						$toast.velocity('slideUpOut', {
							duration: 300,
							delay: show_duration || 2000,
							complete: function(){
								$(this).remove();
								if( LJ.ui.msg_queue.length != 0 )
									LJ.ui.showToast( LJ.ui.msg_queue[0].msg, LJ.ui.msg_queue[0].type );
								    LJ.ui.msg_queue.splice( 0, 1 ) //remove le premier élément
							}
							});						
					  }
				});
			}
			else {
				LJ.ui.msg_queue.push({ 
					msg: msg, 
					type: status 
				});
			}
		}

	});