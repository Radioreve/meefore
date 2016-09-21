	
	var pushEventsDir = '../pushevents';
	var signEvents 	  = require( pushEventsDir + '/signEvents' );

	module.exports = function( app ){

		// Main page
		app.get('/home',
			signEvents.sendHomepage
		);

		app.get('/logs', function( req, res ){
			res.sendFile( process.cwd() + '/views/logs.html' );
		});

		app.get('/logs.log', function( req, res ){
			res.sendFile( process.cwd() + '/json/logs.log' );
		});

		// Conditions générales
		app.get('/legals', function( req, res ){
			res.sendFile( process.cwd() + '/views/legals.html' );
		});

		// Redirection à la page d'accueil
		app.get('/',
			signEvents.redirectToHome
		);

		app.get('/devbuild', function( req, res ){
			res.sendFile( process.cwd() + '/views/index-devbuild.html' );
		});


	}