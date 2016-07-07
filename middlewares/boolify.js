	
	var _ = require('lodash');

	function forOwnDeep( o, callback ){
	    _.forOwn( o, function( value, key ){
	    	if( typeof o[key] == "object" ){
	        	forOwnDeep( o[ key ], callback);
	        } else {
	        	callback( value, key );
	        }
	    })
	}

	function updateKey( o, target_key, value ){
				
	    var keys = Object.keys( o );

	    for( var i=0; i<keys.length; i++ ){

	        var key = keys[ i ];
	        if( key === target_key ){
	            return o[ key ] = value;
	        }

	        if( typeof o[ key ] == "object" ){
	            updateKey(  o[ key ], target_key, value );
	        }

	    }

	}

	function castToBoolDeep( o ){
		forOwnDeep( o, function( value, key ){
	        if( value == "true" ){
	            updateKey( o, key, true );
	        }
	        if( value == "false" ){
	            updateKey( o, key, false );
	        }
	    });
	}

	var castToBool = function( req, res, next ){

		castToBoolDeep( req.sent );
		next();

	};

	module.exports = {
		castToBool: castToBool
	};