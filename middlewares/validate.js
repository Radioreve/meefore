

	var validate = function( types ){

		var types = Array.isArray( types ) ? types : [types];
		var middlewares = [];
		var matches_files = {
			create_event : 'validate-events',
			event_id     : 'validate-event-id',
			request      : 'validate-request',
			facebook_id  : 'validate-facebook-id',
			socket_id    : 'validate-socket-id',
			test         : 'validate-test'
		};

		var path = './validate-modules/';
		types.forEach(function( type ){
			if( matches_files[ type ] ){
				middlewares.push( require( path + matches_files[ type ] ).check )
			} 
		});

		return middlewares;

	};


module.exports = validate;