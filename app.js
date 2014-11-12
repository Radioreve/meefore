		
	//Basic modules
	var express = require('express'),
		bodyParser   = require('body-parser'),
		app = express(),
		server = require('http').createServer( app ),
		socketioJwt = require('socketio-jwt'),
		passport = require('passport');

	var io = require('socket.io')( server );

	//Middleware
		app.use( passport.initialize() );
		app.use( express.static( __dirname + '/public') )
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded({ extended: true }) );

	//configuration object (db, auth, services...)
	var config   = require('./config/config');

		require('./config/cron');
		require('./config/db')( config );
		require('./config/passport')( passport );
		require('./routes')( app, passport );

		io.use( socketioJwt.authorize({

			secret:config.jwtSecret,  
			handshake:true

		})); 

		global.sockets = {};
		global.io = io;

		io.on('connection', function( socket ){

			 console.log( socket.decoded_token.local.email + ' has joined the stream' );
			 var id = socket.decoded_token._id.toString();
			 global.sockets[id] = socket;

			 require('./events/events')( id );
		});

	//Loading the server
	var port = process.env.PORT || 1338;

		server.listen( port, function(){
			console.log('Server listening on '+ port);
		});

		

