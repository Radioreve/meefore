	
	window.LJ = _.merge( window.LJ || {} , {

		typeahead: {
			users: {
				class_names: {
					input:'',
					hint:'',
					menu:'search-results',
					dataset:'search-wrap',
					suggestion:'search-result-users search-result',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			}
		}

	});


	window.LJ.fn = _.merge( window.LJ.fn || {} , 

	{
		initTypeaheadUsers: function(){

			var users = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/users?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			users.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized users'); })

			$('#search input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.users.class_names
			},
			{
				name:'users',
				display:'names',
				source: users.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound_Users,
					pending    : LJ.fn.renderTypeaheadPending_Users,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			});

		},
		initTypeaheadPlaces: function(){

			var places = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/places?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			places.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized places'); })

			$('.row-create-party-location').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.places.class_names
			},
			{
				name:'places',
				display:'names',
				source: places.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound_Places,
					pending    : LJ.fn.renderTypeaheadPending_Places,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Places
				}
			});

		},
		renderTypeaheadNotFound_Users: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.white_on_black.id;

			var message 		 = "Aucun résultats"

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result search-result-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadPending_Users: function(){

			var display_settings = LJ.cloudinary.search.user.params; 
				img_id  		 = LJ.cloudinary.placeholder.id;

			var message 		 = "Recherche..."

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result search-result-empty" >'
					   + '<div class="search-result-images">' 
				       		+ '<img class="search-loader super-centered" src="/img/495.gif" width="15">'
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadSuggestion_Places:  function( place ){

			var html = '<div class="place-result"'

		},
		renderTypeaheadSuggestion_Users: function( user ){

			var user_main_img = '', user_hashtags = '';

			var main_img = LJ.fn.findMainImage( user ),
				display_settings = LJ.cloudinary.search.user.params;
				display_settings.img_version = main_img.img_version;

			user_main_img = $.cloudinary.image( main_img.img_id, display_settings ).prop('outerHTML');

			user_hashtags += '<div>#' +  user.drink + '</div>';
			user_hashtags += '<div>#' +  user.mood + '</div>';

			var html = '<div data-userid="'+user.facebook_id+'">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       		+ '<img class="search-loader super-centered" src="/img/495.gif" width="15">'
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + user.name + '</div>'
				       + '<div class="search-result-hashtags">' + user_hashtags + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		}
	});