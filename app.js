		
		//Basic modules
	var express = require('express'),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io')(server);

		io.set('log level', 1);
		io.configure(function () {
		  	io.set("transports", ["xhr-polling"]);
		  	io.set("polling duration", 10);
		});

		//configuration : database, cloudify...
	var config = require('./config');
		db = require('./db')(config);

		//Loading the server
	var port = process.env.PORT || 1337;
		server.listen(port, function(){
			console.log('Server listening on '+port);
		});

		//Middleware
		app.use(express.static( __dirname + '/public'));

		//Basic routing
	 	app.get('/home', function(req,res){
			res.sendfile('public/index.html');
		});
		app.all('*', function(req,res){
			res.redirect('/home');
		});


