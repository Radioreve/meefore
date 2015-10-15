
	var Pusher = require('pusher'),
		config = require('../config/config');
	
	var pusher = new Pusher({

		appId		: config.pusher[ process.env.NODE_ENV ].app_id,
		key			: config.pusher[ process.env.NODE_ENV ].key,
		secret		: config.pusher[ process.env.NODE_ENV ].secret,
		encrypted	: true
		
	});

	pusher.port = 443;

	module.exports = pusher;

