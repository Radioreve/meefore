
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderMapPreview: function( evt ){

			return '<div id="siteNotice">'+
				      '</div>'+
				      '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
				      '<div id="bodyContent">'+
				      '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
				      'sandstone rock formation in the southern part of the '+
				      'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
				      'south west of the nearest large town, Alice Springs; 450&#160;km '+
				      '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
				      'features of the Uluru - Kata Tjuta National Park. Uluru is '+
				      'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
				      'Aboriginal people of the area. It has many springs, waterholes, '+
				      'rock caves and ancient paintings. Uluru is listed as a World '+
				      'Heritage Site.</p>'+
				      '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
				      'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
				      '(last visited June 22, 2009).</p>'+
				      '</div>'+
				      '</div>';

		},
		attachMapPreviewToMarker: function( opts ){

			var evt = opts.evt;
			var mrk = opts.marker;

			if( !evt || !mrk ){
				return LJ.fn.warn('Cant attach window map view, missing parameter. evt: ' + evt + ', mrk: ' + mrk );
			}

			var new_map_preview = new google.maps.InfoWindow({
				content: LJ.fn.renderMapPreview( evt )
			});

			mrk.addListener('click', function(){
				new_map_preview.open( LJ.map, mrk );
			});

		}

	});