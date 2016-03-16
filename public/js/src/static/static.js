
	
	window.LJ.static = _.merge( window.LJ.static || {}, {

		'images': [
			{
				'access_name': 'main_loader',
				'image_id' 	 : 'app_loader',
				'param'		 : { 'class': 'app__loader', 'width': 80 }
			}
		],
		// Constructs a list of static pictures hosted on Cloudinary that are available
		// to use accross all others modules
		init: function(){

			LJ.Promise.resolve()
					  .then( LJ.static.cacheStaticImages )

		},
		cacheStaticImages: function(){

			LJ.static.images.forEach(function( img ){

				img.param['cloud_name'] = 'radioreve';

				LJ.static[ '$' + img.access_name ] = $.cloudinary.image(
					img.image_id,
					img.param
				);


			});

		},
		getLoader: function( loader_id ){
			return $('.app__loader[data-loaderid="' + loader_id + '"]');
		},
		renderStaticImage: function( access_name ){

			return LJ.static[ '$' + access_name ].clone().prop('outerHTML');

		}

	});