
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',

			init: function(){

				return LJ.promise(function( resolve, reject ){

					LJ.login.bindDomEvents( resolve, reject );
					
				});

			},
			bindDomEvents: function( resolve, reject ){

				$( LJ.login.$trigger_login ).on('click', resolve );

			}

	});