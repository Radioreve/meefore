
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',
			'opening_duration': 1000,
			'completed_steps': 0,

			'data': {},

			init: function(){
				return LJ.promise(function( resolve, reject ){
					LJ.login.bindDomEvents( resolve, reject );
				});
			},
			bindDomEvents: function( resolve, reject ){
				$( LJ.login.$trigger_login ).on('click', resolve );
			},
			enterLoginProcess: function(){

				LJ.ui.showCurtain({
					duration: LJ.login.opening_duration
				});

				return LJ.delay( 1000 )
						 .then(function(){
						 	$( LJ.login.renderLoginProgression() )
								.appendTo( $('.curtain') )
								.hide()
								.velocity('fadeIn', {
									duration: 2000,
									delay: LJ.ui.opening_duration
								});
							return LJ.Promise.resolve();
						 });

			},
			finishLoginProcess: function(){

				LJ.log('Last step completed !');
				LJ.login.stepCompleted(100);

				$('.app').removeClass('nonei');
				$('.landing').remove();

				return LJ.delay(1000).then(function(){
					LJ.ui.hideCurtain({ duration: 900 });
				});

			},
			stepCompleted: function( fill_ratio ){

				fill_ratio = fill_ratio || 25;
				LJ.login.completed_steps += 1;
				LJ.login.fillProgressBar( fill_ratio );
			},
			fillProgressBar: function( fill_ratio ){

				var max_width = $('.login__progress-bar').width();
				var add_width = max_width * fill_ratio/100;
				var cur_width = (LJ.login.completed_steps) * add_width;
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