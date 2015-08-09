
	//Basic modules
	var express = require('express'),
		bodyParser   = require('body-parser'),
		app = express(),
		favicon = require('serve-favicon'),
		compression = require('compression'),
		cookieParser = require('cookie-parser'),
		server = require('http').createServer( app );
	 
	//Middleware
		app.use( compression() );
		app.use( cookieParser() );
		app.use( express.static( __dirname + '/public') )
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded({ extended: true }) );
		app.use( favicon( __dirname + '/public/favicon.ico' ));

	var config = require('./config/config'),
		uri    = config.db[ process.env.NODE_ENV ].uri ;

		require('./globals/cron');
		require('./globals/db')( uri );

	/* Référence globale */
		global.watcher  = {};

	/* Chargement des routes principales */
		require('./routes/routes')( app );

	var port = process.env.PORT || 1234;

		server.listen( port, function(){
			console.log('Server listening on '+ port);
		});
