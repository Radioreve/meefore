
	var _ = require('lodash'),
		jwt = require('jsonwebtoken'),
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

				var data = { msg: clientMsg, err: p.err };
				
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
					facebook_id: 	 user.facebook_id, 
  					email:       	 user.email,
  					name:        	 user.name,
  					age:         	 user.age,
  					access:          user.access, 
  					gender:          user.gender,
  					drink:   	     user.drink,
  					mood:            user.mood,
  					status:      	 user.status,
  					description: 	 user.description,
  					img_id:      	 user.img_id,
  					img_version: 	 user.img_version,
  					friends:         user.friends,
  					asked_events:    user.asked_events,
  					hosted_event_id: user.hosted_event_id,
  					newsletter:      user.newsletter,
  					channels:        user.channels

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

		raiseError: raiseError,
		sendSuccess: sendSuccess,
		randomInt: randomInt,
		generateAppToken: generateAppToken
		
	};