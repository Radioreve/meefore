	
	var cloudinary = require('cloudinary');
	var config     = require('../config/config');

	cloudinary.config({ 

		cloud_name : config.cloudinary.cloud_name,
		api_key    : config.cloudinary.api_key,
		api_secret : config.cloudinary.api_secret

	});

	// To be implementedw