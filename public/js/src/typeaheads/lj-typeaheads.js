	

	window.LJ = _.merge( window.LJ || {} , {

		typeahead: {
			users: {
				class_names: {
					input      :'',
					hint       :'',
					menu       :'search-results-users',
					dataset    :'search-wrap',
					suggestion :'search-result-default search-result-users',
					empty      :'empty',
					open       :'open',
					cursor     :'cursor',
					highlight  :'highlight'
				}
			},
			// places: {
			// 	class_names: {
			// 		input:'',
			// 		hint:'hint-places',
			// 		menu:'search-results-autocomplete search-results-party-places',
			// 		dataset:'search-wrap',
			// 		suggestion:'search-result-default search-result-party-places',
			// 		empty:'empty',
			// 		open:'open',
			// 		cursor:'cursor',
			// 		highlight:'highlight'
			// 	}
			// },
			friends: {
				class_names: {
					input      :'',
					hint       :'hint-places',
					menu       :'search-results-autocomplete search-results-friends',
					dataset    :'search-wrap',
					suggestion :'search-result-default search-result-friend',
					empty      :'empty',
					open       :'open',
					cursor     :'cursor',
					highlight  :'highlight'
				}
			},
			groups: {
				class_names: {
					input      :'',
					hint       :'hint-places',
					menu       :'search-results-autocomplete search-results-friends search-results-groups',
					dataset    :'search-wrap',
					suggestion :'search-result-default search-result-friend',
					empty      :'empty',
					open       :'open',
					cursor     :'cursor',
					highlight  :'highlight'
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
  				 	url: '/api/v1/users?token=' + LJ.fn.getToken() + '&name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	LJ.fn.log(res);
  				 }
			});

			users.initialize()
				 .done(function(){ })
				 .fail(function(){ LJ.fn.log('Bloodhound engine failed to initialized users'); })

			$('#search input').typeahead({
				hint: true,
				highlight: true,
				minLength: 2,
				classNames: LJ.typeahead.users.class_names
			},
			{
				name:'users',
				display:'name',
				source: users.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound_Dark,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			})
			.on('typeahead:select', function( ev, suggestion ){

				LJ.fn.displayUserProfile( suggestion.facebook_id );
				$(this).typeahead('val', '');

			});

		},
		initTypeaheadHosts: function( friends ){

			var friends = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 local: friends,
  				 transform: function(res){
  				 	LJ.fn.log(res);
  				 }
			});

			friends.initialize()
				 .done(function(){ })
				 .fail(function(){ LJ.fn.log('Bloodhound engine failed to initialized friends'); })

			var names = _.pluck( LJ.user.friends, 'name' );
			var results = _.shuffle( names ).slice( 0, _.max([ names.length, 3]) );

			function friendsWithDefaults( q, sync ){
				if( q == '' ){
					sync( friends.get( results ) );
				} else {
					friends.search( q, sync );
				}
			}

			$('.row-create-friends input').typeahead({
				hint: true,
				highlight: true,
				minLength: 0,
				classNames: LJ.typeahead.friends.class_names
			},
			{
				name:'friends',
				display:'name',
				source: friendsWithDefaults,
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			});

		},
		initTypeaheadGroups: function( friends ){

			var friends = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 local: friends,
  				 transform: function(res){
  				 	LJ.fn.log(res);
  				 }
			});

			friends.initialize()
				 .done(function(){ })
				 .fail(function(){ LJ.fn.log('Bloodhound engine failed to initialized friends groups'); })

			var names = _.pluck( LJ.user.friends, 'name' );
			var results = _.shuffle( names ).slice( 0, _.max([ names.length, 3]) );

			function friendsWithDefaults( q, sync ){
				if( q == '' ){
					sync( friends.get( results ) );
				} else {
					friends.search( q, sync );
				}
			}

			$('.row-requestin-group-members input').typeahead({
				hint: true,
				highlight: true,
				minLength: 0,
				classNames: LJ.typeahead.groups.class_names
			},
			{
				name:'friends',
				display:'name',
				source: friendsWithDefaults,
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound,
					pending    : LJ.fn.renderTypeaheadPending,
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
  				 	url: '/api/v1/places?token=' + LJ.fn.getToken() + '&name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	LJ.fn.log(res);
  				 }
			});

			places.initialize()
				 .done(function(){ })
				 .fail(function(){ LJ.fn.log('Bloodhound engine failed to initialized places'); })

			$('.row-create-party-place input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.places.class_names
			},
			{
				name:'places',
				display:'name',
				source: places.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Places
				}
			});

		}
		
	});