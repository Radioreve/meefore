
	var _ = require('lodash'),
		jwt = require('jsonwebtoken'),
		settings = require('../config/settings'),
		config = require('../config/config');


	var raiseApiError = function( req, res, namespace, params ){

		res.status( 400 ).json({
			'namespace' : namespace,
			'error'		: params.error,
			'call_id'   : params.call_id
		});
	}

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
		raiseApiError    : raiseApiError,
		randomInt        : randomInt,
		oSize            : oSize
		
	};