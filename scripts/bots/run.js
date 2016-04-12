	
	var Promise      = require('bluebird');
	var _ 			 = require('lodash');

	var bots         = require('./generate_bots');
	var u 			 = require('../utils');
	var botsconfig   = require('./generate_config');
	var botsfacebook = require('./generate_facebook_user');

	// Generate multiple bots from the source
	var folder_path = process.cwd() + '/bots/boys';


	// Constructor to iterate on a whole folder
	var multiply = function( promiseFn, indexes ){

		return function(){
		// console.log( Array.isArray( indexes) );
		// console.log( indexes );
		indexes = Array.isArray( indexes ) ? indexes :  _.range(0,51);
		return u.readDir( folder_path )
			.then(function( dir ){
				return Promise.mapSeries( dir, function( dir_name, i ){
					// console.log('Asking for i = ' + i );
					// console.log( indexes );
					// console.log( indexes.indexOf(i) );
					if(  !/icon/i.test( dir_name ) && ! /^\..*/.test( dir_name ) && indexes.indexOf(i) != -1 ){
						console.log('path was validated');
						return promiseFn( folder_path + '/' + dir_name );
					} else {
						console.log('Skipping this path : ' + dir_name );
					}
				});
			})
		}
	};


	var p = Promise.resolve

	if( 0 ){
		console.log('Generating bots from folder ' + folder_path );
		p = multiply( bots.generateOneBot, [0] );
	}

	// Deleting all bots from facebook_interface along with associated files 
	if( 0 ){
		console.log('Deleting test users');
		p = multiply( bots.deleteOneBot, [] );
	}

	// Generating bot_data.json & bot_data_default.json in each folders 
	if( 1 ){
		console.log('Generating default config files for each bot');
		p = multiply( bots.generateOneDefaultConfig )
	}

	if( 0 ){
		console.log('Deleting all bot_data files');
		p = multiply( bots.deleteOneDefaultConfig );
	}

	p()
	.catch( u.handleErr )
	.finally( u.handleDone )

	// bots.deleteOneDefaultConfig( process.cwd() + '/bots/boys/Bastian Rose' )
	// 	.catch( u.handleErr )
	// 	.finally( u.handleDone )
