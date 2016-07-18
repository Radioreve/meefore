
	var _    	   = require('lodash');
	var Promise    = require('bluebird');
	var u          = require('../utils');
	var fs         = Promise.promisifyAll( require('fs') );
	var cloudinary = require('cloudinary');
	var genconfig  = require('./generate_config');
	var settings   = require( process.cwd() + '/config/settings' );

	cloudinary.config({ 
		cloud_name : genconfig.cloudinary.cloud_name,
		api_key    : genconfig.cloudinary.api_key,
		api_secret : genconfig.cloudinary.api_secret
	});

	var placeholder_img_id = settings.placeholder_img_id;
	var placeholder_img_vs = settings.placeholder_img_vs;

	var default_pictures = [
		{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 0, is_main: true , hashtag: 'me' },
      	{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 1, is_main: false, hashtag: 'hot' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 2, is_main: false, hashtag: 'friends' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 3, is_main: false, hashtag: 'natural' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 4, is_main: false, hashtag: 'whatever' }
	]

	// Populate the bot_data file with informations about a user pictures
	// Including the img_id, img_version, img_place;
	function generateBotPicturesInformations( path, facebook_id ){
		
		console.log('Uploading pictures...');
		return fs.readdirAsync( path )
			.then(function( files_name ){
				var promises = [];
				var k = 0; // Controls when skip is necessary to offset public_ids. Make sure ids start by 0, then 1... 
				files_name.forEach(function( file_name, i ){

					var extension = file_name.split('.').slice( -1 )[ 0 ];
					if( extension != 'jpg' ) return k--;

					promises.push(new Promise(function( resolve, reject ){

						var picture_path = path + '/' + file_name;
						cloudinary.uploader.upload( picture_path, function( res ){
							return resolve( res );
						}, { 'public_id': facebook_id + '--' + ( i+k ) });

					}) );
				});

				return Promise.all( promises );
			})
			.then(function( picture_objects ){

				var update = { pictures: _.cloneDeep(default_pictures) };  // Fucking clone deep!! 
				picture_objects.forEach(function( pic, i ){
					var upic = update.pictures[ i ];
					if( upic ){
						upic.img_id      = pic.public_id;
						upic.img_version = pic.version;
					}
				});

				return u.updateKeysInJsonFile( path + '/bot_data', update );

			});

	}


	module.exports = {
		generateBotPicturesInformations: generateBotPicturesInformations
	};