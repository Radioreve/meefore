
	var request     = require('request');
	var _           = require('lodash');
	var flags       = require('flags');
	var querystring = require('querystring');

	flags.defineNumber('n', 1);
	flags.defineString('g', 'male');

	flags.parse();

	var n_bot  = flags.get('n');
	var gender = flags.get('g');

	console.log('Starting bots script');
	console.log('n = ' + n_bot + ', gender = ' + gender);

	if( ['male','female'].indexOf(gender) == -1 ){
		console.log('Mispelled the gender, exiting...');
		process.exit(0);
	}


	// This script creates a bot from Facebook (test user) 
	// Upload a set of photos from the bot folder
	// And create itself on the api

	var app_id = '1638104993142222';

	// Get a token for the app here : https://developers.facebook.com/tools/explorer
	var token  = '1638104993142222|X4yMYH7K6S16lCdo7xVxwWKxlFc'; 

	var facebook_url = 'https://graph.facebook.com/v2.5/' + app_id + '/accounts/test-users/';
	var app_url      = 'http://localhost:1234/auth/facebook';

	var data = {
		access_token: token
	};

	(function createTestUserAndBot(){

		console.log('Requesting the url : ' + facebook_url );
		request({
			method : 'post',
			form   : querystring.stringify( data ),
			url    : facebook_url
		}, function( err, body, res ){

			var res = JSON.parse( res );

			if( res.error ){
				return quitScript( res );
			}

			// Response from Facebook API
			var data = { facebook_profile: {}, bot: {} };

			data.facebook_id  = res.id;
			data.access_token = res.access_token;

			data.facebook_profile.email  = res.email;
			data.facebook_profile.id     = res.id;
			data.facebook_profile.gender = gender;

			data.bot.age = 22;
			data.bot.name = "Marie";
			data.bot.job = "Pompier";
			data.bot.ideal_night = "God only knows...";
			data.bot.country_code = "de";
			// Upload picture to cloudinary
			// ...
			//

			createNewProfile( data, function( err, res ){

				print( err );
				print( res );

			});

		});

	})();

	function createNewProfile( data, callback ){

		request({
			method    : 'post',
			json      : data,
			url       : app_url
		}, function( err, body, res ){	

			if( err ){
				callback( err, null )
			} else {
				print('Received response of type : ' + typeof res );
				callback( null, res );
			}

		});

	}


	function quitScript( message ){
		print('Quiting script earlier than expected...');
		print( message );
		process.exit(0);
	}

	function print( message ){
		if( typeof message == "object" ){
			message = JSON.stringify( message, null, 4 );
		}
		console.log( message );
	}




	// Test part
	// var data = { facebook_profile: {}, bot: {} };

	// data.facebook_id  = '12324242';
	// data.access_token = '2424K2N4neAHEHJEHJEjkejbjabejhazb3H2UA4H2zijnk';

	// data.facebook_profile.email  = 'toto@fuck.fr';
	// data.facebook_profile.id     = '12324242';
	// data.facebook_profile.gender = 'male';

	// data.bot.age = 22;
	// data.bot.name = "Marie";
	// data.bot.job = "Pompier";
	// data.bot.ideal_night = "God only knows...";
	// data.bot.country_code = "de";

	// createNewProfile( data, function( err, res ){
	// 	print( err );
	// 	print( res );
	// })





