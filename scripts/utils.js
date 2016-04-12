	
	
	var Promise = require('bluebird');
	var fs 	    = Promise.promisifyAll( require('fs') );
	var _  	 	= require('lodash');

	var path = process.cwd() + '/bots/girls';

	function readJson( path ){
		// console.log( 'About to read...' + path);
		return fs.readFileAsync( path + '.json', 'utf-8' );
	};

	function writeJson( path, content ){
		content = typeof content == 'string' ? content : JSON.stringify( content, null, 4 );
		return fs.writeFileAsync( path + '.json', content, 'utf-8' );
	}

	function readDir( path ){
		return fs.readdirAsync( path );
	}

	function removeFileJson( path ){
		return fs.unlinkAsync( path + '.json');
	}

	function updateKeyInCollectionFile( path, collection_name, item_id, item_key, item_val ){
		return readJson( path )
		.then(function( collection_string ){
			return updateKeyInCollection( collection_string, collection_name, item_id, item_key, item_val );
		})
		.then(function( collection_json ){
			return writeJson( path, collection_json );
		})
		// .catch( handleErr )
	}

	function updateKeyInCollection( collection_string, collection_name, item_id, item_key, item_val ){
			return new Promise(function( resolve, reject ){

				var found      = false;
				var collection = JSON.parse( collection_string );
				var array 	   = collection[ collection_name ];

				if( !array ){
					return reject('Unable to find collection in the json document for key: ' + collection_name );
				}

				array.forEach(function( item, i ){

					if( item.id == item_id ){
						found = true;
						return item[ item_key ] = item_val;
					}
					if( !found && i == collection.users.length - 1 ){
						reject( 'Unable to find any match in the collection' );
					}
				});

				resolve( collection );

			});
	}

	function updateKeysInJsonFile( path, update ){

		var update = typeof update == 'string' ? JSON.parse( update ) : update;
		
		var keyvalues = [];
		Object.keys( update ).forEach(function( key ){
			var obj = {};
			obj[ key ] = update[ key ];
			keyvalues.push( obj );
		});

		return Promise.each( keyvalues, function( keyvalue ){
			var key = Object.keys(keyvalue)[0];
			return updateKeyInJsonFile( path, key, keyvalue[ key ] );
		});

	};


	function updateKeyInJsonFile( path, key, val ){
		return readJson( path )
			.then(function( json_string ){
				return updateKeyInJson( json_string, key, val );
			})
			.then(function( object ){
				// console.log('Writing...');
				return writeJson( path, object );
			})
			// .catch( handleErr )
			
	}

	function updateKeyInJson( json_string, key, val ){
		return new Promise(function( resolve, reject ){

			var object = JSON.parse( json_string );
			object[ key ] = val;

			resolve( object );

		});
	}

	
	function handleErr( err ){
		console.log('Something went sideways...');
		console.log( err );
	}

	function handleDone(){
		console.log('Exiting.');
		process.exit(0);
	}
	

	function print( message ){
		if( typeof message == "object" ){
			message = JSON.stringify( message, null, 4 );
		}
		console.log( message );
	}


	module.exports = {
		print: print,
		handleErr: handleErr,
		handleDone: handleDone,
		readJson: readJson,
		writeJson: writeJson,
		readDir: readDir,
		removeFileJson: removeFileJson,
		updateKeyInJson: updateKeyInJson,
		updateKeyInJsonFile: updateKeyInJsonFile,
		updateKeysInJsonFile: updateKeysInJsonFile,
		updateKeyInCollection: updateKeyInCollection,
		updateKeyInCollectionFile: updateKeyInCollectionFile
	};