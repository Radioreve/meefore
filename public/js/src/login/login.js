
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',
			'opening_duration': 500,

			init: function(){
				return LJ.promise(function( resolve, reject ){
					LJ.login.bindDomEvents( resolve, reject );
				});
			},
			bindDomEvents: function( resolve, reject ){
				$( LJ.login.$trigger_login ).on('click', resolve );
			},
			firstStepCompleted: function( facebook_token ){

				LJ.ui.showCurtain({
					duration: LJ.login.opening_duration
				});

				return LJ.delay( LJ.ui.opening_duration / 2 )
						 .then(function(){
						 	$( LJ.login.renderLoginProgression() )
								.appendTo( LJ.ui.$curtain )
								.velocity('transition.fadeIn');
							return LJ.Promise.resolve( facebook_token );
						 });

			},
			lastStepCompleted: function(){
				LJ.login.fillProgressBar(50);
			},
			stepCompleted: function( step_id ){
				LJ.login.fillProgressBar(25);
			},
			fillProgressBar: function( fill_ratio ){

				var max_width = $('.login__progress-bar').width();
				var cur_width = $('.login__progress-bar-bg').width();
				var add_width = max_width * fill_ratio/100;
				var new_width = cur_width + add_width;

				$('.login__progress-bar-bg')
					.css({ 'width':  new_width });

			},
			renderLoginProgression: function(){

				return LJ.ui.render([

					'<div class="login">',
						'<div class="login__message">',
							'<h1 data-lid="login_loading_msg"></h1>',
						'</div>',
						'<div class="login__progress-bar">',
							'<div class="login__progress-bar-bg"></div>',
						'</div>',
						// '<div class="login-steps">',
						// 	'<div class="login-steps__step">Etape 1</div>',
						// 	'<div class="login-steps__step">Etape 2</div>',
						// 	'<div class="login-steps__step">Etape 3</div>'
						// '</div>',
					'</div>'

				].join(''));

			}


	});