	
	var root = process.cwd();

	var tools 	     = require('../tools');
	var mongoose     = require('mongoose');
	var _            = require('lodash');
	var User 	     = require( root + '/models/UserModel');
	var config       = require( root + '/config/config');
	var settings     = require( root + '/config/settings');

	var uri = config.db[ "dev" ].uri;
	require( root + '/services/db')( uri );

	function handleErr( err ){
		tools.error('Error');
		tools.jsonize( err );
		process.exit();
	}

	var patch = {

		// Testing : 
		// Some keys dont exists
		// Some keys are missing
		// Some keys have wrong type value
		// Some keys are correct (and should be patched);

		fake_key: {
			"shouldnt": "exists"
		},
		app_preferences: {
			ux: {
				show_country: true
			},
			alerts_email: {
				"foo": "bar",
				"marked_as_host": "maybe",
				"group_request_hosts" : 0
			},
			fake_key: {
				"shouldnt": "exists"
			}
		}
	}


	User.findById( "577cc1f8efb45c88b7375505", function( err, user ){

		if( err ) return handleErr( err );

		user.patch( patch, function( err, user ){
			tools.jsonize( err );	
			tools.jsonize( user.app_preferences );
			process.exit(0);
		});

		
	});
	

