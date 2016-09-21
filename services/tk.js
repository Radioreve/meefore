
	var jwt = require('jsonwebtoken');
	var config = require('../config/config');


	var generateAppToken = function( source, data ){

		var public_claim    = {};
		var audience        = [];
		var registred_claim = {};

		if( source == "user" ){

			var user = data;
			
			public_claim = { facebook_id: user.facebook_id };
			audience     = user.access;

			registred_claim = {
				issuer   : 'leo@meefore.com',
				audience : audience
			};
			
		}

		if( source == "app" ){

			var app = data; 
			var public_claim = {

				id               : app.id,
				source           : "generic"

			};

			audience = ["standard", "admin"];
			
			registred_claim = {

				expiresInSecondes : 15,
				issuer            : 'leo@meefore.com',
				audience          : audience

			};
		}

		return jwt.sign( public_claim, config.jwtSecret, registred_claim );

	};

	module.exports = {
		generateAppToken: generateAppToken
	};