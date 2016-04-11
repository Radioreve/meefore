	
	// This script creates a bot from Facebook (test user) 
	// Upload a set of photos from the bot folder
	// And create itself on the api

	// Get a token for the app here : https://developers.facebook.com/tools/explorer


	var u    = require('../utils');

	var genconfig       = require('./generate_config');
	var geninfos        = require('./generate_base');
	var genfiles        = require('./generate_files');
	var genpics         = require('./generate_pics');
	var genappuser      = require('./generate_appuser');
	var genfacebookuser = require('./generate_facebook_user');

	var path = process.cwd() + '/bots/girls';

	// All the following code is based on one folder object
	var user_path = process.cwd() + '/bots/girls/Alejandra Gascon';

	genfiles.generateBotDataFile( user_path + '/bot_data')
		.then(function(){
			return genfiles.generateBotDataFile( user_path + '/bot_data_default')
		})
		.then(function(){
			return geninfos.generateBotBaseInformations( user_path )
		})
		// .then(function(){
		// 	return genfacebookuser.generateFacebookTestUser( genconfig.fb.url, genconfig.fb.token );
		// })
		// .then(function( facebook_data ){
		// 	return u.updateKeysInJsonFile( user_path + '/bot_data', facebook_data );
		// })
		// .then(function( res ){
		// 	var facebook_id = res[0].id;
		// 	return genpics.generateBotPicturesInformations( user_path, '125440777854395' );
		// })
		.then(function(){
			return genappuser.generateAppUser( user_path + '/bot_data' );
		})
		.then(function( res ){
			console.log('User has been successfully created ! é"mé$^é"#@#?/!$ém"^' );
		})
		.catch( u.handleErr )
		.finally( u.handleDone );



	