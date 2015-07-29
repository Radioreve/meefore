
	var request = require('request');

	function pretty( o ){
		return console.log( JSON.stringify( o, null, 4 ) );
	}

	request.get('https://www.google.com', function( err, res, body ){

		pretty( res );
		
	});