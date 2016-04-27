
	window.LJ.before = _.merge( window.LJ.before || {}, {

		generateHourRange: function( begin, stop, step ){

			if( !begin || !stop || !step ){
				return LJ.wlog('Cannot generate hour range without begin, stop and step params');
			}

			var html = [];
			var start_date = moment({ hour: begin });
			var stop_date  = moment({ hour: stop });

			if( stop_date < start_date ){
				stop_date.add( 1, 'day' );
			}

			while( start_date <= stop_date ){
				var s = start_date.format('HH:mm');
				html.push( s );
				start_date.add( step, 'minute' );
			}

			return html;

		},
		renderHourPicker: function( begin, stop, step ){

			var html_hours = LJ.before.generateHourRange( begin, stop, step );
			var html = [];

			html_hours.forEach(function( hs, i ){
				if( i == 0 ){
					html.push('<div class="hourpicker-col">');
					html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
				} else if ( i%4 == 0 ){
					html.push('</div><div class="hourpicker-col">');
					html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
				} else {
					html.push('<div class="hourpicker__hour" data-hour="'+ hs +'">'+ hs +'</div>');
				}
			});
			html.push('</div>');

			return LJ.ui.render([

				'<div class="hourpicker">',
					html.join(''),
				'</div>'

				].join(''));

		},
		showHourPicker: function(){

			$('.hourpicker').show();

		},
		hideHourPicker: function(){

			$('.hourpicker').hide();

		}

	});