
	var Pusher = require('pusher'),
		config = require('../config/config');
	
	var pusher = new Pusher({

		appId		: config[ process.env.NODE_ENV].pusher.app_id,
		key			: config[ process.env.NODE_ENV].pusher.key,
		secret		: config[ process.env.NODE_ENV].pusher.secret,
		encrypted	: true
		
	});

	pusher.port = 443;

	module.exports = pusher;

