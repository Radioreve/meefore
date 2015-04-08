
	var Pusher = require('pusher'),
		config = require('../config/config');
	
	module.exports = new Pusher({

		appId: config.pusher.appId,
		key: config.pusher.key,
		secret: config.pusher.secret
		
	});

