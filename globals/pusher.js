
	var Pusher = require('pusher'),
		config = require('../config/config');
	
	var pusher = new Pusher({

		appId		: config.pusher.appId,
		key			: config.pusher.key,
		secret		: config.pusher.secret,
		encrypted	: true
		
	});

	pusher.port = 443;

	module.exports = pusher;

