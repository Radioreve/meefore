
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderTypeaheadNotFoundHosts: function(){

			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = "Aucun de tes amis n'a ce nom. Peut-être n'est-il pas encore inscrit? Invite-le!";


			var html = '<div class="search-result-default search-result-default-empty">'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name search-result-name-host">' + message + '</div>'
				       + '</div>'
				      +'</div>';

			return html;

		},
		renderTypeaheadNotFound: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = '<div data-lid="app_no_results_invite" >Aucun résultats</div>';
			var invite_btn       = '<div class="invite-friends"><i class="icon icon-facebook"></i><span data-lid="app_button_invite"></span></div>'

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result-default search-result-default-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       		+ '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				       + invite_btn
				      +'</div>';

			html = $(html);
			LJ.fn.setAppLanguage( LJ.app_language, html );
			return html.prop('outerHTML');

		},
		renderTypeaheadNotFound_Dark: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.white_on_black.id;

			var message 		 = '<div data-lid="app_no_results_invite" >Aucun résultats</div>';
			var invite_btn       = '<div class="invite-friends"><i class="icon icon-facebook"></i><span data-lid="app_button_invite"></span></div>'

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result-default search-result-default-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       		+ '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				       + invite_btn
				      +'</div>';

			html = $(html);
			LJ.fn.setAppLanguage( LJ.app_language, html );
			return html.prop('outerHTML');

		},
		renderTypeaheadPending: function(){

			var message 		 = LJ.text_source["app_searching_text"][ LJ.app_language ];
			var image_tag_loader = LJ.$spinner_loader.clone().addClass('search-loader').addClass('super-centered').prop('outerHTML');

			var html = '<div class="search-result-default search-result-default-empty" >'
					   + '<div class="search-result-images">' 
				       		+ image_tag_loader
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadBlank: function( data ){
			return '<div class="nonei"></div>';
		},
		renderTypeaheadSuggestion_Places:  function( place ){

			var html = '<div data-placeid="'+place._id+'">'
							+'<div class="place-data place-name">'+place.name+'</div>'
							+'<div class="place-data place-address">'+place.address+'</div>'
							+'<div class="place-data place-type">'+place.type+'</div>'
						+'</div>';

			return html;

		},
		renderTypeaheadSuggestion_Users: function( user ){

			var user_main_img = '', user_hashtags = '';

			var main_img = LJ.fn.findMainImage( user ),
				display_settings = LJ.cloudinary.search.user.params;
				display_settings.version = main_img.img_version;

			user_main_img = $.cloudinary.image( main_img.img_id, display_settings ).prop('outerHTML');

			if( user.job && user.job.length > 0 ){
				user_hashtags += '<div class="ambiance-hashtag adjust">#</div><div class="ambiance-name ">' +  user.job + '</div>';
			}

			user_hashtags += '<div class="ambiance-hashtag adjust">#</div><div class="ambiance-name">' +  user.age + '</div>';

			var image_tag_loader = LJ.$spinner_loader.clone().addClass('search-loader').addClass('super-centered').prop('outerHTML');

			var html = '<div data-userid="'+user.facebook_id+'">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       		+ image_tag_loader
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       		+ '<div class="search-result-name search-result-name--users">' + user.name + '</div>'
				       		+ '<div class="search-result-hashtags search-result-hashtags--users">' + user_hashtags + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		}
			
	});