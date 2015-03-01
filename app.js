

	//Basic modules
	var express = require('express'),
		bodyParser   = require('body-parser'),
		app = express(),
		compression = require('compression'),
		server = require('http').createServer( app ),
		socketioJwt = require('socketio-jwt'),
		passport = require('passport');

	var io = require('socket.io')( server );

	//Middleware
		app.use( compression() );
		app.use( passport.initialize() );
		app.use( express.static( __dirname + '/public') )
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded({ extended: true }) );

	//configuration object (db, auth, services...)
	var config = require('./config/config'),
		uri    = config[ process.env.NODE_ENV ].dbUri ;

		require('./config/cron');
		require('./config/db')( uri );
		require('./config/passport')( passport );
		require('./routes')( app, passport );

		io.use( socketioJwt.authorize({
			secret:config.jwtSecret,  
			handshake:true
		})); 

		/* Global for ease of use */
		global.sockets = {};
		global.appData = {};
		global.appData.onlineUsers = [];
		global.io = io;

		io.on('connection', function( socket ){
			 console.log( 'New user has joined the app' );
			 
			 var id = socket.decoded_token._id.toString();

			 if( !global.sockets[id] )
			 {
			 	global.sockets[id] = socket;
			 	global.io.emit('user connected', id);
			 	global.appData.onlineUsers.push( id );
			 }
			 else /*  Multi session -NOT- allowed */
			 {
			 	global.sockets[id].emit('server error', { msg: 'You logged in from another device' });
			 	global.sockets[id].disconnect();
			 	global.sockets[id] = socket;
			 }

			 require('./events/allEvents')( id );
		});


	var port = process.env.PORT || 1234;

		server.listen( port, function(){
			console.log('Server listening on '+ port);
		});

		

