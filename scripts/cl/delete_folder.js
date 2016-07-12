	

	var cloudinary = require('cloudinary');
	var config     = require( process.cwd() + '/config/config');

	cloudinary.config({ 

		cloud_name : config.cloudinary.cloud_name,
		api_key    : config.cloudinary.api_key,
		api_secret : config.cloudinary.api_secret

	});


	cloudinary.api.delete_resources_by_prefix('markers/', function( res ){
		console.log(res);
	});