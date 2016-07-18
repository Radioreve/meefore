	// Create a Facebook test user 
	// Get a token for the app here : https://developers.facebook.com/tools/explorer

	var config 	    = require( process.cwd() + '/config/config' );
	var _ 			= require('lodash');
	var Promise     = require('bluebird');
	var request     = require('request');
	var querystring = require('querystring');

	var app_id         = config.facebook[ process.env.APP_ENV ].client_id;
	var app_secret 	   = config.facebook[ process.env.APP_ENV ].client_secret;
	var app_token 	   = app_id + '|' + app_secret;
	var graph_api_url  = 'https://graph.facebook.com/v2.7';
	var test_users_url = 'https://graph.facebook.com/v2.7/'+ app_id +'/accounts/test-users';

	var generateFacebookTestUser = function(){
		return new Promise(function( resolve, reject ){

			var url =  test_users_url + '?' + querystring.stringify({ access_token : app_token });

			if( !url ){
				console.log('Cannot create Facebook test user without url or without token, aborting...');
				return process.exit( 0 );
			}

			console.log('Requesting the url : ' + test_users_url );
			console.log('Generating a Facebook Test user...');

			request.post( url, function( err, body, res ){

				if( res && res.error ){
					reject( res );
				} else {
					resolve( res );
				}

			});
		});
	};

	var deleteFacebookTestUser = function( facebook_id ){
		return new Promise(function( resolve, reject ){

			var url = graph_api_url + '/' + facebook_id + '?' + querystring.stringify({ access_token : app_token });

			if( !url ){
				console.log('Cannot delete Facebook test user without url or without token, aborting...');
				return process.exit( 0 );
			}

			console.log('Requesting the url : ' + url );
			console.log('Deleting a Facebook Test user...');


			request.delete( url, function( err, body, res ){

				if( typeof res == 'string' ){
					res = JSON.parse( res );
				}	
				if( err ){
					return reject( err );
				}
				if( res && res.error ){
					return reject( res );
				} else {
					console.log('Deleting success');
					return resolve( res );
				}

			});
		});
	};

	var fetchFacebookTestUsers = function(){
		return new Promise(function( resolve, reject ){

			var url = test_users_url + '?' + querystring.stringify({ access_token: app_token });
			request.get( url, function( err, body, res ){

				if( typeof res == 'string' ){
					res = JSON.parse( res );
				}	

				if( res && res.data ){
					resolve( _.map( res.data, 'id') );
				} else {
					reject( err );
				}

			});

		});
	};


	module.exports = {
		generateFacebookTestUser : generateFacebookTestUser,
		deleteFacebookTestUser   : deleteFacebookTestUser,
		fetchFacebookTestUsers   : fetchFacebookTestUsers
	}