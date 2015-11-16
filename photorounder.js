
	var express = require('express');
	var app = express();
	var server = require('http').createServer(app);

	app.use( express.static( __dirname + '/public') );

	app.get('*', function(req,res){
		res.sendfile( __dirname + '/photorounder.html');
	});	

	server.listen( 1234, function(){
		console.log('Listening...');
	})