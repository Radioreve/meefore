

	var validate = function( type ){

		if( type == 'event' )
			return require('./validate-modules/validate-events').validateEvent

		if( type == 'requestin' )
			return require('./validate-modules/validate-requestin').validateRequestIn

		if( type == 'facebook_id')
			return require('./validate-modules/validate-facebookid').validateFacebookId

	};

	_.mixin({
	    pluckMany: function() {
	        var array = arguments[0],
	            propertiesToPluck = _.rest(arguments, 1);
	        return _.map(array, function(item) {
	            return _.partial(_.pick, item).apply(null, propertiesToPluck);
	        });
		}
	});

	var expected_data_event = {
		hosts_facebook_id: {
			type: 'array',
			min_length: 2,
			subtype: {
				type: 'string'
			}
		},
		agerange: {
			type: 'string',
			among: ['1825','2530','30+','whatever']
		},
		mixity: {
			type: 'string',
			among: ['boys','girls','mixed','whatever']
		},
		address: {
			type: 'object',
			subtype: {
				place_id: {
					type: 'string',
				}
			}
		},
		begins_at: {
			type: 'string',
			custom: function(val){

			},
			regex: /^\d{2}\/\d{2}\/\d{2}$/,
		},
		ambiance: {
			type: 'array',
			max_length: 5,
			subtype: {
				type: 'string'
			}
		},
		scheduled_party: {
			type: 'object',
			subtype: {
				_id: {
					type: 'string'
				},
				age: {
					type: 'number'
				},
				books: {
					type: 'array',
					subtype: {
						name: {
							type: 'string'
						},
						nPage: {
							type: 'number'
						}
					}
				}
			}		
			
		}
	};

	function findPresenceErrors( data, expected_data, path){
		var presence_errors = [];

		_.keys( expected_data ).forEach(function( key ){

			if( !data[key] ){
				presence_errors.push({
					missing_key : key,
					path		: path
				});				
			}

			var passed_type = Array.isArray( data[key] ) ? 'array' : typeof( data[key] );
			if( data[key] && passed_type == 'array' && expected_data[key].type == 'array' && expected_data[key].min_length && expected_data[key].min_length > data[key].length ){
				presence_errors.push({
					missing_key : key,
					path        : path,
					note        : 'must contain at least ' + expected_data[key].min_length + ' items'
				});
			}
			if( data[key] && passed_type == 'array' && expected_data[key].type == 'array' && expected_data[key].max_length && expected_data[key].max_length < data[key].length ){
				presence_errors.push({
					missing_key : key,
					path        : path,
					note        : 'must contain at most ' + expected_data[key].max_length + ' items'
				});
			}

			/* Recursive call */
			if( data[key] && expected_data[key].type == 'object'){
				console.log('Searching for nested presence errors...');
				presence_errors = presence_errors.concat( findPresenceErrors( data[key], expected_data[key].subtype, key+'.' ) );
			}

		});

		return presence_errors;

	};

	function findTypeErrors( data, expected_data, path ){
		var type_errors = [];

		_.keys( expected_data ).forEach(function( key ){
			var passed_type = Array.isArray( data[key] ) ? 'array' : typeof( data[key] );
			var is_empty    = Array.isArray( data[key] ) && data[key].length == 0 || _.keys( data[key] ).length == 0 ? true : false;

			if( expected_data[key].type != passed_type )
				type_errors.push({
					passed_type   : passed_type,
					expected_type : expected_data[key].type,
					passed_value  : data[key],
					path		  : path && ( path + key ) || key
				});

			if( expected_data[key].type == 'array' && passed_type == 'array' ){
				console.log('Searching for nested type errors (array)');

				data[key].forEach(function( elem, i ){
					var passed_type = Array.isArray( elem ) ? 'array' : typeof( elem );

					if( expected_data[key].subtype.type != passed_type ){
						type_errors.push({
							expected_type : expected_data[key].subtype.type,
							path		  : path && ( path + key ) + '['+i+']' || key + '['+i+']',
							passed        : {
								value : elem,
								type  : passed_type 
							}
						});
					}			

					if( expected_data[key].subtype.type == 'object' && passed_type == 'object' ){
						type_errors = type_errors.concat( findTypeErrors( elem, expected_data[key].subtype.subtype, key+'['+i+'].') );
					}
				});
			}


			if( expected_data[key].type == 'object' ){
				console.log('Searching for nested type errors (object)');
				type_errors = type_errors.concat( findTypeErrors( data[key], expected_data[key].subtype, key+'.' ));
			}

		});

		return type_errors;
	};



	function extendedValidation(){

		console.log('Entering extended validation');

		return function( req, res, next ){

			var data = req.body;
			var expected_data   = expected_data_event;
			var presence_errors = findPresenceErrors( data, expected_data );
			var type_errors     = findTypeErrors( data, expected_data );

			var data_presence = [];
			presence_errors.forEach(function( presence_error ){
				data_presence.push( presence_error );
			});

			var data_type = [];
			type_errors.forEach(function( type_error ){
				data_type.push( type_error );
			});
			
			if( data_presence.length != 0 ){
				return res.json({
					type: "Presence error(s)",
					desc: "Some keys were expected and not found in the request parameters",
					data: data_presence
				});
			}

			if( data_type.length != 0 ){
				return res.json({
					type: "Type error(s)",
					desc: "Some parameters were passed with the wrong type.",
					data: data_type
				});
			}

			req.app_data = { name: "Léo" }
			next();
		}

	};


module.exports = {
	validate: validate,
	extendedValidation: extendedValidation
};