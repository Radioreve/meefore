
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		getMaxWidthLabel: function(container){

			var labels = $(container).find('label');
			var widthArray = [];

			labels.each( function( i, el ){
				widthArray.push( $(el).width() );
			});

			var max = Math.max.apply( null, widthArray );
			console.log('Maximum label width : ' + max );
			return max;
		},
		adjustAllInputsWidth: function(container){

			var $container = $(container);
			var max = LJ.fn.getMaxWidthLabel( container );
			
			$container.find('label').each( function( i, label ){

				var label_width = max + 15;
				var $label = $(label);
					$label.css({ width: label_width });

				var label_full_width = $label.outerWidth(true);
				var parent_width = $label.parent().width();

				var $inp = $label.siblings('input[type="text"], div:not(.inspire)');
					$inp.css({ width: parent_width - label_full_width - 25 }); /* Mega hack, security margin */

			});
			

		}

	});