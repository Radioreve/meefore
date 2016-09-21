	
	var log      = require( process.cwd() + '/services/logger' );
	var print    = require( process.cwd() + '/services/print' )( __dirname.replace( process.cwd()+'/', '' ) + '/db.js' );
	var mongoose = require('mongoose');

	var db = function( uri, callback ){ 

		mongoose.connect( uri );

		mongoose.connection.on( 'open', function(){
			print.info('Connected to MongoDB');
			if( typeof callback == "function" ) {
				callback( null );
			}
		});

		mongoose.connection.on('error', function( err ){
			print.err({ err: err }, 'Connection to the database failed');
			if( typeof callback == "function" ) {
				callback( err );
			}
		});

	}

	module.exports = db;