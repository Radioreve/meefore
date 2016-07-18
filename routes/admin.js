	
	var config      = require( '../config/config' );
	var Alerter 	= require( '../middlewares/alerter' );

	var apiDir      = '../api';
	var jobsDir     = '../jobs';
	var mdwDir      = '../middlewares';
	var validateDir = '../validate';

	var api = {
		users: require( apiDir + '/users' ),
		befores: require( apiDir + '/befores' )
	};

	var mdw = {

		auth 	 : require( mdwDir + '/auth'),
		meepass  : require( mdwDir + '/meepass'),
		facebook : require( mdwDir + '/facebook'),
		pop      : require( mdwDir + '/pop'),
		jobs     : require( jobsDir + '/terminate-befores'),
		mergify  : require( mdwDir + '/mergify'),
		validate : require( validateDir + '/validate')

	};

	module.exports = function( app ){

		 app.all('/admin/*',
	    	function( req, res, next ){
	    		if( req.sent.api_key != config.admin_api_key ){
	    			return res.status( 403 ).json({ msg: "unauthorized" });
	    		} else {
	    			next();
	    		}
	    	});

	    app.post('/admin/credit_meepass',
			mdw.auth.authenticate(['admin']),
			mdw.meepass.updateMeepass('admin_credit')
		);


	    app.post('/admin/auth/facebook/generate-app-token-local', // use the app_token shortcut
	    	function( req, res, next ){

	    		mdw.facebook.generateAppToken(function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/generate-app-token-fetch', // ask facebook graph api for a true app_token
	    	function( req, res, next ){

	    		mdw.facebook.generateAppToken(function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		}, "fetch" );
	    	}
	    );

	    app.post('/admin/auth/facebook/verify-token',
	    	function( req, res, next ){

	    		var token = req.sent.fb_token;

	    		mdw.facebook.verifyFacebookToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/update-token',
	    	function( req, res, next ){

	    		var token = req.sent.fb_token;

	    		mdw.facebook.fetchLongLivedToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/token-with-code',
	    	function( req, res, next ){

	    		var token = req.sent.fb_token;

	    		mdw.facebook.fetchTokenWithCode( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/profile',
	    	function( req, res, next ){

	    		var token       = req.sent.fb_token;
	    		var facebook_id = req.sent.facebook_id;

	    		mdw.facebook.fetchFacebookProfile( facebook_id, token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/validate',
	    	mdw.validate('auth_facebook'),
	    	mdw.pop.populateUser({ force_presence: false }),
	    	mdw.facebook.updateFacebookToken
	    );


	   	app.post('/admin/befores/terminate',
	   		function( req, res, next ){

	   			mdw.jobs.terminateBefores({
					timezone   : req.sent.timezone,
					target_day : req.sent.target_day  // format 'DD/MM/YYYY'
	   			}, function( err, tracked ){

	   				req.sent.expose.err 	= err;
		   			req.sent.expose.tracked = tracked;
		   			next();

	   			});

	   		});


	}	
