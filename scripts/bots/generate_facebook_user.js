	// Create a Facebook test user 
	// Get a token for the app here : https://developers.facebook.com/tools/explorer

	var _ 			= require('lodash');
	var Promise     = require('bluebird');
	var request     = require('request');
	var querystring = require('querystring');

	var generateFacebookTestUser = function( facebook_url, access_token ){
		return new Promise(function( resolve, reject ){

			console.log('Requesting the url : ' + facebook_url );
			console.log('Generating a Facebook Test user...');

			if( !facebook_url || !access_token ){
				console.log('Cannot create Facebook test user without url or without token, aborting...');
				return process.exit(0);
			}

			// No promises here! not so sure how bluebird would handle the request style of
			// passing params ahah! =)
			request({

				method : 'post',
				form   : querystring.stringify({ access_token: access_token }),
				url    : facebook_url

			}, function( err, body, res ){

				if( res && res.error ){
					reject( res );
				} else {
					resolve( res );
				}

			});
		});
	};

	var deleteFacebookTestUser = function( facebook_url, access_token ){
		return new Promise(function( resolve, reject ){

			console.log('Requesting the url : ' + facebook_url );
			console.log('With access_token : ' + access_token );
			console.log('Deleting a Facebook Test user...');

			if( !facebook_url || !access_token ){
				console.log('Cannot delete Facebook test user without url or without token, aborting...');
				return process.exit(0);
			}

			// No promises here! not so sure how bluebird would handle the request style of
			// passing params ahah! =)
			request({

				method : 'delete',
				form   : querystring.stringify({ access_token: access_token }),
				url    : facebook_url

			}, function( err, body, res ){

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

			var access_token_default = "1638104993142222|X4yMYH7K6S16lCdo7xVxwWKxlFc";

			request({

				method : 'get',
				url    : "https://graph.facebook.com/v2.5/1638104993142222/accounts/test-users?access_token=" + access_token_default

			}, function( err, body, res ){

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