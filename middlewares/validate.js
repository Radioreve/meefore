
	var eventUtils  = require('../pushevents/eventUtils'),
		moment      = require('moment'),
		_     	    = require('lodash'),
		settings    = require('../config/settings');

	var Event 	    = require('../models/EventModel'),
		User        = require('../models/UserModel'),
		Place   	= require('../models/PlaceModel');


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



	var validate = function( type ){

		if( type == 'event' )
			return validateEvent

	};

	function validateEventTypes( data ){

		var type_errors = [];
		[ 'hosts_facebook_id', 'begins_at', 'address', 'ambiance', 'agerange', 'mixity', 'scheduled_party']
		.forEach(function( key ){

			var val = data[key];
			var passed_type = Array.isArray( val ) ? 'array' : typeof( val );
			var empty       = Array.isArray( val ) && val.length == 0 || _.keys( val ).length == 0 ? 'empty ' : '';

			if( ['begins_at', 'agerange', 'mixity' ]
					.indexOf( key ) != -1 && typeof( val ) != 'string' )
				{					
					type_errors.push({
						empty: empty, 
						field: key, 
						passed_type: passed_type, 
						required_type: 'string' 
					});
				}
				if( ['scheduled_party', 'address']
					.indexOf( key ) != -1  && ( Array.isArray( val ) || typeof( val ) != 'object' || _.keys( val ).length == 0 ) )
				{
					type_errors.push({
						empty: empty, 
						field: key, 
						passed_type: passed_type, 
						required_type: 'non empty object' 
					});
				}
				if( ['hosts_facebook_id', 'ambiance'].indexOf( key ) != -1  
					&& ( !Array.isArray( val ) || Array.isArray( val ) && val.filter(function(e){ return e.trim(); }).length == 0 ) )
				{
					type_errors.push({ 
						empty: empty,
						field: key, 
						passed_type: passed_type, 
						required_type: 'non empty array' 
					});
				}
		});

		return type_errors;

	};

	function validateEventValues( data ){

		var value_errors = [];

		[ 'hosts_facebook_id', 'begins_at', 'address', 'ambiance', 'agerange', 'mixity', 'scheduled_party']
		.forEach(function( key ){
			var val = data[key];

			if( key === 'begins_at' && ( !/^\d{2}\/\d{2}\/\d{2}$/.test( val ) || !moment( val, 'DD/MM/YY').isValid()  ||  moment( val, 'DD/MM/YY') < moment({'H':0,'m':0}) ) )
			{	
				var required_values = ['valid upcoming date (DD/MM/YY)'];
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'hosts_facebook_id' )
			{	
				var wrong_ids 	  = [];
				data[ key ].forEach(function( fb_id ){
					if( !/^\d{10,}$/.test( fb_id ) )
						wrong_ids.push( fb_id );
				});
				var n_wrong_ids = wrong_ids.length;
				if( n_wrong_ids != 0 ){
					var required_values = ['15 digit integers.'];
					value_errors.push({ required_values: required_values, passed_value: val, field: key });	
				}
			}

			if( key === 'hosts_facebook_id' && data[ key ].length > settings.app.max_hosts )
			{
				var required_values = [settings.app.max_hosts + ' hosts maximum'];
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'address' )
			{
				// Do nothing so far
			}

			if( key === 'ambiance' && data[ key ].length > settings.app.max_ambiance )
			{
				var required_values = [settings.app.max_ambiance + ' suggestions maximum'];
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'agerange' && _.pluck( settings.app.agerange, 'id' ).indexOf( val ) == -1 )
			{
				var required_values = _.pluck( settings.app.agerange, 'id' );
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'mixity' && _.pluck( settings.app.mixity, 'id' ).indexOf( val ) == -1 )
			{
				var required_values = _.pluck( settings.app.mixity, 'id' );
				value_errors.push({ required_values: required_values, passed_value: val, field: key });
			}

			if( key === 'scheduled_party' && !/^[a-z0-9]{24}$/.test( val._id )  )
			{
				var required_values = [' \'_id\' key as valid bson( eg: 55c613b3eb8ced441405a3a6 )']
				value_errors.push({ required_values: required_values, passed_value: val._id , field: key });
			}


		});

		return value_errors;

	};	


	function validateEventPresences( data ){

		var presence_errors = [];
			[ 'hosts_facebook_id', 'begins_at', 'address', 'ambiance', 'agerange', 'mixity', 'scheduled_party']
			.forEach( function( key ){
				if( !data[key] )
					presence_errors.push( key );
			});

		return presence_errors;

	};

	function validateEvent( req, res, next ){

		console.log('Validating event');

		var data = req.body;
		var presence_errors  = [],
			type_errors  	 = [],
			value_errors 	 = [],
			err_msg_arr      = [],
			err_msg          = '';

		var event_data = {};

		/* Est-ce que tous les paramètres sont présent ? */
		presence_errors = validateEventPresences( data );
		if( presence_errors.length != 0 ){
			err_msg = "Presence error(s) : missing parameters [" + presence_errors.join(', ') + ']';
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		/* Est-ce que tous les paramètres sont du bon type ? */
		type_errors = validateEventTypes( data );
		if( type_errors.length != 0 ){
			err_msg = "Type error(s) : ";
			type_errors.forEach( function( el ){
				err_msg_arr.push( el.field + ' field must be ' + el.required_type + ' (' + el.empty + el.passed_type + ' was sent)' );
			});
			err_msg += err_msg_arr.join(', ');
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		/* Est-ce que tous les paramètres ont une valeur parmis celles autorisées ? */
		value_errors = validateEventValues( data );
		if( value_errors.length != 0 ){
			err_msg = "Value error(s) : ";
			value_errors.forEach( function( el ){
				err_msg_arr.push( el.specific_msg || el.field + ' field must be [' + el.required_values.join(', ') + '] (' + el.passed_value + ' was sent)' );
			});
			err_msg += err_msg_arr.join(', ');
			return eventUtils.raiseError({ toClient: err_msg, res: res });
		}

		event_data.begins_at = data.begins_at;
		event_data.address   = data.address;
		event_data.ambiance  = data.ambiance;
		event_data.agerange  = data.agerange;
		event_data.mixity    = data.mixity;

		/* No errors in parameters, checking for valid friend and places ids */
		data.hosts_facebook_id = _.uniq( data.hosts_facebook_id );
		var host_number = data.hosts_facebook_id.length;

		User.find({ 'facebook_id': { $in: data.hosts_facebook_id }}, function( err, hosts ){

			if( err )
				return eventUtils.raiseError({ 
					toClient: 'Error fetching hosts, make sure you provided valid host ids', 
					res: res 
				});

			if( hosts.length != host_number )
				return eventUtils.raiseError({ 
					toClient: 'Error, couldnt find ' + ( host_number - hosts.length ) + ' hosts', 
					res: res 
				});

			event_data.hosts = _.pluckMany( hosts, settings.public_properties.users );

			if( data.scheduled_party && typeof(data.scheduled_party) != 'object' ){
				return eventUtils.raiseError({ 
					toClient: 'Format error : scheduled_party must be object, ' + typeof(data.scheduled_party) + ' passed', 
					res: res 
				});
			}

			Place.findById( data.scheduled_party._id, function( err, place ){

				if( err )
					return eventUtils.raiseError({ 
						toClient: 'Error fetching place, make sure you provided a valid place_id', 
						res: res 
					});

				if( !place )
					return eventUtils.raiseError({ 
						toClient: 'Error, couldnt find place with id : ' + data.scheduled_party._id, 
						res: res 
					});

				event_data.scheduled_party = place;

				/*Everything went fine!*/
				console.log('Validation success!');
				req.event_data = event_data;
				next();

			});

		});
		
	}


module.exports = {
	validate: validate
};