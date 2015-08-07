
	var app = require('express')();
	var server = require('http').createServer(app);
	var _ = require('lodash');
	var compression = require('compression');
	var bodyParser   = require('body-parser');
	var cookieParser = require('cookie-parser');

	console.log( process.env['my_mood'] );

	app.use( bodyParser.json() );
	app.use( bodyParser.urlencoded({ extended: true }) ); 
	app.use( cookieParser() );

	app.all('*', function( req, res, next ){
		console.log('Receiving request');

		console.log('\nHeaders:\n');
		console.log( req.headers );

		console.log('\nBody:\n');
		console.log( req.body );

		console.log('\nCookies:\n');
		console.log( req.headers.cookie );

		req.my_app_message = "Hello express";
		next();

	});

	app.get('*', function( req, res ){
		res.send( req.my_app_message ).end();
	});

	app.post('/api/me', function( req, res ){
		res.send('blabla').end();
	});


	server.listen( 1234, function(){ console.log('Listening...'); });