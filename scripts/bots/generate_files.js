	
	var Promise = require('bluebird');
	var fs      = Promise.promisifyAll( require('fs') );
	var u       = require('../utils');


	function generateBotDataFile( path ){
		// console.log('Generating file for path : ' + path );
		return u.readJson( path )
				.then(function( json ){
					try{
						JSON.parse( json );
					} catch(e){
						u.writeJson( path, {} );
					}
				})
				.catch(function( err ){
					return u.writeJson( path, {} );
				});
	}

	function deleteBotDataFile( path ){
		// console.log('Generating file for path : ' + path );
		return u.removeFileJson( path )
	}


	module.exports = {
		generateBotDataFile : generateBotDataFile,
		deleteBotDataFile   : deleteBotDataFile
	};