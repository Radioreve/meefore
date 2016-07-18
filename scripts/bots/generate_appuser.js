
	// Create a user in database
	var u           = require('../utils');
	var config      = require( process.cwd() + '/config/config' );
	var Promise     = require('bluebird');
	var request     = require('request');
	var _           = require('lodash');
	var querystring = require('querystring');

	var generateAppUser = function( path, access_token ){

		console.log('Generating app user...');
		return u.readJson( path )
			.then(function( user_string ){

				var user = JSON.parse( user_string );

				var data = { bot: {} };

				// Setting globals
				// data.facebook_id = user.id;

				// 'facebook_profile' field is necessary to mimicate the normal flow
				data.fb_token = user.access_token;

				// 'bot' field is necessary to override any other parameters just before saving to db
				data.bot.name         = user.name;
				data.bot.age          = user.age;
				data.bot.job          = user.job;
				data.bot.gender       = user.gender;
				data.bot.pictures     = user.pictures;
				data.bot.ideal_night  = user.ideal_night;
				data.bot.country_code = user.country_code;
				data.bot.location     = user.location;

				return new Promise(function( resolve, reject ){
					request({
						method    : 'post',
						json      : data,
						url       : config.app.uri[ process.env.APP_ENV ] + '/auth/facebook'

					}, function( err, body, res ){	
						if( err ){
							return reject( err );
						} else {
							return resolve( res );
						}

					});
				});

			});
	};

	module.exports.generateAppUser = generateAppUser;