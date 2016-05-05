	
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		state: 'hidden',

		init: function(){
				
			LJ.chat.handleDomEvents();
			return;

		},
		handleDomEvents: function(){

			$('.app__menu-item.--chats').on('click', LJ.chat.handleToggleChatWrap );
			$('.chat__close').on('click', LJ.chat.hideChatWrap );
			LJ.ui.$body.on('click');

		},
		handleToggleChatWrap: function( e ){

			e.preventDefault();
			var $s = $(this);

			$s.toggleClass('--active');
			LJ.chat.toggleChatWrap();


		},
		toggleChatWrap: function(){

			if( LJ.chat.state == 'hidden' ){
				LJ.chat.showChatWrap();

			} else {
				LJ.chat.hideChatWrap();

			}

		},
		showChatWrap: function(){
			
			LJ.chat.state == 'visible';
			
			var $c     = $('.chat');
			var d      = LJ.search.filters_duration;

			LJ.ui.shradeAndStagger( $c, {
				duration: d
			});
			

		},
		hideChatWrap: function(){

			LJ.chat.state == 'hidden';

			var $c  = $('.chat');
			var $cc = $c.children();
			var d   = LJ.search.filters_duration;

			[ $cc, $c ].forEach(function( $el, i ){
				$el.velocity('shradeOut', {
					duration: d,
					display : 'none'
				});
			});

		},


	});