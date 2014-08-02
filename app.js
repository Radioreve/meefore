		
		//Basic modules
	var express = require('express'),
		bodyParser   = require('body-parser'),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io')(server),
		socketioJwt = require('socketio-jwt'),
		passport = require('passport');

		//Middleware
		app.use(passport.initialize());
		app.use(express.static( __dirname + '/public'))
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended:true}));

		//configuration : database, cloudify...
	var config = require('./config/config');

		require('./config/db')(config),
		require('./config/passport')(passport);
		require('./routes')(app,passport);

		io.use(socketioJwt.authorize({
			secret:config.jwtSecret,
			handshake:true
		}));  

		io.on('connection', function(socket){
			 console.log(socket.decoded_token.local.email + ' has joined the stream');
		});

		//Loading the server
		var port = process.env.PORT || 1337;
			server.listen(port, function(){
				console.log('Server listening on '+port);
			});

