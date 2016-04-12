	
	var Promise = require('bluebird');
	var fs      = Promise.promisifyAll( require('fs') );
	var u       = require('../utils');


	function generateBotDataFile( path ){
		// console.log('Generating file for path : ' + path );
		return u.readJson( path )
				.catch(function( err ){
					return u.writeJson( path, {} );
				});
	}


	module.exports = {
		generateBotDataFile: generateBotDataFile
	};