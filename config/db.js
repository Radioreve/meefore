
	var mongoose = require('mongoose');

	var db = function(config){
		mongoose.connect(config.db.uri);
		mongoose.connection.on('open',function(){
			console.log('Connected the the MongoHQ databased!');
		});
		mongoose.connection.on('error',function(err){
			console.log('Connection to the database failed : '+err);
		});
	}

	module.exports = db