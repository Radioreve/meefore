
	var _ = require('lodash'),
		jwt = require('jsonwebtoken'),
		settings = require('../config/settings'),
		config = require('../config/config');



	var sendSuccess = function( res, expose, print ){

		if( !res ) return console.log('Missing res Object from arguments');
		expose = expose || {};
		
		if( print ) console.log('Exposing : '+ JSON.stringify(expose, null, 4) );
		res.status( 200 ).json( expose ).end();
		return;
		
	};

	var raiseError = function( p ){

		console.log('Raising error');

		if( p.toServer )
			console.error( p.toServer ); 

		if( p.err )
			console.error( p.err );

		if( p.toClient && p.res ){

				var clientMsg = p.toClient;

				var data = { msg: clientMsg, err: p.err, errData: p.errData };
				
				p.res.status( p.code || 400 ).json( data ).end();
				return;
			}
	};

	/* Renvoi un entier random entre low et high */
	var randomInt = function(low, high) {
    	return Math.floor(Math.random() * (high - low + 1) + low);
	}

	var generateAppToken = function( source, data ){

		var public_claim    = {};
		var audience        = [];
		var registred_claim = {};

		if( source == "user" ){

			var user = data;
			
			public_claim = { _id: user._id };

			settings.public_properties.users.forEach(function( prop ){
				public_claim[ prop ] = user[ prop ];
			});

			audience = user.access;

			registred_claim = {

				expiresInMinutes  : 600,
				issuer            : 'leo@meefore.com',
				audience          : audience

			};
			
		}

		if( source == "app" ){

			var app = data; 

			var public_claim = {

				expiresInMinutes : 600,
				id               : app.id,
				source           : "generic"

			};

			audience = ["standard", "admin"];
			
			registred_claim = {

				expiresInSecondes : 15,
				issuer            : 'leo@meefore.com',
				audience          : audience

			};
		}

		return jwt.sign( public_claim, config.jwtSecret, registred_claim );

	};

	var oSize = function( object ) {

	    var objectList = [];
	    var stack = [ object ];
	    var bytes = 0;

	    while ( stack.length ) {
	        var value = stack.pop();

	        if ( typeof value === 'boolean' ) {
	            bytes += 4;
	        }
	        else if ( typeof value === 'string' ) {
	            bytes += value.length * 2;
	        }
	        else if ( typeof value === 'number' ) {
	            bytes += 8;
	        }
	        else if
	        (
	            typeof value === 'object'
	            && objectList.indexOf( value ) === -1
	        )
	        {
	            objectList.push( value );

	            for( var i in value ) {
	                stack.push( value[ i ] );
	            }
	        }
	    }
	    return bytes;
	};

	module.exports = {
		
		raiseError       : raiseError,
		sendSuccess      : sendSuccess,
		randomInt        : randomInt,
		generateAppToken : generateAppToken,
		oSize            : oSize
		
	};