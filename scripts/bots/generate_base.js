
	var Promise = require('bluebird');
	var u       = require('../utils');
	var fs      = Promise.promisifyAll( require('fs') );
	var _    	= require('lodash');

	// Populate the bot_data file from the bot_data_defaults informations
	// and from automatic informations for a given path 
	function generateBotBaseInformations( path ){
		
		var folder_name = path.split('/').slice(-1)[0];
		var promises = [];

		var promise = u.readJson( path + '/bot_data_default' )
		  .then(function( json ){

		  	// Setting default values
		  	var update = JSON.parse( json );

		  	// Make sure mandatory fields are set
		  	if( !update.job || !update.ideal_night ){
		  		console.log('Cannot safely create a bot without custom job and ideal_night parameters');
		  		process.exit(0);
		  	}

		  	// Override if missing values with specific rules of randomness
		  	if( !update.name ){
		  		update.name = folder_name;
		  	}

		  	if( !update.age ){
		  		update.age = randomInt( 18, 32 );
		  	}

		  	if( !update.country_code ){
		  		update.country_code = "fr";
		  	}

		  	if( !update.location ){
		  		update.location = {
		  			place_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
		  			place_name: "Paris, France"
		  		}
		  	}

		  	// Automatically set all the time
			update.real_name    = folder_name;
			update.gender       = findGender( path );
			update.generated_at = (new Date()).toISOString();

		  	return u.updateKeysInJsonFile( path + '/bot_data', update );

		  });

		promises.push( promise );


		return Promise.all( promises );

	}

	function findGender( path ){
		if( /boys/.test(path) ){ return "male"; }
		if( /girls/.test(path) ){ return "female"; }
		console.log('Unable to find gender for path : ' + path );
		process.exit(0);
	}


	function randomInt( min, max ){
		return Math.floor( min + Math.random() * (max-min) );
	}


	module.exports = {
		generateBotBaseInformations: generateBotBaseInformations
	};