
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

		/* La base! */
	_.mixin({
	    pluckMany: function() {
	        var array = arguments[0],
	            propertiesToPluck = _.rest(arguments, 1);
	        return _.map(array, function(item) {
	            return _.partial(_.pick, item).apply(null, propertiesToPluck);
	        });
		}
	});

	function validateRequestInTypes( data ){

		var type_errors = [];
		[ 'event_id', 'group']
		.forEach(function( key ){

			var val = data[key];
			var passed_type = Array.isArray( val ) ? 'array' : typeof( val );
			var empty       = Array.isArray( val ) && val.length == 0 || _.keys( val ).length == 0 ? 'empty ' : '';
			var base_error = { empty: empty, field: key, passed_type: passed_type };

			if( ['event_id']
					.indexOf( key ) != -1 && typeof( val ) != 'string' ){					
					type_errors.push( _.merge( { required_type: 'string' }, base_error ) );
				}

			if( ['group']
					.indexOf( key ) != -1  && ( Array.isArray( val ) || typeof( val ) != 'object' || _.keys( val ).length == 0 ) ){
					type_errors.push( _.merge( { required_type: 'non empty object' }, base_error ) );
				}

		});

		return type_errors;

	};


	function validateRequestInValues( data ){

		var value_errors = [];

		[ 'event_id', 'group']
		.forEach(function( key ){
			var val = data[key];

			if( key === 'group' )
			{	
				var wrong_ids 	  = [];
				_.pluck( val.members, 'facebook_id' ).forEach(function( fb_id ){
					if( !/^\d{10,}$/.test( fb_id ) )
						wrong_ids.push( fb_id );
				});
				var n_wrong_ids = wrong_ids.length;
				if( n_wrong_ids != 0 ){
					var required_values = ['15 digit integers.'];
					value_errors.push({ required_values: required_values, passed_value: val, field: key });	
				}

				if( typeof( val.name ) != 'string' || !/^[0-9a-zA-Z\s\&]{4,20}$/.test( val.name ) ){
					var required_values = ['string between 4 and 15 chars'];
					value_errors.push({ required_values: required_values, passed_value: val.name, field: 'group.name' });
				}

				if( typeof( val.message ) != 'string' || !/^[0-9a-zA-Z\s\&]{4,50}$/.test( val.message ) ){
					var required_values = ['string between 4 and 50 chars'];
					value_errors.push({ required_values: required_values, passed_value: val.message, field: 'group.message' });
				}
			}

			if( key === 'group' && _.uniq( _.pluck( data[ key ].members, 'facebook_id') ).length < settings.app.min_group )
			{
				var required_values = [settings.app.min_group + ' members minimum'];
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'event_id' && !/^[a-z0-9]{24}$/.test( val )  )
			{
				var required_values = [' \'_id\' key as valid bson( eg: 55c613b3eb8ced441405a3a6 )']
				value_errors.push({ required_values: required_values, passed_value: val , field: key });
			}

		});

		return value_errors;

	}


	function validateRequestInPresences( data ){

		var presence_errors = [];
			[ 'event_id', 'group']
			.forEach( function( key ){
				if( !data[key] )
					presence_errors.push( key );
			});

		return presence_errors;

	};

	function validateRequestIn( req, res, next ){

		console.log('Validating request in');

		var data = {
			event_id: req.params.event_id,
			group: req.body
		};

		var presence_errors  = [],
			type_errors  	 = [],
			value_errors 	 = [],
			err_msg_arr      = [],
			err_msg          = '';

		/* Est-ce que tous les paramètres sont présent ? */
		presence_errors = validateRequestInPresences( data );
		if( presence_errors.length != 0 ){
			err_msg = "Presence error(s) : missing parameters [" + presence_errors.join(', ') + ']';
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		/* Est-ce que tous les paramètres sont du bon type ? */
		type_errors = validateRequestInTypes( data );
		if( type_errors.length != 0 ){
			err_msg = "Type error(s) : ";
			type_errors.forEach( function( el ){
				err_msg_arr.push( el.field + ' field must be ' + el.required_type + ' (' + el.empty + el.passed_type + ' was sent)' );
			});
			err_msg += err_msg_arr.join(', ');
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		/* Est-ce que tous les paramètres ont une valeur parmis celles autorisées ? */
		value_errors = validateRequestInValues( data );
		if( value_errors.length != 0 ){
			err_msg = "Value error(s) : ";
			value_errors.forEach( function( el ){
				err_msg_arr.push( el.specific_msg || el.field + ' field must be [' + el.required_values.join(', ') + '] (' + el.passed_value + ' was sent)' );
			});
			err_msg += err_msg_arr.join(', ');
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		/* No errors in parameters, checking for valid members */
		var facebook_ids = _.pluck( data.group.members, 'facebook_id');
			facebook_ids = _.uniq( facebook_ids );
		var group_number  = facebook_ids.length;

		User.find({ 'facebook_id': { $in: facebook_ids }}, function( err, members ){

			if( err )
				return eventUtils.raiseError({ 
					toClient: 'Error fetching group members, make sure you provided valid host ids', 
					res: res 
				});

			if( members.length != group_number )
				return eventUtils.raiseError({ 
					toClient: 'Error, couldnt find ' + ( group_number - members.length ) + ' members', 
					res: res 
				});

			Event.findById( data.event_id, function( err, evt ){

			if( err )
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "api error fetching event" 
				});

			if( !evt )
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "event doesnt exist" 
				});
			
			var double_presence_host, doublon_id;
			data.group.members.forEach(function( member ){
				if( _.pluck( evt.hosts, 'facebook_id').indexOf( member.facebook_id ) != -1 ){
					double_presence_host = true;
					doublon_id = member.facebook_id;
				}
			});

			if( double_presence_host )
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "un membre du groupe (id:"+doublon_id+")est déjà présent en tant qu'organisateur!"
				});
			
			var double_presence, doublon_id;
			var groups = evt.groups;
				groups.forEach(function( other_group ){
					data.group.members.forEach(function( member ){
						if( _.pluck( other_group.members, 'facebook_id').indexOf( member.facebook_id ) != -1 ){
							double_presence = true;
							doublon_id = member.facebook_id;
						}
					});
				});

			if( double_presence )
				return eventUtils.raiseError({ err: err, res: res,
					toClient: "un membre du groupe (id: "+doublon_id+") est déjà inscrit dans un autre groupe"
				});

			/*Everything went fine!*/
			console.log('Validation success!');

			req.group = data.group;
			req.event_id = data.event_id;

			console.log( req.group );
			req.group.members = _.pluckMany( members, settings.public_properties.users );
			req.group.status  = 'pending';

			req.groups = evt.groups;
			req.groups.push( req.group );
			next();

			});
		});
	};

	module.exports = {
		validateRequestIn: validateRequestIn
	}
