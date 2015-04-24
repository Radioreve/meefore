
	//Basic modules
	var express = require('express'),
		bodyParser   = require('body-parser'),
		app = express(),
		favicon = require('serve-favicon'),
		compression = require('compression'),
		cookieParser = require('cookie-parser'),
		server = require('http').createServer( app ),
		passport = require('passport');
	 
	//Middleware
		app.use( compression() );
		app.use( cookieParser() );
		app.use( passport.initialize() );
		app.use( express.static( __dirname + '/public') )
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded({ extended: true }) );
		app.use( favicon( __dirname + '/public/favicon.ico' ));

	var config = require('./config/config'),
		uri    = config[ process.env.NODE_ENV ].dbUri ;

		require('./globals/cron');
		require('./globals/db')( uri );
		require('./globals/passport')( passport );

	/* Référence globale */
		global.passport = passport,
		global.watcher  = {};

	/* Chargement des routes principales */
		require('./routes/routes')( app );

	var port = process.env.PORT || 1234;

		server.listen( port, function(){
			console.log('Server listening on '+ port);
		});
