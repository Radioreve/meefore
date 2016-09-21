
	// Basic modules
		var log 	     = require('./services/logger');
		var print 		 = require('./services/print')( 'app.js' );
		var term 		 = require('terminal-kit').terminal
		var express      = require('express');
		var bodyParser   = require('body-parser');
		var app          = express();
		// var favicon      = require('serve-favicon');
		var compression  = require('compression');
		var cookieParser = require('cookie-parser');
		var server       = require('http').createServer( app );
		
	// Middleware
		app.use( compression() );
		app.use( cookieParser() );
		app.use( express.static( __dirname + '/public') );
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded({ extended: true }) );
		// app.use( favicon( __dirname + '/public/img/favicon/favicon2.ico' ));

	// Database
		var config = require('./config/config');
		var uri    = config.db[ process.env.APP_ENV ].uri;

		require('./services/db')( uri );

	// Chargement des routes principales 
		require('./routes/routes')( app );

	// Http server
		var port = process.env.PORT || 1234;
		server.listen( port, function(){
			print.info('Server listening on '+ port);
		});


	// Friendly logs
	var min = 0;
	(function checkingTime(){

		min += 1;
		print.info( 'App running for ' + min + ' minutes now. ');
		setTimeout( checkingTime, 60000);

	})();
