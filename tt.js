
	var print = require('./services/print')( __dirname.replace( 'tt.js' ) );
	var log   = require('./services/logger');

	var req = {
		log: log.child({ "hello": "world" })
	};

	