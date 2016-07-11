	
	var config      = require( '../config/config' );
	
	var apiDir      = '../api';
	var jobsDir     = '../jobs';
	var mdwDir      = '../middlewares';
	var validateDir = '../validate';

	var api = {
	};

	var mdw = {

		validate  : require( validateDir + '/validate'),
		connecter : require( mdwDir + '/connecter')

	};

	module.exports = function( app ){

		// [ @WebHooks ] WebHook from Pusher to monitor in realtime online/offline users
	   	// and save disconnected_at property which is used by front end notifications module
	    app.post('/webhooks/pusher/connection-event',
	    	mdw.connecter.updateConnectedUsers
	    );


	}	
