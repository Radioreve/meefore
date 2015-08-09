
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		getMaxWidthLabel: function(container){

			var labels = $(container).find('label');
			var widthArray = [];

			labels.each( function( i, el ){
				widthArray.push( $(el).innerWidth() );
			});

			var max = Math.max.apply( null, widthArray );
			console.log('Maximum label width : ' + max );
			return max;
		},
		adjustAllInputsWidth: function(container){

			var $container = $(container);
			var max = LJ.fn.getMaxWidthLabel( container );

			$container.find('label').each( function( i, label ){

				var $label = $(label);
				var $inp = $label.siblings('*:not(.inspire, .etiquette)');

				var label_width = max;
				var label_full_width = $label.outerWidth(true);
				var parent_width = $label.parent().width();

				$label.css({ width: label_width });
				$inp.css({ width: parent_width - label_full_width - 50 }); /* Mega hack, security margin */
				$inp.children('input').css({ width:'100%' });
			});
			
		},
		shortenString: function( options ){

			var options = options || {};

			if( !options.str && typeof( options.str ) != 'string' )
				return console.log('Invalid input for shorten string fn');

			var str      = options.str,
				end_tpl  = options.end_tpl || '';
				max_char = options.max_char || 5;

			return str.substr( 0, max_char ) + end_tpl;


		}

	});