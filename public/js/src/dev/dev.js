
	window.LJ.dev = _.merge( window.LJ.dev || {}, {

		n_cloudinary_api_calls: 0,
		t_login_process: 0,

		view_ids: {
			"before": "/img/ios/before.jpg",
			"chat"  : "/img/ios/chat.png",
			"chat_inview": "/img/ios/chat_inview.png",
			"request": "/img/ios/request.png"

		},
		init: function(){

			if( LJ.app_mode == "dev" ){

				Mousetrap.bind('command+c', LJ.dev.toggleColorPalette );
				Mousetrap.bind('command+v', function(){
					LJ.dev.toggleAppView();
				});
				
			}

		},
		toggleColorPalette: function(){

			if( $('.palette').length > 0 ){
				return $('.palette').toggleClass('nonei');
			}

			LJ.log('Showing color palette');
			var $div = $([
				'<div class="palette">',
					'<div class="palette__color x--gentle"></div>',
					'<div class="palette__color x--royal"></div>',
					'<div class="palette__color x--odebo"></div>',
					'<div class="palette__color x--mushia"></div>',
					'<div class="palette__color x--purplepills"></div>',
					'<div class="palette__color x--blueboy"></div>',
					'<div class="palette__color x--pinkirl"></div>',
					'<div class="palette__color x--greenected"></div>',
					'<div class="palette__color x--validateen"></div>',
				'</div>'
				].join('')
			);

			$div.appendTo('body');

		},
		toggleAppView: function( view_id ){

			if( $('.ios').length > 0 ){
				return $('.ios').toggleClass('nonei');
			}

		},
		showAppView: function( view_id ){

			if( $('.ios').length > 0 ){
				$('.ios').remove();
			}

			LJ.log('Showing ios view');
	      
	        var $div = $('<div class="ios"></div>');
	        var url = LJ.dev.view_ids[ view_id ];

	        if( !url ){
	            return LJ.wlog('Couldnt find the url');
	        }

	        var img = '<img width="100%" src="' + url + '"/>';
	        $div
	            .appendTo('body')
	            .hide()
	            .append( img )
	            .show();

		},
		showAppView__Before: function(){
			return LJ.dev.showAppView('before');
		},
		showAppView__Chat: function(){
			return LJ.dev.showAppView('chat');
		},
		showAppView__ChatInview: function(){
			return LJ.dev.showAppView('chat_inview');
		},
		showAppView__Request: function(){
			return LJ.dev.showAppView('request');
		}

	});