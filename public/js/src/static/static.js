
	
	window.LJ.static = _.merge( window.LJ.static || {}, {

		'images': [
			{
				'access_name': 'main_loader',
				'image_id' 	 : 'main_loader',
				'param'		 : { 'class': 'this is it', 'width': 25 }
			}
		],
		// Constructs a list of static pictures hosted on Cloudinary that are available
		// to use accross all others modules
		init: function(){

			LJ.Promise.resolve()
					  .then( LJ.cacheStaticImages )

		},
		cacheStaticImages: function(){

			LJ.static.images.forEach(function( img ){

				img.param['cloud_name'] = 'radioreve';

				LJ.static[ '$' + img.access_name ] = $.cloudinary.image(
					img.image_id,
					img.param
				);


			});

		}

	});