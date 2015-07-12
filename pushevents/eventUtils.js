
	var _ = require('lodash'),
		jwt = require('jsonwebtoken'),
		config = require('../config/config');

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

	/* Renvoi un entier random entre low et high */
	var randomInt = function(low, high) {
    	return Math.floor(Math.random() * (high - low + 1) + low);
	}

	var generateAppToken = function( user ){

		var public_claim = {

					_id:         	 user._id,
					facebookId: 	 user.facebookId, 
  					email:       	 user.email,
  					name:        	 user.name,
  					age:         	 user.age,
  					access:          user.access, 
  					gender:          user.gender,
  					drink:   	     user.drink,
  					mood:            user.mood,
  					status:      	 user.status,
  					description: 	 user.description,
  					imgId:      	 user.imgId,
  					imgVersion: 	 user.imgVersion,
  					friendList:      user.friendList,
  					eventsAskedList: user.eventsAskedList,
  					hostedEventId:   user.hostedEventId,
  					newsletter:      user.newsletter,
  					myChannels:      user.myChannels

				},
				audience = user.access,
				registred_claim = {

					expiresInSecondes: 15,
					issuer: 'jean@free.fall',
					audience: audience
					
				};

			return jwt.sign( public_claim, config.jwtSecret, registred_claim );
	}

	module.exports = {

		makeChannel: makeChannel,
		raiseError: raiseError,
		sendSuccess: sendSuccess,
		randomInt: randomInt,
		generateAppToken: generateAppToken
		
	};