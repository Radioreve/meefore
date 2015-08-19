

	var validate = function( type ){

		if( type == 'event' )
			return require('./validate-modules/validate-events').validateEvent

		if( type == 'requestin' )
			return require('./validate-modules/validate-requestin').validateRequestIn

	};


module.exports = {
	validate: validate
};