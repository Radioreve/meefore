
	var _ = require('lodash');

	var makeChannel = function( options ){

		if( options == {} ) 
			return 'Error, no arguments passed to makeChannel';

		if( options.accessName == 'mychan')
			return options.token;

		if( options.accessName == 'defchan')
			return 'default';

	};


	var sendSuccess = function( res, expose, print ){

		if( !res ) return console.log('Missing res Object from arguments');
		expose = expose || {};
		
		if( print ) console.log('Exposing : '+ JSON.stringify(expose) );
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

				var clientMsg = p.toClient,
					flash     = p.flash || false;

				var data = { msg: clientMsg, flash: flash };
				
				p.res.status( 500 ).json( data ).end();
				return;
			}
	};

	module.exports = {

		makeChannel: makeChannel,
		raiseError: raiseError,
		sendSuccess: sendSuccess,
		
	};