	
	// This script creates a bot from Facebook (test user) 
	// Upload a set of photos from the bot folder
	// And create itself on the api

	// Get a token for the app here : https://developers.facebook.com/tools/explorer
	var Promise = require('bluebird');

	var u    = require('../utils');

	var genconfig       = require('./generate_config');
	var geninfos        = require('./generate_base');
	var genfiles        = require('./generate_files');
	var genpics         = require('./generate_pics');
	var genappuser      = require('./generate_appuser');
	var genfacebookuser = require('./generate_facebook_user');


	var deleteOneDefaultConfig = function( user_path ){

		var data_path = user_path + '/bot_data';

		return u.removeFileJson( data_path )
				.then(function(){
					u.removeFileJson( data_path + '_default');
				})
	};

	var generateOneDefaultConfig = function( user_path ){

		var data_path = user_path + '/bot_data';

		return genfiles.generateBotDataFile( data_path )
				.then(function(){
					return genfiles.generateBotDataFile( data_path + '_default');
				})
				.then(function(){
					return geninfos.generateBotBaseInformations_Default( user_path );
				})
	};


	var generateOneBot = function( user_path ){

		var data_path = user_path + '/bot_data';

		return 	genfiles.generateBotDataFile( data_path )
				.then(function(){
					return genfiles.generateBotDataFile( data_path + '_default' )
				})
				.then(function(){
					// Passing the user_Path important, need access to Folder Name
					return geninfos.generateBotBaseInformations( user_path )
				})
				.then(function(){
					return genfacebookuser.generateFacebookTestUser( genconfig.fb.url, genconfig.fb.token );
				})
				.then(function( facebook_data ){
					return u.updateKeysInJsonFile( data_path, facebook_data );
				})
				.then(function( res ){
					var facebook_id = res[0].id;
					return genpics.generateBotPicturesInformations( user_path, facebook_id );
				})
				.then(function(){
					return genappuser.generateAppUser( data_path );
				})
				.then(function( res ){
					return console.log('User has been successfully created !' );
				});
	};


	// var generateMultipleBots = function( bots_folder_path ){

	// 	return u.readDir( bots_folder_path )
	// 		.then(function( dir ){
	// 			return Promise.mapSeries( dir, function( dir_name, i ){
	// 				if( ! /^\..*/.test( dir_name ) ){
	// 					return generateOneBot( bots_folder_path + '/' + dir_name );
	// 				}
	// 			});
	// 		})	

	// };

	var deleteOneBot = function( user_path ){

		console.log('Reading data from file : ' +  user_path + '/bot_data' );

		return u.readJson( user_path + '/bot_data' )		
				.then(function( json ){
					console.log( 'Deleting user with facebook_id : ' + JSON.parse(json).id );
					return genfacebookuser.deleteFacebookTestUser( genconfig.fb.test_user_url + JSON.parse( json ).id,  genconfig.fb.token );
				});
	}


	module.exports = {
		generateOneBot        		  : generateOneBot,
		generateOneDefaultConfig 	  : generateOneDefaultConfig,
		deleteOneDefaultConfig 		  : deleteOneDefaultConfig,
		deleteOneBot    		 	  : deleteOneBot
	};
	