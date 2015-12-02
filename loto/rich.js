

	$(document).ready(function(){

		
		$.ajax({
			method:'get',
			url: '/data',
			beforeSend: function(){
				console.log('Fetching data...');
			},
			success: function( data ){

				console.log('Fetched');
				window.loto = data.data;

				// initLotoApp( loto.slice(50) );

			},
			error: function( xhr ){
				console.log( JSON.parse( xhr.responseText ) );
			}
		})


	});



	function initLotoApp( loto_data ){

		window.loto_balls = [];
		window.gap_distribution = [];

		for( var i=1; i < 50; i++ ){
			loto_balls.push({
				"no": i,
				"current_gap": 0
			});
		}

		loto_data.forEach(function( tirage ){

			var current_balls = [ tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5 ];

			loto_balls.forEach(function( el ){

				if( current_balls.indexOf( el.no ) != - 1 ){
					el.current_gap = 0;
				} else {
					el.current_gap += 1;
				}

			});


			loto_balls.forEach(function( el ){

				var gap = _.find( gap_distribution, function( gap ){
					return gap.value == el.current_gap
				});

				if( !gap ){
					gap_distribution.push({
						"value": el.current_gap,
						"n": 0
					});
				} else {
					gap.n += 1;
				}

			});


		});

	}