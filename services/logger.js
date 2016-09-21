	
	var config = require( process.cwd() + '/config/config' );
	var bunyan = require('bunyan');
	
	module.exports = bunyan.createLogger({

		name: "Meefore",
		serializers: {
			// Request object, that is logged for every request. Pass in minimal informations
			req: ( req ) => {
				return {
					url: req.url, method: req.method
				}
			},
			// Res object, that is logged at each response. Pass in minimal informations;
			res: ( res ) => {
				return bunyan.stdSerializers.res
			},
			// Err object
			err: ( err ) => {
				return bunyan.stdSerializers.err
			},
			// User object, that is returned at each REST api call on the users edge
			user: ( user ) => {
				return {
					facebook_id : user.facebook_id,
					name        : user.name,
					n_befores   : user.befores.length
				}
			},
			// Before object, that is returned at each REST api call on the before edge
			before: ( before ) => {
				return {
					before_id: before._id,
					address  : before.address.place_name
				}
			}
		},
		streams: [
			{
				stream : process.stdout,
				level  : config.log_level.console.APP_ENV
			},
			{
				path: process.cwd() + '/json/logs.log'
			}
		]


	});
