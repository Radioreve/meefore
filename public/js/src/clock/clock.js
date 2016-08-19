
	window.LJ.clock = _.merge( window.LJ.clock || {}, {

		timer: null,
		init: function(){

			LJ.clock.start();

		},
		run: function run(){

			if( LJ.clock.status == "stop" ){
				return clearTimeout( LJ.clock.timer );
			}

			LJ.clock.timer = setTimeout(function(){

				var m = moment();

				LJ.emit("clock", {
					hours   : m.get('hours'),
					minutes : m.get('minutes'),
					seconds : m.get('seconds')
				});

				LJ.clock.run();

			}, 1000 );
			
		},
		start: function(){

			LJ.clock.status = "start";
			LJ.clock.run();

		},
		stop: function(){
			LJ.clock.status = "stop";
			LJ.clock.run();

		}

	});