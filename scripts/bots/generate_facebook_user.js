	// Create a Facebook test user 
	// Get a token for the app here : https://developers.facebook.com/tools/explorer

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

				if( res.error ){
					reject( res );
				} else {
					resolve( res );
				}

			});
		});
	};

	module.exports = {
		generateFacebookTestUser: generateFacebookTestUser
	}