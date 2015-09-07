
	var request = require('request');
	var jwt = require('jsonwebtoken');
	var config = require('../config/config');

	 function getAccessToken( facebook_id, callback ){

            request({ method: 'post', url: 'http://localhost:1234/auth/token', json: { api_key: 'meeforever', data: { id: facebook_id }} }, function( err, body, res ){
                
                if( err )
                    return callback( err, null );
                
                return callback( null, res.token );

            });

        };

        getAccessToken( '115214325497985', function( err, token ){

        	if( err )
        		return console.log( err );
        	
        	var audience = ['standard'];

        	console.log('Token : ' + token );
        	var payload;
			try{
				payload = jwt.verify( token, config.jwtSecret, { audience: audience });
			} catch( err ){
				console.log( err.message );
				console.log( "Cette action n'est pas autorisée" );
				process.exit(1);
			}

			console.log('Decoded with facebook_id = ' + payload.id );
			process.exit(0);

        });