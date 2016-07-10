	
	var config      = '../config/config';
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

	    app.post('/admin/users/alerts/reset',
	    	function( req, res ){

	    		User
	    			.find()
	    			.exec(function( err, users ){

	    				if( err ){
	    					return res.status( 400 ).json({
	    						msg: "Error occured", err: err, users: users
	    					});
	    				}

	    				if( typeof req.sent.min_frequency != 'number' ){
	    					return res.status( 400 ).json({
	    						msg: "Please, provide min_frequency field of type number"
	    					});
	    				}

	    				var async_tasks = [];
	    				users.forEach(function( user ){

	    					async_tasks.push(function( callback ){

	    						rd.hmset('user_alerts/' + facebook_id, { min_frequency: req.sent.min_frequency }, function( err ){
	    							callback();
	    						});

	    					});


	    				});
	    				
    					async.parallel( async_tasks, function( err, response ){

	    					if( err ){
	    						return res.status( 400 ).json({
	    							err: err, response: response
	    						});
	    					} else {
	    						return res.status( 200 ).json({
	    							res: "success!"
	    						});
	    					}
    					});

	    			});

	    	});

	    app.post('/admin/users/alerts/min_frequency',
	    	function( req, res ){

	    		User
	    			.find()
	    			.select('facebook_id')
	    			.exec(function( err, data ){

	    				if( err || data.length == 0 ){
	    					return res.status(400).json({ msg: "Error occured", err: err, data: data });
	    				}

	    				if( typeof req.sent.min_frequency != 'number' ){
	    					return res.status(400).json({ msg: "Please, provide min_frequency field of type number" });
	    				}

	    				var async_tasks = [];
	    				data.forEach(function( o ){

	    					var facebook_id = o.facebook_id;
	    					async_tasks.push(function( callback ){

	    						// (function( facebook_id ){

			    					rd.hgetall('user_alerts/' + facebook_id, function( err, alerts ){

			    						alerts.min_frequency = req.sent.min_frequency;
			    						rd.hmset('user_alerts/' + facebook_id, alerts, function( err ){
			    							console.log('Cache updated for user : ' + facebook_id );
			    							callback();

			    						});

			    					});

			    				// })( facebook_id );

	    					});
	    				});

	    				async.parallel( async_tasks, function( err, response ){

	    					if( err ){
	    						return res.status( 400 ).json({ err: err, response: response });
	    					} else {
	    						return res.status( 200 ).json({ res: "success!" });
	    					}
	    				});

	    			})

	    	});



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

	    		var token = req.sent.token;

	    		mdw.facebook.verifyFacebookToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/update-token',
	    	function( req, res, next ){

	    		var token = req.sent.token;

	    		mdw.facebook.fetchLongLivedToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/admin/auth/facebook/profile',
	    	function( req, res, next ){

	    		var token       = req.sent.token;
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


	   	app.post('/admin/jobs/terminate-befores',
	   		function( req, res ){

	   			if( req.sent.api_key != 'M33fore'){
	   				return res.status( 403 ).json({
	   					"msg": "unauthorized"
	   				});
	   			}

	   			mdw.jobs.terminateBefores({
						timezone   : req.sent.timezone,
						target_day : req.sent.target_day  // format 'DD/MM/YYYY'
	   			});

	   			res.json({
	   				"msg":"success" 
	   			});

	   		});


	}	
