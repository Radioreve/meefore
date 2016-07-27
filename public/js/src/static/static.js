
	
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
				'access_name' : 'cheers_back_loader',
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
			},
			{ "access_name" : ":D", "image_id": "emoticon_smile" },
			{ "access_name" : "xD", "image_id": "emoticon_smilexd" },
			{ "access_name" : ";)", "image_id": "emoticon_blink" },
			{ "access_name" : ":p", "image_id": "emoticon_tongue" },
			{ "access_name" : "<3", "image_id": "emoticon_love" },
			{ "access_name" : ":%", "image_id": "emoticon_sun" },
			{ "access_name" : "-)", "image_id": "emoticon_bg" },
			{ "access_name" : ":o", "image_id": "emoticon_oh" },
			{ "access_name" : ":(", "image_id": "emoticon_sad" },
			{ "access_name" : ":â", "image_id": "emoticon_angel" },
			{ "access_name" : ":z", "image_id": "emoticon_zzz" },
			{ "access_name" : ":/", "image_id": "emoticon_noop" }
		],
		// Constructs a list of static pictures hosted on Cloudinary that are available
		// to use accross all others modules
		init: function(){

			LJ.static.cacheStaticImages();
			return;

		},
		cacheStaticImages: function(){

			LJ.static.images.forEach(function( img ){

				img.param = img.param || {};
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