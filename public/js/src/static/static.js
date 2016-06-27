
	
	window.LJ.static = _.merge( window.LJ.static || {}, {

		'images': [
			{
				'access_name' : 'main_loader',
				'image_id' 	  : 'app_loader',
				'param'		  : { 'class': 'app__loader', 'width': 80 }
			},
			{
				'access_name' : 'modal_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'       : { 'class': 'modal__loader', 'width': 32  }
			},
			{
				'access_name' : 'menu_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'       : { 'class': 'menu__loader', 'width': 32  }
			},
			{
				'access_name' : 'slide_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'       : { 'class': 'slide__loader', 'width': 32  }	
			},
			{
				'access_name' : 'search_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'       : { 'class': 'search__loader', 'width': 32  }	
			},
			{
				'access_name' : 'be_create_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'       : { 'class': 'be-create__loader', 'width': 32  }
			},
			{
				'access_name' : 'chat_loader',
				'image_id'    : 'loader_circular_blue_thin',
				'param'   	  : { 'class': 'chat__loader', 'width': 28  }
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
			var $l = $('.app__loader[data-loaderid="' + loader_id + '"]');

			if( $l.length != 1 ){
				return LJ.wlog('Unable to uniquely identify the loader with id : ' + loader_id +', length is : ' + $l.length );
			} else {
				return $l;
			}
		},
		renderStaticImage: function( access_name ){

			return LJ.static[ '$' + access_name ].clone().prop('outerHTML');

		}

	});