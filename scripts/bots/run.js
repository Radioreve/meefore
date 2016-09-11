	
	var Promise      = require('bluebird');
	var _ 			 = require('lodash');
	var flags 		 = require('node-flags');

	var bots         = require('./generate_bots');
	var u 			 = require('../utils');
	var botsconfig   = require('./generate_config');
	var botsfacebook = require('./generate_facebook_user');

	// Generate multiple bots from the source
	var folder_path = '/Users/MacLJ/Node/App/Meefore/bots/boys';

	// Constructor to iterate on a whole folder
	var multiply = function( promiseFn, indexes ){

		return function(){

			indexes = Array.isArray( indexes ) ? indexes : _.range( 0, 51 );
			console.log('Indexing from : ' + indexes );
			return u.readDir( folder_path )
				.then(function( dir ){
					return Promise.mapSeries( dir, function( dir_name, i ){
						if(  !/icon/i.test( dir_name ) && ! /^\..*/.test( dir_name ) && indexes.indexOf(i) != -1 ){
							console.log('Path was okay : ' + dir_name );
							return promiseFn( folder_path + '/' + dir_name );
						} else {
							// console.log('Skipping this path : ' + dir_name );
						}
					});
				});
		}
	};

	var multiplyParallel = function( promiseFn, indexes ){

		return function(){

			indexes = Array.isArray( indexes ) ? indexes : _.range( 0, 51 );
			console.log('Indexing from : ' + indexes );
			return u.readDir( folder_path )
				.then(function( dir ){
					var promises = [];
					dir.forEach(function( dir_name, i ){
						if( !/icon/i.test( dir_name ) && ! /^\..*/.test( dir_name ) && indexes.indexOf(i) != -1 ){
							console.log('Path was okay : ' + dir_name );
							 promises.push( promiseFn( folder_path + '/' + dir_name ) );
						} else {
							// console.log('Skipping this path : ' + dir_name );
						}
					});	
					return Promise.all( promises );

				});
		}
	};


	var p = Promise.resolve

	if( flags.get('a') == 'delete' ){
		console.log('Deleting all facebook test users...');
		p = bots.deleteAllFacebookTestUsers;
	}

	console.log( flags.get('a') );

	if( flags.get('a') == 'gen'){
		if( flags.get('name') ){
			var f_name = flags.get('name').split('_').join(' ')
			console.log( f_name );
			p = function(){ return bots.generateOneBot( folder_path + '/' + f_name ) };
		} else {
			console.log('Generating bots from folder ' + folder_path );
			p = multiply( bots.generateOneBot, _.range( parseInt(flags.get('m')), parseInt(flags.get('M'))) );
		}
	}

	if( flags.get('parallel') ){
		console.log('Generating in parallel');
		p = multiplyParallel( bots.generateOneBot, _.range( parseInt(flags.get('m')), parseInt(flags.get('M'))) );
	}

	// Deleting all bots from facebook_interface along with associated files 
	if( 0 ){
		console.log('Deleting test users');
		p = multiplyParallel( bots.deleteOneBot, _.range( 0, 2 ) );
	}

	// Generating bot_data.json & bot_data_default.json in each folders 
	if( 0 ){
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

