	
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

		// Test functions
	    app.get('/users/:user_id/channels',
	    	mdw.mergify.setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];
	    		var chat_id      = req.sent.name; 

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){

	    			req.sent.expose.err = err;
	    			req.sent.expose.channel_item = user.getChatChannel( chat_id );
	    			next();

	    		});
	    	}
	    );

	    // Get all the befores for a particular user, by using each user's own befores
	    // property (which contails all the before's _ids the user has going on)
	    app.get('/users/:user_id/befores.id',
	    	mdw.mergify.setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){
	    			user.findBeforesByIds(function( err, befores ){
						req.sent.expose.err        = err;
						req.sent.expose.n_befores  = befores.length;
						req.sent.expose.before_ids = _.map( befores, '_id' );
						req.sent.expose.befores    = befores;
		    			next();
	    			});
	    		});
	    	}
	    );

	    // Get all the befores for a particular user, but checking the presence of its id
	    // in either the hosts or the group.members fields
	    app.get('/users/:user_id/befores.presence',
	    	mdw.mergify.setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){
	    			user.findBeforesByPresence(function( err, befores ){
						req.sent.expose.err        = err;
						req.sent.expose.n_befores  = befores.length;
						req.sent.expose.before_ids = _.map( befores, '_id' );
						req.sent.expose.befores    = befores;
		    			next();
	    			});
	    		});
	    	}
	    );


	    app.get('/users/:user_id/friends',
	    	mdw.mergify.setParam('user_id'),
	    	api.users.fetchFriends
	   );


	    app.get('/users/:user_id/cheers',
	    	mdw.mergify.setParam('user_id'),
			mdw.pop.populateUser({ force_presence: true }),
			api.users.fetchUserCheers
		);

	}	
