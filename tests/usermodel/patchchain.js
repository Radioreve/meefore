
	

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

		// Test the fact that we can chain multiple patches and dont have a version error
	var patch_chain = [
		{
			name: "Léonidas"
		},
		{
			name: "Léah"
		}
	]

	User.findById( "577cc1f8efb45c88b7375505", function( err, user ){

		if( err ) return handleErr( err );

		user.patch( patch_chain[0], function( err, user2 ){
	
			if( err ) return handleErr( err );

			tools.jsonize( user.name );

			user2.patch( patch_chain[1], function( err, user ){

				if( err ) return handleErr( err );

				tools.jsonize( user.name );
				process.exit(0);

			});


		});

		
	});
	
