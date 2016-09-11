
	var mongoose = require('mongoose');

	var db = function( uri, callback ){ 

		mongoose.connect( uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to MongoDB');
			if( typeof callback == "function" ) {
				callback( null );
			}
		});

		mongoose.connection.on('error', function( err ){
			console.log('Connection to the database failed : '+err);
			if( typeof callback == "function" ) {
				callback( err );
			}
		});

	}

	module.exports = db;