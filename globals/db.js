
	var mongoose      = require('mongoose');

	var db = function( uri ){ 

		mongoose.connect( uri );

		mongoose.connection.on( 'open', function(){
			console.log('Connected to MongoDB');
		});

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

	}

	module.exports = db;